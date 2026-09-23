import "server-only";

import { env } from "@/env";
import { createDb, type Db } from "./client";

export type { Db };

const globalForDb = globalThis as unknown as { db?: Db };

// Reuse the client across hot reloads in development.
export const db =
  globalForDb.db ?? createDb({ databaseUrl: env.DATABASE_URL, pgliteDir: env.PGLITE_DIR });
if (env.NODE_ENV !== "production") globalForDb.db = db;
