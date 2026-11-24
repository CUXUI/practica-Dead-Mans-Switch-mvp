import { getBrand } from "@/lib/brand";
import { textosHome } from "@/components/home/textos";
import { textosInicio } from "@/components/home/textosInicio";
import { textosHistorial } from "@/components/historial/textos";
import InicioActivo from "@/components/home/InicioActivo";
import InicioApagado from "@/components/home/InicioApagado";
import InicioAlerta from "@/components/home/InicioAlerta";
import BarraNavegacion from "@/components/home/BarraNavegacion";
import AlertaPantalla from "@/components/alerta/AlertaPantalla";
import ListaHistorial from "@/components/historial/ListaHistorial";
import { Encabezado, Pantalla } from "@/components/emisor/ui";
import type { EntradaHistorial } from "@/components/historial/tipos";

// Pantallas REALES del producto (los mismos componentes que usan /home, /historial y /alerta/[token]),
// con datos de ejemplo. No leen ni guardan nada: sirven para ver el design system aplicado.
const HORA = 3_600_000;
const en = (horas: number) => new Date(Date.now() + horas * HORA).toISOString();

export type PantallaEjemplo = "activo" | "apagado" | "alerta" | "historial" | "recibe";

export const PANTALLAS: { id: PantallaEjemplo; nombre: string; ruta: string }[] = [
  { id: "activo", nombre: "Inicio · aviso activo", ruta: "/home" },
  { id: "alerta", nombre: "Inicio · alerta en curso", ruta: "/home" },
  { id: "apagado", nombre: "Inicio · aviso apagado", ruta: "/home" },
  { id: "historial", nombre: "Historial", ruta: "/historial" },
  { id: "recibe", nombre: "Alerta · quien recibe", ruta: "/alerta/[token]" },
];

export default function PantallaProducto({ id }: { id: PantallaEjemplo }) {
  const marca = getBrand();
  const t = textosInicio(marca.variant);
  const plazo = { fireAt: en(3), frecuencia: "daily" as const, dias: [], activadoEn: en(-2) };

  if (id === "activo") return <InicioActivo t={t} app={marca.name} nombre="Mariana" plazo={plazo} encendidoAhora={false} graciaMin={30} />;
  if (id === "apagado")
    return <InicioApagado t={t} app={marca.name} nombre="Mariana" pendientes={[]} rechazados={[]} sinEnviar={[]} vacio={false} aceptados={["Ana", "Luis"]} plazo={plazo} apagadoAhora={false} />;
  if (id === "alerta") return <InicioAlerta t={t} textos={textosHome(marca.variant)} app={marca.name} nombre="Mariana" plazo={{ fireAt: en(-0.6), frecuencia: "daily", dias: [] }} />;
  if (id === "historial") {
    const th = textosHistorial(marca.variant);
    const entradas: EntradaHistorial[] = [
      { tipo: "confirmacion", id: "1", cuando: en(-20), origen: "app", aviso: "routine" },
      {
        tipo: "alerta",
        id: "2",
        cuando: en(-44),
        resultado: "closed",
        aviso: "routine",
        cerradaEn: en(-43.6),
        venceEn: null,
        destinatarios: [{ nombre: "Ana Ruiz", canales: [{ canal: "push", resultado: "sent" }, { canal: "email", resultado: "sent" }], visto: true }],
      },
      { tipo: "confirmacion", id: "3", cuando: en(-68), origen: "notification", aviso: "routine" },
      { tipo: "confirmacion", id: "4", cuando: en(-92), origen: "app", aviso: "routine" },
    ];
    return (
      <Pantalla nav={<BarraNavegacion t={t.nav} actual="historial" />}>
        <Encabezado nombre={marca.name} />
        <h1 className="text-seccion">{th.titulo}</h1>
        <ListaHistorial t={th} entradas={entradas} limite={20} />
      </Pantalla>
    );
  }
  return (
    <div className="h-full overflow-y-auto">
      <AlertaPantalla
        variant={marca.variant}
        nombreMarca={marca.name}
        datos={{
          estado: "enviada",
          nombreQuienEmite: "Mariana",
          telefonoQuienEmite: null,
          minutosAbierta: 12,
          horaDeberiaConfirmarIso: en(-0.7),
          ultimaConfirmacionIso: en(-24.5),
          pasos: [
            { orden: 1, texto: "Llámame al celular" },
            { orden: 2, texto: "Toca el timbre del 3.º B" },
          ],
          mensaje: "Si no contesto, mi vecina Carla tiene llave.",
        }}
      />
    </div>
  );
}
