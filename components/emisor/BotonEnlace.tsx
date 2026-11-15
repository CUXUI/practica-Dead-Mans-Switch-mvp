"use client";

import Link, { useLinkStatus } from "next/link";
import Spinner from "./Spinner";

// Enlace con aspecto de botón que enseña un icono de carga mientras la pantalla siguiente se prepara.
function Indicador() {
  const { pending } = useLinkStatus();
  return pending ? <Spinner /> : null;
}

export default function BotonEnlace({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={className}>
      <span className="inline-flex items-center justify-center gap-2">
        <Indicador />
        {children}
      </span>
    </Link>
  );
}
