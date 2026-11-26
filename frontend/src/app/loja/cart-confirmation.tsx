"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/data/products";
import type { Product } from "@/data/products";
import { apiClient } from "@/lib/api";
import { mapProduct } from "@/lib/api-mappers";
import type { ApiItem, ApiProduct } from "@/lib/api-types";
import { useCart } from "@/lib/cart";
import { cartConfirmationEvent, type CartConfirmationItem } from "@/lib/cart-confirmation";
import { displayImageUrl } from "@/lib/display-image-url";
import styles from "./cart-confirmation.module.css";

export function CartConfirmation() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [item, setItem] = useState<CartConfirmationItem | null>(null);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const cart = useCart();
  const cartCount = cart?.reduce((total, entry) => total + entry.quantity, 0) ?? 0;
  const slugs = [...new Set(cart?.map((entry) => entry.slug) ?? [])].join("|");
  const cartLines = cart?.map((entry) => ({ ...entry, product: products[entry.slug] ?? (item?.product.slug === entry.slug ? item.product : undefined) })) ?? [];
  const totalCents = cartLines.reduce((total, entry) => total + (entry.product?.priceCents ?? 0) * entry.quantity, 0);
  const hasMissingPrice = cartLines.some((entry) => !entry.product);

  useEffect(() => {
    function onAdded(event: Event) {
      setItem((event as CustomEvent<CartConfirmationItem>).detail);
      if (!dialogRef.current?.open) dialogRef.current?.showModal();
    }
    window.addEventListener(cartConfirmationEvent, onAdded);
    return () => window.removeEventListener(cartConfirmationEvent, onAdded);
  }, []);

  useEffect(() => {
    if (!item || !slugs) return;
    let active = true;
    const names = slugs.split("|");
    void Promise.allSettled(names.map((slug) => apiClient<ApiItem<ApiProduct>>(`/products/${encodeURIComponent(slug)}`))).then((results) => {
      if (!active) return;
      setProducts((current) => {
        const next = { ...current };
        results.forEach((result, index) => { if (result.status === "fulfilled") next[names[index]] = mapProduct(result.value.data); });
        return next;
      });
    });
    return () => { active = false; };
  }, [item, slugs]);

  function close() {
    dialogRef.current?.close();
  }

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="cart-confirmation-title" onClose={() => setItem(null)} onClick={(event) => { if (event.target === dialogRef.current) close(); }}>
      <div className={styles.panel}>
        <header className={styles.header}>
          <span className={styles.check} aria-hidden="true">✓</span>
          <h2 id="cart-confirmation-title">Adicionado ao carrinho</h2>
          <button className={styles.close} type="button" onClick={close} aria-label="Fechar confirmação">×</button>
        </header>
        <div className={styles.cartBody}>
          {item && <p className={styles.addedNotice}>Agora no carrinho: {item.product.name}{item.size ? ` · ${item.size}` : ""} ({item.quantity})</p>}
          <h3 className={styles.listTitle}>Itens no carrinho ({cartCount})</h3>
          <div className={styles.productList}>
            {cartLines.map((entry) => <div className={styles.product} key={`${entry.slug}:${entry.size ?? ""}`}>
              {entry.product?.image ? <Image className={styles.image} src={displayImageUrl(entry.product.image)} alt={entry.product.alt ?? entry.product.name} width={96} height={96} unoptimized /> : <div className={styles.imagePlaceholder} aria-hidden="true" />}
              <div className={styles.productInfo}>
                <strong>{entry.product?.name ?? entry.slug}</strong>
                {entry.size && <span>Tamanho: {entry.size}</span>}
                <span>Quantidade: {entry.quantity}</span>
                <span className={styles.price}>{entry.product ? formatPrice(entry.product.priceCents * entry.quantity) : "Consultando preço..."}</span>
              </div>
            </div>)}
          </div>
        </div>
        <div className={styles.actions}>
          <div className={styles.total}><span>Total do carrinho</span><strong>{hasMissingPrice ? "Calculando..." : formatPrice(totalCents)}</strong></div>
          <Link className={styles.cartButton} href="/carrinho" onClick={close}>Ver carrinho ({cartCount})</Link>
          <button className={styles.continueButton} type="button" onClick={close}>Continuar comprando</button>
        </div>
      </div>
    </dialog>
  );
}
