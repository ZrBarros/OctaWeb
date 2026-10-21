"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/data/products";
import { addToCart, useCart } from "@/lib/cart";
import { useTimedFeedback } from "@/lib/use-timed-feedback";
import styles from "./page.module.css";

export function ProductPurchase({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { message: feedback, showFeedback, clearFeedback } = useTimedFeedback();
  const cart = useCart();
  const inCart = cart?.find((item) => item.slug === product.slug && item.size === (selectedSize ?? undefined))?.quantity ?? 0;
  const available = 99 - inCart;

  function handleAdd() {
    if (product.sizes && !selectedSize) return;
    const added = Math.min(quantity, available);
    if (added < 1 || !addToCart(product.slug, selectedSize ?? undefined, added)) {
      showFeedback("Limite de 99 unidades deste item no carrinho.");
      return;
    }
    showFeedback(`${added} ${added === 1 ? "unidade adicionada" : "unidades adicionadas"} ao carrinho${selectedSize ? ` · tamanho ${selectedSize}` : ""}.`);
  }

  return (
    <>
      {product.sizes && (
        <div className={styles.sizeSelector}>
          <h2>Tamanho</h2>
          <div className={styles.sizeOptions} role="group" aria-label="Escolher tamanho">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                className={selectedSize === size ? styles.selectedSize : ""}
                aria-pressed={selectedSize === size}
                onClick={() => { setSelectedSize(size); clearFeedback(); }}
              >{size}</button>
            ))}
          </div>
          <p className={styles.sizeNote}>Disponibilidade dos tamanhos a confirmar.</p>
        </div>
      )}

      <div className={styles.quantitySelector}>
        <span>Quantidade</span>
        <div className={styles.quantityControl}>
          <button type="button" aria-label={`Diminuir quantidade de ${product.name}`} disabled={quantity === 1} onClick={() => setQuantity((current) => current - 1)}>−</button>
          <output aria-label={`Quantidade selecionada: ${quantity}`}>{quantity}</output>
          <button type="button" aria-label={`Aumentar quantidade de ${product.name}`} disabled={quantity === 99} onClick={() => setQuantity((current) => current + 1)}>+</button>
        </div>
      </div>

      <div className={styles.purchaseActions}>
        <button
          className="button buttonPrimary"
          type="button"
          disabled={Boolean(product.sizes && !selectedSize) || available === 0}
          onClick={handleAdd}
        >Adicionar ao carrinho</button>
        {product.sizes && !selectedSize && <p>Escolha um tamanho para continuar.</p>}
        <p className={styles.purchaseFeedback} role="status" aria-live="polite">{feedback || "\u00a0"}</p>
        {cart && cart.length > 0 && <Link className={styles.cartShortcut} href="/carrinho">Ver carrinho ({cart.reduce((total, item) => total + item.quantity, 0)}) →</Link>}
      </div>
    </>
  );
}
