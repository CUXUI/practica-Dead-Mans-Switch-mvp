import { getBrand } from "@/lib/brand";
import { Encabezado, Pantalla, Tarjeta, EnlaceBoton } from "@/components/emisor/ui";
import BarraNavegacion from "@/components/home/BarraNavegacion";
import { textosInicio } from "@/components/home/textosInicio";
import { exigirSesion } from "@/app/aviso/_datos/sesion";
import ListaHistorial from "@/components/historial/ListaHistorial";
import { textosHistorial } from "@/components/historial/textos";
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
      <h1 className="text-2xl font-semibold">{t.titulo}</h1>
      {!resultado.ok ? (
        <Tarjeta>
          <h2 className="font-semibold">{t.errorTitulo}</h2>
          <p className="text-text-muted">{t.errorTexto}</p>
          <EnlaceBoton href="/historial" tipo="secundario">
            {t.reintentar}
          </EnlaceBoton>
        </Tarjeta>
      ) : resultado.entradas.length === 0 ? (
        <Tarjeta>
          <h2 className="font-semibold">{t.vacioTitulo}</h2>
          <p className="text-text-muted">{t.vacioTexto}</p>
        </Tarjeta>
      ) : (
        <ListaHistorial t={t} entradas={resultado.entradas} limite={LIMITE} />
      )}
    </Pantalla>
  );
}
