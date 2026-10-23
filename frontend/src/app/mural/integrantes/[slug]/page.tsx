import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiServer } from "@/lib/server-api";
import { ApiError, type ApiItem, type ApiMember } from "@/lib/api-types";
import styles from "./page.module.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try { const { data } = await apiServer<ApiItem<ApiMember>>(`/members/${encodeURIComponent(slug)}`); return { title: `${data.nome} | Integrantes Octacore` }; }
  catch { return { title: "Integrante não encontrado | Octacore" }; }
}

export default async function MemberPage({ params }: Props) {
  const { slug } = await params;
  let data: ApiMember;
  try { data = (await apiServer<ApiItem<ApiMember>>(`/members/${encodeURIComponent(slug)}`)).data; }
  catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); throw error; }
  const member = { name: data.nome, role: data.funcao ?? "Integrante", course: data.curso ?? "Curso não informado", modality: data.modalidades.map((item) => item.modalidade.nome).join(", ") || "Sem modalidade" };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Caminho da página"><Link href="/mural">Mural</Link><span aria-hidden="true">/</span><Link href="/mural/integrantes">Integrantes</Link><span aria-hidden="true">/</span><span>{member.name}</span></nav>
        <article className={styles.profile}>
          <div className={styles.photo} role="img" aria-label={`Foto de ${member.name} pendente`} />
          <div className={styles.content}>
            <p className={styles.kicker}>Integrante Octacore</p>
            <h1>{member.name}</h1>
            <p className={styles.role}>{member.role}</p>
            <dl className={styles.details}>
              <div><dt>Curso</dt><dd>{member.course}</dd></div>
              <div><dt>Modalidade</dt><dd>{member.modality}</dd></div>
            </dl>
            <Link className={styles.backLink} href="/mural/integrantes">← Voltar aos integrantes</Link>
          </div>
        </article>
        <p className={styles.demoNotice}>Perfil cadastrado pela diretoria.</p>
      </div>
    </main>
  );
}
