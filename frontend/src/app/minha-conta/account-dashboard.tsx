"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AccountSettings, type AccountSettingsMode } from "@/components/account-settings";
import { useAuth } from "@/components/auth-provider";
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

const actions: { title: string; description: string; icon: IconName; href?: string; editor?: AccountSettingsMode }[] = [
  { title: "Editar Perfil", description: "Mude seus dados e curso de atuação", icon: "person", editor: "profile" },
  { title: "Alterar Senha", description: "Atualize suas credenciais de segurança", icon: "lock", editor: "password" },
  { title: "Visualizar Pedidos Ativos", description: "Verifique andamento de encomendas", icon: "bag", href: "/meus-pedidos" },
  { title: "Histórico de Compras", description: "Acessórios e armaduras que você já garantiu", icon: "box", href: "/meus-pedidos#historico" },
];

export function AccountDashboard() {
  const [message, setMessage] = useState("");
  const [editor, setEditor] = useState<AccountSettingsMode | null>(null);
  const router = useRouter();
  const { user: profile, status, logout } = useAuth();

  async function signOut() {
    await logout(); router.push("/login"); router.refresh();
  }

  if (status === "loading") return <main className={styles.main}><div className={styles.container}><p>Carregando conta...</p></div></main>;
  if (!profile) return <main className={styles.main}><div className={styles.container}><h1>Minha conta</h1><p className={styles.feedback}>Faça login para acessar sua conta.</p><Link href="/login">Entrar</Link></div></main>;
  const initials = profile.nome.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase("pt-BR");

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <p className={styles.demoLabel}>Conta conectada</p>
        <h1>Meu Painel Acadêmico</h1>
        <div className={styles.layout}>
          <section className={styles.profileCard} aria-labelledby="profile-name">
            <div className={styles.avatar} aria-hidden="true">{initials}</div>
            <h2 id="profile-name">{profile.nome}</h2>
            <p className={styles.role}>{profile.perfil === "ADMIN" ? "Administrador" : "Membro Octacore"}</p>
            <dl className={styles.profileDetails}>
              <div><dt>Curso</dt><dd>{profile.curso}</dd></div>
              <div><dt>E-mail</dt><dd>{profile.email}</dd></div>
              <div><dt>Membro desde</dt><dd>{new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(profile.criadoEm))}</dd></div>
            </dl>
            <button className={styles.logout} type="button" onClick={() => void signOut()}>Sair da conta</button>
          </section>

          <section className={styles.actions} aria-labelledby="actions-heading">
            <h2 id="actions-heading">Gerenciar Conta</h2>
            <div className={styles.actionList}>
              {actions.map((action) => {
                const content = <><span className={styles.actionIcon}><ActionIcon name={action.icon} /></span><span className={styles.actionText}><strong>{action.title}</strong><small>{action.description}</small></span><span className={styles.arrow} aria-hidden="true">→</span></>;
                return action.href
                  ? <Link className={`${styles.actionCard} hoverCard`} href={action.href} key={action.title}>{content}</Link>
                  : <button className={`${styles.actionCard} hoverCard`} type="button" onClick={() => { setMessage(""); setEditor(action.editor ?? null); }} key={action.title}>{content}</button>;
              })}
            </div>
            {message && <p className={styles.feedback} role="status">{message}</p>}
          </section>
        </div>
      </div>
      {editor && <AccountSettings mode={editor} onClose={() => setEditor(null)} onComplete={setMessage} />}
    </main>
  );
}
