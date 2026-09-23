"use client";

import { useRef, useState, useTransition } from "react";

import { crearTareaAccion } from "@/app/(app)/acciones";
import type { AreaTrabajo } from "@/db/schema";
import { AREAS, ETIQUETA_AREA, ETIQUETA_TIPO, TIPOS } from "@/lib/dominio";
import { rangoMes } from "@/lib/fechas";

/**
 * Quick-add row at the bottom of each client group. When browsing a month
 * other than the current one the publication date is required, otherwise the
 * new piece would land in the current month.
 */
export function AgregarPieza({
  clienteId,
  mes,
  fechaRequerida,
}: {
  clienteId: string;
  mes: string;
  fechaRequerida: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [area, setArea] = useState<AreaTrabajo>("diseno");
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();
  const { desde, hasta } = rangoMes(mes);
  const maxFecha = new Date(new Date(`${hasta}T00:00:00Z`).getTime() - 86_400_000)
    .toISOString()
    .slice(0, 10);

  return (
    <form
      ref={formRef}
      aria-label="Agregar pieza"
      onSubmit={(e) => {
        e.preventDefault();
        const datos = Object.fromEntries(new FormData(e.currentTarget));
        setError(null);
        startTransition(async () => {
          const r = await crearTareaAccion({ ...datos, clienteId });
          if (r.ok) {
            formRef.current?.reset();
            formRef.current?.querySelector<HTMLInputElement>("input[name=titulo]")?.focus();
          } else {
            setError(r.error);
          }
        });
      }}
      className="flex flex-wrap items-center gap-2 border-t border-zinc-100 px-3 py-2 text-sm dark:border-zinc-800"
    >
      <input
        name="titulo"
        required
        placeholder="+ Agregar pieza"
        aria-label="Título de la nueva pieza"
        className="min-w-40 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-1 placeholder:text-zinc-500 hover:border-zinc-300 focus:border-zinc-400 focus:outline-none dark:hover:border-zinc-700"
      />
      <select
        name="area"
        aria-label="Área de la nueva pieza"
        value={area}
        onChange={(e) => setArea(e.target.value as AreaTrabajo)}
        className="rounded-md border border-zinc-200 bg-transparent px-1.5 py-1 dark:border-zinc-700"
      >
        {AREAS.map((a) => (
          <option key={a} value={a}>
            {ETIQUETA_AREA[a]}
          </option>
        ))}
      </select>
      <select
        name="tipo"
        aria-label="Tipo de la nueva pieza"
        defaultValue="post"
        className="rounded-md border border-zinc-200 bg-transparent px-1.5 py-1 dark:border-zinc-700"
      >
        {TIPOS.map((t) => (
          <option key={t} value={t}>
            {ETIQUETA_TIPO[t]}
          </option>
        ))}
      </select>
      <input
        type="date"
        name="fechaPublicacion"
        aria-label="Fecha de publicación de la nueva pieza"
        min={desde}
        max={maxFecha}
        required={fechaRequerida}
        className="rounded-md border border-zinc-200 bg-transparent px-1.5 py-1 dark:border-zinc-700"
      />
      <button
        type="submit"
        disabled={pendiente}
        className="rounded-md bg-zinc-900 px-3 py-1 text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pendiente ? "Agregando…" : "Agregar"}
      </button>
      {error && (
        <p role="alert" className="w-full text-xs text-rose-700 dark:text-rose-400">
          {error}
        </p>
      )}
    </form>
  );
}
