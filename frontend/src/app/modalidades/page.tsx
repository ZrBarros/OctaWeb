import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { apiServer } from "@/lib/server-api";
import type { ApiItem, ApiModality } from "@/lib/api-types";
import { displayImageUrl } from "@/lib/display-image-url";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Modalidades | Octacore" };

export default async function ModalitiesPage() {
  const modalities = (await apiServer<ApiItem<ApiModality[]>>("/modalities")).data;
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
                <h2>{modality.nome}</h2>
                <span>M{String(modality.id).padStart(2, "0")}</span>
              </div>
              {modality.imagemUrl ? (
                <Image className={styles.image} src={displayImageUrl(modality.imagemUrl)} alt="" width={720} height={380} unoptimized />
              ) : null}
              <p>{modality.descricao}</p>
              <Link href={`/modalidades/${modality.slug}`} className={styles.details}>Ver detalhes</Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
