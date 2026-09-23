import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { supabaseConfigurado } from "@/env";
import { obtenerPerfilActual } from "@/lib/auth";

import { FormularioLogin } from "./formulario-login";

export const metadata: Metadata = { title: "Ingresar · No Agency OS" };

const AVISOS: Record<string, string> = {
  "sin-acceso": "Tu cuenta no tiene acceso o fue desactivada. Habla con el admin.",
  "enlace-invalido": "El enlace no es válido o ya expiró. Pide uno nuevo.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  if (await obtenerPerfilActual()) redirect("/tablero");
  const { error } = await searchParams;

  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Ingresar</h1>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        Acceso solo para el equipo invitado.
      </p>
      {supabaseConfigurado() ? (
        <FormularioLogin aviso={typeof error === "string" ? AVISOS[error] : undefined} />
      ) : (
        <p
          role="alert"
          className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200"
        >
          El inicio de sesión no está configurado todavía (faltan las variables de Supabase).
        </p>
      )}
    </>
  );
}
