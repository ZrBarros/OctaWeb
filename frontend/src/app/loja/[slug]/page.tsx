import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice } from "@/data/products";
import { mapProduct } from "@/lib/api-mappers";
import { apiServer } from "@/lib/server-api";
import { ApiError, type ApiItem, type ApiProduct } from "@/lib/api-types";
import { ProductPurchase } from "./product-purchase";
import styles from "./page.module.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try { const { data } = await apiServer<ApiItem<ApiProduct>>(`/products/${encodeURIComponent(slug)}`); return { title: `${data.nome} | Loja Octacore` }; }
  catch { return { title: "Produto não encontrado | Octacore" }; }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  let product;
  try { product = mapProduct((await apiServer<ApiItem<ApiProduct>>(`/products/${encodeURIComponent(slug)}`)).data); }
  catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); throw error; }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Caminho da página">
          <Link href="/loja">Loja</Link><span aria-hidden="true">/</span><span>{product.name}</span>
        </nav>

        <div className={styles.productLayout}>
          <div className={styles.visual}>
            {product.image ? (
              <Image className={styles.image} src={product.image} alt={product.alt ?? product.name} width={900} height={800} priority />
            ) : (
              <div className={styles.placeholder} role="img" aria-label={`Imagem de ${product.name} pendente`} />
            )}
          </div>

          <section className={styles.details} aria-labelledby="product-title">
            <div className={styles.kicker}><span>{product.category}</span><i /></div>
            <h1 id="product-title">{product.name}</h1>
            <p className={styles.description}>{product.description}</p>
            <strong className={styles.price}>{formatPrice(product.priceCents)}</strong>

            <ProductPurchase product={product} />

            <Link className="button buttonOutline" href="/loja">← Voltar para a loja</Link>
          </section>
        </div>
      </div>
    </main>
  );
}
