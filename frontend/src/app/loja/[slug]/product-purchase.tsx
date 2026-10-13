"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/data/products";
import { addToCart } from "@/lib/cart";
import styles from "./page.module.css";

export function ProductPurchase({ product }: { product: Product }) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  function handleAdd() {
    if (product.sizes && !selectedSize) return;
    addToCart(product.slug, selectedSize ?? undefined);
    router.push("/carrinho");
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
                onClick={() => setSelectedSize(size)}
              >{size}</button>
            ))}
          </div>
          <p className={styles.sizeNote}>Disponibilidade dos tamanhos a confirmar.</p>
        </div>
      )}

      <div className={styles.purchaseActions}>
        <button
          className="button buttonPrimary"
          type="button"
          disabled={Boolean(product.sizes && !selectedSize)}
          onClick={handleAdd}
        >Adicionar ao carrinho</button>
        {product.sizes && !selectedSize && <p>Escolha um tamanho para continuar.</p>}
      </div>
    </>
  );
}
