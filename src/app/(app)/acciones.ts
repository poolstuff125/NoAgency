"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { env } from "@/env";
import { perfilParaAccion } from "@/lib/auth";
import { ejecutarAccion, ErrorDominio, type ResultadoAccion } from "@/lib/errores";
import { actualizarCliente, crearCliente } from "@/lib/servicios/clientes";
import { actualizarMiembro, invitarMiembro, type Invitador } from "@/lib/servicios/equipo";
import { actualizarTarea, crearTarea } from "@/lib/servicios/tareas";
import { crearSupabaseAdmin } from "@/lib/supabase/admin";

// Every action re-checks the session: server actions are public endpoints.

const formularioAObjeto = (formData: FormData) =>
  Object.fromEntries([...formData.entries()].filter(([k]) => !k.startsWith("$ACTION")));

export async function crearTareaAccion(datos: Record<string, unknown>): Promise<ResultadoAccion> {
  return ejecutarAccion(async () => {
    const actor = await perfilParaAccion();
    await crearTarea(db, actor, datos);
    revalidatePath("/tablero");
    revalidatePath("/clientes", "layout");
  });
}

export async function actualizarTareaAccion(
  tareaId: string,
  cambios: Record<string, unknown>,
): Promise<ResultadoAccion> {
  return ejecutarAccion(async () => {
    const actor = await perfilParaAccion();
    await actualizarTarea(db, actor, tareaId, cambios);
    revalidatePath("/", "layout");
  });
}

export async function guardarClienteAccion(
  id: string | null,
  _prev: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  return ejecutarAccion(async () => {
    const actor = await perfilParaAccion();
    const datos = formularioAObjeto(formData);
    const cliente = {
      nombre: datos.nombre,
      color: datos.color,
      logoUrl: datos.logoUrl,
      ...(id ? { activo: datos.activo === "on" } : {}),
    };
    if (id) await actualizarCliente(db, actor, id, cliente);
    else await crearCliente(db, actor, cliente);
    revalidatePath("/clientes", "layout");
    revalidatePath("/tablero");
  });
}

const invitarConSupabase: Invitador = async (email, nombre) => {
  const { data, error } = await crearSupabaseAdmin().auth.admin.inviteUserByEmail(email, {
    data: { nombre },
    redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/actualizar-contrasena`,
  });
  if (error || !data.user) {
    console.error("inviteUserByEmail", error);
    throw new ErrorDominio(
      `No se pudo enviar la invitación${error?.message ? `: ${error.message}` : "."}`,
    );
  }
  return { id: data.user.id };
};

export async function invitarMiembroAccion(
  _prev: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  return ejecutarAccion(async () => {
    const actor = await perfilParaAccion();
    await invitarMiembro(db, actor, formularioAObjeto(formData), invitarConSupabase);
    revalidatePath("/equipo");
  });
}

export async function actualizarMiembroAccion(
  id: string,
  cambios: Record<string, unknown>,
): Promise<ResultadoAccion> {
  return ejecutarAccion(async () => {
    const actor = await perfilParaAccion();
    await actualizarMiembro(db, actor, id, cambios);
    revalidatePath("/", "layout");
  });
}
