"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./admin.module.css";

export type AdminIconName = "dashboard" | "news" | "products" | "events" | "users" | "results" | "orders" | "search";

export function AdminIcon({ name }: { name: AdminIconName }) {
  const paths: Record<AdminIconName, React.ReactNode> = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    news: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    products: <><rect x="4" y="7" width="16" height="14" rx="2" /><path d="M8 9V6a4 4 0 0 1 8 0v3" /></>,
    events: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1" /></>,
    results: <><path d="M7 3h10v7a5 5 0 0 1-10 0V3ZM7 5H4v3a4 4 0 0 0 4 4M17 5h3v3a4 4 0 0 1-4 4M12 15v4M8 21h8" /></>,
    orders: <><path d="M3 4h2l2 12h12l2-9H6M8 20h.01M18 20h.01" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></>,
  };

  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const sections: { label: string; icon: AdminIconName; href?: string }[] = [
  { label: "Dashboard", icon: "dashboard", href: "/admin" },
  { label: "Notícias", icon: "news", href: "/admin/noticias" },
  { label: "Produtos", icon: "products", href: "/admin/produtos" },
  { label: "Eventos", icon: "events", href: "/admin/eventos" },
  { label: "Integrantes", icon: "users", href: "/admin/integrantes" },
  { label: "Resultados", icon: "results", href: "/admin/resultados" },
  { label: "Pedidos", icon: "orders", href: "/admin/pedidos" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [feedback, setFeedback] = useState("");

  return <div className={styles.shell}>
    <aside className={styles.sidebar} aria-label="Painel administrativo">
      <Link className={styles.brand} href="/" aria-label="Octacore, voltar ao site">
        <span className={styles.brandMark}><Image src="/images/logo-octacore.png" alt="" width={48} height={48} /></span>
        <span className={styles.brandText}><strong>Octacore</strong><small>Painel Admin</small></span>
      </Link>

      <nav className={styles.navigation} aria-label="Áreas administrativas">
        {sections.map((section) => {
          const active = pathname === section.href;
          const content = <><AdminIcon name={section.icon} /><span>{section.label}</span>{active && <span className={styles.activeDot} aria-hidden="true" />}</>;
          return section.href
            ? <Link className={active ? styles.activeNav : styles.navItem} href={section.href} aria-current={active ? "page" : undefined} onClick={() => setFeedback("")} key={section.label}>{content}</Link>
            : <button className={styles.navItem} type="button" onClick={() => setFeedback(`A área de ${section.label.toLowerCase()} será construída nas próximas etapas.`)} key={section.label}>{content}</button>;
        })}
      </nav>

      <div className={styles.sidebarBottom}>
        <Link href="/">← <span>Voltar ao Site</span></Link>
        <button type="button" onClick={() => setFeedback("Esta é uma prévia. Ainda não existe uma sessão administrativa para encerrar.")}>↪ <span>Sair do Painel</span></button>
      </div>
    </aside>

    <main className={styles.main}>
      {feedback && <p className={styles.shellFeedback} role="status">{feedback}</p>}
      {children}
    </main>
  </div>;
}
