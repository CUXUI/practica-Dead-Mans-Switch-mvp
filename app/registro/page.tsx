import { redirect } from "next/navigation";

// El registro ahora vive en el flujo 1 (Alta de quien emite): /alta/registro.
// Esta ruta se mantiene para no romper enlaces que ya apuntaban a /registro.
export default function RegistroPage() {
  redirect("/alta/registro");
}
