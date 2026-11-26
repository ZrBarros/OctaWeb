import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { mapNews } from "@/lib/api-mappers";
import { displayImageUrl } from "@/lib/display-image-url";
import { apiServer } from "@/lib/server-api";
import { ApiError, type ApiItem, type ApiNews, type ApiPage } from "@/lib/api-types";
import styles from "./page.module.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try { const { data } = await apiServer<ApiItem<ApiNews>>(`/news/${encodeURIComponent(slug)}`); return { title: `${data.titulo} | Octacore` }; }
  catch { return { title: "Notícia não encontrada | Octacore" }; }
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  let article;
  try { article = mapNews((await apiServer<ApiItem<ApiNews>>(`/news/${encodeURIComponent(slug)}`)).data); }
  catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); throw error; }
  const relatedNews = (await apiServer<ApiPage<ApiNews>>("/news?pageSize=3")).data.map(mapNews).filter((item) => item.slug !== slug).slice(0, 2);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Caminho da página">
          <Link href="/noticias">Notícias</Link><span aria-hidden="true">/</span><span>{article.category}</span>
        </nav>

        <header className={styles.articleHeader}>
          <span className={styles.category}>{article.category}</span>
          <h1>{article.title}</h1>
          <div className={styles.meta}><span>Por {article.author}</span><span aria-hidden="true">•</span><time dateTime={article.dateTime}>{article.date}</time></div>
        </header>

        <div className={styles.layout}>
          <article className={styles.article} aria-label={article.title}>
            {article.image ? (
              <Image className={styles.cover} src={displayImageUrl(article.image)} alt={`Imagem de capa da notícia ${article.title}`} width={1200} height={675} unoptimized />
            ) : null}
            {article.summary && <p className={styles.lead}>{article.summary}</p>}
            {article.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </article>

          <aside className={styles.sidebar} aria-label="Outras notícias">
            <h2>Outras notícias</h2>
            <div className={styles.related}>{relatedNews.map((item) => (
              <Link className={styles.relatedCard} href={`/noticias/${item.slug}`} key={item.slug}>
                {item.image ? <Image className={styles.relatedImage} src={displayImageUrl(item.image)} alt="" width={240} height={180} unoptimized /> : <span className={styles.relatedPlaceholder} aria-hidden="true" />}
                <span className={styles.relatedContent}>
                  <span className={styles.relatedMeta}><span>{item.category}</span><time dateTime={item.dateTime}>{item.date}</time></span>
                  <strong>{item.title}</strong>
                  <span className={styles.relatedMore}>Ler notícia <span aria-hidden="true">→</span></span>
                </span>
              </Link>
            ))}</div>
          </aside>
        </div>
      </div>
    </main>
  );
}
