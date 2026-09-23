"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Aviso, BotonEnviar, claseCampo, claseEtiqueta } from "@/components/formulario";

import { recuperarContrasena } from "../acciones";

export default function RecuperarPage() {
  const [estado, accion] = useActionState(recuperarContrasena, {});
  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Recuperar contraseña</h1>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        Te enviaremos un enlace para crear una nueva.
      </p>
      <form action={accion} className="space-y-4">
        <Aviso {...estado} />
        <div>
          <label htmlFor="email" className={claseEtiqueta}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={claseCampo}
          />
        </div>
        <BotonEnviar className="w-full">Enviar enlace</BotonEnviar>
        <p className="text-center text-sm">
          <Link
            href="/login"
            className="text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400"
          >
            Volver a ingresar
          </Link>
        </p>
      </form>
    </>
  );
}
