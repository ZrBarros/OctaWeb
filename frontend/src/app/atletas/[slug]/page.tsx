import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { athleteProfiles } from "@/data/athletes";
import styles from "./page.module.css";

type Props = { params: Promise<{ slug: string }> };
const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
function formatDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  return `${day} ${months[Number(month) - 1]} ${year}`;
}

export function generateStaticParams() {
  return athleteProfiles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const athlete = athleteProfiles.find((profile) => profile.slug === slug);
  return { title: athlete ? `${athlete.name} | Atletas Octacore` : "Atleta não encontrado | Octacore" };
}

export default async function AthleteProfilePage({ params }: Props) {
  const { slug } = await params;
  const athlete = athleteProfiles.find((profile) => profile.slug === slug);
  if (!athlete) notFound();

  return <main className={styles.main}>
    <div className={styles.container}>
      <p className={styles.demoNotice}>Perfil demonstrativo · dados esportivos de exemplo</p>
      <section className={styles.profileHero} aria-labelledby="athlete-name">
        <div className={styles.portrait} role="img" aria-label={`Foto de ${athlete.name} pendente`}><span>{athlete.initials}</span></div>
        <div className={styles.profileIntro}>
          <div className={styles.identifiers}><span>{athlete.modality}</span><strong>Nº {athlete.shirtNumber}</strong></div>
          <h1 id="athlete-name">{athlete.name}</h1>
          <p>{athlete.biography}</p>
        </div>
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.statistics} aria-labelledby="statistics-title">
          <h2 id="statistics-title">Estatísticas Individuais</h2>
          <dl>{athlete.statistics.map((statistic) => <div key={statistic.label}><dt>{statistic.label}</dt><dd>{statistic.value}</dd></div>)}</dl>
        </section>
        <section className={styles.results} aria-labelledby="results-title">
          <h2 id="results-title">Histórico de Resultados Recentes</h2>
          <ul>{athlete.recentResults.map((result) => <li key={`${result.date}-${result.opponent}`}>
            <div className={styles.matchText}><strong>Octacore vs {result.opponent}</strong><span>{result.contribution}</span></div>
            <time dateTime={result.date}>{formatDate(result.date)}</time>
            <span className={`${styles.score} ${result.outcome === "Vitória" ? styles.win : result.outcome === "Empate" ? styles.draw : styles.loss}`} aria-label={`${result.outcome}, ${result.score}`}>{result.score}</span>
          </li>)}</ul>
        </section>
      </div>
      <Link className={styles.backLink} href="/modalidades/futsal">← Voltar ao Futsal</Link>
    </div>
  </main>;
}
