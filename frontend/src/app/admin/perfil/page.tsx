import type { Metadata } from "next";
import { AdminProfilePage } from "./profile-page";

export const metadata: Metadata = { title: "Meu perfil | Painel Octacore" };

export default function AdminProfileRoute() {
  return <AdminProfilePage />;
}
