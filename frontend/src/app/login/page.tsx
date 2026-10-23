import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Entrar | Octacore" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ senha?: string }> }) {
  const { senha } = await searchParams;
  return <AuthForm mode="login" initialMessage={senha === "alterada" ? "Senha alterada. Entre novamente com a nova senha." : ""} />;
}
