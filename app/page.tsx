import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Index() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Sin sesión, la entrada es el inicio del flujo 1 (Alta): /alta.
  redirect(user ? "/home" : "/alta");
}
