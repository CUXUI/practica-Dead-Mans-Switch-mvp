import Link from "next/link";
import { getBrand } from "@/lib/brand";
import { Encabezado, Pantalla } from "@/components/emisor/ui";
import BarraNavegacion from "@/components/home/BarraNavegacion";
import { textosInicio } from "@/components/home/textosInicio";
import CerrarSesion from "@/components/cuenta/CerrarSesion";
import DialogoEliminar from "@/components/cuenta/DialogoEliminar";
import InterruptorNotificaciones from "@/components/cuenta/InterruptorNotificaciones";
import { boton, tarjeta } from "@/components/cuenta/estilos";
import { textosCuenta } from "@/components/cuenta/textos";
import { avisoActual, exigirSesion } from "@/app/aviso/_datos/sesion";

// E8 · Cuenta (destino "Ajustes" del menú). Datos de quien emite, cerrar sesión y eliminar la cuenta.
export async function generateMetadata() {
  return { title: textosCuenta(getBrand().variant).titulo };
}

export default async function Cuenta() {
  const s = await exigirSesion();
  const marca = getBrand();
  const t = textosCuenta(marca.variant);

  const [{ data: perfil }, aviso] = await Promise.all([
    s.supabase.from("profiles").select("full_name, phone").eq("id", s.user.id).single(),
    avisoActual(s),
  ]);
  const enAlerta = aviso?.state === "alert";

  const dato = (valor: string | null | undefined) => (valor && valor.trim() ? valor : t.sinDato);
  // Fila de perfil (DS): etiqueta pequeña arriba, dato debajo y línea inferior sutil. El enlace «Editar» de la
  // fila queda fuera de este flujo (edición de perfil).
  const filas = [
    { etiqueta: t.nombre, valor: dato(perfil?.full_name) },
    { etiqueta: t.telefono, valor: dato(perfil?.phone) },
    { etiqueta: t.correo, valor: dato(s.user.email) },
  ];

  return (
    <Pantalla nav={<BarraNavegacion t={textosInicio(marca.variant).nav} actual="ajustes" />}>
      <Encabezado nombre={marca.name} />
      <h1 className="text-2xl font-bold leading-8">{t.titulo}</h1>

      <section aria-labelledby="datos" className={tarjeta}>
        <h2 id="datos" className="text-xl font-semibold leading-7">
          {t.datos}
        </h2>
        <dl className="flex flex-col">
          {filas.map((f) => (
            <div key={f.etiqueta} className="flex flex-col gap-espacio-xs border-b border-borde-sutil py-espacio-s">
              <dt className="text-sm leading-[21px] text-text-muted">{f.etiqueta}</dt>
              <dd className="break-all text-base leading-6">{f.valor}</dd>
            </div>
          ))}
        </dl>
        <CerrarSesion texto={t.cerrarSesion} />
      </section>

      <section aria-labelledby="notificaciones" className={tarjeta}>
        <InterruptorNotificaciones t={t} />
      </section>

      <section aria-labelledby="eliminar" className={tarjeta}>
        <h2 id="eliminar" className="text-xl font-semibold leading-7">
          {t.borrarTitulo}
        </h2>
        <p className="text-base leading-6 text-text-muted">{t.borrarTexto}</p>
        {enAlerta ? (
          <>
            <p role="status" className="text-base font-semibold leading-6">
              {t.alertaEnCurso}
            </p>
            <Link href="/home" className={boton.secundario}>
              {t.irInicio}
            </Link>
          </>
        ) : (
          <DialogoEliminar t={t} />
        )}
      </section>
    </Pantalla>
  );
}
