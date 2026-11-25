"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/data/products";
import { useCart } from "@/lib/cart";
import { cartConfirmationEvent, type CartConfirmationItem } from "@/lib/cart-confirmation";
import { displayImageUrl } from "@/lib/display-image-url";
import styles from "./cart-confirmation.module.css";

export function CartConfirmation() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [item, setItem] = useState<CartConfirmationItem | null>(null);
  const cart = useCart();
  const cartCount = cart?.reduce((total, entry) => total + entry.quantity, 0) ?? 0;

  useEffect(() => {
    function onAdded(event: Event) {
      setItem((event as CustomEvent<CartConfirmationItem>).detail);
      if (!dialogRef.current?.open) dialogRef.current?.showModal();
    }
    window.addEventListener(cartConfirmationEvent, onAdded);
    return () => window.removeEventListener(cartConfirmationEvent, onAdded);
  }, []);

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
        {item && (
          <div className={styles.product}>
            {item.product.image ? <Image className={styles.image} src={displayImageUrl(item.product.image)} alt={item.product.alt ?? item.product.name} width={128} height={128} unoptimized /> : <div className={styles.imagePlaceholder} aria-hidden="true" />}
            <div className={styles.productInfo}>
              <strong>{item.product.name}</strong>
              {item.size && <span>Tamanho: {item.size}</span>}
              <span>Quantidade adicionada: {item.quantity}</span>
              <span className={styles.price}>{formatPrice(item.product.priceCents * item.quantity)}</span>
            </div>
          </div>
        )}
        <div className={styles.actions}>
          <Link className={styles.cartButton} href="/carrinho" onClick={close}>Ver carrinho ({cartCount})</Link>
          <button className={styles.continueButton} type="button" onClick={close}>Continuar comprando</button>
        </div>
      </div>
    </dialog>
  );
}
