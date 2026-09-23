import { defineConfig } from "drizzle-kit";

// drizzle-kit does not read .env files; load them like Next.js does.
for (const archivo of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(archivo);
  } catch {
    // File not present.
  }
}

// Migrations prefer a direct/session connection (port 5432): Supabase's
// transaction pooler (6543) is meant for the app at runtime.
const url = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  ...(url
    ? { dbCredentials: { url } }
    : { driver: "pglite", dbCredentials: { url: process.env.PGLITE_DIR || "./.pglite" } }),
});
