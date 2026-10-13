import type { Metadata } from "next";
import { AccountDashboard } from "./account-dashboard";

export const metadata: Metadata = { title: "Minha conta | Octacore" };

export default function MinhaContaPage() {
  return <AccountDashboard />;
}
