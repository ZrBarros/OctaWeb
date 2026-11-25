"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/data/products";
import { formatPrice } from "@/data/products";
import { addToCart, useCart } from "@/lib/cart";
import { openCartConfirmation } from "@/lib/cart-confirmation";
import { useTimedFeedback } from "@/lib/use-timed-feedback";
import { displayImageUrl } from "@/lib/display-image-url";
import styles from "./page.module.css";

export function ProductCard({ product }: { product: Product }) {
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { message: feedback, showFeedback, clearFeedback } = useTimedFeedback();
  const cart = useCart();
  const inCart = cart?.find((item) => item.slug === product.slug && item.size === (size ?? undefined))?.quantity ?? 0;
  const availableStock = product.variations?.find((variation) => variation.size === (size ?? "UNICO"))?.stock ?? 0;
  const available = Math.max(0, Math.min(99, availableStock) - inCart);
  const wasAdded = feedback.startsWith("Adicionado:");

  function handleAdd() {
    if (product.sizes && !size) {
      showFeedback("Escolha um tamanho para adicionar ao carrinho.");
      return;
    }
    const added = Math.min(quantity, available);
    if (added < 1 || !addToCart(product.slug, size ?? undefined, added)) {
      showFeedback("Estoque disponível atingido para esta opção.");
      return;
    }
    showFeedback(`Adicionado: ${added} ${added === 1 ? "unidade" : "unidades"} de ${product.name}${size ? ` · tamanho ${size}` : ""}.`);
    openCartConfirmation({ product, size: size ?? undefined, quantity: added });
  }

  return (
    <article className={styles.card}>
      <Link className={styles.imageLink} href={`/loja/${product.slug}`} aria-label={`Ver ${product.name} em detalhes`}>
        {product.image ? (
          <Image className={styles.image} src={displayImageUrl(product.image)} alt={product.alt ?? ""} width={400} height={300} unoptimized />
        ) : (
          <span className={styles.placeholder} role="img" aria-label={`Imagem de ${product.name} pendente`} />
        )}
      </Link>
      <h2>{product.name}</h2>
      <p className={styles.description}>{product.description}</p>
      <strong className={styles.price}>{formatPrice(product.priceCents)}</strong>

      {product.sizes && (
        <fieldset className={styles.sizes}>
          <legend>Tamanho</legend>
          <div className={styles.sizeOptions}>
            {product.sizes.map((option) => (
              <button
                key={option}
                type="button"
                className={size === option ? styles.selectedSize : ""}
                aria-pressed={size === option}
                aria-label={`Tamanho ${option} de ${product.name}`}
                onClick={() => { setSize(option); clearFeedback(); }}
              >{option}</button>
            ))}
          </div>
        </fieldset>
      )}

      <div className={styles.quantityRow}>
        <span>Quantidade</span>
        <div className={styles.quantityControl}>
          <button type="button" aria-label={`Diminuir quantidade de ${product.name}`} disabled={quantity === 1} onClick={() => { setQuantity((current) => current - 1); clearFeedback(); }}>−</button>
          <output aria-label={`Quantidade selecionada: ${quantity}`}>{quantity}</output>
          <button type="button" aria-label={`Aumentar quantidade de ${product.name}`} disabled={quantity === 99} onClick={() => { setQuantity((current) => current + 1); clearFeedback(); }}>+</button>
        </div>
      </div>

      <button className={`${styles.addButton} ${wasAdded ? styles.addButtonSuccess : ""}`} type="button" onClick={handleAdd} disabled={Boolean(size || !product.sizes) && available === 0}>{wasAdded ? "Adicionado ✓" : "Adicionar ao carrinho"}</button>
      {feedback && !wasAdded && <p className={styles.feedbackError} role="alert">{feedback}</p>}
      <Link className={styles.detailsLink} href={`/loja/${product.slug}`}>Ver detalhes <span aria-hidden="true">↗</span></Link>
    </article>
  );
}
