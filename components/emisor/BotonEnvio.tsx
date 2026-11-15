"use client";

import { useFormStatus } from "react-dom";
import Spinner from "./Spinner";

// Botón de envío de un formulario con acción de servidor: mientras espera la respuesta enseña el icono de
// carga y el texto "pendiente". Va dentro del <form>.
export default function BotonEnvio({ className, children, pendiente }: { className: string; children: React.ReactNode; pendiente: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={className}>
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <Spinner />
          {pendiente}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
