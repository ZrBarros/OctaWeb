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

  if (pathname === "/noticias") {
    return <><div className={styles.newsShell}><SiteHeader />{children}</div><SiteFooter /></>;
  }

  if (pathname === "/modalidades") {
    return <><div className={styles.modalityShell}><SiteHeader />{children}</div><SiteFooter /></>;
  }

  if (pathname === "/agenda") {
    return <><div className={styles.agendaShell}><SiteHeader />{children}</div><SiteFooter /></>;
  }

  if (pathname === "/mural") {
    return <><div className={styles.muralShell}><SiteHeader />{children}</div><SiteFooter /></>;
  }

  if (pathname === "/loja") {
    return <><div className={styles.storeShell}><SiteHeader />{children}</div><SiteFooter /></>;
  }

  return <><SiteHeader />{children}<SiteFooter /></>;
}
