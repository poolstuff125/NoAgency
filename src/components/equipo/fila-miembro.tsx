"use client";

import { useState, useTransition } from "react";

import { actualizarMiembroAccion } from "@/app/(app)/acciones";
import type { Perfil } from "@/db/schema";
import { AREAS, ETIQUETA_AREA, ETIQUETA_ROL, ROLES } from "@/lib/dominio";

type MiembroFila = Pick<Perfil, "id" | "nombre" | "email" | "rol" | "areaPrincipal" | "activo">;

const claseControl =
  "rounded-md border border-zinc-200 bg-transparent px-1.5 py-1 text-sm disabled:opacity-60 dark:border-zinc-700";

export function FilaMiembro({ miembro, esYo }: { miembro: MiembroFila; esYo: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  const guardar = (cambios: Partial<MiembroFila>) => {
    setError(null);
    startTransition(async () => {
      const r = await actualizarMiembroAccion(miembro.id, cambios);
      if (!r.ok) setError(r.error);
    });
  };

  return (
    <li
      className={`grid gap-2 border-t border-zinc-100 px-4 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_8rem_10rem_8rem] sm:items-center dark:border-zinc-800 ${
        miembro.activo ? "" : "opacity-60"
      } ${pendiente ? "animate-pulse" : ""}`}
    >
      <div className="min-w-0">
        <p className="truncate font-medium">
          {miembro.nombre} {esYo && <span className="text-xs text-zinc-500">(tú)</span>}
        </p>
        <p className="truncate text-zinc-500">{miembro.email}</p>
      </div>
      <select
        aria-label={`Rol de ${miembro.nombre}`}
        value={miembro.rol}
        disabled={esYo || pendiente}
        onChange={(e) => guardar({ rol: e.target.value as MiembroFila["rol"] })}
        className={claseControl}
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {ETIQUETA_ROL[r]}
          </option>
        ))}
      </select>
      <select
        aria-label={`Área principal de ${miembro.nombre}`}
        value={miembro.areaPrincipal ?? ""}
        disabled={pendiente}
        onChange={(e) =>
          guardar({ areaPrincipal: (e.target.value || null) as MiembroFila["areaPrincipal"] })
        }
        className={claseControl}
      >
        <option value="">Sin área</option>
        {AREAS.map((a) => (
          <option key={a} value={a}>
            {ETIQUETA_AREA[a]}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={esYo || pendiente}
        onClick={() => guardar({ activo: !miembro.activo })}
        className="rounded-md border border-zinc-300 px-2 py-1 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        {miembro.activo ? "Desactivar" : "Activar"}
      </button>
      {error && (
        <p role="alert" className="text-xs text-rose-700 sm:col-span-4 dark:text-rose-400">
          {error}
        </p>
      )}
    </li>
  );
}
