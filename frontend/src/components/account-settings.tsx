"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { apiClient } from "@/lib/api";
import type { ApiItem, ApiUser } from "@/lib/api-types";
import styles from "./account-settings.module.css";

export type AccountSettingsMode = "profile" | "password";

export function AccountSettings({ mode, onClose, onComplete }: { mode: AccountSettingsMode; onClose: () => void; onComplete?: (message: string) => void }) {
  const { user, updateUser, logout } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitting(true); setMessage("");
    try {
      const response = await apiClient<ApiItem<ApiUser>>("/auth/me", {
        method: "PATCH",
        auth: true,
        body: JSON.stringify({ name: data.get("name"), course: data.get("course"), photoUrl: user?.fotoUrl ?? null }),
      });
      updateUser(response.data);
      onComplete?.("Perfil atualizado com sucesso.");
      onClose();
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Não foi possível atualizar o perfil."); }
    finally { setSubmitting(false); }
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const newPassword = String(data.get("newPassword") ?? "");
    if (newPassword !== data.get("confirmPassword")) { setMessage("A confirmação da nova senha não confere."); return; }
    setSubmitting(true); setMessage("");
    try {
      await apiClient<void>("/auth/me/password", {
        method: "PATCH",
        auth: true,
        body: JSON.stringify({ currentPassword: data.get("currentPassword"), newPassword }),
      });
      await logout();
      router.replace("/login?senha=alterada");
      router.refresh();
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Não foi possível alterar a senha."); }
    finally { setSubmitting(false); }
  }

  const passwordPattern = "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,128}";

  return <div className={styles.overlay} onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
    <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="account-settings-title">
      <div className={styles.header}>
        <div><p>Gerenciar conta</p><h2 id="account-settings-title">{mode === "profile" ? "Editar perfil" : "Alterar senha"}</h2></div>
        <button type="button" aria-label="Fechar" onClick={onClose}>×</button>
      </div>

      {mode === "profile" ? <form className={styles.form} onSubmit={submitProfile}>
        <label>Nome completo<input autoFocus name="name" defaultValue={user.nome} required minLength={2} maxLength={120} autoComplete="name" /></label>
        <label>Curso<input name="course" defaultValue={user.curso} required minLength={2} maxLength={100} autoComplete="organization-title" /></label>
        <label>E-mail<input value={user.email} readOnly aria-readonly="true" /></label>
        <p className={styles.help}>O e-mail identifica sua conta e só pode ser alterado por um administrador.</p>
        {message && <p className={styles.feedback} role="alert">{message}</p>}
        <div className={styles.actions}><button type="button" onClick={onClose}>Cancelar</button><button type="submit" disabled={submitting}>{submitting ? "Salvando..." : "Salvar alterações"}</button></div>
      </form> : <form className={styles.form} onSubmit={submitPassword}>
        <label>Senha atual<input autoFocus name="currentPassword" type="password" required maxLength={128} autoComplete="current-password" /></label>
        <label>Nova senha<input name="newPassword" type="password" required minLength={8} maxLength={128} pattern={passwordPattern} title="Use ao menos 8 caracteres, com letra minúscula, maiúscula e número." autoComplete="new-password" /></label>
        <label>Confirmar nova senha<input name="confirmPassword" type="password" required minLength={8} maxLength={128} pattern={passwordPattern} autoComplete="new-password" /></label>
        <p className={styles.help}>Use ao menos 8 caracteres, com letra minúscula, maiúscula e número. Após a troca, entre novamente.</p>
        {message && <p className={styles.feedback} role="alert">{message}</p>}
        <div className={styles.actions}><button type="button" onClick={onClose}>Cancelar</button><button type="submit" disabled={submitting}>{submitting ? "Alterando..." : "Alterar senha"}</button></div>
      </form>}
    </section>
  </div>;
}
