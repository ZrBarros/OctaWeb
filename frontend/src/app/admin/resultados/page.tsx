import type { Metadata } from "next";
import { AdminResultsPage } from "./admin-results-page";

export const metadata: Metadata = { title: "Resultados | Painel Octacore" };

export default function Page() {
  return <AdminResultsPage />;
}
