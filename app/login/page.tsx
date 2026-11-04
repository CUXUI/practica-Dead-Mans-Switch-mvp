import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";
import { getBrand } from "@/lib/brand";

export default function LoginPage() {
  const brand = getBrand();
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-1 text-2xl font-semibold">{brand.name}</h1>
      <p className="mb-6 text-text-muted">Iniciá sesión para continuar.</p>
      <AuthForm mode="login" />
      <p className="mt-6 text-sm">
        ¿No tenés cuenta?{" "}
        <Link href="/registro" className="font-medium text-brand-primary underline">
          Crear cuenta
        </Link>
      </p>
    </main>
  );
}
