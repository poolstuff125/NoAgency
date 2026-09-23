import { randomUUID } from "node:crypto";

import type { Db } from "@/db/client";
import { clientes, perfiles, type AreaTrabajo, type RolUsuario } from "@/db/schema";

export async function crearPerfil(
  db: Db,
  datos: { nombre?: string; rol?: RolUsuario; area?: AreaTrabajo | null; activo?: boolean } = {},
) {
  const id = randomUUID();
  const [perfil] = await db
    .insert(perfiles)
    .values({
      id,
      nombre: datos.nombre ?? "Persona",
      email: `${id}@example.com`,
      rol: datos.rol ?? "equipo",
      areaPrincipal: datos.area ?? null,
      activo: datos.activo ?? true,
    })
    .returning();
  return perfil;
}

export async function crearClienteDirecto(db: Db, nombre = "Cliente", activo = true) {
  const [cliente] = await db.insert(clientes).values({ nombre, activo }).returning();
  return cliente;
}
