# Configurar Supabase

1. **Proyecto**: crea un proyecto en Supabase (región más cercana: `us-east-1`).
2. **Variables** (Project Settings → API y botón **Connect**). Ponlas en `.env.local` (local) y en Netlify (producción):

   | Variable                                                                   | Dónde                                                    |
   | -------------------------------------------------------------------------- | -------------------------------------------------------- |
   | `NEXT_PUBLIC_SUPABASE_URL`                                                 | Project URL                                              |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` (o `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) | clave `anon` o _publishable_ (`sb_publishable_…`)        |
   | `SUPABASE_SERVICE_ROLE_KEY`                                                | clave `service_role` (o _secret_). Solo servidor         |
   | `DATABASE_URL`                                                             | Connect → Transaction pooler (puerto 6543)               |
   | `DATABASE_URL_DIRECT`                                                      | Connect → Session pooler (puerto 5432), para migraciones |
   | `NEXT_PUBLIC_SITE_URL`                                                     | URL pública de la app (p. ej. `https://os.noagency.ec`)  |
   | `ADMIN_EMAIL`                                                              | email de Paul, solo para el seed                         |

3. **Registro cerrado**: Authentication → Sign In / Providers → Email: desactiva **Allow new users to sign up**. Las invitaciones del admin siguen funcionando.
4. **URLs**: Authentication → URL Configuration → _Site URL_ = `NEXT_PUBLIC_SITE_URL`; agrega `http://localhost:3000/**` y la URL de producción a _Redirect URLs_.
5. **Plantillas de email** (Authentication → Emails). Cambia el enlace para que pase por `/auth/confirm` (flujo SSR con `token_hash`):
   - **Invite user**: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/actualizar-contrasena`
   - **Reset password**: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/actualizar-contrasena`

   Textos sugeridos en español: "Te invitaron a No Agency OS — crea tu contraseña" / "Crea una nueva contraseña".

6. **Migraciones**: `npm run db:migrate` (usa `DATABASE_URL_DIRECT`). Crea tablas, enums e índices, y activa RLS sin políticas en todas las tablas.
7. **Primer admin**: `npm run seed:admin`. Envía la invitación a `ADMIN_EMAIL` y crea el perfil _Paul Bayas_ con rol admin. Se puede repetir sin duplicar.
8. **Equipo**: Paul entra, va a **Equipo** e invita a Ricardo Silva (audiovisual) y Dominga Coloma (diseño).
9. **Storage (fase 2)**: bucket privado `attachments` para adjuntos (URLs firmadas).

> El envío de emails de Supabase en el plan gratis tiene un límite bajo por hora. Para producción configura SMTP propio (Authentication → Emails → SMTP), por ejemplo con Resend, que ya está previsto para la fase 3.

## Hosting en Render (plan gratis)

`render.yaml` define el servicio. En Render: **New → Blueprint** → repo `NoAgency` → rama de trabajo → completa `SUPABASE_SERVICE_ROLE_KEY` y `DATABASE_URL` (Transaction pooler, 6543) → **Apply**. URL: `https://noagency-os.onrender.com` (si Render asigna otra, actualiza `NEXT_PUBLIC_SITE_URL` en Render y la _Site URL_ / _Redirect URLs_ de Supabase). En el plan gratis el servicio se duerme tras ~15 min sin uso.
