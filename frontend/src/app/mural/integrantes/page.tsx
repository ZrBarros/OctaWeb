"use client";

import Link from "next/link";
import { InstagramIcon } from "@/components/instagram-icon";
import { memberFilters } from "@/data/mural";
import type { ApiMember, ApiPage } from "@/lib/api-types";
import { useApiData } from "@/lib/use-api";
import { useState } from "react";
import styles from "./page.module.css";

export default function MembersPage() {
  const [filter, setFilter] = useState<(typeof memberFilters)[number]>("Todos");
  const { data: response, loading, error } = useApiData<ApiPage<ApiMember>>("/members?pageSize=100", { data: [], meta: { page: 1, pageSize: 100, total: 0, totalPages: 0 } });
  const muralMembers = response.data.map((member) => ({ slug: member.slug, name: member.nome, role: member.funcao ?? "Integrante", course: member.curso ?? "Curso não informado", modality: member.modalidades[0]?.modalidade.nome ?? "Sem modalidade", groups: [...(member.diretoria ? ["Diretoria"] : []), ...member.modalidades.map((item) => item.modalidade.nome)] }));
  const visibleMembers = filter === "Todos" ? muralMembers : muralMembers.filter((member) => member.groups.includes(filter));

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Caminho da página"><Link href="/mural">Mural</Link><span aria-hidden="true">/</span><span>Integrantes</span></nav>
        <div className={styles.kicker}><span>Diretoria</span><i /></div>
        <h1>Nossos integrantes</h1>
        <p className={styles.intro}>O ecossistema que faz a Octa campeã.</p>

        <div className={styles.filters} aria-label="Filtrar integrantes">
          {memberFilters.map((item) => (
            <button
              type="button"
              key={item}
              className={filter === item ? styles.selected : ""}
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
            >{item}</button>
          ))}
        </div>
        <label className={styles.mobileFilter}>
          <span>Filtrar integrantes</span>
          <select value={filter} onChange={(event) => setFilter(event.target.value as (typeof memberFilters)[number])}>
            {memberFilters.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        {loading ? <p className={styles.empty}>Carregando integrantes...</p> : error ? <p className={styles.empty}>{error}</p> : visibleMembers.length > 0 ? (
          <div className={styles.grid}>
            {visibleMembers.map((member) => (
              <Link className={`${styles.card} hoverCard`} key={member.slug} href={`/mural/integrantes/${member.slug}`} aria-label={`Ver perfil de ${member.name}`}>
                <div className={styles.photo} role="img" aria-label={`Foto de ${member.name} pendente`} />
                <div className={styles.cardContent}>
                  <h2>{member.name}</h2>
                  <p className={styles.role}>{member.role}</p>
                  <p>{member.course}</p>
                  <p>Modalidade: {member.modality}</p>
                  <span className={styles.instagram}>
                    <InstagramIcon />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>Ainda não há integrantes cadastrados nessa modalidade.</p>
        )}
      </div>
    </main>
  );
}
