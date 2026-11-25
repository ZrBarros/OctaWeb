import type { Product } from "@/data/products";

export const cartConfirmationEvent = "octacore-cart-confirmation";

export type CartConfirmationItem = {
  product: Product;
  size?: string;
  quantity: number;
};

export function openCartConfirmation(item: CartConfirmationItem) {
  window.dispatchEvent(new CustomEvent<CartConfirmationItem>(cartConfirmationEvent, { detail: item }));
}
