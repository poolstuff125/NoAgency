import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";

import * as schema from "./schema";

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

/** Creates a Drizzle client. Usable from scripts; app code imports `@/db` instead. */
export function createDb(opts: { databaseUrl?: string; pgliteDir?: string }): Db {
  if (opts.databaseUrl) {
    return drizzlePg(opts.databaseUrl, { schema }) as unknown as Db;
  }
  // Local fallback: embedded Postgres (WASM), no server required.
  return drizzlePglite({ client: new PGlite(opts.pgliteDir), schema }) as unknown as Db;
}
