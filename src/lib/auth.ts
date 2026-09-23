import "server-only";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";

import { db } from "@/db";
import { perfiles, type Perfil } from "@/db/schema";
import { supabaseConfigurado } from "@/env";
import { ErrorDominio } from "@/lib/errores";
import { crearSupabaseServidor } from "@/lib/supabase/server";

/**
 * The signed-in user's active profile, or null. The Supabase session alone is
 * not enough: the user must also have an active row in `perfiles`.
 * Cached per request.
 */
export const obtenerPerfilActual = cache(async (): Promise<Perfil | null> => {
  // Always per-request, even when Supabase is not configured at build time.
  await connection();
  if (!supabaseConfigurado()) return null;
  const supabase = await crearSupabaseServidor();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return null;

  const [perfil] = await db.select().from(perfiles).where(eq(perfiles.id, userId));
  return perfil?.activo ? perfil : null;
});

/** For pages and layouts: redirects to /login without an active profile. */
export async function exigirPerfil(): Promise<Perfil> {
  const perfil = await obtenerPerfilActual();
  if (!perfil) redirect("/login?error=sin-acceso");
  return perfil;
}

/** For server actions: throws a user-facing error instead of redirecting. */
export async function perfilParaAccion(): Promise<Perfil> {
  const perfil = await obtenerPerfilActual();
  if (!perfil) throw new ErrorDominio("Tu sesión expiró. Vuelve a iniciar sesión.");
  return perfil;
}
