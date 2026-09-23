import Link from "next/link";

import { puedeCrearTareas } from "@/lib/permisos";

import { AgregarPieza } from "./agregar-pieza";
import { FilaTarea } from "./fila-tarea";
import type { ActorVista, ClienteGrupo, Miembro, TareaFila } from "./tipos";

const COLUMNAS = [
  "Pieza",
  "Tipo",
  "Área",
  "Responsable",
  "Estado",
  "Prioridad",
  "Publicación",
  "Entrega",
];

export function GrupoCliente({
  cliente,
  tareas,
  actor,
  miembros,
  mes,
  fechaRequerida,
}: {
  cliente: ClienteGrupo;
  tareas: TareaFila[];
  actor: ActorVista;
  miembros: Miembro[];
  mes: string;
  fechaRequerida: boolean;
}) {
  const listas = tareas.filter((t) => t.estado === "listo").length;
  return (
    <section
      aria-labelledby={`cliente-${cliente.id}`}
      className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
      style={{ borderLeft: `4px solid ${cliente.color}` }}
    >
      <header className="flex items-center gap-3 px-3 py-2.5">
        <h2 id={`cliente-${cliente.id}`} className="font-semibold" style={{ color: cliente.color }}>
          <Link href={`/clientes/${cliente.id}?mes=${mes}`} className="hover:underline">
            {cliente.nombre}
          </Link>
        </h2>
        <span className="text-xs text-zinc-500">
          {tareas.length} {tareas.length === 1 ? "pieza" : "piezas"} · {listas} listas
        </span>
      </header>
      <div
        aria-hidden
        className="hidden grid-cols-[minmax(0,1fr)_7.5rem_7.5rem_9rem_9rem_6rem_8.5rem_8.5rem] gap-x-2 border-t border-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-500 md:grid dark:border-zinc-800"
      >
        {COLUMNAS.map((c) => (
          <span key={c} className="px-1.5">
            {c}
          </span>
        ))}
      </div>
      <ul>
        {tareas.map((t) => (
          <FilaTarea key={`${t.id}:${t.version}`} tarea={t} actor={actor} miembros={miembros} />
        ))}
      </ul>
      {tareas.length === 0 && (
        <p className="border-t border-zinc-100 px-4 py-3 text-sm text-zinc-500 dark:border-zinc-800">
          Sin piezas este mes.
        </p>
      )}
      {puedeCrearTareas(actor) && (
        <AgregarPieza clienteId={cliente.id} mes={mes} fechaRequerida={fechaRequerida} />
      )}
    </section>
  );
}
