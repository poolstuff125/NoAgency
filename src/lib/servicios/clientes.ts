import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import type { Db } from "@/db/client";
import { clientes, type Cliente, type Perfil } from "@/db/schema";
import { ErrorDominio } from "@/lib/errores";
import { puedeGestionarClientes } from "@/lib/permisos";
import { colorHex, primerError, vacioANulo } from "@/lib/validacion";

type Actor = Pick<Perfil, "id" | "rol">;

// No defaults here: Zod 4 applies defaults even inside .partial(), which
// would reset untouched fields on update. Column defaults cover inserts.
export const esquemaCliente = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio.").max(120),
  color: colorHex.optional(),
  logoUrl: vacioANulo(z.url({ error: "El logo debe ser una URL válida." })).optional(),
  activo: z.boolean().optional(),
});

function validar<T extends z.ZodType>(esquema: T, datos: unknown): z.infer<T> {
  const parsed = esquema.safeParse(datos);
  if (!parsed.success) throw new ErrorDominio(primerError(parsed.error));
  return parsed.data;
}

function exigirPermiso(actor: Actor) {
  if (!puedeGestionarClientes(actor)) {
    throw new ErrorDominio("Solo el admin puede gestionar clientes.");
  }
}

export async function crearCliente(db: Db, actor: Actor, datos: unknown): Promise<Cliente> {
  exigirPermiso(actor);
  const input = validar(esquemaCliente, datos);
  const [cliente] = await db.insert(clientes).values(input).returning();
  return cliente;
}

export async function actualizarCliente(
  db: Db,
  actor: Actor,
  id: string,
  datos: unknown,
): Promise<Cliente> {
  exigirPermiso(actor);
  const input = validar(esquemaCliente.partial().strict(), datos);
  const [cliente] = await db.update(clientes).set(input).where(eq(clientes.id, id)).returning();
  if (!cliente) throw new ErrorDominio("El cliente no existe.");
  return cliente;
}

export async function listarClientes(db: Db, { soloActivos = true } = {}) {
  return db
    .select()
    .from(clientes)
    .where(soloActivos ? eq(clientes.activo, true) : undefined)
    .orderBy(asc(clientes.nombre));
}

export async function obtenerCliente(db: Db, id: string) {
  const [cliente] = await db.select().from(clientes).where(eq(clientes.id, id));
  return cliente ?? null;
}
