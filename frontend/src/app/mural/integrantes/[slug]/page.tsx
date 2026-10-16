import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { muralMembers } from "@/data/mural";
import styles from "./page.module.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return muralMembers.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const member = muralMembers.find((item) => item.slug === slug);
  return { title: member ? `${member.name} | Integrantes Octacore` : "Integrante não encontrado | Octacore" };
}

export default async function MemberPage({ params }: Props) {
  const { slug } = await params;
  const member = muralMembers.find((item) => item.slug === slug);
  if (!member) notFound();

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
        <p className={styles.demoNotice}>Perfil demonstrativo · dados e foto aguardam confirmação da diretoria.</p>
      </div>
    </main>
  );
}
