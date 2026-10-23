"use client";

import { useState } from "react";
import Link from "next/link";
import { AccountSettings, type AccountSettingsMode } from "@/components/account-settings";
import { useAuth } from "@/components/auth-provider";
import { AdminPageHeading } from "../admin-shell";
import shared from "../admin.module.css";
import styles from "./page.module.css";

const adminSections = [
  ["Notícias", "/admin/noticias"],
  ["Produtos", "/admin/produtos"],
  ["Eventos", "/admin/eventos"],
  ["Modalidades", "/admin/modalidades"],
  ["Integrantes", "/admin/integrantes"],
  ["Mural", "/admin/mural"],
  ["Resultados", "/admin/resultados"],
  ["Pedidos", "/admin/pedidos"],
  ["Usuários", "/admin/usuarios"],
] as const;

export function AdminProfilePage() {
  const [message, setMessage] = useState("");
  const [editor, setEditor] = useState<AccountSettingsMode | null>(null);
  const { user: profile, status } = useAuth();
  const initials = profile?.nome.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase("pt-BR") ?? "AD";

  return <div className={shared.content}>
    <AdminPageHeading title="Meu Perfil" role="Administrador" />
    <p className={shared.demoNotice}>{status === "loading" ? "Carregando perfil..." : "Conta administrativa conectada"}</p>

    <div className={styles.profileLayout}>
      <section className={styles.identityCard} aria-labelledby="profile-name">
        <div className={styles.avatar} aria-hidden="true">{initials}</div>
        <h2 id="profile-name">{profile?.nome ?? "Administrador"}</h2>
        <p className={styles.role}>{profile?.curso ?? ""}</p>
        <span className={styles.accessBadge}>Administrador</span>
        <dl className={styles.profileDetails}>
          <div><dt>Conta</dt><dd>{profile?.email ?? ""}</dd></div>
          <div><dt>Autenticação</dt><dd>Conectada</dd></div>
          <div><dt>Permissões</dt><dd>Perfil ADMIN validado pela API</dd></div>
        </dl>
        <div className={styles.profileActions}>
          <button type="button" onClick={() => { setMessage(""); setEditor("profile"); }}>Editar perfil</button>
          <button type="button" onClick={() => { setMessage(""); setEditor("password"); }}>Alterar senha</button>
        </div>
        {message && <p className={styles.feedback} role="status">{message}</p>}
      </section>

      <section className={styles.accessCard} aria-labelledby="access-title">
        <h2 id="access-title">Áreas do painel</h2>
        <p>Atalhos para as áreas administrativas autorizadas.</p>
        <nav className={styles.accessLinks} aria-label="Áreas administrativas">
          {adminSections.map(([label, href]) => <Link href={href} key={href}>{label}<span aria-hidden="true">→</span></Link>)}
        </nav>
        <p className={styles.notice}>As rotas administrativas exigem autenticação e perfil ADMIN na API.</p>
      </section>
    </div>
    {editor && <AccountSettings mode={editor} onClose={() => setEditor(null)} onComplete={setMessage} />}
  </div>;
}
