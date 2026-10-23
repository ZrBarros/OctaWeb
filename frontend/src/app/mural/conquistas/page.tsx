import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { apiServer } from "@/lib/server-api";
import type { ApiAchievement, ApiItem } from "@/lib/api-types";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Conquistas e galeria | Octacore" };

export default async function AchievementsPage() {
  const achievements = (await apiServer<ApiItem<ApiAchievement[]>>("/achievements")).data.map((item) => ({ year: String(item.ano), result: item.colocacao, title: item.titulo, description: item.descricao ?? item.campeonato }));
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Caminho da página"><Link href="/mural">Mural</Link><span aria-hidden="true">/</span><span>Conquistas</span></nav>
        <section aria-labelledby="achievements-title">
          <div className={styles.kicker}><span>Glórias</span><i /></div>
          <h1 id="achievements-title">Conquistas recentes</h1>
          <p className={styles.intro}>O orgulho do polvo estampado em medalhas e troféus.</p>
          <div className={styles.achievementGrid}>
            {achievements.map((achievement) => (
              <article className={`${styles.achievement} hoverCard`} key={achievement.title}>
                <div className={styles.achievementMeta}><strong><span aria-hidden="true">🏆</span> {achievement.year}</strong><span>{achievement.result}</span></div>
                <h2>{achievement.title}</h2>
                <p>{achievement.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="galeria" aria-labelledby="gallery-title" className={styles.gallerySection}>
          <div className={styles.kicker}><span>Galeria</span><i /></div>
          <h2 id="gallery-title">Mosaico de fotos</h2>
          <p className={styles.intro}>Registros reais de nossas festas, jogos, treinos e momentos que nos dão orgulho.</p>
          <div className={styles.gallery}>
            <Image src="/images/imagem-galeria.png" alt="Integrantes reunidos em um evento esportivo da Octacore" width={500} height={300} />
            {Array.from({ length: 4 }, (_, index) => (
              <div className={styles.placeholder} role="img" aria-label={`Foto ${index + 2} da galeria pendente`} key={index} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
