"use client";

import { useFormStatus } from "react-dom";

export function BotonEnviar({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 ${className}`}
    >
      {pending ? "Guardando…" : children}
    </button>
  );
}

export function Aviso({ error, mensaje }: { error?: string; mensaje?: string }) {
  if (error) {
    return (
      <p
        role="alert"
        className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:bg-rose-950 dark:text-rose-200"
      >
        {error}
      </p>
    );
  }
  if (mensaje) {
    return (
      <p
        role="status"
        className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
      >
        {mensaje}
      </p>
    );
  }
  return null;
}

export const claseCampo =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-zinc-700";
export const claseEtiqueta = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";
