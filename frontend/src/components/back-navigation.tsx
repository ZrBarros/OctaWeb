"use client";

import { usePathname, useRouter } from "next/navigation";
import styles from "./back-navigation.module.css";

function fallbackFor(pathname: string) {
  if (pathname === "/admin") return "/";
  if (pathname.startsWith("/admin/")) return "/admin";
  if (pathname.startsWith("/agenda/")) return "/agenda";
  if (pathname.startsWith("/noticias/")) return "/noticias";
  if (pathname.startsWith("/modalidades/")) return "/modalidades";
  if (pathname.startsWith("/mural/integrantes/")) return "/mural/integrantes";
  if (pathname.startsWith("/loja/")) return "/loja";
  if (pathname === "/checkout") return "/carrinho";
  if (pathname === "/meus-pedidos") return "/minha-conta";
  if (pathname === "/redefinir-senha") return "/login";
  if (pathname.startsWith("/atletas/")) return "/modalidades/futsal";
  return "/";
}

export function BackNavigation({ admin = false }: { admin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const primaryPublicPages = ["/", "/noticias", "/modalidades", "/agenda", "/mural", "/loja"];

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push(fallbackFor(pathname));
  }

  if (!admin && primaryPublicPages.includes(pathname)) return null;

  return (
    <div className={`${styles.backNavigation} ${admin ? styles.adminBackNavigation : ""}`}>
      <button className={styles.backButton} type="button" onClick={goBack}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5m0 0 7-7m-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span>Voltar</span>
      </button>
    </div>
  );
}
