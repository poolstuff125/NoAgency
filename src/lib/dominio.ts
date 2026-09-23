import {
  areaTrabajo,
  estadoTarea,
  rolUsuario,
  tipoPieza,
  type AreaTrabajo,
  type EstadoTarea,
  type RolUsuario,
  type TipoPieza,
} from "@/db/schema";

export const AREAS = areaTrabajo.enumValues;
export const ESTADOS = estadoTarea.enumValues;
export const TIPOS = tipoPieza.enumValues;
export const ROLES = rolUsuario.enumValues;
export const PRIORIDADES = [1, 2, 3] as const;

export const ETIQUETA_AREA: Record<AreaTrabajo, string> = {
  audiovisual: "Audiovisual",
  diseno: "Diseño",
  pauta: "Pauta",
  estrategia: "Estrategia",
  otro: "Otro",
};

export const ETIQUETA_ESTADO: Record<EstadoTarea, string> = {
  no_iniciado: "No iniciado",
  en_proceso: "En proceso",
  en_revision: "En revisión",
  cambios: "Cambios",
  listo: "Listo",
  standby: "Standby",
};

export const ETIQUETA_TIPO: Record<TipoPieza, string> = {
  post: "Post",
  carrusel: "Carrusel",
  reel: "Reel",
  ugc: "UGC",
  historia: "Historia",
  anuncio: "Anuncio",
  otro: "Otro",
};

export const ETIQUETA_ROL: Record<RolUsuario, string> = {
  admin: "Admin",
  equipo: "Equipo",
};

export const ETIQUETA_PRIORIDAD: Record<number, string> = {
  1: "Alta",
  2: "Normal",
  3: "Baja",
};

/** Tailwind classes per status pill. */
export const COLOR_ESTADO: Record<EstadoTarea, string> = {
  no_iniciado: "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100",
  en_proceso: "bg-amber-200 text-amber-900 dark:bg-amber-500/30 dark:text-amber-100",
  en_revision: "bg-sky-200 text-sky-900 dark:bg-sky-500/30 dark:text-sky-100",
  cambios: "bg-rose-200 text-rose-900 dark:bg-rose-500/30 dark:text-rose-100",
  listo: "bg-emerald-200 text-emerald-900 dark:bg-emerald-500/30 dark:text-emerald-100",
  standby: "bg-violet-200 text-violet-900 dark:bg-violet-500/30 dark:text-violet-100",
};
