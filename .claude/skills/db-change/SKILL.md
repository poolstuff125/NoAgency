---
name: db-change
description: Change the database schema safely with Drizzle - edit schema, generate migration, review SQL, verify. Use for new tables, columns, indexes or relations.
---

Cambio de esquema: `$ARGUMENTS`

1. Edita `src/db/schema.ts` siguiendo las convenciones del agente `db-architect` (uuid, timestamps con zona, tipos inferidos).
2. `npm run db:generate` y muestra el SQL nuevo de `drizzle/`. Si incluye `DROP` o renombres, detente y pide confirmación.
3. `npm run db:migrate` (aplica a PGlite local o a `DATABASE_URL`).
4. Actualiza/añade tests que usen la tabla y ejecuta `npm run check`.
