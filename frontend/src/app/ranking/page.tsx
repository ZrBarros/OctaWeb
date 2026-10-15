import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { leagueRanking, modalityPerformance, seasonSummary } from "@/data/ranking";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Ranking e Estatísticas | Octacore" };

export default function RankingPage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.eyebrow}><span>ARENA STATS</span><i aria-hidden="true" /></div>
        <h1>Ranking e Estatísticas Esportivas</h1>
        <p className={styles.intro}>Veja o desempenho e a jornada das nossas equipes nos campeonatos universitários deste ano.</p>
        <p className={styles.demoNotice}>Dados demonstrativos do protótipo</p>

        <section className={styles.summary} aria-label="Resumo da temporada">
          {seasonSummary.map((item) => (
            <article className={styles.summaryCard} key={item.label}>
              <strong className={styles[item.tone]}>{item.value}</strong>
              <h2>{item.label}</h2>
            </article>
          ))}
        </section>

        <div className={styles.panels}>
          <section className={styles.rankingPanel} aria-labelledby="ranking-title">
            <div className={styles.panelHeading}><h2 id="ranking-title">Campeonato Universitário - Geral</h2><span>SÉRIE A</span></div>
            <ol className={styles.rankingList}>
              {leagueRanking.map((team) => (
                <li className={team.isOctacore ? styles.currentTeam : ""} key={team.position}>
                  <span className={styles.position}>{team.position}º</span>
                  <span className={styles.teamMark} aria-hidden="true">{team.isOctacore ? <Image src="/images/logo-octacore.png" alt="" width={33} height={33} /> : "●"}</span>
                  <strong>{team.name}</strong>
                  <span className={styles.points}>{team.points} pts</span>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.performancePanel} aria-labelledby="performance-title">
            <h2 id="performance-title">Aproveitamento por Quadra</h2>
            <ul>
              {modalityPerformance.map((modality) => (
                <li key={modality.name}>
                  <div className={styles.performanceLabel}><span>{modality.name}</span><span>{modality.percentage}%</span></div>
                  <div className={styles.track} role="meter" aria-label={`Aproveitamento em ${modality.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={modality.percentage}>
                    <span className={styles[modality.tone]} style={{ width: `${modality.percentage}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <Link href="/modalidades" className={styles.backLink}>← Ver modalidades</Link>
      </div>
    </main>
  );
}
