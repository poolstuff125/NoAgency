"use client";

import { useState, useTransition } from "react";

import { actualizarTareaAccion } from "@/app/(app)/acciones";
import type { EstadoTarea } from "@/db/schema";
import {
  AREAS,
  COLOR_ESTADO,
  ESTADOS,
  ETIQUETA_AREA,
  ETIQUETA_ESTADO,
  ETIQUETA_PRIORIDAD,
  ETIQUETA_TIPO,
  PRIORIDADES,
  TIPOS,
} from "@/lib/dominio";
import { fechaCorta } from "@/lib/fechas";
import { esAdmin, puedeEditarTarea } from "@/lib/permisos";

import type { ActorVista, Miembro, TareaFila } from "./tipos";

const claseControl =
  "w-full min-w-0 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm hover:border-zinc-300 focus:border-zinc-400 focus:outline-none disabled:cursor-default disabled:hover:border-transparent dark:hover:border-zinc-700";

export function FilaTarea({
  tarea: inicial,
  actor,
  miembros,
}: {
  tarea: TareaFila;
  actor: ActorVista;
  miembros: Miembro[];
}) {
  const [tarea, setTarea] = useState(inicial);
  const [error, setError] = useState<string | null>(null);
  const [pidiendoMotivo, setPidiendoMotivo] = useState(false);
  const [pendiente, startTransition] = useTransition();

  const admin = esAdmin(actor);
  const editable = puedeEditarTarea(actor, inicial);
  const nombreDe = (id: string | null) =>
    miembros.find((m) => m.id === id)?.nombre ?? "Sin asignar";

  function guardar(cambios: Partial<TareaFila>) {
    const anterior = tarea;
    setTarea({ ...tarea, ...cambios });
    setError(null);
    startTransition(async () => {
      const r = await actualizarTareaAccion(tarea.id, cambios);
      if (!r.ok) {
        setTarea(anterior);
        setError(r.error);
      }
    });
  }

  function cambiarEstado(estado: EstadoTarea) {
    if (estado === "standby") setPidiendoMotivo(true);
    else guardar({ estado });
  }

  const etiquetaCampo = "text-xs text-zinc-500 md:hidden";

  return (
    <li
      className={`grid grid-cols-2 items-center gap-x-2 gap-y-1 border-t border-zinc-100 px-3 py-2 text-sm md:grid-cols-[minmax(0,1fr)_7.5rem_7.5rem_9rem_9rem_6rem_8.5rem_8.5rem] dark:border-zinc-800 ${
        pendiente ? "opacity-70" : ""
      }`}
    >
      <div className="col-span-2 md:col-span-1">
        {admin ? (
          <input
            aria-label="Título"
            defaultValue={tarea.titulo}
            onBlur={(e) => {
              const titulo = e.currentTarget.value.trim();
              if (titulo && titulo !== tarea.titulo) guardar({ titulo });
              else e.currentTarget.value = tarea.titulo;
            }}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            className={`${claseControl} font-medium`}
          />
        ) : (
          <span className="px-1.5 font-medium">{tarea.titulo}</span>
        )}
        {tarea.estado === "standby" && tarea.motivoStandby && (
          <p className="px-1.5 text-xs text-violet-700 dark:text-violet-300">
            Standby: {tarea.motivoStandby}
          </p>
        )}
      </div>

      <label className="contents">
        <span className={etiquetaCampo}>Tipo</span>
        <select
          aria-label="Tipo"
          value={tarea.tipo}
          disabled={!admin}
          onChange={(e) => guardar({ tipo: e.target.value as TareaFila["tipo"] })}
          className={claseControl}
        >
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {ETIQUETA_TIPO[t]}
            </option>
          ))}
        </select>
      </label>

      <label className="contents">
        <span className={etiquetaCampo}>Área</span>
        <select
          aria-label="Área"
          value={tarea.area}
          disabled={!admin}
          onChange={(e) => guardar({ area: e.target.value as TareaFila["area"] })}
          className={claseControl}
        >
          {AREAS.map((a) => (
            <option key={a} value={a}>
              {ETIQUETA_AREA[a]}
            </option>
          ))}
        </select>
      </label>

      <label className="contents">
        <span className={etiquetaCampo}>Responsable</span>
        {admin ? (
          <select
            aria-label="Responsable"
            value={tarea.responsableId ?? ""}
            onChange={(e) => guardar({ responsableId: e.target.value || null })}
            className={`${claseControl} ${tarea.responsableId ? "" : "text-rose-600 dark:text-rose-400"}`}
          >
            <option value="">Sin asignar</option>
            {miembros
              .filter((m) => m.activo || m.id === tarea.responsableId)
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
          </select>
        ) : (
          <span className="truncate px-1.5">{nombreDe(tarea.responsableId)}</span>
        )}
      </label>

      <label className="contents">
        <span className={etiquetaCampo}>Estado</span>
        <select
          aria-label="Estado"
          value={pidiendoMotivo ? "standby" : tarea.estado}
          disabled={!editable}
          onChange={(e) => cambiarEstado(e.target.value as EstadoTarea)}
          className={`${claseControl} rounded-full text-center font-medium ${COLOR_ESTADO[pidiendoMotivo ? "standby" : tarea.estado]}`}
        >
          {ESTADOS.map((s) => (
            <option key={s} value={s} disabled={s === "listo" && !admin}>
              {ETIQUETA_ESTADO[s]}
            </option>
          ))}
        </select>
      </label>

      <label className="contents">
        <span className={etiquetaCampo}>Prioridad</span>
        <select
          aria-label="Prioridad"
          value={tarea.prioridad}
          disabled={!admin}
          onChange={(e) => guardar({ prioridad: Number(e.target.value) })}
          className={`${claseControl} ${tarea.prioridad === 1 ? "font-semibold text-rose-700 dark:text-rose-400" : ""}`}
        >
          {PRIORIDADES.map((p) => (
            <option key={p} value={p}>
              {ETIQUETA_PRIORIDAD[p]}
            </option>
          ))}
        </select>
      </label>

      <CampoFecha
        etiqueta="Publicación"
        valor={tarea.fechaPublicacion}
        editable={admin}
        onChange={(v) => guardar({ fechaPublicacion: v })}
      />
      <CampoFecha
        etiqueta="Entrega"
        valor={tarea.fechaEntrega}
        editable={admin}
        onChange={(v) => guardar({ fechaEntrega: v })}
      />

      {pidiendoMotivo && (
        <form
          className="col-span-2 flex flex-wrap items-center gap-2 md:col-span-8"
          onSubmit={(e) => {
            e.preventDefault();
            const motivo = String(new FormData(e.currentTarget).get("motivo") ?? "").trim();
            if (!motivo) return;
            setPidiendoMotivo(false);
            guardar({ estado: "standby", motivoStandby: motivo });
          }}
        >
          <input
            name="motivo"
            autoFocus
            required
            placeholder="Motivo del standby (ej. falta material del cliente)"
            aria-label="Motivo del standby"
            className="min-w-0 flex-1 rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button type="submit" className="rounded-md bg-violet-600 px-3 py-1 text-sm text-white">
            Poner en standby
          </button>
          <button
            type="button"
            onClick={() => setPidiendoMotivo(false)}
            className="text-sm underline"
          >
            Cancelar
          </button>
        </form>
      )}

      {error && (
        <p
          role="alert"
          className="col-span-2 text-xs text-rose-700 md:col-span-8 dark:text-rose-400"
        >
          {error}
        </p>
      )}
    </li>
  );
}

function CampoFecha({
  etiqueta,
  valor,
  editable,
  onChange,
}: {
  etiqueta: string;
  valor: string | null;
  editable: boolean;
  onChange: (v: string | null) => void;
}) {
  return (
    <label className="contents">
      <span className="text-xs text-zinc-500 md:hidden">{etiqueta}</span>
      {editable ? (
        <input
          type="date"
          aria-label={etiqueta}
          value={valor ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          className={claseControl}
        />
      ) : (
        <span className="px-1.5">{valor ? fechaCorta(valor) : "—"}</span>
      )}
    </label>
  );
}
