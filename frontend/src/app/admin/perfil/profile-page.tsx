"use client";

import { useState } from "react";
import Link from "next/link";
import { adminProfile } from "@/data/admin-profile";
import { AdminPageHeading } from "../admin-shell";
import shared from "../admin.module.css";
import styles from "./page.module.css";

const adminSections = [
  ["Notícias", "/admin/noticias"],
  ["Produtos", "/admin/produtos"],
  ["Eventos", "/admin/eventos"],
  ["Integrantes", "/admin/integrantes"],
  ["Resultados", "/admin/resultados"],
  ["Pedidos", "/admin/pedidos"],
] as const;

export function AdminProfilePage() {
  const [message, setMessage] = useState("");

  return <div className={shared.content}>
    <AdminPageHeading title="Meu Perfil" role={adminProfile.accessLevel} />
    <p className={shared.demoNotice}>Prévia demonstrativa · nenhuma conta administrativa conectada</p>

    <div className={styles.profileLayout}>
      <section className={styles.identityCard} aria-labelledby="profile-name">
        <div className={styles.avatar} aria-hidden="true">{adminProfile.initials}</div>
        <h2 id="profile-name">{adminProfile.name}</h2>
        <p className={styles.role}>{adminProfile.role}</p>
        <span className={styles.accessBadge}>{adminProfile.accessLevel}</span>
        <dl className={styles.profileDetails}>
          <div><dt>Conta</dt><dd>Perfil de demonstração</dd></div>
          <div><dt>Autenticação</dt><dd>Não conectada</dd></div>
          <div><dt>Permissões</dt><dd>Interface administrativa de exemplo</dd></div>
        </dl>
        <div className={styles.profileActions}>
          <button type="button" onClick={() => setMessage("A edição do perfil ficará disponível quando a conta administrativa estiver integrada.")}>Editar perfil</button>
          <button type="button" onClick={() => setMessage("A alteração de senha depende da integração de autenticação.")}>Alterar senha</button>
        </div>
        {message && <p className={styles.feedback} role="status">{message}</p>}
      </section>

      <section className={styles.accessCard} aria-labelledby="access-title">
        <h2 id="access-title">Áreas do painel</h2>
        <p>Atalhos para as áreas administrativas disponíveis nesta prévia.</p>
        <nav className={styles.accessLinks} aria-label="Áreas administrativas">
          {adminSections.map(([label, href]) => <Link href={href} key={href}>{label}<span aria-hidden="true">→</span></Link>)}
        </nav>
        <p className={styles.notice}>O painel ainda não verifica permissões. Os dados e as alterações dessas áreas são demonstrativos e ficam no navegador.</p>
      </section>
    </div>
  </div>;
}
