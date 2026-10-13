import type { Metadata } from "next";
import { CartContent } from "./cart-content";

export const metadata: Metadata = { title: "Carrinho | Loja Octacore" };

export default function CartPage() {
  return <CartContent />;
}
