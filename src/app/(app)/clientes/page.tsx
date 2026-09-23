import type { Metadata } from "next";
import Link from "next/link";

import { FormularioCliente } from "@/components/clientes/formulario-cliente";
import { LogoCliente } from "@/components/clientes/logo-cliente";
import { db } from "@/db";
import { exigirPerfil } from "@/lib/auth";
import { puedeGestionarClientes } from "@/lib/permisos";
import { listarClientes } from "@/lib/servicios/clientes";

export const metadata: Metadata = { title: "Clientes · No Agency OS" };

export default async function ClientesPage() {
  const perfil = await exigirPerfil();
  const admin = puedeGestionarClientes(perfil);
  const clientes = await listarClientes(db, { soloActivos: !admin });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>

      {admin && (
        <section
          aria-labelledby="nuevo-cliente"
          className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 id="nuevo-cliente" className="mb-3 font-medium">
            Nuevo cliente
          </h2>
          <FormularioCliente />
        </section>
      )}

      {clientes.length === 0 ? (
        <p className="text-sm text-zinc-500">Todavía no hay clientes.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clientes.map((c) => (
            <li key={c.id}>
              <Link
                href={`/clientes/${c.id}`}
                className={`flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600 ${
                  c.activo ? "" : "opacity-60"
                }`}
              >
                <LogoCliente cliente={c} />
                <span className="min-w-0 flex-1 truncate font-medium">{c.nombre}</span>
                {!c.activo && <span className="text-xs text-zinc-500">Inactivo</span>}
                <span
                  aria-hidden
                  className="size-3 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
