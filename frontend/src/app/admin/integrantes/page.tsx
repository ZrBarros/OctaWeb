import type { Metadata } from "next";
import { AdminMembersPage } from "./admin-members-page";

export const metadata: Metadata = { title: "Integrantes | Painel Octacore" };

export default function Page() {
  return <AdminMembersPage />;
}
