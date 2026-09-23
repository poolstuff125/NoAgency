import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import type { Db } from "@/db/client";
import { perfiles, type Perfil } from "@/db/schema";
import { AREAS, ROLES } from "@/lib/dominio";
import { ErrorDominio } from "@/lib/errores";
import { puedeGestionarEquipo } from "@/lib/permisos";
import { primerError, vacioANulo } from "@/lib/validacion";

type Actor = Pick<Perfil, "id" | "rol">;

/** Creates the Supabase Auth user and sends the invite email; returns its id. */
export type Invitador = (email: string, nombre: string) => Promise<{ id: string }>;

export const esquemaInvitacion = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio.").max(120),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Email inválido." })),
  rol: z.enum(ROLES).default("equipo"),
  areaPrincipal: vacioANulo(z.enum(AREAS)).optional(),
});

export const esquemaCambiosMiembro = z
  .object({
    nombre: z.string().trim().min(1).max(120),
    rol: z.enum(ROLES),
    areaPrincipal: vacioANulo(z.enum(AREAS)),
    activo: z.boolean(),
  })
  .partial()
  .strict();

function exigirPermiso(actor: Actor) {
  if (!puedeGestionarEquipo(actor))
    throw new ErrorDominio("Solo el admin puede gestionar el equipo.");
}

export async function invitarMiembro(
  db: Db,
  actor: Actor,
  datos: unknown,
  invitar: Invitador,
): Promise<Perfil> {
  exigirPermiso(actor);
  const parsed = esquemaInvitacion.safeParse(datos);
  if (!parsed.success) throw new ErrorDominio(primerError(parsed.error));
  const input = parsed.data;

  const [existente] = await db
    .select({ id: perfiles.id })
    .from(perfiles)
    .where(eq(perfiles.email, input.email));
  if (existente) throw new ErrorDominio("Ya existe un miembro con ese email.");

  const { id } = await invitar(input.email, input.nombre);
  const [perfil] = await db
    .insert(perfiles)
    .values({
      id,
      nombre: input.nombre,
      email: input.email,
      rol: input.rol,
      areaPrincipal: input.areaPrincipal ?? null,
    })
    .returning();
  return perfil;
}

export async function actualizarMiembro(
  db: Db,
  actor: Actor,
  id: string,
  datos: unknown,
): Promise<Perfil> {
  exigirPermiso(actor);
  const parsed = esquemaCambiosMiembro.safeParse(datos);
  if (!parsed.success) throw new ErrorDominio(primerError(parsed.error));
  const cambios = parsed.data;

  if (id === actor.id && (cambios.rol === "equipo" || cambios.activo === false)) {
    throw new ErrorDominio("No puedes quitarte el rol de admin ni desactivar tu propia cuenta.");
  }
  const [perfil] = await db.update(perfiles).set(cambios).where(eq(perfiles.id, id)).returning();
  if (!perfil) throw new ErrorDominio("El miembro no existe.");
  return perfil;
}

export async function listarEquipo(db: Db, { soloActivos = false } = {}) {
  return db
    .select()
    .from(perfiles)
    .where(soloActivos ? eq(perfiles.activo, true) : undefined)
    .orderBy(asc(perfiles.nombre));
}
