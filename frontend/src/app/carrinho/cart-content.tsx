"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/data/products";
import { mapProduct } from "@/lib/api-mappers";
import type { ApiPage, ApiProduct } from "@/lib/api-types";
import { useApiData } from "@/lib/use-api";
import { changeCartQuantity, removeFromCart, useCart } from "@/lib/cart";
import { displayImageUrl } from "@/lib/display-image-url";
import styles from "./page.module.css";

export function CartContent() {
  const [pendingRemoval, setPendingRemoval] = useState<{ slug: string; size?: string; name: string } | null>(null);
  const removalDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = removalDialog.current; if (pendingRemoval && dialog && !dialog.open) dialog.showModal(); }, [pendingRemoval]);
  function closeRemoval() { removalDialog.current?.close(); setPendingRemoval(null); }
  const items = useCart();
  const { data: response, loading, error } = useApiData<ApiPage<ApiProduct>>("/products?pageSize=100", { data: [], meta: { page: 1, pageSize: 100, total: 0, totalPages: 0 } });
  const products = response.data.map(mapProduct);
  const lines = items?.flatMap((item) => {
    const product = products.find((candidate) => candidate.slug === item.slug);
    return product ? [{ ...item, product }] : [];
  }) ?? [];
  const totalCents = lines.reduce((total, item) => total + item.product.priceCents * item.quantity, 0);
  const itemCount = lines.reduce((total, item) => total + item.quantity, 0);
  const hasStockIssue = lines.some((item) => { const stock = item.product.variations?.find((variation) => variation.size === (item.size ?? "UNICO"))?.stock ?? 0; return item.quantity > stock; });

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Caminho da página">
          <Link href="/loja">Loja</Link><span aria-hidden="true">/</span><span>Carrinho</span>
        </nav>
        <div className={styles.kicker}><span>Loja</span><i /></div>
        <h1>Seu carrinho</h1>
        <p className={styles.intro}>Confira os produtos escolhidos antes de continuar.</p>

        {items === null || loading ? (
          <p className={styles.loading} role="status">Carregando carrinho...</p>
        ) : error ? (
          <p className={styles.loading} role="alert">{error}</p>
        ) : lines.length === 0 ? (
          <section className={styles.empty} aria-label="Carrinho vazio">
            <h2>Seu carrinho está vazio</h2>
            <p>Explore os produtos oficiais da Octacore e escolha seus favoritos.</p>
            <Link className="button buttonPrimary" href="/loja">Explorar a loja</Link>
          </section>
        ) : (
          <div className={styles.layout}>
            <section className={styles.items} aria-label="Produtos no carrinho">
              {lines.map(({ slug, size, quantity, product }) => {
                const stock = product.variations?.find((variation) => variation.size === (size ?? "UNICO"))?.stock ?? 0;
                return (
                <article className={styles.item} key={`${slug}:${size ?? ""}`}>
                  <Link className={styles.visual} href={`/loja/${slug}`} aria-label={`Ver ${product.name}`}>
                    {product.image ? (
                      <Image src={displayImageUrl(product.image)} alt={product.alt ?? product.name} width={140} height={140} unoptimized />
                    ) : (
                      <span className={styles.placeholder} role="img" aria-label={`Imagem de ${product.name} pendente`} />
                    )}
                  </Link>
                  <div className={styles.itemDetails}>
                    <Link className={styles.productName} href={`/loja/${slug}`}>{product.name}</Link>
                    <p>{product.category}{size ? ` · Tamanho ${size}` : ""}</p>
                    <strong>{formatPrice(product.priceCents)}</strong>
                    {quantity > stock && <p className={styles.stockWarning} role="alert">{stock > 0 ? `Apenas ${stock} ${stock === 1 ? "unidade disponível" : "unidades disponíveis"}.` : "Produto esgotado."} {stock > 0 && <button type="button" onClick={() => changeCartQuantity(slug, size, stock)}>Ajustar quantidade</button>}</p>}
                  </div>
                  <div className={styles.itemTotals}>
                    <div className={styles.itemControls}>
                      <div className={styles.quantity} aria-label={`Quantidade de ${product.name}${size ? `, tamanho ${size}` : ""}`}>
                        <button type="button" aria-label={`Diminuir quantidade de ${product.name}`} disabled={quantity === 1} onClick={() => changeCartQuantity(slug, size, quantity - 1)}>−</button>
                        <span>{quantity}</span>
                        <button type="button" aria-label={`Aumentar quantidade de ${product.name}`} disabled={quantity >= Math.min(99, stock)} onClick={() => changeCartQuantity(slug, size, quantity + 1)}>+</button>
                      </div>
                      <button className={styles.removeIcon} type="button" aria-label={`Remover ${product.name} do carrinho`} title="Remover do carrinho" onClick={() => setPendingRemoval({ slug, size, name: product.name })}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5" /></svg></button>
                    </div>
                    <strong>{formatPrice(product.priceCents * quantity)}</strong>
                  </div>
                </article>
              ); })}
            </section>

            <aside className={styles.summary} aria-labelledby="summary-title">
              <h2 id="summary-title">Resumo do pedido</h2>
              <div className={styles.summaryRow}><span>Produtos ({itemCount})</span><strong>{formatPrice(totalCents)}</strong></div>
              <div className={`${styles.summaryRow} ${styles.total}`}><span>Total</span><strong>{formatPrice(totalCents)}</strong></div>
              {hasStockIssue ? <p className={styles.checkoutWarning} role="alert">Ajuste os itens acima do estoque disponível antes de finalizar.</p> : <Link className={`button buttonPrimary ${styles.checkoutLink}`} href="/checkout">Ir para checkout</Link>}
              <p>O pedido será registrado sem cobrança online.</p>
              <Link className={styles.continueLink} href="/loja">← Continuar comprando</Link>
            </aside>
          </div>
        )}
      </div>
      <dialog ref={removalDialog} className={styles.confirmDialog} aria-labelledby="remove-item-title" aria-describedby="remove-item-description" onClose={() => setPendingRemoval(null)} onClick={(event) => { if (event.target === removalDialog.current) closeRemoval(); }}>
        <div className={styles.confirmContent}>
          <div className={styles.confirmHeader}><h2 id="remove-item-title">Remover item?</h2><button type="button" aria-label="Fechar confirmação" onClick={closeRemoval}>×</button></div>
          <p id="remove-item-description">Você deseja mesmo remover <strong>{pendingRemoval?.name}</strong>{pendingRemoval?.size ? ` (tamanho ${pendingRemoval.size})` : ""} do seu carrinho?</p>
          <div className={styles.confirmActions}><button type="button" className={styles.cancelRemoval} onClick={closeRemoval}>Cancelar</button><button type="button" className={styles.confirmRemoval} onClick={() => { if (pendingRemoval) removeFromCart(pendingRemoval.slug, pendingRemoval.size); closeRemoval(); }}>Remover item</button></div>
        </div>
      </dialog>
    </main>
  );
}
