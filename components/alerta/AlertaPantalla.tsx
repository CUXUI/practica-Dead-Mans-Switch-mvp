import { boton as botonDS } from "@/components/ds/estilos";
import type { Variant } from "@/lib/brand";
import { textosAlerta } from "./textos";
import type { DatosAlerta } from "./tipos";
import LineaConfirmacion from "./LineaConfirmacion";

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
        <h1 className="text-tarjeta">{nombreMarca}</h1>
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
          <h2 id="alerta-titulo" className="text-seccion">
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
            <LineaConfirmacion
              variant={variant}
              horaIso={datos.horaDeberiaConfirmarIso}
              ultimaIso={datos.ultimaConfirmacionIso}
            />
          </div>

          {telefono && (
            <div className="space-y-3">
              <a
                href={`tel:+${telefono}`}
                className={`${botonDS.principal}`}
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
          <h2 id="cierre-titulo" className="text-tarjeta">{t.cerradaTitulo}</h2>
          <p className="text-text-muted">{t.cerradaCuerpo(nombre)}</p>
        </section>
      )}

      {datos.estado === "sin_resolver" && (
        <section aria-labelledby="sin-resolver-titulo" role="status" className="space-y-2 rounded-xl border border-border bg-surface p-5">
          <h2 id="sin-resolver-titulo" className="text-tarjeta">{t.sinResolverTitulo}</h2>
          <p className="text-text-muted">{t.sinResolverCuerpo(nombre)}</p>
          {telefono && (
            <a
              href={`tel:+${telefono}`}
              className={`${botonDS.principal}`}
            >
              {t.llamar(nombre)}
            </a>
          )}
        </section>
      )}

      {datos.mensaje && (
        <section aria-labelledby="mensaje-titulo" className="space-y-2 rounded-xl border border-border bg-surface p-5">
          <h2 id="mensaje-titulo" className="text-bloque">{t.mensajeTitulo(nombre)}</h2>
          <p className="whitespace-pre-line break-words text-base">{datos.mensaje}</p>
        </section>
      )}

      {t.textoFijo && (
        <section aria-labelledby="fijo-titulo" className="space-y-2 rounded-xl border border-border bg-surface p-5">
          <h2 id="fijo-titulo" className="text-bloque">{t.textoFijoTitulo}</h2>
          <p className="text-sm">{t.textoFijo}</p>
        </section>
      )}

      <p className="pb-6 text-xs text-text-muted">{t.pieSistema}</p>
    </main>
  );
}
