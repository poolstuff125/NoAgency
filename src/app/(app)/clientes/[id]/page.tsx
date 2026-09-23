import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { FormularioCliente } from "@/components/clientes/formulario-cliente";
import { LogoCliente } from "@/components/clientes/logo-cliente";
import { FiltrosTablero } from "@/components/tareas/filtros-tablero";
import { ListaPorCliente } from "@/components/tareas/lista-por-cliente";
import { db } from "@/db";
import { exigirPerfil } from "@/lib/auth";
import { esMesValido, mesActual } from "@/lib/fechas";
import { puedeGestionarClientes } from "@/lib/permisos";
import { obtenerCliente } from "@/lib/servicios/clientes";
import { listarEquipo } from "@/lib/servicios/equipo";
import { esquemaFiltrosTablero } from "@/lib/servicios/tareas";

export const metadata: Metadata = { title: "Cliente · No Agency OS" };

const texto = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

export default async function ClientePage({ params, searchParams }: PageProps<"/clientes/[id]">) {
  const perfil = await exigirPerfil();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const cliente = await obtenerCliente(db, id);
  if (!cliente) notFound();

  const sp = await searchParams;
  const mes = texto(sp.mes);
  const filtros = esquemaFiltrosTablero.parse({
    mes: esMesValido(mes) ? mes : mesActual(),
    clienteId: cliente.id,
    area: texto(sp.area),
    responsableId: texto(sp.responsable),
    estado: texto(sp.estado),
  });
  const miembros = await listarEquipo(db);

  return (
    <div className="space-y-6">
      <Link href="/clientes" className="text-sm text-zinc-600 underline dark:text-zinc-400">
        ← Clientes
      </Link>
      <header className="flex items-center gap-3">
        <LogoCliente cliente={cliente} tamano={48} />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{cliente.nombre}</h1>
          {!cliente.activo && <p className="text-sm text-zinc-500">Cliente inactivo</p>}
        </div>
      </header>

      {puedeGestionarClientes(perfil) && (
        <details className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <summary className="cursor-pointer font-medium">Editar cliente</summary>
          <div className="mt-3">
            <FormularioCliente cliente={cliente} />
          </div>
        </details>
      )}

      <FiltrosTablero
        mes={filtros.mes}
        clientes={[]}
        mostrarCliente={false}
        miembros={miembros.map(({ id, nombre, activo }) => ({ id, nombre, activo }))}
      />
      <ListaPorCliente filtros={filtros} clientes={[{ ...cliente, activo: true }]} actor={perfil} />
    </div>
  );
}
