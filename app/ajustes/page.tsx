import { redirect } from "next/navigation";

// El menú de quien emite apunta a /ajustes; la cuenta vive en /cuenta (docs/FLUJOS.md, flujo 6).
export default function Ajustes() {
  redirect("/cuenta");
}
