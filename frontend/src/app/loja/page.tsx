"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatPrice, products } from "@/data/products";
import styles from "./page.module.css";

const categories = ["Todos", "Camisas", "Tirantes", "Copos", "Acessórios", "Kits"];

export default function StorePage() {
  const [category, setCategory] = useState("Todos");
  const [search, setSearch] = useState("");
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
          <Link className={styles.cartLink} href="/carrinho">Ver carrinho <span aria-hidden="true">→</span></Link>
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
        </div>

        {visibleProducts.length > 0 ? (
          <div className={styles.grid}>
            {visibleProducts.map((product) => (
              <article className={`${styles.card} hoverCard`} key={product.slug}>
                <Link className={styles.productLink} href={`/loja/${product.slug}`} aria-label={`Ver detalhes de ${product.name}`}>
                  {product.image ? (
                    <Image className={styles.image} src={product.image} alt={product.alt ?? ""} width={400} height={300} />
                  ) : (
                    <div className={styles.placeholder} role="img" aria-label={`Imagem de ${product.name} pendente`} />
                  )}
                  <h2>{product.name}</h2>
                  <p>{product.description}</p>
                  <strong>{formatPrice(product.priceCents)}</strong>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>Nenhum produto encontrado nessa categoria.</p>
        )}
      </div>
    </main>
  );
}
