import { PGlite } from "@electric-sql/pglite";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";

import type { Db } from "@/db/client";
import * as schema from "@/db/schema";

/** Fresh in-memory Postgres with all migrations applied. */
export async function crearDbPrueba(): Promise<Db> {
  const db = drizzle({ client: new PGlite(), schema });
  await migrate(db, { migrationsFolder: "drizzle" });
  return db as unknown as Db;
}

/** Empties every table; cheaper than booting a new PGlite per test. */
export async function vaciarDb(db: Db) {
  await db.execute(
    sql`truncate table historial, adjuntos, comentarios, tareas, clientes, perfiles cascade`,
  );
}
