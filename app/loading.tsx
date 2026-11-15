import Spinner from "@/components/emisor/Spinner";

// Mientras una pantalla tarda en llegar, se ve este aviso en vez de una pantalla quieta.
export default function Cargando() {
  return (
    <div role="status" className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 bg-surface-muted p-6 text-text-muted">
      <Spinner className="size-8" />
      <p>Cargando…</p>
    </div>
  );
}
