import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Cadastro | Octacore" };

export default function CadastroPage() {
  return <AuthForm mode="cadastro" />;
}
