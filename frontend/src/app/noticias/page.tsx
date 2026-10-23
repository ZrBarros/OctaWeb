"use client";

import { useState } from "react";
import { NewsCard } from "@/components/news-card";
import { newsCategories } from "@/data/news";
import { mapNews } from "@/lib/api-mappers";
import type { ApiNews, ApiPage } from "@/lib/api-types";
import { useApiData } from "@/lib/use-api";
import styles from "./page.module.css";

export default function NewsPage() {
  const [category, setCategory] = useState<(typeof newsCategories)[number]>("Todos");
  const { data: response, loading, error } = useApiData<ApiPage<ApiNews>>("/news?pageSize=100", { data: [], meta: { page: 1, pageSize: 100, total: 0, totalPages: 0 } });
  const articles = response.data.map(mapNews);
  const visibleNews = category === "Todos" ? articles : articles.filter((article) => article.category === category);

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
        <label className={styles.mobileCategory}>
          <span>Filtrar por categoria</span>
          <select value={category} onChange={(event) => setCategory(event.target.value as (typeof newsCategories)[number])}>
            {newsCategories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        {loading ? <p className={styles.empty}>Carregando notícias...</p> : error ? <p className={styles.empty}>{error}</p> : visibleNews.length > 0 ? (
          <div className={styles.grid}>{visibleNews.map((article) => <NewsCard key={article.slug} article={article} />)}</div>
        ) : (
          <p className={styles.empty}>Ainda não há notícias nessa categoria.</p>
        )}
      </div>
    </main>
  );
}
