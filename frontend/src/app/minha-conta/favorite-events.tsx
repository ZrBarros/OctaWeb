"use client";

import Link from "next/link";
import type { ApiEvent, ApiItem } from "@/lib/api-types";
import { useApiData } from "@/lib/use-api";
import styles from "./page.module.css";

export function FavoriteEvents() {
  const { data, loading, error } = useApiData<ApiItem<ApiEvent[]>>("/events/favorites", { data: [] }, true);

  return <section className={styles.favorites} aria-labelledby="favorite-events-title">
    <div className={styles.favoritesHeading}>
      <h2 id="favorite-events-title">Eventos favoritos</h2>
      <Link href="/agenda">Ver agenda</Link>
    </div>
    {loading ? <p>Carregando favoritos…</p> : error ? <p role="alert">{error}</p> : data.data.length === 0
      ? <p>Você ainda não favoritou nenhum evento. Abra um evento na agenda para salvá-lo aqui.</p>
      : <ul>{data.data.map((item) => <li key={item.id}><Link href={`/agenda/${item.slug}`}><strong>{item.titulo}</strong><span>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeZone: "America/Maceio" }).format(new Date(item.dataHora))}</span></Link></li>)}</ul>}
  </section>;
}
