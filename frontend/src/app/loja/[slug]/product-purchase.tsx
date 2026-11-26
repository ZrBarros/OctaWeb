"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/data/products";
import { addToCart, useCart } from "@/lib/cart";
import { openCartConfirmation } from "@/lib/cart-confirmation";
import { useTimedFeedback } from "@/lib/use-timed-feedback";
import styles from "./page.module.css";

export function ProductPurchase({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { message: feedback, showFeedback, clearFeedback } = useTimedFeedback();
  const cart = useCart();
  const inCart = cart?.find((item) => item.slug === product.slug && item.size === (selectedSize ?? undefined))?.quantity ?? 0;
  const availableStock = product.variations?.find((variation) => variation.size === (selectedSize ?? "UNICO"))?.stock ?? 0;
  const available = Math.max(0, Math.min(99, availableStock) - inCart);
  const wasAdded = feedback.startsWith("Adicionado:");

  function handleAdd() {
    if (product.sizes && !selectedSize) return;
    if (quantity > available) { showFeedback(`Restam ${available} ${available === 1 ? "unidade" : "unidades"} disponíveis para adicionar.`); return; }
    const added = quantity;
    if (added < 1 || !addToCart(product.slug, selectedSize ?? undefined, added)) {
      showFeedback("Estoque disponível atingido para esta opção.");
      return;
    }
    showFeedback(`Adicionado: ${added} ${added === 1 ? "unidade" : "unidades"} de ${product.name}${selectedSize ? ` · tamanho ${selectedSize}` : ""}.`);
    openCartConfirmation({ product, size: selectedSize ?? undefined, quantity: added });
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
                disabled={product.variations?.find((variation) => variation.size === size)?.stock === 0}
                onClick={() => { setSelectedSize(size); setQuantity(1); clearFeedback(); }}
              >{size}</button>
            ))}
          </div>
          {product.sizes.length === 0 && <p className={styles.sizeNote}>Tamanhos ainda não cadastrados.</p>}
          {selectedSize && <p className={styles.sizeNote}>{available > 0 ? `${available} ${available === 1 ? "unidade disponível" : "unidades disponíveis"} para adicionar` : "Estoque disponível atingido para este tamanho."}</p>}
        </div>
      )}

      <div className={styles.quantitySelector}>
        <span>Quantidade</span>
        <div className={styles.quantityControl}>
          <button type="button" aria-label={`Diminuir quantidade de ${product.name}`} disabled={quantity === 1} onClick={() => { setQuantity((current) => current - 1); clearFeedback(); }}>−</button>
          <output aria-label={`Quantidade selecionada: ${quantity}`}>{quantity}</output>
          <button type="button" aria-label={`Aumentar quantidade de ${product.name}`} disabled={quantity >= (selectedSize || !product.sizes ? available : 99)} onClick={() => { setQuantity((current) => current + 1); clearFeedback(); }}>+</button>
        </div>
      </div>

      <div className={styles.purchaseActions}>
        <button
          className={`button buttonPrimary ${wasAdded ? styles.addButtonSuccess : ""}`}
          type="button"
          disabled={Boolean(product.sizes && !selectedSize) || available === 0}
          onClick={handleAdd}
        >{wasAdded ? "Adicionado ✓" : "Adicionar ao carrinho"}</button>
        {product.sizes && product.sizes.length > 0 && !selectedSize && <p>Escolha um tamanho para continuar.</p>}
        {feedback && !wasAdded && <p className={styles.purchaseFeedbackError} role="alert">{feedback}</p>}
        {!wasAdded && cart && cart.length > 0 && <Link className={styles.cartShortcut} href="/carrinho">Ver carrinho ({cart.reduce((total, item) => total + item.quantity, 0)}) →</Link>}
      </div>
    </>
  );
}
