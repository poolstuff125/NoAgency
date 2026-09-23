"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { env } from "@/env";
import { crearSupabaseServidor } from "@/lib/supabase/server";

export type EstadoFormulario = { error?: string; mensaje?: string };

const credenciales = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1),
});

export async function iniciarSesion(
  _prev: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const parsed = credenciales.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Ingresa tu email y contraseña." };

  const supabase = await crearSupabaseServidor();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Email o contraseña incorrectos." };
  redirect("/tablero");
}

export async function recuperarContrasena(
  _prev: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const email = z.string().trim().toLowerCase().pipe(z.email()).safeParse(formData.get("email"));
  if (!email.success) return { error: "Ingresa un email válido." };

  const supabase = await crearSupabaseServidor();
  const { error } = await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/actualizar-contrasena`,
  });
  if (error) console.error("resetPasswordForEmail", error);
  // Same answer whether or not the account exists.
  return {
    mensaje: "Si el email está registrado, te enviamos un enlace para crear una nueva contraseña.",
  };
}

const nuevaContrasena = z
  .object({
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirmacion: z.string(),
  })
  .refine((d) => d.password === d.confirmacion, { message: "Las contraseñas no coinciden." });

export async function actualizarContrasena(
  _prev: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const parsed = nuevaContrasena.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await crearSupabaseServidor();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { error: "No se pudo guardar la contraseña. Abre de nuevo el enlace del email." };
  }
  redirect("/tablero");
}

export async function cerrarSesion() {
  const supabase = await crearSupabaseServidor();
  await supabase.auth.signOut();
  redirect("/login");
}
