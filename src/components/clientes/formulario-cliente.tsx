"use client";

import { useActionState } from "react";

import { guardarClienteAccion } from "@/app/(app)/acciones";
import { Aviso, BotonEnviar, claseCampo, claseEtiqueta } from "@/components/formulario";
import type { Cliente } from "@/db/schema";

export function FormularioCliente({ cliente }: { cliente?: Cliente }) {
  const [estado, accion] = useActionState(
    guardarClienteAccion.bind(null, cliente?.id ?? null),
    null,
  );
  const id = cliente?.id ?? "nuevo";

  return (
    <form
      action={accion}
      className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem_minmax(0,1fr)_auto] sm:items-end"
    >
      <div>
        <label htmlFor={`nombre-${id}`} className={claseEtiqueta}>
          Nombre
        </label>
        <input
          id={`nombre-${id}`}
          name="nombre"
          required
          defaultValue={cliente?.nombre}
          className={claseCampo}
        />
      </div>
      <div>
        <label htmlFor={`color-${id}`} className={claseEtiqueta}>
          Color
        </label>
        <input
          id={`color-${id}`}
          name="color"
          type="color"
          defaultValue={cliente?.color ?? "#6366f1"}
          className="h-10 w-full cursor-pointer rounded-lg border border-zinc-300 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <div>
        <label htmlFor={`logo-${id}`} className={claseEtiqueta}>
          Logo (URL, opcional)
        </label>
        <input
          id={`logo-${id}`}
          name="logoUrl"
          type="url"
          placeholder="https://…"
          defaultValue={cliente?.logoUrl ?? ""}
          className={claseCampo}
        />
      </div>
      <div className="flex items-center gap-3">
        {cliente && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="activo"
              defaultChecked={cliente.activo}
              className="size-4"
            />
            Activo
          </label>
        )}
        <BotonEnviar>{cliente ? "Guardar" : "Crear cliente"}</BotonEnviar>
      </div>
      <div className="sm:col-span-4">
        <Aviso
          error={estado && !estado.ok ? estado.error : undefined}
          mensaje={estado?.ok ? (cliente ? "Cambios guardados." : "Cliente creado.") : undefined}
        />
      </div>
    </form>
  );
}
