CREATE TYPE "public"."area_trabajo" AS ENUM('audiovisual', 'diseno', 'pauta', 'estrategia', 'otro');--> statement-breakpoint
CREATE TYPE "public"."estado_tarea" AS ENUM('no_iniciado', 'en_proceso', 'en_revision', 'cambios', 'listo', 'standby');--> statement-breakpoint
CREATE TYPE "public"."rol_usuario" AS ENUM('admin', 'equipo');--> statement-breakpoint
CREATE TYPE "public"."tipo_adjunto" AS ENUM('audio', 'imagen', 'video', 'doc', 'link');--> statement-breakpoint
CREATE TYPE "public"."tipo_pieza" AS ENUM('post', 'carrusel', 'reel', 'ugc', 'historia', 'anuncio', 'otro');--> statement-breakpoint
CREATE TABLE "adjuntos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tarea_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"url" text,
	"storage_path" text,
	"tipo" "tipo_adjunto" NOT NULL,
	"subido_por" uuid,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "adjuntos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "clientes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"color" text DEFAULT '#6366f1' NOT NULL,
	"logo_url" text,
	"activo" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clientes_color_hex" CHECK ("clientes"."color" ~ '^#[0-9a-fA-F]{6}$')
);
--> statement-breakpoint
ALTER TABLE "clientes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "comentarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tarea_id" uuid NOT NULL,
	"autor_id" uuid,
	"texto" text NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comentarios" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "historial" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tarea_id" uuid NOT NULL,
	"usuario_id" uuid,
	"campo" text NOT NULL,
	"valor_anterior" text,
	"valor_nuevo" text,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "historial" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "perfiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"email" text NOT NULL,
	"rol" "rol_usuario" DEFAULT 'equipo' NOT NULL,
	"area_principal" "area_trabajo",
	"avatar_url" text,
	"activo" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "perfiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "perfiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tareas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cliente_id" uuid NOT NULL,
	"titulo" text NOT NULL,
	"area" "area_trabajo" NOT NULL,
	"tipo" "tipo_pieza" DEFAULT 'post' NOT NULL,
	"estado" "estado_tarea" DEFAULT 'no_iniciado' NOT NULL,
	"motivo_standby" text,
	"prioridad" smallint DEFAULT 2 NOT NULL,
	"responsable_id" uuid,
	"fecha_entrega" date,
	"fecha_publicacion" date,
	"brief" text,
	"link_entrega" text,
	"orden" integer DEFAULT 0 NOT NULL,
	"monday_id" text,
	"creado_por" uuid,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tareas_monday_id_unique" UNIQUE("monday_id"),
	CONSTRAINT "tareas_prioridad_rango" CHECK ("tareas"."prioridad" between 1 and 3),
	CONSTRAINT "tareas_standby_requiere_motivo" CHECK ("tareas"."estado" <> 'standby' or length(trim(coalesce("tareas"."motivo_standby", ''))) > 0)
);
--> statement-breakpoint
ALTER TABLE "tareas" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "adjuntos" ADD CONSTRAINT "adjuntos_tarea_id_tareas_id_fk" FOREIGN KEY ("tarea_id") REFERENCES "public"."tareas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adjuntos" ADD CONSTRAINT "adjuntos_subido_por_perfiles_id_fk" FOREIGN KEY ("subido_por") REFERENCES "public"."perfiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_tarea_id_tareas_id_fk" FOREIGN KEY ("tarea_id") REFERENCES "public"."tareas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_autor_id_perfiles_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."perfiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "historial" ADD CONSTRAINT "historial_tarea_id_tareas_id_fk" FOREIGN KEY ("tarea_id") REFERENCES "public"."tareas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "historial" ADD CONSTRAINT "historial_usuario_id_perfiles_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."perfiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_responsable_id_perfiles_id_fk" FOREIGN KEY ("responsable_id") REFERENCES "public"."perfiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_creado_por_perfiles_id_fk" FOREIGN KEY ("creado_por") REFERENCES "public"."perfiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "adjuntos_tarea_id_idx" ON "adjuntos" USING btree ("tarea_id");--> statement-breakpoint
CREATE INDEX "comentarios_tarea_id_idx" ON "comentarios" USING btree ("tarea_id");--> statement-breakpoint
CREATE INDEX "historial_tarea_id_idx" ON "historial" USING btree ("tarea_id");--> statement-breakpoint
CREATE INDEX "tareas_cliente_id_idx" ON "tareas" USING btree ("cliente_id");--> statement-breakpoint
CREATE INDEX "tareas_responsable_id_idx" ON "tareas" USING btree ("responsable_id");--> statement-breakpoint
CREATE INDEX "tareas_estado_idx" ON "tareas" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "tareas_fecha_publicacion_idx" ON "tareas" USING btree ("fecha_publicacion");