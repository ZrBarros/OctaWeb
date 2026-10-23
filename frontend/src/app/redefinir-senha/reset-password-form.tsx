"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import styles from "@/components/auth-form.module.css";

export function ResetPasswordForm({ token }: { token: string }) {
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    if (data.get("password") !== data.get("confirmPassword")) { setMessage("As senhas precisam ser iguais."); return; }
    try { await apiClient<void>("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password: data.get("password") }) }); setDone(true); setMessage("Senha redefinida com sucesso."); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : "Não foi possível redefinir a senha."); }
  }
  return <main className={`${styles.main} ${styles.loginPage}`}><section className={styles.card}><header className={styles.loginHeading}><h1>Redefinir senha</h1></header>
    {!token ? <p className={styles.feedback}>O link de redefinição está incompleto.</p> : done ? <><p className={styles.feedback}>{message}</p><Link className="button buttonPrimary" href="/login">Fazer login</Link></> : <form className={styles.form} onSubmit={submit}>
      <label className={styles.field}>Nova senha<input name="password" type="password" required minLength={8} autoComplete="new-password" /></label>
      <label className={styles.field}>Confirmar nova senha<input name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" /></label>
      {message && <p className={styles.feedback} role="alert">{message}</p>}<button className={`button buttonPrimary ${styles.submit}`} type="submit">Salvar nova senha</button>
    </form>}
  </section></main>;
}
