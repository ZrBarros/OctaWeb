import type { Metadata } from "next";
import { AdminNewsPage } from "./admin-news-page";

export const metadata: Metadata = { title: "Mural de notícias | Painel Octacore" };

export default function Page() {
  return <AdminNewsPage />;
}
