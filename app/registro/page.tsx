import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";
import { getBrand } from "@/lib/brand";

export default function RegistroPage() {
  const brand = getBrand();
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-1 text-2xl font-semibold">Crear cuenta en {brand.name}</h1>
      <p className="mb-6 text-text-muted">{brand.description}</p>
      <AuthForm mode="registro" />
      <p className="mt-6 text-sm">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="font-medium text-brand-primary underline">
          Iniciar sesión
        </Link>
      </p>
    </main>
  );
}
