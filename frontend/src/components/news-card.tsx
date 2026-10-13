import Link from "next/link";
import type { NewsArticle } from "@/data/news";
import styles from "./news-card.module.css";

export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <article className={`${styles.card} hoverCard`}>
      <Link className={styles.link} href={`/noticias/${article.slug}`}>
        <div className={styles.placeholder} role="img" aria-label={`Imagem da notícia ${article.title} pendente`} />
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
