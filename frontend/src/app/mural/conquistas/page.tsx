import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { displayImageUrl } from "@/lib/display-image-url";
import { apiServer } from "@/lib/server-api";
import type { ApiAchievement, ApiGalleryPhoto, ApiItem } from "@/lib/api-types";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Conquistas e galeria | Octacore" };

export default async function AchievementsPage() {
  const achievements = (await apiServer<ApiItem<ApiAchievement[]>>("/achievements")).data.map((item) => ({ year: String(item.ano), result: item.colocacao, title: item.titulo, description: item.descricao ?? item.campeonato }));
  const photos = (await apiServer<ApiItem<ApiGalleryPhoto[]>>("/gallery")).data;
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Caminho da página"><Link href="/mural">Mural</Link><span aria-hidden="true">/</span><span>Conquistas</span></nav>
        <section aria-labelledby="achievements-title">
          <div className={styles.kicker}><span>Glórias</span><i /></div>
          <h1 id="achievements-title">Conquistas recentes</h1>
          <p className={styles.intro}>O orgulho do polvo estampado em medalhas e troféus.</p>
          <div className={styles.achievementGrid}>
            {achievements.map((achievement, index) => (
              <article className={`${styles.achievement} hoverCard`} key={`${achievement.year}-${achievement.title}-${index}`}>
                <div className={styles.achievementMeta}><strong><span aria-hidden="true">🏆</span> {achievement.year}</strong><span>{achievement.result}</span></div>
                <h2>{achievement.title}</h2>
                <p>{achievement.description}</p>
              </article>
            ))}
          </div>
          {achievements.length === 0 && <p className={styles.empty}>Ainda não há conquistas cadastradas.</p>}
        </section>

        <section id="galeria" aria-labelledby="gallery-title" className={styles.gallerySection}>
          <div className={styles.kicker}><span>Galeria</span><i /></div>
          <h2 id="gallery-title">Mosaico de fotos</h2>
          <p className={styles.intro}>Registros reais de nossas festas, jogos, treinos e momentos que nos dão orgulho.</p>
          {photos.length > 0 ? <div className={styles.gallery}>
            {photos.map((photo) => <figure className={styles.photo} key={photo.id}><Image src={displayImageUrl(photo.imageUrl)} alt={photo.description} width={500} height={300} unoptimized />{photo.caption && <figcaption>{photo.caption}</figcaption>}</figure>)}
          </div> : <p className={styles.empty}>Ainda não há fotos cadastradas na galeria.</p>}
        </section>
      </div>
    </main>
  );
}
