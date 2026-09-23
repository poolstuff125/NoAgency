import Link from "next/link";

import { db } from "@/db";
import { exigirPerfil } from "@/lib/auth";
import { esAdmin } from "@/lib/permisos";
import { contarPendientes } from "@/lib/servicios/tareas";

import { cerrarSesion } from "../(auth)/acciones";
import { NavLink } from "./nav-link";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const perfil = await exigirPerfil();
  const admin = esAdmin(perfil);
  const pendientes = await contarPendientes(db, perfil);
  const hrefPendientes = admin
    ? "/tablero?estado=en_revision"
    : `/tablero?estado=cambios&responsable=${perfil.id}`;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href="/tablero" className="font-semibold tracking-tight">
            No Agency OS
          </Link>
          <nav className="flex items-center gap-1 text-sm" aria-label="Principal">
            <NavLink href="/tablero">Tablero</NavLink>
            <NavLink href="/clientes">Clientes</NavLink>
            {admin && <NavLink href="/equipo">Equipo</NavLink>}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <Link
              href={hrefPendientes}
              className="flex items-center gap-1.5 rounded-full px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title={admin ? "Tareas en revisión" : "Tareas con cambios pedidos"}
            >
              <span>{admin ? "En revisión" : "Cambios"}</span>
              <span
                className={`min-w-6 rounded-full px-1.5 text-center text-xs font-semibold ${
                  pendientes > 0
                    ? "bg-rose-600 text-white"
                    : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                }`}
              >
                {pendientes}
              </span>
            </Link>
            <span className="hidden text-zinc-600 sm:inline dark:text-zinc-400">
              {perfil.nombre}
            </span>
            <form action={cerrarSesion}>
              <button
                type="submit"
                className="text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
