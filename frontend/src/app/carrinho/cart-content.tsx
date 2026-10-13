"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice, products } from "@/data/products";
import { changeCartQuantity, removeFromCart, useCart } from "@/lib/cart";
import styles from "./page.module.css";

export function CartContent() {
  const items = useCart();
  const lines = items?.flatMap((item) => {
    const product = products.find((candidate) => candidate.slug === item.slug);
    return product ? [{ ...item, product }] : [];
  }) ?? [];
  const totalCents = lines.reduce((total, item) => total + item.product.priceCents * item.quantity, 0);
  const itemCount = lines.reduce((total, item) => total + item.quantity, 0);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Caminho da página">
          <Link href="/loja">Loja</Link><span aria-hidden="true">/</span><span>Carrinho</span>
        </nav>
        <div className={styles.kicker}><span>Loja</span><i /></div>
        <h1>Seu carrinho</h1>
        <p className={styles.intro}>Confira os produtos escolhidos antes de continuar.</p>

        {items === null ? (
          <p className={styles.loading} role="status">Carregando carrinho...</p>
        ) : lines.length === 0 ? (
          <section className={styles.empty} aria-label="Carrinho vazio">
            <h2>Seu carrinho está vazio</h2>
            <p>Explore os produtos oficiais da Octacore e escolha seus favoritos.</p>
            <Link className="button buttonPrimary" href="/loja">Explorar a loja</Link>
          </section>
        ) : (
          <div className={styles.layout}>
            <section className={styles.items} aria-label="Produtos no carrinho">
              {lines.map(({ slug, size, quantity, product }) => (
                <article className={styles.item} key={`${slug}:${size ?? ""}`}>
                  <Link className={styles.visual} href={`/loja/${slug}`} aria-label={`Ver ${product.name}`}>
                    {product.image ? (
                      <Image src={product.image} alt={product.alt ?? product.name} width={140} height={140} />
                    ) : (
                      <span className={styles.placeholder} role="img" aria-label={`Imagem de ${product.name} pendente`} />
                    )}
                  </Link>
                  <div className={styles.itemDetails}>
                    <Link className={styles.productName} href={`/loja/${slug}`}>{product.name}</Link>
                    <p>{product.category}{size ? ` · Tamanho ${size}` : ""}</p>
                    <strong>{formatPrice(product.priceCents)}</strong>
                    <button className={styles.remove} type="button" onClick={() => removeFromCart(slug, size)}>Remover</button>
                  </div>
                  <div className={styles.itemTotals}>
                    <div className={styles.quantity} aria-label={`Quantidade de ${product.name}${size ? `, tamanho ${size}` : ""}`}>
                      <button type="button" aria-label={`Diminuir quantidade de ${product.name}`} disabled={quantity === 1} onClick={() => changeCartQuantity(slug, size, quantity - 1)}>−</button>
                      <span>{quantity}</span>
                      <button type="button" aria-label={`Aumentar quantidade de ${product.name}`} disabled={quantity === 99} onClick={() => changeCartQuantity(slug, size, quantity + 1)}>+</button>
                    </div>
                    <strong>{formatPrice(product.priceCents * quantity)}</strong>
                  </div>
                </article>
              ))}
            </section>

            <aside className={styles.summary} aria-labelledby="summary-title">
              <h2 id="summary-title">Resumo do pedido</h2>
              <div className={styles.summaryRow}><span>Produtos ({itemCount})</span><strong>{formatPrice(totalCents)}</strong></div>
              <div className={`${styles.summaryRow} ${styles.total}`}><span>Total</span><strong>{formatPrice(totalCents)}</strong></div>
              <Link className={`button buttonPrimary ${styles.checkoutLink}`} href="/checkout">Ir para checkout</Link>
              <p>Checkout de demonstração, sem cobrança real.</p>
              <Link className={styles.continueLink} href="/loja">← Continuar comprando</Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
