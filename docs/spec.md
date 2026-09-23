# No Agency OS — Módulo 1: Gestor de tareas

> Fuente de verdad del producto. Decisiones técnicas en `CLAUDE.md`.

## Contexto

No Agency es una agencia de marketing en Puyo, Ecuador, con ~15 clientes. Reemplaza Monday.com (3 usuarios). Primer módulo de una plataforma que luego tendrá métricas de Meta/TikTok Ads con IA y publicación en redes (tipo Metricool). Toda la interfaz en español neutro. Zona horaria America/Guayaquil (UTC-5).

## Usuarios y acceso

- Solo por invitación, sin registro abierto. El admin invita por email desde la app.
- Primer admin: Paul Bayas, creado con un script seed (`SUPABASE_SERVICE_ROLE_KEY` + `ADMIN_EMAIL`).
- Equipo inicial (los invita el admin desde la app): Ricardo Silva (área audiovisual) y Dominga Coloma (área diseño).

## Flujo real del equipo

1. El admin crea la pieza y escribe el brief (objetivo, texto en arte, brief visual, CTA, slides).
2. A veces adjunta un audio de voz en off (.mp3 de ElevenLabs).
3. El responsable (audiovisual o diseño) produce y entrega un link de Google Drive.
4. Pasa a revisión y luego a listo.

Problemas a resolver frente a Monday:

- Hoy se crea un tablero por mes y por área. Aquí es un solo espacio; mes y área son filtros.
- 36% de tareas sin responsable → asignación automática según el área.
- Brief y entrega estaban mezclados en comentarios → son campos propios.
- No había paso de revisión → estados en_revision y cambios.

## Modelo de datos (Drizzle, Postgres)

Enums:

- rol_usuario: admin, equipo
- area_trabajo: audiovisual, diseno, pauta, estrategia, otro
- estado_tarea: no_iniciado, en_proceso, en_revision, cambios, listo, standby
- tipo_pieza: post, carrusel, reel, ugc, historia, anuncio, otro

perfiles

- id (uuid, = id de Supabase Auth), nombre, email, rol (default equipo), area_principal (area_trabajo, nullable), avatar_url, activo (default true), creado_en

clientes

- id, nombre, color (hex, default #6366f1), logo_url, activo (default true), creado_en

tareas

- id, cliente_id (FK, requerido), titulo (requerido), area (requerido), tipo (default post)
- estado (default no_iniciado), motivo_standby (requerido si estado = standby)
- prioridad (smallint: 1 alta, 2 normal, 3 baja; default 2)
- responsable_id (FK perfiles, nullable), fecha_entrega (date), fecha_publicacion (date)
- brief (text, markdown), link_entrega (text), orden (int, para kanban)
- monday_id (text, unique, nullable — solo migración)
- creado_por (FK perfiles), creado_en, actualizado_en
- Índices: cliente_id, responsable_id, estado, fecha_publicacion

comentarios

- id, tarea_id (FK cascade), autor_id, texto, creado_en

adjuntos

- id, tarea_id (FK cascade), nombre, url (Storage o link externo, nullable), storage_path (nullable), tipo (audio, imagen, video, doc, link), subido_por, creado_en

historial

- id, tarea_id (FK cascade), usuario_id, campo, valor_anterior, valor_nuevo, creado_en

## Reglas de negocio (en el servidor)

- Al crear una tarea sin responsable: asignar el perfil activo cuya area_principal coincide con el área. Si hay varios o ninguno, queda vacío.
- Cada cambio de estado, responsable o fechas se registra en historial.
- Estado standby exige motivo_standby.
- Permisos:
  - admin: todo (clientes, tareas, usuarios, borrar).
  - equipo: ve todo; en tareas donde es responsable puede cambiar estado (menos a "listo", que solo aprueba el admin), link_entrega, adjuntos y comentarios. Puede comentar en cualquier tarea. No crea clientes, no borra tareas, no cambia responsables.

## Pantallas

1. Login (email y contraseña, solo invitados). Recuperar contraseña.
2. Mis tareas: vencidas, hoy, esta semana, en revisión (para el admin: todo lo que está en revisión).
3. Tablero con filtros: mes, cliente, área, responsable, estado. Tres vistas:
   - Lista agrupada por cliente, estilo Monday, con edición en línea y fila "+ Agregar pieza" por grupo.
   - Kanban por estado con drag & drop (@dnd-kit).
   - Calendario mensual por fecha_publicacion, con el color del cliente.
4. Detalle de tarea (panel lateral): todos los campos, brief en markdown, link de entrega con botón "Abrir", adjuntos (reproductor para audio), comentarios e historial.
5. Clientes: lista, crear/editar, color y logo; vista por cliente con sus piezas del mes.
6. Equipo (solo admin): invitar por email, rol, área principal, activar/desactivar.

Extras:

- Duplicar mes: copiar las piezas de un cliente al mes siguiente, sin entregas, estados ni fechas exactas (mismo día del mes siguiente).
- Si el estado pasa a en_revision se notifica al admin; a cambios, al responsable (notificaciones reales en fase 3; en fase 1–2 basta con un contador en la interfaz).
- Diseño limpio, responsive, usable desde el celular.

## Migración desde Monday

Archivo: data/tareas_migracion_septiembre.csv (lo subiré al repo). 114 tareas de septiembre 2026, 13 clientes.
Columnas: monday_id, area, cliente, titulo, responsable, estado, prioridad, fecha, brief, entregables, adjuntos.

Script scripts/importar-monday.ts (idempotente por monday_id):

- Crea clientes que no existan.
- Estados: Listo → listo, No iniciado → no_iniciado, STANDBY → standby (si prioridad dice "STOP FALTA MATERIAL", va a motivo_standby).
- Área: Audiovisual → audiovisual, Diseño → diseno.
- Responsable por nombre (Ricardo Silva, Dominga Coloma, Paul Bayas); vacío → regla de asignación por área.
- fecha → fecha_entrega y fecha_publicacion.
- entregables (separados por " | "): el primero a link_entrega, el resto a adjuntos tipo link.
- adjuntos (nombres de audios ElevenLabs) → adjuntos tipo audio sin url.

## Fases

- Fase 1: esquema completo + migraciones, seed del admin, login e invitaciones, clientes, vista lista con creación rápida.
- Fase 2: kanban, calendario, detalle de tarea, comentarios, adjuntos (Supabase Storage, bucket privado con URLs firmadas), historial, script de importación.
- Fase 3: Mis tareas, notificaciones por email (Resend), resumen diario 8:00, duplicar mes, deploy en Netlify. Uso en paralelo con Monday 1–2 semanas.
- Fase 4: cancelar Monday.

## Pensado para después (no construir aún)

- Rol cliente: ve su calendario, aprueba o pide cambios.
- Publicación en Instagram/Facebook/TikTok: tarea aprobada → cola de publicación.
- Métricas de Meta/TikTok Ads por cliente con análisis de IA.

Por eso todo cuelga de cliente_id y ya existen los estados de revisión.
