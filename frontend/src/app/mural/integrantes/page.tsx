"use client";

import Link from "next/link";
import { InstagramIcon } from "@/components/instagram-icon";
import { memberFilters, muralMembers } from "@/data/mural";
import { useState } from "react";
import styles from "./page.module.css";

export default function MembersPage() {
  const [filter, setFilter] = useState<(typeof memberFilters)[number]>("Todos");
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

        {visibleMembers.length > 0 ? (
          <div className={styles.grid}>
            {visibleMembers.map((member) => (
              <article className={`${styles.card} hoverCard`} key={member.name}>
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
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>Ainda não há integrantes cadastrados nessa modalidade.</p>
        )}
      </div>
    </main>
  );
}
