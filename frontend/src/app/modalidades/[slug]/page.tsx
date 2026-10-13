import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { basqueteDetails, futsalDetails, modalities } from "@/data/modalities";
import styles from "./page.module.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return modalities.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const modality = modalities.find((item) => item.slug === slug);
  return { title: modality ? `${modality.name} | Modalidades Octacore` : "Modalidade não encontrada | Octacore" };
}

export default async function ModalityDetailPage({ params }: Props) {
  const { slug } = await params;
  const modality = modalities.find((item) => item.slug === slug);
  if (!modality) notFound();
  const details = slug === "futsal" ? futsalDetails : slug === "basquete" ? basqueteDetails : null;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Caminho da página">
          <Link href="/modalidades">Modalidades</Link><span aria-hidden="true">/</span><span>{modality.name}</span>
        </nav>
        <div className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Modalidade oficial</p>
            <h1>{modality.name} Octacore</h1>
            <p className={styles.intro}>{modality.introduction ?? modality.description}</p>
          </div>
          <div className={styles.heroPlaceholder} role="img" aria-label={`Imagem de ${modality.name} pendente`} />
        </div>

        {details ? (
          <div className={styles.contentGrid}>
            <div className={styles.leftColumn}>
              <section className={`${styles.information} hoverCard`} aria-labelledby="information-title">
                <h2 id="information-title">Informações gerais</h2>
                <div className={styles.facts}>
                  <div><h3>Horário dos treinos</h3><p>{details.trainingTime}</p></div>
                  <div><h3>Capitão</h3><p>{details.coach}</p></div>
                  <div><h3>Local dos treinos</h3><p>{details.trainingPlace}</p></div>
                </div>
              </section>
              {slug === "futsal" && (
                <div className={styles.matches}>
                  <section className="hoverCard" aria-labelledby="result-title">
                    <h2 id="result-title">Último resultado</h2>
                    <strong>{futsalDetails.lastResult}</strong>
                    <p>{futsalDetails.lastResultContext}</p>
                  </section>
                  <section className="hoverCard" aria-labelledby="next-title">
                    <h2 id="next-title">Próximo desafio</h2>
                    <strong>{futsalDetails.nextMatch}</strong>
                    <p>{futsalDetails.nextMatchDate}</p>
                  </section>
                </div>
              )}
            </div>
            <aside className={`${styles.roster} hoverCard`} aria-labelledby="roster-title">
              <h2 id="roster-title">Elenco {modality.name}</h2>
              <ul>{details.roster.map((member) => <li key={member}>{member}</li>)}</ul>
            </aside>
          </div>
        ) : (
          <section className={`${styles.pending} hoverCard`} aria-labelledby="pending-title">
            <h2 id="pending-title">Informações da modalidade</h2>
            <p>Horários, elenco e resultados serão adicionados quando a atlética confirmar esses dados.</p>
          </section>
        )}
      </div>
    </main>
  );
}
