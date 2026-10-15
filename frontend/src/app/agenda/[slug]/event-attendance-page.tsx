"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { EventDetail } from "@/data/event-details";
import styles from "./page.module.css";

export function EventAttendancePage({ event }: { event: EventDetail }) {
  const [favorite, setFavorite] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [showAttendees, setShowAttendees] = useState(false);
  const count = event.confirmedCount + Number(confirmed);

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        {event.heroImage
          ? <Image src={event.heroImage} alt={`Imagem de ${event.title}`} width={1440} height={320} priority />
          : <div className={styles.heroPlaceholder} role="img" aria-label={`Imagem de ${event.title} pendente`} />}
      </div>

      <div className={styles.container}>
        <p className={styles.demoNotice}>Prévia demonstrativa · presença não é registrada</p>
        <div className={styles.layout}>
          <div className={styles.eventContent}>
            <div className={styles.titleRow}>
              <div>
                <div className={styles.tags}><span>{event.category}</span><span>{event.modality}</span></div>
                <h1>{event.title}</h1>
              </div>
              <button type="button" className={`${styles.favorite} ${favorite ? styles.isFavorite : ""}`} aria-pressed={favorite} onClick={() => setFavorite(!favorite)}>
                <span aria-hidden="true">{favorite ? "★" : "☆"}</span> {favorite ? "Favoritado" : "Favoritar Evento"}
              </button>
            </div>

            <div className={styles.facts} aria-label="Informações do compromisso">
              <div><span>Data e hora</span><strong><time dateTime={event.dateTime}>{event.displayDate}</time></strong></div>
              <div><span>Local</span><strong>{event.place}</strong></div>
              <div><span>Presença confirmada</span><strong>{count} atletas confirmados</strong></div>
            </div>

            <section className={styles.description} aria-labelledby="description-title">
              <h2 id="description-title">Descrição do compromisso</h2>
              <p>{event.description}</p>
            </section>

            <section className={styles.confirmation} aria-labelledby="confirmation-title">
              <div>
                <h2 id="confirmation-title">{confirmed ? "Presença marcada nesta prévia" : "Sua presença está confirmada?"}</h2>
                <p>{confirmed ? "Esta confirmação é apenas visual e será perdida ao recarregar a página." : "Confirme sua presença para ajudar a organização a se planejar."}</p>
              </div>
              <button type="button" onClick={() => setConfirmed(!confirmed)}>{confirmed ? "Desfazer confirmação" : "Confirmar presença"}</button>
            </section>
            <Link className={styles.backLink} href="/agenda">← Voltar à agenda</Link>
          </div>

          <aside className={styles.attendees} aria-labelledby="attendees-title">
            <h2 id="attendees-title">Confirmados ({count})</h2>
            <ul>
              {event.confirmedAthletes.map((athlete) => <li key={athlete.name}>
                <span className={styles.avatar} aria-hidden="true">{athlete.initials}</span>
                <span className={styles.person}><strong>{athlete.name}</strong><small>{athlete.position}</small></span>
                <span className={styles.check} aria-label="Presença confirmada">✓</span>
              </li>)}
              {confirmed && <li><span className={styles.avatar} aria-hidden="true">VC</span><span className={styles.person}><strong>Você (prévia)</strong><small>Confirmação visual</small></span><span className={styles.check} aria-label="Presença simulada">✓</span></li>}
              {event.confirmedAthletes.length === 0 && !confirmed && <li className={styles.emptyAttendees}>Nenhuma confirmação nesta prévia.</li>}
            </ul>
            {event.confirmedAthletes.length > 0 && <button type="button" className={styles.allAttendees} aria-expanded={showAttendees} onClick={() => setShowAttendees(!showAttendees)}>{showAttendees ? "Ocultar informação" : "Ver todos os confirmados"}</button>}
            {showAttendees && <p className={styles.attendeeNote}>O protótipo informa {event.confirmedCount} presenças, mas apresenta apenas estes cinco nomes. A lista completa dependerá dos dados reais do backend.</p>}
          </aside>
        </div>
      </div>
    </main>
  );
}
