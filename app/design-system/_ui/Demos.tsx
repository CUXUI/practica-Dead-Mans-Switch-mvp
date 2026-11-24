"use client";

import { useState } from "react";
import { Boton, BotonAnadir, BotonEnlace, BotonIcono, Enlace } from "@/components/ds/Boton";
import { AreaTexto, Campo } from "@/components/ds/Campo";
import { Casilla, ControlSegmentado, Interruptor, Radio } from "@/components/ds/Seleccion";
import { Badge, Card, Contacto, DatoGrande, Desplegable, EstadoVacio, FilaDato, FilaInfo, Paso } from "@/components/ds/Contenido";
import { Banner, Cargando, Dialogo, DobleCheck, ToastVisual } from "@/components/ds/Mensajes";
import { BarraNavegacion, BarraTitulo, Encabezado, FilaNavegacion, Stepper, TituloGrupo, ZonaAccion } from "@/components/ds/Navegacion";
import HoldButton from "@/components/home/HoldButton";

// Ejemplos que funcionan de cada componente. Son los componentes reales, no dibujos.
const Fila = ({ children }: { children: React.ReactNode }) => <div className="flex flex-wrap items-center gap-espacio-m">{children}</div>;
const Columna = ({ children }: { children: React.ReactNode }) => <div className="mx-auto flex w-full max-w-sm flex-col gap-espacio-m">{children}</div>;
const Rotulo = ({ children }: { children: React.ReactNode }) => <p className="text-pequeno font-semibold uppercase tracking-wide text-text-muted">{children}</p>;

export function DemoBoton() {
  const [cargando, setCargando] = useState(false);
  return (
    <Columna>
      <Boton>Guardar aviso</Boton>
      <Boton tipo="secundario">Ahora no</Boton>
      <Boton icono="rotate-cw" tipo="secundario">
        Reintentar ahora
      </Boton>
      <Boton
        cargando={cargando}
        textoCargando="Enviando…"
        onClick={() => {
          setCargando(true);
          setTimeout(() => setCargando(false), 1800);
        }}
      >
        Enviar invitación (tócame)
      </Boton>
      <Boton disabled>Guardar aviso</Boton>
      <Boton tipo="secundario" disabled>
        Ahora no
      </Boton>
    </Columna>
  );
}

export function DemoBotonesMenores() {
  return (
    <Columna>
      <Rotulo>Botón ícono</Rotulo>
      <Fila>
        <BotonIcono icono="chevron-up" etiqueta="Subir a Ana" />
        <BotonIcono icono="chevron-down" etiqueta="Bajar a Ana" />
        <BotonIcono icono="x" etiqueta="Quitar paso 1" />
        <BotonIcono icono="chevron-up" etiqueta="Subir a Ana" disabled />
      </Fila>
      <Rotulo>Enlace y enlace con ícono</Rotulo>
      <Fila>
        <Enlace href="#enlace">Reenviar invitación</Enlace>
        <Enlace href="#enlace" icono="pencil" aria-label="Editar aviso">
          Editar
        </Enlace>
      </Fila>
      <Rotulo>Botón de añadir</Rotulo>
      <BotonAnadir>Añade tu primer contacto</BotonAnadir>
      <Rotulo>Botón que lleva a otra pantalla</Rotulo>
      <BotonEnlace href="#enlace" tipo="secundario">
        Ver contactos
      </BotonEnlace>
    </Columna>
  );
}

export function DemoMantener() {
  const [hecho, setHecho] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  if (hecho) {
    return (
      <Columna>
        <div className="flex flex-col items-center gap-espacio-m py-espacio-l text-center">
          <DobleCheck />
          <p role="status" className="text-tarjeta">
            Cancelaste la alerta
          </p>
          <Boton tipo="secundario" onClick={() => setHecho(false)}>
            Probar otra vez
          </Boton>
        </div>
      </Columna>
    );
  }
  return (
    <Columna>
      <HoldButton
        label="Estoy bien, cancelar alerta"
        help="Mantén presionado el botón 2 segundos"
        helpSmall="Si lo sueltas antes, no pasa nada."
        holdingLabel="Sigue presionando…"
        helpAssisted="Con teclado o lector de pantalla: actívalo y confirma en el siguiente paso."
        confirmQuestion="¿Cancelar la alerta?"
        confirmYes="Sí, estoy bien"
        confirmBack="Volver"
        busyLabel="Cancelando…"
        busy={ocupado}
        onComplete={() => {
          setOcupado(true);
          setTimeout(() => {
            setOcupado(false);
            setHecho(true);
          }, 600);
        }}
      />
    </Columna>
  );
}

export function DemoCampo() {
  const [correo, setCorreo] = useState("ana@correo");
  const [mensaje, setMensaje] = useState("Si no confirmo, llámame primero al celular.");
  const invalido = correo.length > 0 && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo);
  return (
    <Columna>
      <Campo etiqueta="Nombre" placeholder="Como te llaman" ayuda="Así te verán tus contactos." />
      <Campo etiqueta="Correo" tipo="correo" value={correo} onChange={(e) => setCorreo(e.target.value)} error={invalido ? "Revisa el correo: falta algo después de la arroba." : undefined} autoComplete="off" />
      <Campo etiqueta="Contraseña" tipo="contrasena" defaultValue="contraseña" autoComplete="off" />
      <AreaTexto etiqueta="Mensaje para tus contactos" value={mensaje} onChange={(e) => setMensaje(e.target.value)} maximo={300} />
      <Campo etiqueta="Celular" tipo="telefono" defaultValue="+54 11 5555 0000" disabled ayuda="Se cambia desde Ajustes." />
    </Columna>
  );
}

export function DemoSeleccion() {
  const [aviso, setAviso] = useState(true);
  const [rep, setRep] = useState<"once" | "daily" | "weekly">("daily");
  const [margen, setMargen] = useState<"15" | "30" | "60">("30");
  const [dias, setDias] = useState([1, 2, 3, 4, 5]);
  return (
    <Columna>
      <Rotulo>Interruptor</Rotulo>
      <Interruptor etiqueta={aviso ? "Toca para apagar tu aviso" : "Toca para encender tu aviso"} activado={aviso} onCambiar={setAviso} />
      <Interruptor etiqueta="Notificaciones en este teléfono" descripcion="Actívalas desde los ajustes del teléfono." activado={false} onCambiar={() => {}} deshabilitado />
      <Rotulo>Control segmento</Rotulo>
      <ControlSegmentado
        etiqueta="Repetición"
        valor={rep}
        onCambiar={setRep}
        opciones={[
          { valor: "once", texto: "Solo hoy" },
          { valor: "daily", texto: "A diario" },
          { valor: "weekly", texto: "Elegir días" },
        ]}
      />
      {rep === "weekly" && (
        <div role="group" aria-label="Días" className="flex justify-between gap-espacio-xs">
          {["L", "M", "X", "J", "V", "S", "D"].map((d, i) => {
            const on = dias.includes(i);
            return (
              <button
                key={i}
                type="button"
                aria-pressed={on}
                aria-label={["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][i]}
                onClick={() => setDias(on ? dias.filter((x) => x !== i) : [...dias, i])}
                className={`inline-flex size-11 items-center justify-center rounded-full text-etiqueta transition-colors duration-(--duracion-rapida) focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-foco-anillo motion-reduce:transition-none ${on ? "bg-brand-primary text-brand-on-primary" : "border border-border bg-surface text-text"}`}
              >
                {d}
              </button>
            );
          })}
        </div>
      )}
      <ControlSegmentado
        etiqueta="Tiempo de gracia"
        valor={margen}
        onCambiar={setMargen}
        opciones={[
          { valor: "15", texto: "15 min" },
          { valor: "30", texto: "30 min" },
          { valor: "60", texto: "1 h" },
        ]}
      />
      <Rotulo>Casilla y radio</Rotulo>
      <Casilla defaultChecked>Ana Ruiz · pareja</Casilla>
      <Casilla>Luis Pérez · papá</Casilla>
      <Casilla disabled>Carla Gómez · aún no acepta</Casilla>
      <fieldset>
        <legend className="mb-espacio-xs text-etiqueta">Mensaje de la invitación</legend>
        <Radio name="demo-mensaje" defaultChecked>
          General
        </Radio>
        <Radio name="demo-mensaje">Personalizado</Radio>
      </fieldset>
    </Columna>
  );
}

export function DemoNavegacion() {
  const [actual, setActual] = useState("inicio");
  const [paso, setPaso] = useState(1);
  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-radio-l border border-borde-sutil bg-surface-muted">
      <Encabezado nombre="Cerca" saludo="Hola, Mariana" />
      <div className="flex flex-col gap-espacio-l p-espacio-l">
        <BarraTitulo titulo="Configurar aviso" alVolver={() => setPaso(Math.max(1, paso - 1))} />
        <Stepper actual={paso} total={3} siguiente={["Siguiente: Tiempo de gracia", "Siguiente: Contactos", "Último paso"][paso - 1]} />
        <TituloGrupo titulo="Ajustes" ayuda="Filas que llevan a otra pantalla" />
        <Card densidad="compacta">
          <FilaNavegacion href="#nav" icono="user" titulo="Mi perfil" descripcion="Nombre, correo y contraseña" />
          <FilaNavegacion href="#nav" icono="bell" titulo="Notificaciones" />
        </Card>
      </div>
      <ZonaAccion>
        <Boton onClick={() => setPaso(paso === 3 ? 1 : paso + 1)}>{paso === 3 ? "Guardar aviso" : "Continuar"}</Boton>
      </ZonaAccion>
      <div
        onClickCapture={(e) => {
          const a = (e.target as HTMLElement).closest("a");
          if (!a) return;
          e.preventDefault();
          setActual(a.getAttribute("href")!.slice(1));
        }}
      >
        <BarraNavegacion
          actual={actual}
          destinos={[
            { id: "inicio", href: "#inicio", etiqueta: "Inicio", icono: "house" },
            { id: "contactos", href: "#contactos", etiqueta: "Contactos", icono: "users" },
            { id: "historial", href: "#historial", etiqueta: "Historial", icono: "list" },
            { id: "ajustes", href: "#ajustes", etiqueta: "Ajustes", icono: "settings" },
          ]}
        />
      </div>
    </div>
  );
}

export function DemoBadges() {
  return (
    <Fila>
      <Badge icono="clock">Confirmación pendiente</Badge>
      <Badge tipo="oscuro" icono="bell-dot">
        Alerta activa
      </Badge>
      <Badge tipo="exito">Aviso activo</Badge>
      <Badge tipo="etiqueta">Recordatorios enviados</Badge>
    </Fila>
  );
}

export function DemoCards() {
  return (
    <div className="grid gap-espacio-l md:grid-cols-3">
      <Card
        id="demo-card-1"
        encabezado={<Badge tipo="exito">Aviso activo</Badge>}
        accionEsquina={
          <Enlace href="#card" icono="pencil" aria-label="Editar aviso">
            Editar
          </Enlace>
        }
        titulo="Tu aviso"
      >
        <DatoGrande valor="8:00 p. m." sufijo="todos los días" />
        <FilaInfo icono="users">Si no confirmas antes de las 8:30 p. m., avisaremos a Ana.</FilaInfo>
      </Card>
      <Card id="demo-card-2" tono="neutra" encabezado={<Badge icono="clock">Confirmación pendiente</Badge>} titulo="Tu «Estoy bien» no se envió" acciones={<Boton tipo="secundario" icono="rotate-cw">Reintentar ahora</Boton>}>
        <p className="text-pequeno">Lo tocaste a las 7:52 p. m., pero no se pudo enviar. Tu confirmación sigue pendiente.</p>
      </Card>
      <Card id="demo-card-3" tono="enfasis" encabezado={<Badge icono="alarm-clock">Tiempo de gracia</Badge>} titulo="¿Estás bien?">
        <p className="text-pequeno">No recibimos tu confirmación de las 8:00 p. m. Si no confirmas, avisaremos a Ana.</p>
        <DatoGrande valor="18 min" sufijo="para confirmar" />
      </Card>
    </div>
  );
}

export function DemoContenido() {
  return (
    <div className="grid gap-espacio-l md:grid-cols-2">
      <Card titulo="Lista de datos" id="demo-datos">
        <dl className="flex flex-col gap-espacio-s">
          <FilaDato etiqueta="Última confirmación" valor="Hoy, 8:05 p. m." />
          <FilaDato etiqueta="Tiempo de gracia" valor="30 min" />
          <FilaDato etiqueta="Contactos" valor="1 Ana · 2 Luis" />
        </dl>
      </Card>
      <Card titulo="Contactos" id="demo-contactos">
        <Contacto nombre="Ana Ruiz" subtitulo="Pareja" orden={1} estado={<Badge tipo="exito">Aceptó el 3 de oct.</Badge>} />
        <Contacto nombre="Luis Pérez" subtitulo="Papá" orden={2} estado={<Badge icono="clock">En espera</Badge>} accion={<Enlace href="#c">Reenviar</Enlace>} />
      </Card>
      <Card titulo="Si recibes una alerta" id="demo-pasos">
        <ol className="flex flex-col gap-espacio-m">
          <Paso numero={1} titulo="Llámala al celular" descripcion="Puede estar sin señal o con el teléfono en silencio." />
          <Paso numero={2} titulo="Escríbele por WhatsApp" />
          <Paso icono="check" titulo="Avisa a los demás contactos" />
        </ol>
      </Card>
      <div className="flex flex-col gap-espacio-m">
        <Card densidad="compacta">
          <EstadoVacio icono="shield" titulo="No hay alertas">
            Solo te avisaremos si Mariana no confirma a tiempo que está bien.
          </EstadoVacio>
        </Card>
        <div>
          <Desplegable pregunta="¿Qué pasa si no tengo señal?">Tu confirmación queda pendiente y se envía sola cuando vuelve la conexión.</Desplegable>
          <Desplegable pregunta="¿Mis contactos necesitan instalar algo?">No. Les llega un correo con un enlace; no necesitan cuenta ni app.</Desplegable>
        </div>
      </div>
    </div>
  );
}

export function DemoMensajes() {
  const [toast, setToast] = useState(true);
  const [dialogo, setDialogo] = useState<null | "confirmacion" | "destructiva">(null);
  return (
    <div className="grid gap-espacio-l md:grid-cols-2">
      <div className="flex flex-col gap-espacio-m">
        <Rotulo>Banner de sistema</Rotulo>
        <Banner tipo="error" titulo="No pudimos guardar tu aviso" accion={<Enlace href="#m">Reintentar</Enlace>}>
          Revisa tu conexión y vuelve a intentarlo.
        </Banner>
        <Banner tipo="sin-conexion" titulo="Sin conexión">
          Ves el último dato guardado. Se actualiza solo cuando vuelva la señal.
        </Banner>
        <Banner tipo="enviando" titulo="Enviando tu confirmación…" />
      </div>
      <div className="flex flex-col gap-espacio-m">
        <Rotulo>Toast</Rotulo>
        <div className="min-h-16">{toast ? <ToastVisual key="t" texto="Invitación enviada" alCerrar={() => setToast(false)} /> : <Boton tipo="secundario" onClick={() => setToast(true)}>Mostrar el toast otra vez</Boton>}</div>
        <Rotulo>Diálogo de confirmación</Rotulo>
        <Boton tipo="secundario" onClick={() => setDialogo("confirmacion")}>
          Abrir confirmación
        </Boton>
        <Boton tipo="secundario" onClick={() => setDialogo("destructiva")}>
          Abrir destructiva
        </Boton>
        <Rotulo>Cargando y doble check</Rotulo>
        <Fila>
          <Cargando />
          <Cargando tamano={20} />
          <span className="text-pequeno text-text-muted">Verificando el código…</span>
        </Fila>
        <DemoDobleCheck />
      </div>
      <Dialogo abierto={dialogo === "confirmacion"} alCerrar={() => setDialogo(null)} titulo="¿Apagar tu aviso?" confirmar="Apagar aviso" alConfirmar={() => setDialogo(null)}>
        Mientras esté apagado no avisaremos a nadie. Puedes encenderlo cuando quieras.
      </Dialogo>
      <Dialogo abierto={dialogo === "destructiva"} tipo="destructiva" alCerrar={() => setDialogo(null)} titulo="¿Eliminar tu cuenta?" confirmar="Eliminar mi cuenta" alConfirmar={() => setDialogo(null)}>
        Se borran tu aviso, tus contactos y tu historial. No se puede deshacer.
      </Dialogo>
    </div>
  );
}

function DemoDobleCheck() {
  const [n, setN] = useState(0);
  return (
    <Fila>
      <DobleCheck key={n} />
      <Boton tipo="secundario" ancho="contenido" onClick={() => setN(n + 1)}>
        Repetir animación
      </Boton>
    </Fila>
  );
}
