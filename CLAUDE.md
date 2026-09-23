@AGENTS.md

# NoAgency

Web app full-stack en TypeScript. Next.js 16 (App Router) + React 19 + Tailwind v4 + Drizzle ORM (Postgres) + Zod. Supabase para Postgres en producción, Auth (`@supabase/ssr`) y Storage.

## Producto: No Agency OS — Módulo 1, gestor de tareas

**Fuente de verdad: [`docs/spec.md`](docs/spec.md).** Si algo aquí la contradice, manda la spec.

- Agencia de marketing en Puyo, Ecuador (~15 clientes). Reemplaza Monday.com. Primer módulo de una plataforma que luego tendrá métricas de Ads con IA y publicación en redes: **todo cuelga de `cliente_id`**.
- **Toda la interfaz en español neutro.** Zona horaria **America/Guayaquil** (usa `src/lib/fechas.ts`, nunca la hora del servidor).
- Flujo: el admin crea la pieza y el brief → el responsable produce y entrega un link de Drive → `en_revision` → `listo` (o `cambios`).
- Un solo espacio de trabajo: mes, cliente, área, responsable y estado son **filtros**, no tableros.
- Acceso solo por invitación (sin registro abierto). Primer admin: Paul Bayas (`npm run seed:admin`). Equipo: Ricardo Silva (audiovisual), Dominga Coloma (diseño).
- Fases: **1** esquema, seed, login/invitaciones, clientes, lista con creación rápida · **2** kanban, calendario, detalle, comentarios, adjuntos, historial, importación Monday · **3** Mis tareas, emails (Resend), resumen diario, duplicar mes, deploy Netlify · **4** apagar Monday.

### Modelo de datos (`src/db/schema.ts`)

Tablas y columnas en español, snake_case en SQL y camelCase en TS (`cliente_id` ↔ `clienteId`).

| Tabla         | Campos clave                                                                                                                                                                                                                                  |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `perfiles`    | `id` = id de Supabase Auth, nombre, email (único), rol (`admin`/`equipo`), area_principal, activo                                                                                                                                             |
| `clientes`    | nombre, color (hex, default `#6366f1`), logo_url, activo                                                                                                                                                                                      |
| `tareas`      | cliente_id (req.), titulo, area, tipo, estado, motivo_standby, prioridad (1 alta · 2 normal · 3 baja), responsable_id, fecha_entrega, fecha_publicacion, brief (markdown), link_entrega, orden, monday_id (único), creado_por, actualizado_en |
| `comentarios` | tarea_id (cascade), autor_id, texto                                                                                                                                                                                                           |
| `adjuntos`    | tarea_id (cascade), nombre, url, storage_path, tipo (`audio`/`imagen`/`video`/`doc`/`link`), subido_por                                                                                                                                       |
| `historial`   | tarea_id (cascade), usuario_id, campo, valor_anterior, valor_nuevo                                                                                                                                                                            |

Enums: `area_trabajo` (audiovisual, diseno, pauta, estrategia, otro) · `estado_tarea` (no_iniciado, en_proceso, en_revision, cambios, listo, standby) · `tipo_pieza` (post, carrusel, reel, ugc, historia, anuncio, otro). Etiquetas en español en `src/lib/dominio.ts`.

### Reglas de negocio (siempre en el servidor, en `src/lib/servicios/`)

- **Permisos en el servidor, no en RLS** (`src/lib/permisos.ts`). Admin: todo. Equipo: ve todo; en tareas donde es responsable cambia `estado` (nunca a `listo`), `link_entrega`, adjuntos y comentarios; comenta en cualquier tarea; no crea clientes ni tareas, no borra, no cambia responsables.
- Tarea nueva sin responsable → el **único** perfil activo con `area_principal` = área; si hay varios o ninguno, queda vacía.
- `standby` exige `motivo_standby` (también hay un CHECK en la DB); al salir de standby se limpia.
- Cambios de estado, responsable, fecha_entrega y fecha_publicacion → fila en `historial` (solo si el valor cambia).
- Mes de una tarea en el tablero: `fecha_publicacion`, si no `fecha_entrega`, si no `creado_en` (hora de Ecuador).
- Contador de pendientes en la barra (hasta los emails de fase 3): admin → tareas `en_revision`; equipo → sus tareas en `cambios`.

## Comandos

| Tarea                    | Comando                                                  |
| ------------------------ | -------------------------------------------------------- |
| Dev server               | `npm run dev`                                            |
| Todas las verificaciones | `npm run check` (lint + typecheck + format + unit tests) |
| Unit tests               | `npm test` (Vitest, `src/**/*.test.ts(x)`)               |
| E2E                      | `npm run test:e2e` (Playwright, `e2e/`)                  |
| Formatear                | `npm run format`                                         |
| Migraciones              | `npm run db:generate` → `npm run db:migrate`             |
| Crear el primer admin    | `ADMIN_EMAIL=… npm run seed:admin`                       |

En el sandbox de Claude Code web, e2e necesita `PLAYWRIGHT_CHROMIUM_PATH=/opt/pw-browsers/chromium` (ya lo exporta el hook de inicio). No ejecutes `playwright install`.

## Estructura

- `src/app/(auth)/` — login, recuperar y actualizar contraseña (+ `acciones.ts`). `src/app/auth/confirm` — canje del enlace de invitación/recuperación.
- `src/app/(app)/` — pantallas autenticadas (tablero, clientes, equipo) y `acciones.ts` (server actions: delgadas, delegan en servicios).
- `src/lib/servicios/` — lógica de dominio (tareas, clientes, equipo). Reciben `db` y el actor como parámetros: se testean contra PGlite sin mocks.
- `src/lib/auth.ts` — `exigirPerfil()` (páginas) y `perfilParaAccion()` (server actions). La sesión de Supabase no basta: el usuario debe tener un perfil **activo**.
- `src/proxy.ts` — refresca la sesión y redirige a `/login` (chequeo optimista; la autorización real está en páginas y acciones).
- `src/components/` — UI por dominio (`tareas/`, `clientes/`, `equipo/`).
- `src/db/schema.ts` — esquema Drizzle (fuente de verdad del modelo de datos). `src/db/index.ts` — cliente (`server-only`); `src/db/client.ts` — fábrica usable desde scripts.
- `scripts/` — scripts de terminal (`tsx`), p. ej. `seed-admin.ts`.
- `src/env.ts` — variables de entorno validadas con Zod. Añade aquí toda variable nueva y en `.env.example`.
- `e2e/` — tests Playwright. `drizzle/` — migraciones generadas (no editar a mano).

## Base de datos

Sin `DATABASE_URL` se usa PGlite (Postgres embebido en WASM): en memoria, o en disco si `PGLITE_DIR` está definido (aplica migraciones con `npm run db:migrate`). En producción `DATABASE_URL` apunta al pooler de transacciones de Supabase (6543) y `DATABASE_URL_DIRECT` a la conexión de sesión (5432) para `drizzle-kit`. PGlite está en `serverExternalPackages` en `next.config.ts`; no lo quites.

Todas las tablas tienen **RLS activado sin políticas**: la app conecta como dueña de las tablas (no le afecta) y la API REST pública de Supabase (anon key) queda sin acceso. No agregues políticas RLS: los permisos viven en `src/lib/permisos.ts`. Toda tabla nueva lleva `.enableRLS()`.

Tests de DB: `crearDbPrueba()` una vez por archivo (`beforeAll`) y `vaciarDb()` en `beforeEach` (`src/test/db.ts`); fixtures en `src/test/fixtures.ts`.

## Supabase

Configuración paso a paso en [`docs/supabase.md`](docs/supabase.md). Variables en `.env.example`. `SUPABASE_SERVICE_ROLE_KEY` solo en servidor (`src/lib/supabase/admin.ts`, marcado `server-only`). Sin variables de Supabase la app arranca y muestra el login deshabilitado (así corren CI y e2e).

## Convenciones

- Valida toda entrada externa (body, params, searchParams) con Zod en el borde.
- Textos de UI en español neutro. Identificadores del dominio en español como la spec (`tareas`, `clienteId`, `crearTarea`); comentarios y utilidades genéricas pueden ir en inglés.
- Mutaciones: server action → `ejecutarAccion()` → servicio. Errores para el usuario con `ErrorDominio` (mensaje en español); el resto se loguea y se muestra un mensaje genérico.
- Cada cambio de comportamiento lleva test (unit en el mismo directorio, `*.test.ts(x)`; flujos de usuario en `e2e/`).
- Antes de dar algo por terminado: `npm run check`. Si tocas rutas o UI, también `npm run build`.
- No commitees `.env*` (excepto `.env.example`).

## Agentes del proyecto (`.claude/agents/`)

- `frontend-engineer` — páginas, componentes, Tailwind, accesibilidad.
- `backend-engineer` — route handlers, server actions, validación, lógica de dominio.
- `db-architect` — esquema Drizzle, migraciones, consultas.
- `test-engineer` — Vitest y Playwright.
- `code-reviewer` — revisión de diffs antes de commit/PR (solo lectura).

Skills: `/check`, `/api-route`, `/db-change`. Plugins en `.claude/settings.json`.
