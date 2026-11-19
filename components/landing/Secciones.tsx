import Link from "next/link";
import BotonInstalar from "@/components/landing/BotonInstalar";
import InstalarApp from "@/components/landing/InstalarApp";
import { configLanding, RUTA_BAJA_CONTACTO, RUTA_LANDING } from "@/components/landing/config";
import { textosLanding } from "@/components/landing/textos";
import { estiloBotonSecundario, estiloEnlaceTexto, Seccion } from "@/components/landing/ui";

// Secciones del home de la landing, en el orden del brief. Un mensaje por sección y pocas palabras.
// Un solo botón principal visible a la vez: el resto son secundarios o enlaces de texto.

export function Hero() {
  const t = textosLanding.hero;
  return (
    <section aria-labelledby="hero-titulo" className="bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-12 md:py-20">
        <h1 id="hero-titulo" className="max-w-2xl text-[32px] font-bold leading-10 md:text-5xl md:leading-tight">
          {t.titulo}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-text-muted">{t.subtitulo}</p>
        <div className="mt-8 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-6">
          <BotonInstalar texto={t.instalar} destino="#instalar" className="w-full sm:w-auto" />
          <a href="#contacto" className={estiloEnlaceTexto}>
            {t.meInvitaron}
          </a>
        </div>
      </div>
    </section>
  );
}

// Pone en negrita (y en el color de texto principal) el fragmento destacado de una frase.
function resaltar(texto: string, destacado?: string) {
  if (!destacado) return texto;
  const i = texto.indexOf(destacado);
  if (i < 0) return texto;
  return (
    <>
      {texto.slice(0, i)}
      <strong className="font-semibold text-text">{destacado}</strong>
      {texto.slice(i + destacado.length)}
    </>
  );
}

export function ComoFunciona() {
  const t = textosLanding.comoFunciona;
  return (
    <Seccion id="como-funciona" titulo={t.titulo}>
      {/* Cards de pasos. Las capturas de la app se suman cuando el equipo defina cuáles van. */}
      <ol className="grid gap-4 md:grid-cols-3">
        {t.pasos.map((paso, i) => (
          <li key={paso.titulo} className="flex flex-col gap-3 rounded-2xl border border-borde-sutil bg-surface p-6">
            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-full bg-fondo-inverso text-lg font-bold text-brand-on-primary"
            >
              {i + 1}
            </span>
            <h3 className="text-xl font-semibold leading-7">{paso.titulo}</h3>
            <p className="text-text-muted">{resaltar(paso.detalle, "destacado" in paso ? paso.destacado : undefined)}</p>
          </li>
        ))}
      </ol>
    </Seccion>
  );
}

export function Privacidad() {
  const t = textosLanding.privacidad;
  return (
    <Seccion id="privacidad" titulo={t.titulo} fondo="superficie">
      <ul className="grid gap-3 sm:grid-cols-2">
        {t.afirmaciones.map((a) => (
          <li key={a} className="flex items-start gap-3 rounded-xl bg-fondo-sutil p-4">
            <span aria-hidden="true" className="mt-0.5 font-bold">
              ✓
            </span>
            <span>{a}</span>
          </li>
        ))}
      </ul>
      {/* PENDIENTE: enlazar la política de privacidad cuando exista. */}
      <p className="mt-4 text-sm text-text-muted">
        {t.politica} · {t.politicaPendiente}
      </p>
    </Seccion>
  );
}

export function Instalar() {
  const t = textosLanding.instalar;
  return (
    <Seccion id="instalar" titulo={t.titulo}>
      <InstalarApp />
    </Seccion>
  );
}

export function Contacto() {
  const t = textosLanding.contacto;
  return (
    <Seccion id="contacto" titulo={t.titulo} fondo="superficie">
      <ul className="max-w-xl space-y-3">
        {t.puntos.map((p) => (
          <li key={p} className="flex items-start gap-3">
            <span aria-hidden="true" className="mt-0.5 font-bold">
              ✓
            </span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
      {/* Lleva a la pantalla donde se pide el correo para recibir el enlace de baja (sin código). */}
      <Link href={RUTA_BAJA_CONTACTO} className={`${estiloBotonSecundario} mt-6 w-full sm:w-auto`}>
        {t.dejar}
      </Link>
    </Seccion>
  );
}

export function Organizaciones() {
  const t = textosLanding.organizaciones;
  if (!configLanding.mostrarOrganizaciones) return null;
  return (
    <Seccion id="organizaciones" titulo={t.titulo} fondo="sutil">
      <p className="max-w-prose text-text-muted">{t.cuerpo}</p>
      <Link href={`${RUTA_LANDING}/organizaciones`} className={`${estiloBotonSecundario} mt-6`}>
        {t.boton}
      </Link>
    </Seccion>
  );
}

export function NoHace() {
  const t = textosLanding.noHace;
  return (
    <Seccion id="no-hace" titulo={t.titulo}>
      <ul className="grid gap-4 md:grid-cols-3">
        {t.puntos.map((p) => (
          <li key={p.titulo} className="flex flex-col items-center gap-2 rounded-2xl border border-borde-sutil bg-surface p-6 text-center">
            <h3 className="text-lg font-semibold leading-7">{p.titulo}</h3>
            <p className="text-text-muted">{p.descripcion}</p>
          </li>
        ))}
      </ul>
    </Seccion>
  );
}

export function Baja() {
  const t = textosLanding.baja;
  return (
    <Seccion id="baja" titulo={t.titulo} fondo="superficie">
      <p className="max-w-prose text-text-muted">{t.cuerpo}</p>
      {/* Eliminar la cuenta se hace solo desde la app (Cuenta); la landing solo ofrece dejar de ser contacto. */}
      <Link href={RUTA_BAJA_CONTACTO} className={`${estiloBotonSecundario} mt-6 w-full sm:w-auto`}>
        {t.accion}
      </Link>
    </Seccion>
  );
}
