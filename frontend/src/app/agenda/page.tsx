"use client";

import { useState } from "react";
import { agendaEvents, eventCategories } from "@/data/events";
import styles from "./page.module.css";

export default function AgendaPage() {
  const [category, setCategory] = useState<(typeof eventCategories)[number]>("Todos");
  const visibleEvents = category === "Todos"
    ? agendaEvents
    : agendaEvents.filter((event) => event.category === category);

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

        <div className={styles.layout}>
          <section className={styles.eventList} aria-label="Compromissos da Octacore">
            {visibleEvents.length > 0 ? visibleEvents.map((event) => (
              <article className={`${styles.eventCard} hoverCard`} key={event.id}>
                <time className={styles.dateBox} dateTime={event.dateTime}>
                  <strong>{event.day}</strong><span>{event.month}</span>
                </time>
                <div className={styles.eventDetails}>
                  <h2>{event.title}</h2>
                  <p><time dateTime={event.dateTime}>◷ {event.time}</time><span>·</span><span>▣ {event.place}</span></p>
                </div>
                <span className={styles.badge}>{event.category}</span>
              </article>
            )) : (
              <p className={styles.empty}>Ainda não há compromissos nessa categoria.</p>
            )}
          </section>

          <aside className={styles.info} aria-labelledby="info-title">
            <h2 id="info-title">Informações de seletiva</h2>
            <p>Compareça sempre aos treinos com uniforme confortável e munido de sua garrafa d&apos;água. Em caso de dúvidas, procure o coordenador técnico no Mural.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
