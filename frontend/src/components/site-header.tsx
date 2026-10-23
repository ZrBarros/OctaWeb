"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAuth } from "./auth-provider";
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
  const { user, status } = useAuth();
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);
  const accountHref = user?.perfil === "ADMIN" ? "/admin" : user ? "/minha-conta" : "/login";
  const firstName = user?.nome.trim().split(/\s+/)[0];
  const accountLabel = status === "loading" ? "Minha conta" : firstName ? `Olá, ${firstName}` : "Entrar / Minha conta";
  const closeMobileMenu = () => {
    if (mobileMenuRef.current) mobileMenuRef.current.open = false;
  };

  useEffect(() => {
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !mobileMenuRef.current?.contains(event.target)) closeMobileMenu();
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobileMenu();
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

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
        <Link className={styles.account} href={accountHref}>{accountLabel}</Link>
        <details className={styles.mobileMenu} ref={mobileMenuRef}>
          <summary aria-label="Menu de navegação"><span aria-hidden="true">☰</span></summary>
          <nav aria-label="Navegação móvel">
            {links.map((link) => <Link href={link.href} key={link.href} onClick={closeMobileMenu}>{link.label}</Link>)}
            <Link href={accountHref} onClick={closeMobileMenu}>{accountLabel}</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
