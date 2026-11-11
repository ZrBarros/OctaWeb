import Link from "next/link";
import Image from "next/image";
import type { NewsArticle } from "@/data/news";
import { displayImageUrl } from "@/lib/display-image-url";
import styles from "./news-card.module.css";

export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <article className={`${styles.card} hoverCard`}>
      <Link className={styles.link} href={`/noticias/${article.slug}`}>
        {article.image ? (
          <Image className={styles.image} src={displayImageUrl(article.image)} alt="" width={720} height={420} unoptimized />
        ) : (
          <div className={styles.placeholder} role="img" aria-label={`Imagem da notícia ${article.title} pendente`} />
        )}
        <div className={styles.content}>
          <div className={styles.meta}>
            <span>{article.category}</span>
            <time dateTime={article.dateTime}>{article.date}</time>
          </div>
          <h2>{article.title}</h2>
          <p>{article.summary}</p>
          <span className={styles.readMore}>Ler notícia <span aria-hidden="true">→</span></span>
        </div>
      </Link>
    </article>
  );
}
