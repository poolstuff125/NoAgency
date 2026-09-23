---
name: check
description: Run every quality gate (lint, typecheck, format, unit tests, build, e2e) and fix what fails. Use before committing or when asked to verify the project.
---

1. Ejecuta `npm run check`. Si falla, corrige la causa raíz y repite.
   - Formato: `npm run format` y vuelve a comprobar.
2. Ejecuta `npm run build`.
3. Ejecuta `npm run test:e2e`.
4. Resume en una tabla: paso, resultado, y qué corregiste. No marques como verde nada que no hayas visto pasar.
