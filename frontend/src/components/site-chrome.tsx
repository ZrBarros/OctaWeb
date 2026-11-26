"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import styles from "./site-header.module.css";

export function SiteChrome({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return <>{children}</>;
  }

  if (pathname === "/") {
    return <><div className={styles.homeShell}><SiteHeader />{children}</div><SiteFooter /></>;
  }

  if (pathname === "/noticias" || pathname.startsWith("/noticias/")) {
    return <><div className={styles.newsShell}><SiteHeader />{children}</div><SiteFooter /></>;
  }

  if (pathname === "/modalidades" || pathname.startsWith("/modalidades/") || pathname === "/ranking") {
    return <><div className={styles.modalityShell}><SiteHeader />{children}</div><SiteFooter /></>;
  }

  if (pathname === "/agenda" || pathname.startsWith("/agenda/")) {
    return <><div className={styles.agendaShell}><SiteHeader />{children}</div><SiteFooter /></>;
  }

  if (pathname === "/mural" || pathname.startsWith("/mural/integrantes") || pathname === "/mural/historia" || pathname === "/mural/conquistas") {
    return <><div className={styles.muralShell}><SiteHeader />{children}</div><SiteFooter /></>;
  }

  if (pathname === "/loja" || pathname.startsWith("/loja/")) {
    return <><div className={styles.storeShell}><SiteHeader />{children}</div><SiteFooter /></>;
  }

  if (pathname === "/minha-conta") {
    return <><div className={styles.accountShell}><SiteHeader />{children}</div><SiteFooter /></>;
  }

  if (pathname === "/login" || pathname === "/cadastro") {
    return <><div className={styles.accountShell}><SiteHeader />{children}</div><SiteFooter /></>;
  }

  if (pathname === "/carrinho" || pathname === "/checkout") {
    return <><div className={styles.cartShell}><SiteHeader />{children}</div><SiteFooter /></>;
  }

  return <><SiteHeader />{children}<SiteFooter /></>;
}
