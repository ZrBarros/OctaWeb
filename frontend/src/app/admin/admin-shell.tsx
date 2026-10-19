"use client";

import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminProfile } from "@/data/admin-profile";
import styles from "./admin.module.css";

export type AdminIconName = "dashboard" | "news" | "products" | "events" | "users" | "results" | "orders" | "search" | "logout";

const AdminFeedbackContext = createContext<(message: string) => void>(() => {});
const AdminToolbarTargetContext = createContext<{ desktop: HTMLElement | null; mobile: HTMLElement | null; setMobile: (target: HTMLElement | null) => void }>({ desktop: null, mobile: null, setMobile: () => {} });

const mobileViewport = {
  subscribe(onChange: () => void) {
    const media = window.matchMedia("(max-width: 650px)");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  },
  getSnapshot: () => window.matchMedia("(max-width: 650px)").matches,
  getServerSnapshot: () => false,
};

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
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolbarSearchTarget, setToolbarSearchTarget] = useState<HTMLElement | null>(null);
  const [mobileToolbarSearchTarget, setMobileToolbarSearchTarget] = useState<HTMLElement | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const currentSection = pathname === "/admin/perfil" ? "Meu perfil" : sections.find((section) => section.href === pathname)?.label ?? "Painel";

  useEffect(() => {
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !sidebarRef.current?.contains(event.target)) setMobileMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return <AdminFeedbackContext.Provider value={setFeedback}><AdminToolbarTargetContext.Provider value={{ desktop: toolbarSearchTarget, mobile: mobileToolbarSearchTarget, setMobile: setMobileToolbarSearchTarget }}><div className={styles.shell}>
    <aside ref={sidebarRef} className={styles.sidebar} aria-label="Painel administrativo">
      <div className={styles.adminNavbar}>
        <div className={styles.brandHeader}>
          <Link className={styles.brand} href="/admin" aria-label="Octacore, abrir dashboard administrativo">
            <span className={styles.brandMark}><Image src="/images/logo-octacore.png" alt="" width={48} height={48} /></span>
            <span className={styles.brandText}><strong>Octacore</strong><small>Painel Admin</small></span>
          </Link>
          <button
            className={styles.mobileMenuToggle}
            type="button"
            aria-label="Menu administrativo"
            aria-expanded={mobileMenuOpen}
            aria-controls="admin-navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span>Menu</span>
            <span className={styles.mobileCurrentSection}>{currentSection}</span>
            <svg className={styles.desktopMenuIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            <svg className={`${styles.mobileMenuChevron} ${mobileMenuOpen ? styles.chevronOpen : ""}`} viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
        <div className={styles.navbarActions}>
          <div id="admin-toolbar-search" ref={setToolbarSearchTarget} className={styles.toolbarSearchSlot} />
          <Link className={styles.adminProfileLink} href="/admin/perfil" aria-label={`Abrir perfil de ${adminProfile.name}`}>
            <span className={styles.adminIdentity}><strong>{adminProfile.name}</strong><small>{adminProfile.role}</small></span>
            <span className={styles.adminAvatar} aria-hidden="true">{adminProfile.initials}</span>
          </Link>
          <AdminLogoutButton placement="desktop" />
        </div>
      </div>

      <nav id="admin-navigation" className={`${styles.navigation} ${mobileMenuOpen ? styles.navigationOpen : ""}`} aria-label="Áreas administrativas">
        {sections.map((section) => {
          const active = pathname === section.href;
          const content = <><AdminIcon name={section.icon} /><span>{section.label}</span>{active && <span className={styles.activeDot} aria-hidden="true" />}</>;
          return section.href
            ? <Link className={active ? styles.activeNav : styles.navItem} href={section.href} aria-current={active ? "page" : undefined} onClick={() => { setFeedback(""); setMobileMenuOpen(false); }} key={section.label}>{content}</Link>
            : <button className={styles.navItem} type="button" onClick={() => { setFeedback(`A área de ${section.label.toLowerCase()} será construída nas próximas etapas.`); setMobileMenuOpen(false); }} key={section.label}>{content}</button>;
        })}
        <Link className={styles.mobileProfileNav} href="/admin/perfil" aria-current={pathname === "/admin/perfil" ? "page" : undefined} onClick={() => { setFeedback(""); setMobileMenuOpen(false); }}><AdminIcon name="users" /><span>Meu perfil</span>{pathname === "/admin/perfil" && <span className={styles.activeDot} aria-hidden="true" />}</Link>
      </nav>

    </aside>

    <main className={styles.main}>
      {feedback && <p className={styles.shellFeedback} role="status">{feedback}</p>}
      <div className={styles.pageTransition} key={pathname}>
        {children}
      </div>
    </main>
  </div></AdminToolbarTargetContext.Provider></AdminFeedbackContext.Provider>;
}

export function AdminLogoutButton({ placement }: { placement: "desktop" | "mobile" }) {
  const setFeedback = useContext(AdminFeedbackContext);
  const placementClass = placement === "mobile" ? styles.logoutMobile : styles.logoutTopbar;
  return <button className={`${styles.logoutIcon} ${placementClass}`} type="button" aria-label="Sair do painel" title="Sair do painel" onClick={() => setFeedback("Esta é uma prévia. Ainda não existe uma sessão administrativa para encerrar.")}>
    <AdminIcon name="logout" />
  </button>;
}

export function AdminPageHeading({ title, role = "Diretoria" }: { title: string; role?: string }) {
  const { setMobile } = useContext(AdminToolbarTargetContext);
  return <div className={styles.pageHeading}><h1>{title}</h1><span className={styles.roleBadge}>{role}</span><div ref={setMobile} className={styles.mobileToolbarSearchSlot} /></div>;
}

export function AdminToolbarSearch({ children }: { children: ReactNode }) {
  const targets = useContext(AdminToolbarTargetContext);
  const isMobile = useSyncExternalStore(mobileViewport.subscribe, mobileViewport.getSnapshot, mobileViewport.getServerSnapshot);
  const target = isMobile ? targets.mobile : targets.desktop;
  return target ? createPortal(children, target) : null;
}
