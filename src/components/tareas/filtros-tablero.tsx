"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AREAS, ESTADOS, ETIQUETA_AREA, ETIQUETA_ESTADO } from "@/lib/dominio";
import { desplazarMes, nombreMes } from "@/lib/fechas";

import type { ClienteGrupo, Miembro } from "./tipos";

const claseFiltro =
  "rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export function FiltrosTablero({
  mes,
  clientes,
  miembros,
  mostrarCliente = true,
}: {
  mes: string;
  clientes: ClienteGrupo[];
  miembros: Miembro[];
  mostrarCliente?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const hrefCon = (cambios: Record<string, string | null>) => {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(cambios)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    return `${pathname}?${p}`;
  };
  const cambiar = (clave: string) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
    router.push(hrefCon({ [clave]: e.target.value || null }));

  const hayFiltros = ["cliente", "area", "responsable", "estado"].some((k) => params.get(k));

  return (
    <div className="flex flex-wrap items-center gap-2" role="search" aria-label="Filtros">
      <div className="flex items-center gap-1">
        <Link
          href={hrefCon({ mes: desplazarMes(mes, -1) })}
          aria-label="Mes anterior"
          className="rounded-lg px-2 py-1 hover:bg-zinc-200 dark:hover:bg-zinc-800"
        >
          ←
        </Link>
        <h1 className="min-w-44 text-center text-lg font-semibold">{nombreMes(mes)}</h1>
        <Link
          href={hrefCon({ mes: desplazarMes(mes, 1) })}
          aria-label="Mes siguiente"
          className="rounded-lg px-2 py-1 hover:bg-zinc-200 dark:hover:bg-zinc-800"
        >
          →
        </Link>
      </div>
      <input
        type="month"
        aria-label="Mes"
        value={mes}
        onChange={cambiar("mes")}
        className={claseFiltro}
      />
      {mostrarCliente && (
        <select
          aria-label="Cliente"
          value={params.get("cliente") ?? ""}
          onChange={cambiar("cliente")}
          className={claseFiltro}
        >
          <option value="">Todos los clientes</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      )}
      <select
        aria-label="Área"
        value={params.get("area") ?? ""}
        onChange={cambiar("area")}
        className={claseFiltro}
      >
        <option value="">Todas las áreas</option>
        {AREAS.map((a) => (
          <option key={a} value={a}>
            {ETIQUETA_AREA[a]}
          </option>
        ))}
      </select>
      <select
        aria-label="Responsable"
        value={params.get("responsable") ?? ""}
        onChange={cambiar("responsable")}
        className={claseFiltro}
      >
        <option value="">Todos los responsables</option>
        <option value="sin">Sin asignar</option>
        {miembros.map((m) => (
          <option key={m.id} value={m.id}>
            {m.nombre}
          </option>
        ))}
      </select>
      <select
        aria-label="Estado"
        value={params.get("estado") ?? ""}
        onChange={cambiar("estado")}
        className={claseFiltro}
      >
        <option value="">Todos los estados</option>
        {ESTADOS.map((s) => (
          <option key={s} value={s}>
            {ETIQUETA_ESTADO[s]}
          </option>
        ))}
      </select>
      {hayFiltros && (
        <Link
          href={`${pathname}?mes=${mes}`}
          className="text-sm text-zinc-600 underline dark:text-zinc-400"
        >
          Limpiar filtros
        </Link>
      )}
    </div>
  );
}
