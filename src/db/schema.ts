import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";

// Every table enables RLS with no policies: the app connects as the table
// owner (bypasses RLS) and enforces permissions on the server, while
// Supabase's public REST API (anon key) gets no access at all.

export const rolUsuario = pgEnum("rol_usuario", ["admin", "equipo"]);
export const areaTrabajo = pgEnum("area_trabajo", [
  "audiovisual",
  "diseno",
  "pauta",
  "estrategia",
  "otro",
]);
export const estadoTarea = pgEnum("estado_tarea", [
  "no_iniciado",
  "en_proceso",
  "en_revision",
  "cambios",
  "listo",
  "standby",
]);
export const tipoPieza = pgEnum("tipo_pieza", [
  "post",
  "carrusel",
  "reel",
  "ugc",
  "historia",
  "anuncio",
  "otro",
]);
export const tipoAdjunto = pgEnum("tipo_adjunto", ["audio", "imagen", "video", "doc", "link"]);

const creadoEn = () => timestamp("creado_en", { withTimezone: true }).notNull().defaultNow();

export const perfiles = pgTable("perfiles", {
  // Same id as the Supabase Auth user (auth.users.id).
  id: uuid("id").primaryKey(),
  nombre: text("nombre").notNull(),
  email: text("email").notNull().unique(),
  rol: rolUsuario("rol").notNull().default("equipo"),
  areaPrincipal: areaTrabajo("area_principal"),
  avatarUrl: text("avatar_url"),
  activo: boolean("activo").notNull().default(true),
  creadoEn: creadoEn(),
}).enableRLS();

export const clientes = pgTable(
  "clientes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nombre: text("nombre").notNull(),
    color: text("color").notNull().default("#6366f1"),
    logoUrl: text("logo_url"),
    activo: boolean("activo").notNull().default(true),
    creadoEn: creadoEn(),
  },
  (t) => [check("clientes_color_hex", sql`${t.color} ~ '^#[0-9a-fA-F]{6}$'`)],
).enableRLS();

export const tareas = pgTable(
  "tareas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clienteId: uuid("cliente_id")
      .notNull()
      .references(() => clientes.id, { onDelete: "restrict" }),
    titulo: text("titulo").notNull(),
    area: areaTrabajo("area").notNull(),
    tipo: tipoPieza("tipo").notNull().default("post"),
    estado: estadoTarea("estado").notNull().default("no_iniciado"),
    motivoStandby: text("motivo_standby"),
    prioridad: smallint("prioridad").notNull().default(2),
    responsableId: uuid("responsable_id").references(() => perfiles.id, { onDelete: "set null" }),
    fechaEntrega: date("fecha_entrega"),
    fechaPublicacion: date("fecha_publicacion"),
    brief: text("brief"),
    linkEntrega: text("link_entrega"),
    orden: integer("orden").notNull().default(0),
    mondayId: text("monday_id").unique(),
    creadoPor: uuid("creado_por").references(() => perfiles.id, { onDelete: "set null" }),
    creadoEn: creadoEn(),
    actualizadoEn: timestamp("actualizado_en", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("tareas_cliente_id_idx").on(t.clienteId),
    index("tareas_responsable_id_idx").on(t.responsableId),
    index("tareas_estado_idx").on(t.estado),
    index("tareas_fecha_publicacion_idx").on(t.fechaPublicacion),
    check("tareas_prioridad_rango", sql`${t.prioridad} between 1 and 3`),
    check(
      "tareas_standby_requiere_motivo",
      sql`${t.estado} <> 'standby' or length(trim(coalesce(${t.motivoStandby}, ''))) > 0`,
    ),
  ],
).enableRLS();

export const comentarios = pgTable(
  "comentarios",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tareaId: uuid("tarea_id")
      .notNull()
      .references(() => tareas.id, { onDelete: "cascade" }),
    autorId: uuid("autor_id").references(() => perfiles.id, { onDelete: "set null" }),
    texto: text("texto").notNull(),
    creadoEn: creadoEn(),
  },
  (t) => [index("comentarios_tarea_id_idx").on(t.tareaId)],
).enableRLS();

export const adjuntos = pgTable(
  "adjuntos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tareaId: uuid("tarea_id")
      .notNull()
      .references(() => tareas.id, { onDelete: "cascade" }),
    nombre: text("nombre").notNull(),
    url: text("url"),
    storagePath: text("storage_path"),
    tipo: tipoAdjunto("tipo").notNull(),
    subidoPor: uuid("subido_por").references(() => perfiles.id, { onDelete: "set null" }),
    creadoEn: creadoEn(),
  },
  (t) => [index("adjuntos_tarea_id_idx").on(t.tareaId)],
).enableRLS();

export const historial = pgTable(
  "historial",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tareaId: uuid("tarea_id")
      .notNull()
      .references(() => tareas.id, { onDelete: "cascade" }),
    usuarioId: uuid("usuario_id").references(() => perfiles.id, { onDelete: "set null" }),
    campo: text("campo").notNull(),
    valorAnterior: text("valor_anterior"),
    valorNuevo: text("valor_nuevo"),
    creadoEn: creadoEn(),
  },
  (t) => [index("historial_tarea_id_idx").on(t.tareaId)],
).enableRLS();

export type Perfil = typeof perfiles.$inferSelect;
export type NuevoPerfil = typeof perfiles.$inferInsert;
export type Cliente = typeof clientes.$inferSelect;
export type NuevoCliente = typeof clientes.$inferInsert;
export type Tarea = typeof tareas.$inferSelect;
export type NuevaTarea = typeof tareas.$inferInsert;
export type Comentario = typeof comentarios.$inferSelect;
export type Adjunto = typeof adjuntos.$inferSelect;
export type Historial = typeof historial.$inferSelect;

export type RolUsuario = (typeof rolUsuario.enumValues)[number];
export type AreaTrabajo = (typeof areaTrabajo.enumValues)[number];
export type EstadoTarea = (typeof estadoTarea.enumValues)[number];
export type TipoPieza = (typeof tipoPieza.enumValues)[number];
export type TipoAdjunto = (typeof tipoAdjunto.enumValues)[number];
