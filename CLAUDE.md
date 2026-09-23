@AGENTS.md

# NoAgency

Web app full-stack en TypeScript. Next.js 16 (App Router) + React 19 + Tailwind v4 + Drizzle ORM (Postgres) + Zod.

## Comandos

| Tarea                    | Comando                                                  |
| ------------------------ | -------------------------------------------------------- |
| Dev server               | `npm run dev`                                            |
| Todas las verificaciones | `npm run check` (lint + typecheck + format + unit tests) |
| Unit tests               | `npm test` (Vitest, `src/**/*.test.ts(x)`)               |
| E2E                      | `npm run test:e2e` (Playwright, `e2e/`)                  |
| Formatear                | `npm run format`                                         |
| Migraciones              | `npm run db:generate` → `npm run db:migrate`             |

En el sandbox de Claude Code web, e2e necesita `PLAYWRIGHT_CHROMIUM_PATH=/opt/pw-browsers/chromium` (ya lo exporta el hook de inicio). No ejecutes `playwright install`.

## Estructura

- `src/app/` — rutas (páginas y `api/**/route.ts`). Server Components por defecto; `"use client"` solo cuando haga falta estado/efectos.
- `src/db/schema.ts` — esquema Drizzle (fuente de verdad del modelo de datos). `src/db/index.ts` — cliente (`server-only`).
- `src/env.ts` — variables de entorno validadas con Zod. Añade aquí toda variable nueva y en `.env.example`.
- `e2e/` — tests Playwright. `drizzle/` — migraciones generadas (no editar a mano).

## Base de datos

Sin `DATABASE_URL` se usa PGlite (Postgres embebido en WASM): en memoria, o en disco si `PGLITE_DIR` está definido. En producción define `DATABASE_URL`. PGlite está en `serverExternalPackages` en `next.config.ts`; no lo quites.

## Convenciones

- Valida toda entrada externa (body, params, searchParams) con Zod en el borde.
- Código en inglés; textos de UI en español.
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
