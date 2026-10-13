"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./site-header.module.css";

const links = [
  { label: "Home", href: "/" },
  { label: "Notícias", href: "/noticias" },
  { label: "Modalidades", href: "/modalidades" },
  { label: "Agenda", href: "/agenda" },
  { label: "Mural", href: "/mural" },
  { label: "Loja", href: "/loja" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const accountLabel = pathname === "/login" || pathname === "/cadastro" ? "Minha conta" : "Entrar / Minha conta";

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/" aria-label="Octacore, página inicial">
          <span className={styles.brandMark}><Image src="/images/logo-octacore.png" alt="" width={76} height={76} priority /></span>
          <span><strong>Octacore</strong><small>A.A.A. Computação · UFAL</small></span>
        </Link>
        <nav className={styles.desktopNav} aria-label="Navegação principal">
          {links.map((link) => <Link className={pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`)) ? styles.active : ""} href={link.href} key={link.href}>{link.label}</Link>)}
        </nav>
        <Link className={styles.account} href="/login">{accountLabel}</Link>
        <details className={styles.mobileMenu}>
          <summary>Menu <span aria-hidden="true">☰</span></summary>
          <nav aria-label="Navegação móvel">
            {links.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
            <Link href="/login">{accountLabel}</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
