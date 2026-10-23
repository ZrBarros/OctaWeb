import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiServer } from "@/lib/server-api";
import { ApiError, type ApiItem, type ApiModality } from "@/lib/api-types";
import styles from "./page.module.css";

type Props = { params: Promise<{ slug: string }> };

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
            <p className={styles.intro}>{modality.description}</p>
          </div>
          <div className={styles.heroPlaceholder} role="img" aria-label={`Imagem de ${modality.name} pendente`} />
        </div>

        {(
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
              {(data.resultados?.length || data.eventos?.length) ? (
                <div className={styles.matches}>
                  <section className="hoverCard" aria-labelledby="result-title">
                    <h2 id="result-title">Último resultado</h2>
                    <strong>{data.resultados?.[0] ? `Octa ${data.resultados[0].placarOcta} × ${data.resultados[0].placarAdversario} ${data.resultados[0].adversario}` : "Nenhum resultado"}</strong>
                    <p>{data.resultados?.[0]?.campeonato ?? ""}</p>
                  </section>
                  <section className="hoverCard" aria-labelledby="next-title">
                    <h2 id="next-title">Próximo desafio</h2>
                    <strong>{data.eventos?.[0]?.titulo ?? "Nenhum evento futuro"}</strong>
                    <p>{data.eventos?.[0] ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" }).format(new Date(data.eventos[0].dataHora)) : ""}</p>
                  </section>
                </div>
              ) : null}
            </div>
            <aside className={`${styles.roster} hoverCard`} aria-labelledby="roster-title">
              <h2 id="roster-title">Elenco {modality.name}</h2>
              <ul>{details.roster.map((member) => <li key={member}>{member}</li>)}</ul>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
