import { Baja, ComoFunciona, Contacto, Hero, Instalar, NoHace, Organizaciones, Privacidad } from "@/components/landing/Secciones";

// Home de la landing. Orden acordado: hero, cómo funciona, privacidad, lo que no hace, personalidad
// de la marca, ser contacto, instalar y baja. Instalar queda casi al final porque ya hay varias
// formas de llegar ahí rápido (botón del hero y de la barra).
export default function LandingPage() {
  return (
    <>
      <Hero />
      <ComoFunciona />
      <Privacidad />
      <NoHace />
      <Organizaciones />
      <Contacto />
      <Instalar />
      <Baja />
    </>
  );
}
