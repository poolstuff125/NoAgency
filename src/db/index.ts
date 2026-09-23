import "server-only";

import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";

import { env } from "@/env";
import * as schema from "./schema";

function createDb() {
  if (env.DATABASE_URL) {
    return drizzlePg(env.DATABASE_URL, { schema });
  }
  // Local fallback: embedded Postgres (WASM), no server required.
  return drizzlePglite({ client: new PGlite(env.PGLITE_DIR), schema });
}

const globalForDb = globalThis as unknown as { db?: ReturnType<typeof createDb> };

// Reuse the client across hot reloads in development.
export const db = globalForDb.db ?? createDb();
if (env.NODE_ENV !== "production") globalForDb.db = db;
