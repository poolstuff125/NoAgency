import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { crearSupabaseServidor } from "@/lib/supabase/server";

const TIPOS_VALIDOS: EmailOtpType[] = ["invite", "recovery", "email", "magiclink", "signup"];

/**
 * Landing for links in invite and password-recovery emails. Exchanges the
 * one-time token for a session, then sends the user to `next`
 * (usually /actualizar-contrasena). Requires the Supabase email templates to
 * link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=<tipo>&next=...`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = rutaInterna(searchParams.get("next"));

  const supabase = await crearSupabaseServidor();
  let ok = false;
  if (tokenHash && type && TIPOS_VALIDOS.includes(type)) {
    ok = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error;
  } else if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  }

  return NextResponse.redirect(new URL(ok ? next : "/login?error=enlace-invalido", origin));
}

/** Only same-site relative paths, to avoid open redirects. */
function rutaInterna(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/tablero";
}
