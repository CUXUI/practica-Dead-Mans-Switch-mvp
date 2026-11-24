import Link from "next/link";
import { getBrand } from "@/lib/brand";
import { Encabezado, Pantalla } from "@/components/emisor/ui";
import BarraNavegacion from "@/components/home/BarraNavegacion";
import { textosInicio } from "@/components/home/textosInicio";
import { exigirSesion } from "@/app/aviso/_datos/sesion";
import EstadoVacio from "@/components/historial/EstadoVacio";
import ListaHistorial from "@/components/historial/ListaHistorial";
import { IconoReloj } from "@/components/historial/iconos";
import { textosHistorial } from "@/components/historial/textos";
import { boton, tarjeta } from "@/components/cuenta/estilos";
import { LIMITE, leerHistorial } from "./_datos/historial";

// E7 · Historial de quien emite. Reemplaza el 404 al que apunta el menú (Inicio · Contactos · Historial · Ajustes).
export async function generateMetadata() {
  return { title: textosHistorial(getBrand().variant).titulo };
}

export default async function Historial() {
  const s = await exigirSesion();
  const marca = getBrand();
  const t = textosHistorial(marca.variant);
  const resultado = await leerHistorial(s.supabase, s.user.id);

  return (
    <Pantalla nav={<BarraNavegacion t={textosInicio(marca.variant).nav} actual="historial" />}>
      <Encabezado nombre={marca.name} />
      <h1 className="text-seccion leading-8">{t.titulo}</h1>
      {!resultado.ok ? (
        <section className={tarjeta}>
          <h2 className="text-tarjeta leading-7">{t.errorTitulo}</h2>
          <p className="text-text-muted">{t.errorTexto}</p>
          <Link href="/historial" className={boton.secundario}>
            {t.reintentar}
          </Link>
        </section>
      ) : resultado.entradas.length === 0 ? (
        <EstadoVacio icono={<IconoReloj />} titulo={t.vacioTitulo} texto={t.vacioTexto} />
      ) : (
        <ListaHistorial t={t} entradas={resultado.entradas} limite={LIMITE} />
      )}
    </Pantalla>
  );
}
