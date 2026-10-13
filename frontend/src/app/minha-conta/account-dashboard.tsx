"use client";

import { useState } from "react";
import Link from "next/link";
import { demoProfile } from "@/data/account";
import styles from "./page.module.css";

type IconName = "person" | "lock" | "bag" | "box";

function ActionIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    person: <><circle cx="12" cy="8" r="3" /><path d="M6.5 19v-2a5.5 5.5 0 0 1 11 0v2" /></>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    bag: <><rect x="5" y="7" width="14" height="14" rx="2" /><path d="M9 9V6a3 3 0 0 1 6 0v3M9 14l2 2 4-4" /></>,
    box: <><path d="M4 7h16v4H4zM6 11v9h12v-9M10 14h4" /></>,
  };

  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const actions: { title: string; description: string; icon: IconName; href?: string; message?: string }[] = [
  { title: "Editar Perfil", description: "Mude seus dados e curso de atuação", icon: "person", message: "A edição do perfil estará disponível após a integração da conta." },
  { title: "Alterar Senha", description: "Atualize suas credenciais de segurança", icon: "lock", message: "A alteração de senha estará disponível após a integração da autenticação." },
  { title: "Visualizar Pedidos Ativos", description: "Verifique andamento de encomendas", icon: "bag", href: "/meus-pedidos" },
  { title: "Histórico de Compras", description: "Acessórios e armaduras que você já garantiu", icon: "box", href: "/meus-pedidos#historico" },
];

export function AccountDashboard() {
  const [message, setMessage] = useState("");

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <p className={styles.demoLabel}>Prévia demonstrativa · nenhuma conta conectada</p>
        <h1>Meu Painel Acadêmico</h1>
        <div className={styles.layout}>
          <section className={styles.profileCard} aria-labelledby="profile-name">
            <div className={styles.avatar} aria-hidden="true">{demoProfile.initials}</div>
            <h2 id="profile-name">{demoProfile.name}</h2>
            <p className={styles.role}>{demoProfile.role}</p>
            <dl className={styles.profileDetails}>
              <div><dt>Curso</dt><dd>{demoProfile.course}</dd></div>
              <div><dt>E-mail</dt><dd>{demoProfile.email}</dd></div>
              <div><dt>Membro desde</dt><dd>{demoProfile.memberSince}</dd></div>
            </dl>
            <button className={styles.logout} type="button" onClick={() => setMessage("Esta é uma prévia. Não há sessão iniciada para encerrar.")}>Sair da conta</button>
          </section>

          <section className={styles.actions} aria-labelledby="actions-heading">
            <h2 id="actions-heading">Gerenciar Conta</h2>
            <div className={styles.actionList}>
              {actions.map((action) => {
                const content = <><span className={styles.actionIcon}><ActionIcon name={action.icon} /></span><span className={styles.actionText}><strong>{action.title}</strong><small>{action.description}</small></span><span className={styles.arrow} aria-hidden="true">→</span></>;
                return action.href
                  ? <Link className={`${styles.actionCard} hoverCard`} href={action.href} key={action.title}>{content}</Link>
                  : <button className={`${styles.actionCard} hoverCard`} type="button" onClick={() => setMessage(action.message ?? "")} key={action.title}>{content}</button>;
              })}
            </div>
            {message && <p className={styles.feedback} role="status">{message}</p>}
          </section>
        </div>
      </div>
    </main>
  );
}
