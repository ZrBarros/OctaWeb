"use client";

import { useMemo, useSyncExternalStore } from "react";
import { products } from "@/data/products";

const storageKey = "octacore-cart";
const changeEvent = "octacore-cart-change";
const emptyCart = "[]";
let memorySnapshot = emptyCart;

export type CartItem = {
  slug: string;
  size?: string;
  quantity: number;
};

function readSnapshot() {
  if (typeof window === "undefined") return emptyCart;
  try {
    return window.localStorage.getItem(storageKey) ?? emptyCart;
  } catch {
    return memorySnapshot;
  }
}

function parseCart(raw: string): CartItem[] {
  try {
    const saved: unknown = JSON.parse(raw);
    if (!Array.isArray(saved)) return [];

    const items: CartItem[] = [];
    for (const candidate of saved) {
      if (!candidate || typeof candidate !== "object") continue;
      const { slug, size, quantity } = candidate as Partial<CartItem>;
      const product = products.find((item) => item.slug === slug);
      if (!product || !Number.isInteger(quantity) || !quantity || quantity < 1) continue;
      if (product.sizes && (typeof size !== "string" || !product.sizes.includes(size))) continue;

      const validSize = product.sizes ? size : undefined;
      const existing = items.find((item) => item.slug === slug && item.size === validSize);
      if (existing) existing.quantity = Math.min(99, existing.quantity + quantity);
      else items.push({ slug: product.slug, size: validSize, quantity: Math.min(99, quantity) });
    }
    return items;
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  const next = JSON.stringify(items);
  memorySnapshot = next;
  try {
    window.localStorage.setItem(storageKey, next);
  } catch {
    // O carrinho continua funcionando nesta aba se o armazenamento for bloqueado.
  }
  window.dispatchEvent(new Event(changeEvent));
}

function subscribe(onChange: () => void) {
  window.addEventListener(changeEvent, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(changeEvent, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useCart() {
  const snapshot = useSyncExternalStore(subscribe, readSnapshot, () => emptyCart);
  const isReady = useSyncExternalStore(() => () => {}, () => true, () => false);
  return useMemo(() => isReady ? parseCart(snapshot) : null, [isReady, snapshot]);
}

export function addToCart(slug: string, size?: string) {
  const product = products.find((item) => item.slug === slug);
  if (!product || (product.sizes && (!size || !product.sizes.includes(size)))) return;

  const items = parseCart(readSnapshot());
  const selectedSize = product.sizes ? size : undefined;
  const existing = items.find((item) => item.slug === slug && item.size === selectedSize);
  if (existing) existing.quantity = Math.min(99, existing.quantity + 1);
  else items.push({ slug, size: selectedSize, quantity: 1 });
  writeCart(items);
}

export function changeCartQuantity(slug: string, size: string | undefined, quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return;
  const items = parseCart(readSnapshot());
  const item = items.find((entry) => entry.slug === slug && entry.size === size);
  if (!item) return;
  item.quantity = quantity;
  writeCart(items);
}

export function removeFromCart(slug: string, size?: string) {
  const items = parseCart(readSnapshot()).filter((item) => item.slug !== slug || item.size !== size);
  writeCart(items);
}
