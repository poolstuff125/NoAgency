import type { Cliente, Perfil, Tarea } from "@/db/schema";

export type TareaFila = Pick<
  Tarea,
  | "id"
  | "clienteId"
  | "titulo"
  | "area"
  | "tipo"
  | "estado"
  | "motivoStandby"
  | "prioridad"
  | "responsableId"
  | "fechaEntrega"
  | "fechaPublicacion"
> & {
  /** Changes whenever the row changes on the server; used as React key to resync. */
  version: string;
};

export type Miembro = Pick<Perfil, "id" | "nombre" | "activo">;
export type ClienteGrupo = Pick<Cliente, "id" | "nombre" | "color" | "logoUrl">;
export type ActorVista = Pick<Perfil, "id" | "rol">;

export const aFila = (t: Tarea): TareaFila => ({
  id: t.id,
  clienteId: t.clienteId,
  titulo: t.titulo,
  area: t.area,
  tipo: t.tipo,
  estado: t.estado,
  motivoStandby: t.motivoStandby,
  prioridad: t.prioridad,
  responsableId: t.responsableId,
  fechaEntrega: t.fechaEntrega,
  fechaPublicacion: t.fechaPublicacion,
  version: t.actualizadoEn.toISOString(),
});
