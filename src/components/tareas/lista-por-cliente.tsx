import { db } from "@/db";
import type { Cliente } from "@/db/schema";
import { mesActual } from "@/lib/fechas";
import { listarEquipo } from "@/lib/servicios/equipo";
import { listarTareasTablero, type FiltrosTablero } from "@/lib/servicios/tareas";

import { GrupoCliente } from "./grupo-cliente";
import { aFila, type ActorVista } from "./tipos";

/**
 * Monday-style list: one group per client with inline editing and a quick-add
 * row. Groups for active clients are shown even when empty so pieces can be
 * added to them.
 */
export async function ListaPorCliente({
  filtros,
  clientes,
  actor,
}: {
  filtros: FiltrosTablero;
  clientes: Cliente[];
  actor: ActorVista;
}) {
  const [tareas, miembros] = await Promise.all([
    listarTareasTablero(db, filtros),
    listarEquipo(db),
  ]);
  const hayFiltrosDeTarea = Boolean(filtros.area || filtros.estado || filtros.responsableId);
  const grupos = clientes
    .map((cliente) => ({
      cliente,
      tareas: tareas.filter((t) => t.clienteId === cliente.id).map(aFila),
    }))
    // With task filters active, hide clients with no matches to reduce noise.
    .filter((g) => g.tareas.length > 0 || (!hayFiltrosDeTarea && g.cliente.activo));

  if (grupos.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
        No hay piezas con estos filtros.
      </p>
    );
  }

  const actorVista = { id: actor.id, rol: actor.rol };
  const miembrosVista = miembros.map(({ id, nombre, activo }) => ({ id, nombre, activo }));
  return (
    <div className="space-y-4">
      {grupos.map((g) => (
        <GrupoCliente
          key={g.cliente.id}
          cliente={g.cliente}
          tareas={g.tareas}
          actor={actorVista}
          miembros={miembrosVista}
          mes={filtros.mes}
          fechaRequerida={filtros.mes !== mesActual()}
        />
      ))}
    </div>
  );
}
