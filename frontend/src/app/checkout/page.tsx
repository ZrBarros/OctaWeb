import type { Metadata } from "next";
import { CheckoutContent } from "./checkout-content";

export const metadata: Metadata = { title: "Checkout simulado | Loja Octacore" };

export default function CheckoutPage() {
  return <CheckoutContent />;
}
