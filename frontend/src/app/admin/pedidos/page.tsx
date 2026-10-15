import type { Metadata } from "next";
import { AdminOrdersPage } from "./admin-orders-page";

export const metadata: Metadata = { title: "Pedidos | Painel Octacore" };

export default function Page() {
  return <AdminOrdersPage />;
}
