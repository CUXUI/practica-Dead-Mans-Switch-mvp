import type { Variant } from "@/lib/brand";
import { textosAlerta } from "./textos";
import type { DatosAlerta } from "./tipos";

// Pantalla de la alerta para quien recibe (R2 a R7). Es una página pública sin cuenta:
// se ve bien en celular y en computadora. Solo texto y enlaces; no ejecuta acciones solo.
// R3 ("visto") se registra en el servidor al abrir la página: lo hace el núcleo, no este componente.

export default function AlertaPantalla({
  variant,
  datos,
  nombreMarca,
}: {
  variant: Variant;
  datos: DatosAlerta;
  nombreMarca: string;
}) {
  const t = textosAlerta(variant);
  const nombre = datos.nombreQuienEmite;
  const telefono = datos.telefonoQuienEmite;
  const mensaje = encodeURIComponent(t.mensajeWhatsapp(nombre));

  return (
    <main className="mx-auto w-full max-w-md space-y-4 p-4 md:max-w-2xl">
      <header className="flex items-center gap-3 py-2">
        <span aria-hidden="true" className="size-8 rounded-full bg-text" />
        <h1 className="text-xl font-semibold">{nombreMarca}</h1>
      </header>

      <section
        aria-label="Cómo llegó esta alerta"
        className="rounded-lg bg-surface-muted p-4 text-sm text-text-muted"
      >
        Entraste con el enlace de tu correo. No necesitas cuenta ni contraseña.
      </section>

      {(datos.estado === "enviada" || datos.estado === "alguien_la_vio" || datos.estado === "sin_respuesta") && (
        <section aria-labelledby="alerta-titulo" className="space-y-4 rounded-xl border border-border bg-surface p-5">
          <p className="inline-flex rounded-full bg-text px-3 py-1 text-sm font-medium text-surface">
            {datos.estado === "enviada" && t.etiquetaEnviada}
            {datos.estado === "alguien_la_vio" && t.etiquetaAlguienLaVio}
            {datos.estado === "sin_respuesta" && t.etiquetaSinRespuesta}
          </p>
          <h2 id="alerta-titulo" className="text-2xl font-semibold">
            {nombre} no ha confirmado que está bien
          </h2>
          <p className="text-sm font-medium">
            {datos.estado === "enviada" && t.enviadaCuerpo}
            {datos.estado === "alguien_la_vio" && t.alguienLaVioCuerpo(nombre)}
            {datos.estado === "sin_respuesta" && t.sinRespuesta}
          </p>
          <p className="text-text-muted">{t.causasTitulo}</p>

          <div className="space-y-1 text-sm">
            <p className="font-semibold">{t.abiertaHace(datos.minutosAbierta)}</p>
            <p className="text-text-muted">
              {t.debiaConfirmar(datos.horaDeberiaConfirmar)}
              {datos.ultimaConfirmacion
                ? ` ${t.ultimaSenal(datos.ultimaConfirmacion.cuando)}`
                : ""}
            </p>
          </div>

          {telefono && (
            <div className="space-y-3">
              <a
                href={`tel:+${telefono}`}
                className="flex min-h-12 items-center justify-center rounded-lg bg-brand-primary px-4 font-semibold text-brand-on-primary"
              >
                {t.llamar(nombre)}
              </a>
              <a
                href={`https://wa.me/${telefono}?text=${mensaje}`}
                className="flex min-h-12 items-center justify-center rounded-lg border border-border px-4 font-semibold text-text"
              >
                {t.whatsapp(nombre)}
              </a>
            </div>
          )}
        </section>
      )}

      {datos.estado === "cerrada" && (
        <section aria-labelledby="cierre-titulo" role="status" className="space-y-2 rounded-xl border border-border bg-surface p-5">
          <h2 id="cierre-titulo" className="text-xl font-semibold">{t.cerradaTitulo}</h2>
          <p className="text-text-muted">{t.cerradaCuerpo(nombre)}</p>
        </section>
      )}

      {datos.estado === "sin_resolver" && (
        <section aria-labelledby="sin-resolver-titulo" role="status" className="space-y-2 rounded-xl border border-border bg-surface p-5">
          <h2 id="sin-resolver-titulo" className="text-xl font-semibold">{t.sinResolverTitulo}</h2>
          <p className="text-text-muted">{t.sinResolverCuerpo(nombre)}</p>
          {telefono && (
            <a
              href={`tel:+${telefono}`}
              className="flex min-h-12 items-center justify-center rounded-lg bg-brand-primary px-4 font-semibold text-brand-on-primary"
            >
              {t.llamar(nombre)}
            </a>
          )}
        </section>
      )}

      <section aria-labelledby="pasos-titulo" className="space-y-3 rounded-xl border border-border bg-surface p-5">
        <h2 id="pasos-titulo" className="text-lg font-semibold">{t.pasosTitulo(nombre)}</h2>
        <p className="text-sm text-text-muted">{t.pasosSubtitulo(nombre)}</p>
        {datos.pasos.length === 0 ? (
          <p className="text-sm">{t.sinPasos}</p>
        ) : (
          <ol className="space-y-3">
            {datos.pasos.map((paso) => (
              <li key={paso.orden} className="flex gap-3">
                <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-muted font-semibold">
                  {paso.orden}
                </span>
                <div>
                  <p className="font-semibold">{paso.texto}</p>
                  {paso.detalle && <p className="text-sm text-text-muted">{paso.detalle}</p>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {t.textoFijo && (
        <section aria-labelledby="fijo-titulo" className="space-y-2 rounded-xl border border-border bg-surface p-5">
          <h2 id="fijo-titulo" className="text-lg font-semibold">{t.textoFijoTitulo}</h2>
          <p className="text-sm">{t.textoFijo}</p>
        </section>
      )}

      <p className="pb-6 text-xs text-text-muted">{t.pieSistema}</p>
    </main>
  );
}
