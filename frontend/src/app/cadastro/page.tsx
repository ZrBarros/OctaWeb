import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Cadastro | Octacore" };

export default async function CadastroPage({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) {
  const { redirect } = await searchParams;
  return <AuthForm mode="cadastro" returnTo={redirect} />;
}
