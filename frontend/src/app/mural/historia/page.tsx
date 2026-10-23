import type { Metadata } from "next";
import Link from "next/link";
import { apiServer } from "@/lib/server-api";
import type { ApiItem, ApiMilestone } from "@/lib/api-types";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Nossa história | Octacore" };

export default async function HistoryPage() {
  const historyMilestones = (await apiServer<ApiItem<ApiMilestone[]>>("/history")).data.map((item) => ({ year: String(item.ano), label: "Marco histórico", title: item.titulo, description: item.descricao ?? "" }));
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Caminho da página"><Link href="/mural">Mural</Link><span aria-hidden="true">/</span><span>História</span></nav>
        <div className={styles.kicker}><span>História</span><i /></div>
        <h1>Nossa trajetória</h1>
        <p className={styles.intro}>A evolução do polvo nas quadras acadêmicas de Maceió.</p>

        <ol className={styles.timeline}>
          {historyMilestones.map((milestone) => (
            <li className={styles.milestone} key={milestone.year}>
              <div className={styles.year}><strong>{milestone.year}</strong><span>{milestone.label}</span></div>
              <span className={styles.dot} aria-hidden="true" />
              <div className={`${styles.event} hoverCard`}><h2>{milestone.title}</h2><p>{milestone.description}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
