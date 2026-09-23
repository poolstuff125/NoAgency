/**
 * Creates (or repairs) the first admin: Paul Bayas.
 *
 *   ADMIN_EMAIL=... npm run seed:admin
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and DATABASE_URL
 * (loaded from .env.local / .env). Sends a Supabase invite email so the admin
 * sets their own password. Idempotent: re-running reuses the existing Auth user
 * and makes sure the profile is an active admin.
 */
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { createDb } from "../src/db/client";
import { perfiles } from "../src/db/schema";

const NOMBRE_ADMIN = "Paul Bayas";

const env = z
  .object({
    ADMIN_EMAIL: z.string().trim().toLowerCase().pipe(z.email()),
    NEXT_PUBLIC_SUPABASE_URL: z.url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    DATABASE_URL: z.url().optional(),
    PGLITE_DIR: z.string().optional(),
    NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  })
  // Empty variables (e.g. a missing GitHub secret) count as unset.
  .parse(Object.fromEntries(Object.entries(process.env).filter(([, v]) => v !== "")));

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function buscarUsuario(email: string) {
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const user = data.users.find((u) => u.email?.toLowerCase() === email);
    if (user || data.users.length < 200) return user ?? null;
  }
}

async function main() {
  let user = await buscarUsuario(env.ADMIN_EMAIL);
  if (user) {
    console.log(`Usuario de Auth existente: ${user.id}`);
  } else {
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(env.ADMIN_EMAIL, {
      data: { nombre: NOMBRE_ADMIN },
      redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/actualizar-contrasena`,
    });
    if (error || !data.user) throw error ?? new Error("Supabase no devolvió el usuario.");
    user = data.user;
    console.log(`Invitación enviada a ${env.ADMIN_EMAIL}.`);
  }

  const db = createDb({ databaseUrl: env.DATABASE_URL, pgliteDir: env.PGLITE_DIR });
  await db
    .insert(perfiles)
    .values({ id: user.id, nombre: NOMBRE_ADMIN, email: env.ADMIN_EMAIL, rol: "admin" })
    .onConflictDoUpdate({
      target: perfiles.id,
      set: { rol: "admin", activo: true, email: env.ADMIN_EMAIL },
    });
  console.log(`Perfil admin listo: ${NOMBRE_ADMIN} <${env.ADMIN_EMAIL}>`);
  process.exit(0);
}

main().catch((error) => {
  console.error("No se pudo crear el admin:", error);
  process.exit(1);
});
