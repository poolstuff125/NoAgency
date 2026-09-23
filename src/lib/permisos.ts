import type { EstadoTarea, Perfil, Tarea } from "@/db/schema";

type Actor = Pick<Perfil, "id" | "rol">;

export const esAdmin = (actor: Actor) => actor.rol === "admin";

/** Clients, team and task creation/deletion are admin-only. */
export const puedeGestionarClientes = esAdmin;
export const puedeGestionarEquipo = esAdmin;
export const puedeCrearTareas = esAdmin;
export const puedeBorrarTareas = esAdmin;

/** Fields a team member may change on a task they are responsible for. */
export const CAMPOS_EDITABLES_EQUIPO = ["estado", "motivoStandby", "linkEntrega"] as const;

export type CampoTarea =
  | "titulo"
  | "area"
  | "tipo"
  | "estado"
  | "motivoStandby"
  | "prioridad"
  | "responsableId"
  | "fechaEntrega"
  | "fechaPublicacion"
  | "brief"
  | "linkEntrega";

/** Returns the reason the change is not allowed, or null if it is. */
export function motivoRechazoEdicion(
  actor: Actor,
  tarea: Pick<Tarea, "responsableId">,
  campos: CampoTarea[],
  estadoNuevo?: EstadoTarea,
): string | null {
  if (esAdmin(actor)) return null;
  if (tarea.responsableId !== actor.id) {
    return "Solo puedes editar las tareas donde eres responsable.";
  }
  const ajeno = campos.find((c) => !(CAMPOS_EDITABLES_EQUIPO as readonly string[]).includes(c));
  if (ajeno) return "No tienes permiso para cambiar ese campo.";
  if (estadoNuevo === "listo") return "Solo el admin puede marcar una tarea como lista.";
  return null;
}

/** UI hint: can this actor edit anything on the task? */
export function puedeEditarTarea(actor: Actor, tarea: Pick<Tarea, "responsableId">) {
  return esAdmin(actor) || tarea.responsableId === actor.id;
}
