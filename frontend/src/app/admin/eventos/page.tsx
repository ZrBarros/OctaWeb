import type { Metadata } from "next";
import { AdminEventsPage } from "./admin-events-page";

export const metadata: Metadata = { title: "Eventos | Painel Octacore" };

export default function Page() {
  return <AdminEventsPage />;
}
