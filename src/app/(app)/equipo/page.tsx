import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FilaMiembro } from "@/components/equipo/fila-miembro";
import { FormularioInvitacion } from "@/components/equipo/formulario-invitacion";
import { db } from "@/db";
import { exigirPerfil } from "@/lib/auth";
import { puedeGestionarEquipo } from "@/lib/permisos";
import { listarEquipo } from "@/lib/servicios/equipo";

export const metadata: Metadata = { title: "Equipo · No Agency OS" };

export default async function EquipoPage() {
  const perfil = await exigirPerfil();
  if (!puedeGestionarEquipo(perfil)) notFound();
  const miembros = await listarEquipo(db);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Equipo</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          El área principal define la asignación automática: una pieza nueva sin responsable se
          asigna a la única persona activa con esa área.
        </p>
      </div>

      <section
        aria-labelledby="invitar"
        className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2 id="invitar" className="mb-3 font-medium">
          Invitar por email
        </h2>
        <FormularioInvitacion />
      </section>

      <section
        aria-labelledby="miembros"
        className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2 id="miembros" className="px-4 py-3 font-medium">
          Miembros ({miembros.length})
        </h2>
        <ul>
          {miembros.map((m) => (
            <FilaMiembro
              key={`${m.id}:${m.rol}:${m.areaPrincipal}:${m.activo}`}
              miembro={{
                id: m.id,
                nombre: m.nombre,
                email: m.email,
                rol: m.rol,
                areaPrincipal: m.areaPrincipal,
                activo: m.activo,
              }}
              esYo={m.id === perfil.id}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}
