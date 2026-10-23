import type { Metadata } from "next";
import { AdminUsersPage } from "./users-page";

export const metadata: Metadata = { title: "Usuários | Painel Octacore" };

export default function Page() { return <AdminUsersPage />; }
