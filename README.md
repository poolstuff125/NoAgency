# NoAgency

Web app full-stack: Next.js 16 · React 19 · TypeScript · Tailwind v4 · Drizzle (Postgres/PGlite) · Zod · Vitest · Playwright.

## Empezar

```bash
npm install
cp .env.example .env.local   # opcional: DATABASE_URL para Postgres real
npm run dev                  # http://localhost:3000
```

Sin `DATABASE_URL` la app usa PGlite (Postgres embebido), así que no necesitas servidor de base de datos en local.

## Scripts

- `npm run check` — lint, typecheck, formato y tests unitarios
- `npm run test:e2e` — tests end-to-end con Playwright
- `npm run db:generate` / `npm run db:migrate` — migraciones Drizzle

## Claude Code

Configuración en `.claude/`: agentes del proyecto, skills (`/check`, `/api-route`, `/db-change`), hooks (instalación al iniciar sesión web, formateo automático) y plugins oficiales habilitados. Ver `CLAUDE.md`.
