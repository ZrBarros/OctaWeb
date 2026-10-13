import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice, products } from "@/data/products";
import { ProductPurchase } from "./product-purchase";
import styles from "./page.module.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  return { title: product ? `${product.name} | Loja Octacore` : "Produto não encontrado | Octacore" };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  if (!product) notFound();

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
