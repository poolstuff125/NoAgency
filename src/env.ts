import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  // Postgres connection string. When unset, an embedded PGlite database is used.
  DATABASE_URL: z.url().optional(),
  // Directory for the embedded PGlite database. Unset = in-memory.
  PGLITE_DIR: z.string().optional(),
});

export const env = envSchema.parse(process.env);
