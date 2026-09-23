"use client";

import { useActionState } from "react";

import { Aviso, BotonEnviar, claseCampo, claseEtiqueta } from "@/components/formulario";

import { actualizarContrasena } from "../acciones";

export default function ActualizarContrasenaPage() {
  const [estado, accion] = useActionState(actualizarContrasena, {});
  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Crea tu contraseña</h1>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">Mínimo 8 caracteres.</p>
      <form action={accion} className="space-y-4">
        <Aviso {...estado} />
        <div>
          <label htmlFor="password" className={claseEtiqueta}>
            Nueva contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            className={claseCampo}
          />
        </div>
        <div>
          <label htmlFor="confirmacion" className={claseEtiqueta}>
            Repite la contraseña
          </label>
          <input
            id="confirmacion"
            name="confirmacion"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            className={claseCampo}
          />
        </div>
        <BotonEnviar className="w-full">Guardar y entrar</BotonEnviar>
      </form>
    </>
  );
}
