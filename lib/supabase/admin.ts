import { createClient } from "@supabase/supabase-js";

// Cliente con service_role. SOLO servidor (páginas, acciones y rutas de API).
// Se usa cuando no hay sesión: por ejemplo, quien recibe una invitación desde el enlace del correo.
export function clienteAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!key || !url) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
