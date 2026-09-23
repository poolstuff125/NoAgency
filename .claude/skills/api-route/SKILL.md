---
name: api-route
description: Scaffold a new validated API route handler with its test. Use when the user asks for a new endpoint. Args - route path and HTTP methods, e.g. "projects GET POST".
---

Crea el endpoint `$ARGUMENTS`:

1. `src/app/api/<ruta>/route.ts` exportando cada método pedido.
   - Entrada validada con Zod (`safeParse`); 400 con `{ error: "invalid_input", issues }` si falla.
   - DB vía `import { db } from "@/db"` y tablas de `@/db/schema`.
   - `export const dynamic = "force-dynamic"` si lee datos que cambian.
2. `src/app/api/<ruta>/route.test.ts` con `// @vitest-environment node` y `vi.mock("server-only", () => ({}))`: caso feliz, entrada inválida y no encontrado cuando aplique.
3. Si hace falta una tabla nueva, sigue primero `/db-change`.
4. `npm run check`.
