import { z } from "zod";

const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (v === "" ? undefined : v), schema.optional());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  // Postgres (Supabase transaction pooler in production). Unset = embedded PGlite.
  DATABASE_URL: optional(z.url()),
  // Directory for the embedded PGlite database. Unset = in-memory.
  PGLITE_DIR: optional(z.string()),
  // Supabase Auth. Required to log in; the app boots without them (tests, CI).
  NEXT_PUBLIC_SUPABASE_URL: optional(z.url()),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optional(z.string().min(1)),
  // Server-only: inviting users. Never expose to the client.
  SUPABASE_SERVICE_ROLE_KEY: optional(z.string().min(1)),
  // Public base URL used in invite / password-reset emails.
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
});

export const env = envSchema.parse(process.env);

export function supabaseConfigurado() {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
