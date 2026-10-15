import type { Metadata } from "next";
import Link from "next/link";
import { modalities } from "@/data/modalities";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Modalidades | Octacore" };

export default function ModalitiesPage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.kicker} aria-hidden="true" />
        <h1>Nossas modalidades</h1>
        <p className={styles.intro}>Seja na quadra, no campo ou na tela, a Octa tem um time para você.</p>
        <Link href="/ranking" className={styles.rankingLink}>Ver ranking e estatísticas <span aria-hidden="true">→</span></Link>

        <div className={styles.grid}>
          {modalities.map((modality) => (
            <article className={`${styles.card} hoverCard`} key={modality.slug}>
              <div className={styles.cardHeading}>
                <h2>{modality.name}</h2>
                <span>{modality.code}</span>
              </div>
              <div className={styles.placeholder} role="img" aria-label={`Imagem de ${modality.name} pendente`} />
              <p>{modality.description}</p>
              <Link href={`/modalidades/${modality.slug}`} className={styles.details}>Ver detalhes</Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
