// Icono de carga para botones y pantallas que esperan al servidor. Se detiene si la persona
// pide menos movimiento. Decorativo: el texto del botón ya dice qué pasa ("Enviando…").
export default function Spinner({ className = "size-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`${className} shrink-0 animate-spin motion-reduce:animate-none`} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  );
}
