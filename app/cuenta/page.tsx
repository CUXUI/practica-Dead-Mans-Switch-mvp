import { getBrand } from "@/lib/brand";
import { Encabezado, EnlaceBoton, Pantalla, Tarjeta } from "@/components/emisor/ui";
import BarraNavegacion from "@/components/home/BarraNavegacion";
import { textosInicio } from "@/components/home/textosInicio";
import SignOutButton from "@/components/auth/SignOutButton";
import BorrarCuenta from "@/components/cuenta/BorrarCuenta";
import { textosCuenta } from "@/components/cuenta/textos";
import { avisoActual, exigirSesion } from "@/app/aviso/_datos/sesion";

// E8 · Cuenta (destino "Ajustes" del menú). Datos de quien emite, cerrar sesión y borrar la cuenta.
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

  return (
    <Pantalla nav={<BarraNavegacion t={textosInicio(marca.variant).nav} actual="ajustes" />}>
      <Encabezado nombre={marca.name} />
      <h1 className="text-2xl font-semibold">{t.titulo}</h1>

      <Tarjeta titulo={t.datos} id="datos">
        <dl className="space-y-3">
          <div>
            <dt className="text-sm text-text-muted">{t.nombre}</dt>
            <dd className="font-medium">{dato(perfil?.full_name)}</dd>
          </div>
          <div>
            <dt className="text-sm text-text-muted">{t.telefono}</dt>
            <dd className="font-medium">{dato(perfil?.phone)}</dd>
          </div>
          <div>
            <dt className="text-sm text-text-muted">{t.correo}</dt>
            <dd className="break-all font-medium">{dato(s.user.email)}</dd>
          </div>
        </dl>
        <SignOutButton />
      </Tarjeta>

      <Tarjeta titulo={t.borrarTitulo} id="borrar">
        <p className="text-text-muted">{t.borrarTexto}</p>
        {enAlerta ? (
          <>
            <p role="status" className="font-medium">
              {t.alertaEnCurso}
            </p>
            <EnlaceBoton href="/home" tipo="secundario">
              {t.irInicio}
            </EnlaceBoton>
          </>
        ) : (
          <BorrarCuenta t={t} />
        )}
      </Tarjeta>
    </Pantalla>
  );
}
