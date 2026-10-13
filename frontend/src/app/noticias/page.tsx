"use client";

import { useState } from "react";
import { NewsCard } from "@/components/news-card";
import { news, newsCategories } from "@/data/news";
import styles from "./page.module.css";

export default function NewsPage() {
  const [category, setCategory] = useState<(typeof newsCategories)[number]>("Todos");
  const visibleNews = category === "Todos" ? news : news.filter((article) => article.category === category);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.kicker}><span>Fique por dentro</span><i /></div>
        <h1>Mural de notícias</h1>
        <p className={styles.intro}>Acompanhe todas as novidades, coberturas esportivas e comunicados oficiais.</p>

        <div className={styles.categories} aria-label="Filtrar notícias por categoria">
          {newsCategories.map((item) => (
            <button
              key={item}
              type="button"
              className={category === item ? styles.selected : ""}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >{item}</button>
          ))}
        </div>

        {visibleNews.length > 0 ? (
          <div className={styles.grid}>{visibleNews.map((article) => <NewsCard key={article.slug} article={article} />)}</div>
        ) : (
          <p className={styles.empty}>Ainda não há notícias nessa categoria.</p>
        )}
      </div>
    </main>
  );
}
