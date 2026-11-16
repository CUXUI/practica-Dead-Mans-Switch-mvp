// Íconos Lucide (licencia ISC) que usa el DS en Historial y en el diálogo de la cuenta:
// check, clock, triangle-alert y circle-x. Trazo 2 px en 24 px, como en la Biblioteca.
// Decorativos: el texto de al lado dice lo mismo, por eso van ocultos al lector de pantalla.

function Base({ children, className = "size-6" }: { children: React.ReactNode; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`${className} shrink-0`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export const IconoCheck = ({ className }: { className?: string }) => (
  <Base className={className}>
    <path d="M20 6 9 17l-5-5" />
  </Base>
);

export const IconoReloj = ({ className }: { className?: string }) => (
  <Base className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </Base>
);

export const IconoAlerta = ({ className }: { className?: string }) => (
  <Base className={className}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </Base>
);

export const IconoCirculoX = ({ className }: { className?: string }) => (
  <Base className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </Base>
);
