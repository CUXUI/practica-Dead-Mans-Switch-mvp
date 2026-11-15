// Solo servidor. Punto único de entrada a los datos extra del aviso (tablas de la migración 0010 del núcleo).
import type { createClient } from "@/lib/supabase/server";
import { crearAdaptadorSupabase } from "./adaptador-supabase";
import type { AdaptadorExtras } from "./tipos";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export function adaptadorExtras(supabase: SupabaseClient): AdaptadorExtras {
  return crearAdaptadorSupabase(supabase);
}
