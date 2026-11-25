"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import type { EventDetail } from "@/data/event-details";
import { apiClient } from "@/lib/api";
import type { ApiEventAttendance, ApiItem } from "@/lib/api-types";
import { displayImageUrl } from "@/lib/display-image-url";
import styles from "./page.module.css";

export function EventAttendancePage({ event }: { event: EventDetail }) {
  const { status } = useAuth();
  const [favorite, setFavorite] = useState(false);
  const [attendance, setAttendance] = useState<ApiEventAttendance>({ count: 0, confirmedByMe: false, attendees: [] });
  const [loadedKey, setLoadedKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const requestKey = `${event.slug}:${status}`;
  const loading = status === "loading" || loadedKey !== requestKey;

  useEffect(() => {
    if (status === "loading") return;
    let active = true;
    void apiClient<ApiItem<ApiEventAttendance>>(`/events/${encodeURIComponent(event.slug)}/attendance`, { auth: status === "authenticated" })
      .then((response) => { if (active) { setAttendance(response.data); setMessage(""); } })
      .catch((reason: unknown) => { if (active) setMessage(reason instanceof Error ? reason.message : "Não foi possível carregar as presenças."); })
      .finally(() => { if (active) setLoadedKey(requestKey); });
    return () => { active = false; };
  }, [event.slug, requestKey, status]);

  async function toggleAttendance() {
    setSubmitting(true);
    setMessage("");
    try {
      const response = await apiClient<ApiItem<ApiEventAttendance>>(`/events/${encodeURIComponent(event.slug)}/attendance`, { method: attendance.confirmedByMe ? "DELETE" : "POST", auth: true });
      setAttendance(response.data);
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Não foi possível atualizar sua presença.");
    } finally {
      setSubmitting(false);
    }
  }

  const loginHref = `/login?redirect=${encodeURIComponent(`/agenda/${event.slug}`)}`;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.hero}>
          {event.heroImage
            ? <Image src={displayImageUrl(event.heroImage)} alt={`Imagem de ${event.title}`} width={1440} height={320} priority unoptimized />
            : <div className={styles.heroPlaceholder} role="img" aria-label={`Imagem de ${event.title} pendente`} />}
        </div>
        <p className={styles.demoNotice}>{status === "authenticated" ? "Confirmações vinculadas à sua conta Octacore" : "Entre na sua conta para confirmar presença neste evento"}</p>
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
              <div><span>Presença confirmada</span><strong>{attendance.count} pessoas confirmadas</strong></div>
            </div>

            <section className={styles.description} aria-labelledby="description-title">
              <h2 id="description-title">Descrição do compromisso</h2>
              <p>{event.description}</p>
            </section>

            <section className={styles.confirmation} aria-labelledby="confirmation-title">
              <div>
                <h2 id="confirmation-title">{attendance.confirmedByMe ? "Sua presença está confirmada" : "Vai participar?"}</h2>
                <p>{attendance.confirmedByMe ? "Sua confirmação está salva e continuará aqui quando você voltar." : "Confirme sua presença para ajudar a organização a se planejar."}</p>
                {message && <p className={styles.confirmationMessage} role="alert">{message}</p>}
              </div>
              {status === "authenticated"
                ? <button type="button" onClick={() => void toggleAttendance()} disabled={loading || submitting}>{submitting ? "Salvando…" : attendance.confirmedByMe ? "Desfazer confirmação" : "Confirmar presença"}</button>
                : <Link className={styles.confirmationAction} href={loginHref}>{status === "loading" ? "Verificando conta…" : "Entrar para confirmar"}</Link>}
            </section>
            <Link className={styles.backLink} href="/agenda">← Voltar à agenda</Link>
          </div>

          <aside className={styles.attendees} aria-labelledby="attendees-title">
            <h2 id="attendees-title">Confirmados ({attendance.count})</h2>
            <ul>
              {attendance.attendees.map((attendee) => <li key={attendee.id}>
                <span className={styles.avatar} aria-hidden="true">{attendee.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("")}</span>
                <span className={styles.person}><strong>{attendee.name}</strong><small>Presença confirmada</small></span>
                <span className={styles.check} aria-label="Presença confirmada">✓</span>
              </li>)}
              {attendance.attendees.length === 0 && <li className={styles.emptyAttendees}>{loading ? "Carregando confirmações…" : "Ninguém confirmou presença ainda."}</li>}
            </ul>
          </aside>
        </div>
      </div>
    </main>
  );
}
