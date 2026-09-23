"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Aviso, BotonEnviar, claseCampo, claseEtiqueta } from "@/components/formulario";

import { iniciarSesion } from "../acciones";

export function FormularioLogin({ aviso }: { aviso?: string }) {
  const [estado, accion] = useActionState(iniciarSesion, {});
  return (
    <form action={accion} className="space-y-4">
      <Aviso error={estado.error ?? aviso} />
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
      <div>
        <label htmlFor="password" className={claseEtiqueta}>
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={claseCampo}
        />
      </div>
      <BotonEnviar className="w-full">Ingresar</BotonEnviar>
      <p className="text-center text-sm">
        <Link
          href="/recuperar"
          className="text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </p>
    </form>
  );
}
