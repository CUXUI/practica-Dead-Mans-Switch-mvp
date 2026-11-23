"use client";

// "Editar" del Inicio con el aviso encendido: siempre se ve, desactivado (apaga primero para editarlo).
export default function EditarActivo({ texto, aria, titulo }: { texto: string; aria: string; titulo: string }) {
  return (
    <button
      type="button"
      disabled
      aria-label={aria}
      title={titulo}
      className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4 opacity-50 disabled:cursor-not-allowed"
    >
      {texto}
    </button>
  );
}
