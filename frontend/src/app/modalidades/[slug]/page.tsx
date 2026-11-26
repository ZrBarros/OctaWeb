import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiServer } from "@/lib/server-api";
import { ApiError, type ApiItem, type ApiModality } from "@/lib/api-types";
import { displayImageUrl } from "@/lib/display-image-url";
import styles from "./page.module.css";

type Props = { params: Promise<{ slug: string }> };

function nextUpcomingEvent(events: ApiModality["eventos"]) {
  const now = Date.now();
  return events?.filter((event) => new Date(event.dataHora).getTime() >= now).sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())[0];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try { const { data } = await apiServer<ApiItem<ApiModality>>(`/modalities/${encodeURIComponent(slug)}`); return { title: `${data.nome} | Modalidades Octacore` }; }
  catch { return { title: "Modalidade não encontrada | Octacore" }; }
}

export default async function ModalityDetailPage({ params }: Props) {
  const { slug } = await params;
  let data: ApiModality;
  try { data = (await apiServer<ApiItem<ApiModality>>(`/modalities/${encodeURIComponent(slug)}`)).data; }
  catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); throw error; }
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const modality = { name: data.nome, description: data.descricao ?? "" };
  const details = { trainingTime: data.horarios.map((item) => `${days[item.diaSemana]} ${new Date(item.horaInicio).toISOString().slice(11, 16)}`).join(" · ") || "A confirmar", coach: data.responsavel ?? "A confirmar", trainingPlace: data.localTreino ?? "A confirmar", roster: data.integrantes?.map((item) => item.integrante.nome) ?? [] };
  const nextEvent = nextUpcomingEvent(data.eventos);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Caminho da página">
          <Link href="/modalidades">Modalidades</Link><span aria-hidden="true">/</span><span>{modality.name}</span>
        </nav>
        <div className={`${styles.hero} ${data.imagemUrl ? styles.heroWithImage : ""}`}>
          <div>
            <p className={styles.eyebrow}>Modalidade oficial</p>
            <h1>{modality.name} Octacore</h1>
            <p className={styles.intro}>{modality.description || "Conheça a equipe, os treinos e os próximos desafios desta modalidade."}</p>
          </div>
          {data.imagemUrl && <Image className={styles.heroImage} src={displayImageUrl(data.imagemUrl)} alt={`Modalidade ${modality.name}`} width={900} height={560} unoptimized priority />}
        </div>

        {(
          <div className={styles.contentGrid}>
            <div className={styles.leftColumn}>
              <section className={styles.information} aria-labelledby="information-title">
                <h2 id="information-title">Informações gerais</h2>
                <div className={styles.facts}>
                  <div><h3>Horário dos treinos</h3><p>{details.trainingTime}</p></div>
                  <div><h3>Responsável</h3><p>{details.coach}</p></div>
                  <div><h3>Local dos treinos</h3><p>{details.trainingPlace}</p></div>
                </div>
              </section>
              {(data.resultados?.length || data.eventos?.length) ? (
                <div className={styles.matches}>
                  <section aria-labelledby="result-title">
                    <h2 id="result-title">Último resultado</h2>
                    <strong>{data.resultados?.[0] ? `Octa ${data.resultados[0].placarOcta} × ${data.resultados[0].placarAdversario} ${data.resultados[0].adversario}` : "Nenhum resultado"}</strong>
                    <p>{data.resultados?.[0]?.campeonato ?? ""}</p>
                  </section>
                  <section aria-labelledby="next-title">
                    <h2 id="next-title">Próximo desafio</h2>
                    <strong>{nextEvent?.titulo ?? "Nenhum evento futuro"}</strong>
                    <p>{nextEvent ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short", timeZone: "America/Maceio" }).format(new Date(nextEvent.dataHora)) : ""}</p>
                  </section>
                </div>
              ) : null}
            </div>
            <aside className={styles.roster} aria-labelledby="roster-title">
              <h2 id="roster-title">Elenco {modality.name}</h2>
              {details.roster.length > 0 ? <ul>{details.roster.map((member) => <li key={member}>{member}</li>)}</ul> : <p className={styles.rosterEmpty}>O elenco ainda não foi cadastrado.</p>}
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
