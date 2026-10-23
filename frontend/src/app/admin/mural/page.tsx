import type { Metadata } from "next";
import { AdminMuralPage } from "./mural-page";

export const metadata: Metadata = { title: "Mural | Painel Octacore" };

export default function Page() { return <AdminMuralPage />; }
