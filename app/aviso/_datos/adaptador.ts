// Solo servidor. Punto único de entrada a los datos extra del aviso.
import type { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;
import { CONFIG_EMISOR } from "./config";
import { adaptadorFichero } from "./adaptador-fichero";
import { crearAdaptadorSupabase } from "./adaptador-supabase";
import type { AdaptadorExtras } from "./tipos";

export function adaptadorExtras(supabase: SupabaseClient): AdaptadorExtras {
  return CONFIG_EMISOR.adaptadorExtras === "supabase" ? crearAdaptadorSupabase(supabase) : adaptadorFichero;
}
