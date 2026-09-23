import { and, asc, count, eq, gte, lt, sql } from "drizzle-orm";
import { z } from "zod";

import type { Db } from "@/db/client";
import {
  clientes,
  historial,
  perfiles,
  tareas,
  type AreaTrabajo,
  type Perfil,
  type Tarea,
} from "@/db/schema";
import { AREAS, ESTADOS, TIPOS } from "@/lib/dominio";
import { ErrorDominio } from "@/lib/errores";
import { rangoMes, ZONA_HORARIA } from "@/lib/fechas";
import {
  motivoRechazoEdicion,
  puedeBorrarTareas,
  puedeCrearTareas,
  type CampoTarea,
} from "@/lib/permisos";
import { fecha, primerError, vacioANulo } from "@/lib/validacion";

type Actor = Pick<Perfil, "id" | "rol">;

export const esquemaNuevaTarea = z.object({
  clienteId: z.uuid({ error: "Cliente inválido." }),
  titulo: z.string().trim().min(1, "El título es obligatorio.").max(200),
  area: z.enum(AREAS, { error: "Área inválida." }),
  tipo: z.enum(TIPOS).default("post"),
  prioridad: z.coerce.number().int().min(1).max(3).default(2),
  responsableId: vacioANulo(z.uuid()).optional(),
  fechaEntrega: vacioANulo(fecha).optional(),
  fechaPublicacion: vacioANulo(fecha).optional(),
  brief: vacioANulo(z.string().max(20_000)).optional(),
});

export const esquemaCambiosTarea = z
  .object({
    titulo: z.string().trim().min(1, "El título es obligatorio.").max(200),
    area: z.enum(AREAS),
    tipo: z.enum(TIPOS),
    estado: z.enum(ESTADOS),
    motivoStandby: vacioANulo(z.string().trim().max(500)),
    prioridad: z.coerce.number().int().min(1).max(3),
    responsableId: vacioANulo(z.uuid()),
    fechaEntrega: vacioANulo(fecha),
    fechaPublicacion: vacioANulo(fecha),
    brief: vacioANulo(z.string().max(20_000)),
    linkEntrega: vacioANulo(z.url({ error: "El link de entrega no es una URL válida." })),
  })
  .partial()
  .strict();

export type CambiosTarea = z.infer<typeof esquemaCambiosTarea>;

// Changes to these fields are recorded in `historial` (column names as in the spec).
const CAMPOS_CON_HISTORIAL = {
  estado: "estado",
  responsableId: "responsable_id",
  fechaEntrega: "fecha_entrega",
  fechaPublicacion: "fecha_publicacion",
} as const satisfies Partial<Record<CampoTarea, string>>;

/** The single active profile whose main area matches; null if none or several. */
export async function responsablePorArea(db: Db, area: AreaTrabajo): Promise<string | null> {
  const candidatos = await db
    .select({ id: perfiles.id })
    .from(perfiles)
    .where(and(eq(perfiles.activo, true), eq(perfiles.areaPrincipal, area)))
    .limit(2);
  return candidatos.length === 1 ? candidatos[0].id : null;
}

async function exigirResponsableActivo(db: Db, id: string) {
  const [perfil] = await db
    .select({ activo: perfiles.activo })
    .from(perfiles)
    .where(eq(perfiles.id, id));
  if (!perfil?.activo) throw new ErrorDominio("El responsable no existe o está inactivo.");
}

export async function crearTarea(db: Db, actor: Actor, datos: unknown): Promise<Tarea> {
  if (!puedeCrearTareas(actor)) throw new ErrorDominio("Solo el admin puede crear tareas.");
  const parsed = esquemaNuevaTarea.safeParse(datos);
  if (!parsed.success) throw new ErrorDominio(primerError(parsed.error));
  const input = parsed.data;

  const [cliente] = await db
    .select({ activo: clientes.activo })
    .from(clientes)
    .where(eq(clientes.id, input.clienteId));
  if (!cliente?.activo) throw new ErrorDominio("El cliente no existe o está inactivo.");

  let responsableId = input.responsableId ?? null;
  if (responsableId) await exigirResponsableActivo(db, responsableId);
  else responsableId = await responsablePorArea(db, input.area);

  const [{ siguiente }] = await db
    .select({ siguiente: sql<number>`coalesce(max(${tareas.orden}), 0) + 1` })
    .from(tareas)
    .where(eq(tareas.clienteId, input.clienteId));

  const [tarea] = await db
    .insert(tareas)
    .values({
      clienteId: input.clienteId,
      titulo: input.titulo,
      area: input.area,
      tipo: input.tipo,
      prioridad: input.prioridad,
      responsableId,
      fechaEntrega: input.fechaEntrega ?? null,
      fechaPublicacion: input.fechaPublicacion ?? null,
      brief: input.brief ?? null,
      orden: Number(siguiente),
      creadoPor: actor.id,
    })
    .returning();
  return tarea;
}

export async function actualizarTarea(
  db: Db,
  actor: Actor,
  tareaId: string,
  datos: unknown,
): Promise<Tarea> {
  const parsed = esquemaCambiosTarea.safeParse(datos);
  if (!parsed.success) throw new ErrorDominio(primerError(parsed.error));
  const cambios: CambiosTarea = parsed.data;
  const campos = Object.keys(cambios) as CampoTarea[];
  if (campos.length === 0) throw new ErrorDominio("No hay cambios que guardar.");

  return db.transaction(async (tx) => {
    const [actual] = await tx.select().from(tareas).where(eq(tareas.id, tareaId)).for("update");
    if (!actual) throw new ErrorDominio("La tarea no existe.");

    const rechazo = motivoRechazoEdicion(actor, actual, campos, cambios.estado);
    if (rechazo) throw new ErrorDominio(rechazo);

    if (cambios.responsableId) await exigirResponsableActivo(tx, cambios.responsableId);

    const estadoFinal = cambios.estado ?? actual.estado;
    const motivoFinal =
      cambios.motivoStandby !== undefined ? cambios.motivoStandby : actual.motivoStandby;
    if (estadoFinal === "standby" && !motivoFinal?.trim()) {
      throw new ErrorDominio("Indica el motivo del standby.");
    }
    const valores: CambiosTarea = {
      ...cambios,
      motivoStandby: estadoFinal === "standby" ? motivoFinal : null,
    };

    // Keep only fields whose value actually changes.
    const diferencias = Object.fromEntries(
      Object.entries(valores).filter(
        ([campo, valor]) => (actual as Record<string, unknown>)[campo] !== valor,
      ),
    ) as CambiosTarea;
    if (Object.keys(diferencias).length === 0) return actual;

    const [actualizada] = await tx
      .update(tareas)
      .set(diferencias)
      .where(eq(tareas.id, tareaId))
      .returning();

    const registros = Object.entries(CAMPOS_CON_HISTORIAL)
      .filter(([campo]) => campo in diferencias)
      .map(([campo, columna]) => ({
        tareaId,
        usuarioId: actor.id,
        campo: columna,
        valorAnterior: aTexto(actual[campo as keyof Tarea]),
        valorNuevo: aTexto(actualizada[campo as keyof Tarea]),
      }));
    if (registros.length > 0) await tx.insert(historial).values(registros);

    return actualizada;
  });
}

export async function eliminarTarea(db: Db, actor: Actor, tareaId: string) {
  if (!puedeBorrarTareas(actor)) throw new ErrorDominio("Solo el admin puede borrar tareas.");
  const borradas = await db
    .delete(tareas)
    .where(eq(tareas.id, tareaId))
    .returning({ id: tareas.id });
  if (borradas.length === 0) throw new ErrorDominio("La tarea no existe.");
}

const aTexto = (v: unknown) => (v === null || v === undefined ? null : String(v));

export const esquemaFiltrosTablero = z.object({
  mes: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  clienteId: z.uuid().optional().catch(undefined),
  area: z.enum(AREAS).optional().catch(undefined),
  responsableId: z
    .union([z.uuid(), z.literal("sin")])
    .optional()
    .catch(undefined),
  estado: z.enum(ESTADOS).optional().catch(undefined),
});

export type FiltrosTablero = z.infer<typeof esquemaFiltrosTablero>;

/**
 * Tasks for the board. A task belongs to the month of its publication date,
 * falling back to its delivery date and then to its creation date (Ecuador time).
 */
export async function listarTareasTablero(db: Db, filtros: FiltrosTablero) {
  const { desde, hasta } = rangoMes(filtros.mes);
  const fechaMes = sql`coalesce(${tareas.fechaPublicacion}, ${tareas.fechaEntrega}, (${tareas.creadoEn} at time zone ${ZONA_HORARIA})::date)`;

  const condiciones = [gte(fechaMes, desde), lt(fechaMes, hasta)];
  if (filtros.clienteId) condiciones.push(eq(tareas.clienteId, filtros.clienteId));
  if (filtros.area) condiciones.push(eq(tareas.area, filtros.area));
  if (filtros.estado) condiciones.push(eq(tareas.estado, filtros.estado));
  if (filtros.responsableId === "sin") condiciones.push(sql`${tareas.responsableId} is null`);
  else if (filtros.responsableId) condiciones.push(eq(tareas.responsableId, filtros.responsableId));

  return db
    .select()
    .from(tareas)
    .where(and(...condiciones))
    .orderBy(
      asc(tareas.prioridad),
      sql`${tareas.fechaPublicacion} asc nulls last`,
      asc(tareas.orden),
      asc(tareas.creadoEn),
    );
}

/**
 * In-app notification counter (until email notifications in phase 3):
 * admin → tasks awaiting review; team → own tasks sent back for changes.
 */
export async function contarPendientes(db: Db, actor: Actor): Promise<number> {
  const condicion =
    actor.rol === "admin"
      ? eq(tareas.estado, "en_revision")
      : and(eq(tareas.estado, "cambios"), eq(tareas.responsableId, actor.id));
  const [fila] = await db.select({ n: count() }).from(tareas).where(condicion);
  return fila?.n ?? 0;
}
