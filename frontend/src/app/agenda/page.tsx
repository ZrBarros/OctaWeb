"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { eventCategories } from "@/data/events";
import { mapEvent } from "@/lib/api-mappers";
import { apiClient } from "@/lib/api";
import type { ApiEvent, ApiPage } from "@/lib/api-types";
import styles from "./page.module.css";

export default function AgendaPage() {
  const [category, setCategory] = useState<(typeof eventCategories)[number]>("Todos");
  const [month, setMonth] = useState(() => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1); });
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; async function load() { try { const first = await apiClient<ApiPage<ApiEvent>>("/events?pageSize=100&sort=asc"); const pages = await Promise.all(Array.from({ length: Math.max(0, first.meta.totalPages - 1) }, (_, index) => apiClient<ApiPage<ApiEvent>>(`/events?pageSize=100&sort=asc&page=${index + 2}`))); if (active) setEvents([first, ...pages].flatMap((page) => page.data)); } catch (reason) { if (active) setError(reason instanceof Error ? reason.message : "Não foi possível carregar a agenda."); } finally { if (active) setLoading(false); } } void load(); return () => { active = false; }; }, []);
  const agendaEvents = events.map(mapEvent);
  const filteredEvents = (category === "Todos"
    ? [...agendaEvents]
    : agendaEvents.filter((event) => event.category === category))
    .sort((first, second) => first.dateTime.localeCompare(second.dateTime));
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const visibleEvents = filteredEvents.filter((event) => new Date(event.dateTime) >= cutoff);
  const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(month);
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.kicker} aria-hidden="true" />
        <h1>Agenda do polvo</h1>
        <p className={styles.intro}>Fique por dentro de todos os treinos, jogos oficiais e reuniões de planejamento.</p>

        <div className={styles.filters} aria-label="Filtrar agenda por tipo de compromisso">
          {eventCategories.map((item) => (
            <button
              type="button"
              key={item}
              className={category === item ? styles.selected : ""}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >{item}</button>
          ))}
        </div>
        <label className={styles.mobileFilter}>
          <span>Filtrar por tipo</span>
          <select value={category} onChange={(event) => setCategory(event.target.value as (typeof eventCategories)[number])}>
            {eventCategories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <div className={styles.layout}>
          <section className={styles.eventList} aria-label="Compromissos da Octacore">
            {loading ? <p className={styles.empty}>Carregando agenda...</p> : error ? <p className={styles.empty}>{error}</p> : visibleEvents.length > 0 ? visibleEvents.map((event) => (
              <article className={`${styles.eventCard} hoverCard`} key={event.id}>
                <time className={styles.dateBox} dateTime={event.dateTime}>
                  <strong>{event.day}</strong><span>{event.month}</span>
                </time>
                <div className={styles.eventDetails}>
                  <h2>{event.title}</h2>
                  <p><time dateTime={event.dateTime}>◷ {event.time}</time><span>·</span><span>▣ {event.place}</span></p>
                  {event.detailSlug && <span className={styles.detailLink}>Ver detalhes e presença <span aria-hidden="true">→</span></span>}
                </div>
                <span className={styles.badge}>{event.category}</span>
                {event.detailSlug && <Link className={styles.cardLink} href={`/agenda/${event.detailSlug}`} aria-label={`Ver detalhes de ${event.title}`} />}
              </article>
            )) : (
              <p className={styles.empty}>Não há eventos recentes ou futuros nessa categoria. Consulte o calendário para ver os anteriores.</p>
            )}
          </section>

          <aside className={styles.info} aria-labelledby="info-title">
            <h2 id="info-title">Informações de seletiva</h2>
            <p>Compareça sempre aos treinos com uniforme confortável e munido de sua garrafa d&apos;água. Em caso de dúvidas, procure o coordenador técnico no Mural.</p>
          </aside>
        </div>
        <section className={styles.calendar} aria-labelledby="calendar-title">
          <div className={styles.calendarHeader}><div><h2 id="calendar-title">Calendário de eventos</h2><p>Consulte também os eventos anteriores.</p></div><div className={styles.calendarNavigation}><button type="button" aria-label="Mês anterior" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>‹</button><strong aria-live="polite">{monthLabel}</strong><button type="button" aria-label="Próximo mês" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>›</button></div></div>
          <div className={styles.calendarGrid}>{["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => <strong className={styles.weekday} key={day}>{day}</strong>)}{Array.from({ length: Math.ceil((firstDay + daysInMonth) / 7) * 7 }, (_, index) => { const day = index - firstDay + 1; const dayEvents = day > 0 && day <= daysInMonth ? filteredEvents.filter((event) => { const date = new Date(event.dateTime); const local = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Maceio", year: "numeric", month: "2-digit", day: "2-digit" }).format(date); return local === `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`; }) : []; return <div className={day > 0 && day <= daysInMonth ? styles.calendarDay : styles.outsideDay} key={index}>{day > 0 && day <= daysInMonth && <><span>{day}</span>{dayEvents.map((event) => <Link key={event.id} href={`/agenda/${event.detailSlug}`} title={event.title}>{event.time} · {event.title}</Link>)}</>}</div>; })}</div>
        </section>
      </div>
    </main>
  );
}
