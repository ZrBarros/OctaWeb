"use client";

import Link from "next/link";
import { useState } from "react";
import { products } from "@/data/products";
import { useCart } from "@/lib/cart";
import { ProductCard } from "./product-card";
import styles from "./page.module.css";

const categories = ["Todos", "Camisas", "Tirantes", "Copos", "Acessórios", "Kits"];

export default function StorePage() {
  const [category, setCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const cart = useCart();
  const cartCount = cart?.reduce((total, item) => total + item.quantity, 0) ?? 0;
  const visibleProducts = products.filter((product) =>
    (category === "Todos" || product.category === category) &&
    product.name.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR")),
  );

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.kicker}><span>Faz o pix!</span><i /></div>
        <div className={styles.headingRow}>
          <h1>Loja oficial Octacore</h1>
        </div>
        <p className={styles.intro}>Vista as cores da maior associação acadêmica do estado.</p>

        <div className={styles.controls}>
          <div className={styles.categories} aria-label="Categorias de produtos">
            {categories.map((item) => (
              <button
                type="button"
                className={category === item ? styles.selected : ""}
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
                key={item}
              >{item}</button>
            ))}
          </div>
          <label className={styles.mobileCategory}>
            <span>Filtrar por categoria</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className={styles.search}>
            <span className={styles.visuallyHidden}>Buscar produtos</span>
            <input type="search" placeholder="Buscar na Octa Store..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <Link className={styles.cartLink} href="/carrinho">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h3l2.5 14h13l2-10H5" /></svg>
            Ver carrinho <span className={styles.cartCount} aria-label={`${cartCount} ${cartCount === 1 ? "item" : "itens"} no carrinho`}>{cartCount}</span>
          </Link>
        </div>

        {visibleProducts.length > 0 ? (
          <div className={styles.grid}>
            {visibleProducts.map((product) => <ProductCard product={product} key={product.slug} />)}
          </div>
        ) : (
          <p className={styles.empty}>Nenhum produto encontrado nessa categoria.</p>
        )}
      </div>
    </main>
  );
}
