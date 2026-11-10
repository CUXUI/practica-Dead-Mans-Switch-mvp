import { getBrand } from "@/lib/brand";
import { textosAlta } from "@/components/alta/textos";
import { EnlaceBoton, Numero, Pantalla, Tarjeta } from "@/components/emisor/ui";
import { exigirSesion } from "@/app/aviso/_datos/sesion";

// R-AV-E1 · Web · Onboarding · comienzo
export default async function AltaComienzo() {
  await exigirSesion();
  const brand = getBrand();
  const t = textosAlta(brand.variant).comienzo;

  return (
    <Pantalla pie={<EnlaceBoton href="/alta/notificaciones">{t.empezar}</EnlaceBoton>}>
      <p className="pt-2 text-lg font-semibold">{brand.name}</p>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t.titulo}</h1>
        <p className="text-text-muted">{t.intro}</p>
      </div>
      <Tarjeta>
        <ol className="space-y-4">
          {t.pasos.map((p, i) => (
            <li key={p.titulo} className="flex gap-3">
              <Numero n={i + 1} />
              <div>
                <p className="font-semibold">{p.titulo}</p>
                <p className="text-text-muted">{p.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </Tarjeta>
    </Pantalla>
  );
}
