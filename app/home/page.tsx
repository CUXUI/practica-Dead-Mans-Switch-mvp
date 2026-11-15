import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBrand } from "@/lib/brand";
import { textosHome } from "@/components/home/textos";
import { textosInicio } from "@/components/home/textosInicio";
import InicioApagado from "@/components/home/InicioApagado";
import InicioActivo from "@/components/home/InicioActivo";
import CancelarAlerta from "@/components/home/CancelarAlerta";
import type { Frecuencia } from "@/app/aviso/_datos/tipos";
import { avisoActual } from "@/app/aviso/_datos/sesion";
import { adaptadorExtras } from "@/app/aviso/_datos/adaptador";
import type { DatosContacto } from "@/app/aviso/_datos/tipos";
import { listaNombres, primerNombre } from "@/app/aviso/_datos/formato";
import { rellenar } from "@/components/aviso/textos";

// Inicio de quien emite: sin aviso → alta · apagado → Inicio apagado · encendido → Inicio activo.
// En alerta → placeholder del núcleo con E6 (ver CONEXIÓN · Francis más abajo).
//
// CONEXIÓN · Alta (Sarah): sin aviso se manda a /alta, que no va en este PR. Lo que supuse: el alta
// (comienzo y notificaciones) termina en /contactos/nuevo. Desde ahí sigue este flujo en modo alta
// ("sin aviso todavía"): primer contacto, contactos y configurar el aviso, que se guarda apagado.
export async function generateMetadata() {
  return { title: textosInicio(getBrand().variant).titulo };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ alerta?: string; encendido?: string; apagado?: string; confirmado?: string }>;
}) {
  const { alerta, encendido, apagado, confirmado } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // El perfil y el aviso se piden a la vez: cada consulta es un viaje a la base.
  const [{ data: profile }, aviso] = await Promise.all([
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).single(),
    avisoActual({ supabase, user }),
  ]);

  const brand = getBrand();
  const textos = textosHome(brand.variant);

  // Desvío tras el login (Figma: «¿Cómo está su aviso?»):
  // sin aviso → onboarding · apagado → Inicio apagado · encendido / en alerta → lo de abajo.
  if (!aviso) redirect("/alta");
  if (aviso.state === "off") {
    const [{ data: filas }, extrasAviso, { data: todosAceptados }] = await Promise.all([
      supabase.from("notice_contacts").select("position, contacts(id, name, status, accepted_at)").eq("notice_id", aviso.id).order("position"),
      adaptadorExtras(supabase).leerAviso(user.id, aviso.id).catch(() => null),
      // Contactos que ya aceptaron (para saber si alguno está fuera de este aviso).
      supabase.from("contacts").select("id, name").eq("issuer_id", user.id).eq("status", "accepted"),
    ]);
    const contactos = (filas ?? [])
      .map((f) => (Array.isArray(f.contacts) ? f.contacts[0] : f.contacts) as { id: string; name: string; status: string; accepted_at: string | null } | null)
      .filter((c): c is { id: string; name: string; status: string; accepted_at: string | null } => !!c && c.status !== "removed");
    // "Aún no responde" solo vale si la invitación salió. Si no salió, se dice eso.
    const extras = await adaptadorExtras(supabase)
      .leerContactos(user.id, contactos.map((c) => c.id))
      .catch(() => ({}) as Record<string, DatosContacto>);
    const enviada = (c: { id: string }) => !!extras[c.id]?.invitacionEnviadaEn;
    const aceptados = contactos.filter((c) => c.status === "accepted").map((c) => primerNombre(c.name));
    // Contactos que ya aceptaron pero no están dentro de este aviso (el nombre sale de la base).
    const dentro = new Set(contactos.map((c) => c.id));
    const aceptadosFuera = (todosAceptados ?? []).filter((c) => !dentro.has(c.id)).map((c) => primerNombre(c.name));
    // Quienes se dieron de baja desde su correo en los últimos 30 días: Inicio dice que se fueron.
    // CONEXIÓN · Francis (dejar de ser contacto, /baja): esa página no va en este PR. Lo que supuse: la baja
    // deja el contacto en status = "rejected" con removed_at, y si era el último aceptado apaga el aviso.
    const { data: salidas } = await supabase
      .from("contacts")
      .select("name")
      .eq("issuer_id", user.id)
      .eq("status", "rejected")
      .gt("removed_at", new Date(Date.now() - 30 * 86_400_000).toISOString());
    const tI = textosInicio(brand.variant);
    return (
      <InicioApagado
        aceptadosFuera={aceptadosFuera}
        salieron={(salidas ?? []).map((c) => primerNombre(c.name as string))}
        t={textosInicio(brand.variant)}
        app={brand.name}
        nombre={primerNombre(profile?.full_name ?? "")}
        aceptados={aceptados}
        apagadoAhora={apagado === "1"}
        canceladaAhora={alerta === "cancelada" ? textos.canceladaTitulo : undefined}
        plazo={{ fireAt: aviso.fire_at, frecuencia: aviso.recurrence as Frecuencia, dias: extrasAviso?.dias ?? [] }}
        pendientes={contactos.filter((c) => c.status === "pending" && enviada(c)).map((c) => primerNombre(c.name))}
        sinEnviar={contactos.filter((c) => c.status === "pending" && !enviada(c)).map((c) => primerNombre(c.name))}
        vacio={contactos.length === 0}
        rechazados={contactos.filter((c) => c.status === "rejected").map((c) => primerNombre(c.name))}
      />
    );
  }

  // CONEXIÓN · Francis (Inicio con alerta en curso y cancelar, E6): esta pantalla no va en este PR.
  // Hasta que llegue, se deja el bloque de alerta del placeholder del núcleo, tal cual.
  // Lo que supuse: Inicio decide la pantalla por notices.state ("off", "active", "alert") y con "alert"
  // le pasa el control a la pantalla de Francis. Tras cancelar, su flujo vuelve a /home?alerta=cancelada
  // y Inicio apagado enseña el aviso "alerta cancelada" (canceladaAhora).
  if (aviso.state === "alert") {
    return (
      <main className="mx-auto max-w-md space-y-6 p-6">
        <section aria-labelledby="alerta-en-curso" className="space-y-3 rounded-lg border-2 border-danger bg-surface p-4">
          <h2 id="alerta-en-curso" className="text-lg font-semibold">
            {textos.alertaTitulo}
          </h2>
          <p className="text-text-muted">{textos.alertaCuerpo}</p>
          <CancelarAlerta textos={textos} />
        </section>
      </main>
    );
  }

  // Aviso encendido (E-02 Activo), con su ventana de confirmar y su tiempo de gracia.
  const extrasAviso = await adaptadorExtras(supabase).leerAviso(user.id, aviso.id).catch(() => null);
  return (
    <InicioActivo
      t={textosInicio(brand.variant)}
      app={brand.name}
      nombre={primerNombre(profile?.full_name ?? "")}
      encendidoAhora={encendido === "1"}
      confirmadoAhora={confirmado === "1"}
      graciaMin={(aviso.grace_minutes as number | null) ?? 0}
      plazo={{ fireAt: aviso.fire_at, frecuencia: aviso.recurrence as Frecuencia, dias: extrasAviso?.dias ?? [] }}
    />
  );
}
