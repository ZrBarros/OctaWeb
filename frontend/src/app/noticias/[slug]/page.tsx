import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NewsCard } from "@/components/news-card";
import { news } from "@/data/news";
import styles from "./page.module.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return news.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = news.find((item) => item.slug === slug);
  return { title: article ? `${article.title} | Octacore` : "Notícia não encontrada | Octacore" };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = news.find((item) => item.slug === slug);
  if (!article) notFound();
  const relatedNews = news.filter((item) => item.slug !== slug).slice(0, 2);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Caminho da página">
          <Link href="/noticias">Notícias</Link><span aria-hidden="true">/</span><span>{article.category}</span>
        </nav>

        <div className={styles.layout}>
          <article className={styles.article}>
            <span className={styles.category}>{article.category}</span>
            <h1>{article.title}</h1>
            <div className={styles.meta}><span>Por {article.author}</span><span aria-hidden="true">•</span><time dateTime={article.dateTime}>{article.date}</time></div>
            <div className={styles.placeholder} role="img" aria-label={`Imagem da notícia ${article.title} pendente`} />
            <p className={styles.lead}>{article.summary}</p>
            {article.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <Link className={styles.back} href="/noticias"><span aria-hidden="true">←</span> Voltar para notícias</Link>
          </article>

          <aside className={styles.sidebar} aria-label="Outras notícias">
            <h2>Outras notícias</h2>
            <div className={styles.related}>{relatedNews.map((item) => <NewsCard key={item.slug} article={item} />)}</div>
          </aside>
        </div>
      </div>
    </main>
  );
}
