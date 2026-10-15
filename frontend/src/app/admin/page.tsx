import type { Metadata } from "next";
import { AdminDashboard } from "./admin-dashboard";

export const metadata: Metadata = { title: "Painel administrativo | Octacore" };

export default function AdminPage() {
  return <AdminDashboard />;
}
