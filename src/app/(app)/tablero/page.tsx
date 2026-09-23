import type { Metadata } from "next";

import { db } from "@/db";
import { FiltrosTablero } from "@/components/tareas/filtros-tablero";
import { ListaPorCliente } from "@/components/tareas/lista-por-cliente";
import { exigirPerfil } from "@/lib/auth";
import { esMesValido, mesActual } from "@/lib/fechas";
import { listarClientes } from "@/lib/servicios/clientes";
import { listarEquipo } from "@/lib/servicios/equipo";
import { esquemaFiltrosTablero } from "@/lib/servicios/tareas";

export const metadata: Metadata = { title: "Tablero · No Agency OS" };

const texto = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

export default async function TableroPage({ searchParams }: PageProps<"/tablero">) {
  const perfil = await exigirPerfil();
  const sp = await searchParams;
  const mes = texto(sp.mes);
  const filtros = esquemaFiltrosTablero.parse({
    mes: esMesValido(mes) ? mes : mesActual(),
    clienteId: texto(sp.cliente),
    area: texto(sp.area),
    responsableId: texto(sp.responsable),
    estado: texto(sp.estado),
  });

  const [clientes, miembros] = await Promise.all([listarClientes(db), listarEquipo(db)]);
  const visibles = filtros.clienteId
    ? clientes.filter((c) => c.id === filtros.clienteId)
    : clientes;

  return (
    <div className="space-y-5">
      <FiltrosTablero
        mes={filtros.mes}
        clientes={clientes}
        miembros={miembros.map(({ id, nombre, activo }) => ({ id, nombre, activo }))}
      />
      {clientes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
          Todavía no hay clientes.{" "}
          {perfil.rol === "admin" ? "Crea el primero en la sección Clientes." : ""}
        </p>
      ) : (
        <ListaPorCliente filtros={filtros} clientes={visibles} actor={perfil} />
      )}
    </div>
  );
}
