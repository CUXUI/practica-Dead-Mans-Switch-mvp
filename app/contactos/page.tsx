import { getBrand } from "@/lib/brand";
import { textosContactos } from "@/components/contactos/textos";
import Dia from "@/components/contactos/Dia";
import Reenviar from "@/components/contactos/Reenviar";
import { Badge, BarraTitulo, EnlaceBoton, Numero, Pantalla, Progreso, Tarjeta } from "@/components/emisor/ui";
import { CONFIG_EMISOR } from "@/app/aviso/_datos/config";
import { adaptadorExtras } from "@/app/aviso/_datos/adaptador";
import { avisoActual, exigirSesion } from "@/app/aviso/_datos/sesion";

// R-AV-E1 · Web Aviso · invitación enviada (y lista de contactos fuera del onboarding).
export default async function Contactos({
  searchParams,
}: {
  searchParams: Promise<{ enviada?: string; fallo?: string }>;
}) {
  const { enviada, fallo } = await searchParams;
  const s = await exigirSesion();
  const t = textosContactos(getBrand().variant).lista;

  const [{ data }, aviso] = await Promise.all([
    s.supabase
      .from("contacts")
      .select("id, name, status, created_at, accepted_at")
      .eq("issuer_id", s.user.id)
      .neq("status", "removed")
      .order("position"),
    avisoActual(s),
  ]);
  const contactos = data ?? [];
  const relaciones = await adaptadorExtras(s.supabase)
    .leerRelaciones(s.user.id, contactos.map((c) => c.id))
    .catch(() => ({}) as Record<string, string>);
  const enAlta = !aviso;
  const puedeAgregar = contactos.length < CONFIG_EMISOR.contactosMax;

  return (
    <Pantalla
      pie={
        <>
          {puedeAgregar && (
            <EnlaceBoton href="/contactos/nuevo" tipo={enAlta && contactos.length > 0 ? "secundario" : "principal"}>
              {t.agregar}
            </EnlaceBoton>
          )}
          {enAlta && contactos.length > 0 && <EnlaceBoton href="/aviso">{t.continuar}</EnlaceBoton>}
        </>
      }
    >
      {enAlta ? <Progreso actual={2} total={3} siguiente={t.siguiente} /> : <BarraTitulo titulo={t.titulo} volverHref="/home" />}

      {enviada && (
        <div role="status">
          <Badge>{t.enviada}</Badge>
        </div>
      )}
      {fallo && (
        <p role="alert" className="rounded-lg border-2 border-danger bg-surface p-3 text-sm font-medium">
          {t.falloCorreo}
        </p>
      )}

      <Tarjeta titulo={enAlta ? t.titulo : undefined} id="tus-contactos">
        <p className="text-text-muted">{t.texto}</p>
        {contactos.length === 0 && <p>{t.vacio}</p>}
        <ol className="space-y-3">
          {contactos.map((c, i) => (
            <li key={c.id} className="flex gap-3 rounded-lg border border-border/50 p-3">
              <Numero n={i + 1} />
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="font-semibold">{c.name}</p>
                {relaciones[c.id] && <p className="text-sm text-text-muted">{relaciones[c.id]}</p>}
                {c.status === "pending" && (
                  <>
                    <p className="text-sm text-text-muted">
                      <Dia iso={c.created_at} prefijo={t.enviadaEl} />
                    </p>
                    <p className="text-sm font-medium">{t.pendiente}</p>
                    <Reenviar contactId={c.id} nombre={c.name} t={t} />
                  </>
                )}
                {c.status === "accepted" && (
                  <p className="text-sm font-medium">
                    <Dia iso={c.accepted_at ?? c.created_at} prefijo={t.aceptoEl} />
                  </p>
                )}
                {c.status === "rejected" && <p className="text-sm font-medium">{t.rechazo}</p>}
              </div>
            </li>
          ))}
        </ol>
      </Tarjeta>
    </Pantalla>
  );
}
