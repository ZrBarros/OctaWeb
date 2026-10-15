import type { Metadata } from "next";
import { AdminProductsPage } from "./admin-products-page";

export const metadata: Metadata = { title: "Produtos | Painel Octacore" };

export default function Page() {
  return <AdminProductsPage />;
}
