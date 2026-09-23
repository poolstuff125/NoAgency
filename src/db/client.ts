import { createRequire } from "node:module";

import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

import * as schema from "./schema";

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

/** Creates a Drizzle client. Usable from scripts; app code imports `@/db` instead. */
export function createDb(opts: { databaseUrl?: string; pgliteDir?: string }): Db {
  if (opts.databaseUrl) {
    return drizzlePg(opts.databaseUrl, { schema }) as unknown as Db;
  }
  // Local fallback: embedded Postgres (WASM), no server required. Loaded lazily
  // so production (DATABASE_URL set) never loads PGlite or its WASM files.
  const require = createRequire(import.meta.url);
  const { PGlite } = require("@electric-sql/pglite") as typeof import("@electric-sql/pglite");
  const { drizzle: drizzlePglite } =
    require("drizzle-orm/pglite") as typeof import("drizzle-orm/pglite");
  return drizzlePglite({ client: new PGlite(opts.pgliteDir), schema }) as unknown as Db;
}
