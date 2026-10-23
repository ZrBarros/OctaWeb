"use client";

import { useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { apiClient } from "@/lib/api";
import type { ApiItem, ApiUser } from "@/lib/api-types";
import styles from "./auth-form.module.css";

type AuthMode = "login" | "cadastro";

export function AuthForm({ mode, initialMessage = "" }: { mode: AuthMode; initialMessage?: string }) {
  const isSignup = mode === "cadastro";
  const [message, setMessage] = useState(initialMessage);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const { establishSession } = useAuth();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const data = new FormData(event.currentTarget);
    if (isSignup) {
      if (data.get("password") !== data.get("confirmPassword")) {
        setMessage("As senhas precisam ser iguais.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const body = isSignup
        ? { name: data.get("name"), email: data.get("email"), course: data.get("course"), password: data.get("password") }
        : { email: data.get("email"), password: data.get("password") };
      const response = await apiClient<{ data: { user: ApiUser; accessToken: string } }>(`/auth/${isSignup ? "register" : "login"}`, { method: "POST", body: JSON.stringify(body) });
      establishSession(response.data.user, response.data.accessToken);
      router.push(response.data.user.perfil === "ADMIN" ? "/admin" : "/minha-conta");
      router.refresh();
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Não foi possível acessar a conta."); }
    finally { setSubmitting(false); }
  }

  async function forgotPassword() {
    const email = String(new FormData(formRef.current ?? undefined).get("email") ?? "").trim();
    if (!email) { setMessage("Digite seu e-mail para receber as instruções."); return; }
    try { await apiClient<ApiItem<never>>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }); setMessage("Se o e-mail estiver cadastrado, enviaremos as instruções de redefinição."); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : "Não foi possível solicitar a redefinição."); }
  }

  return (
    <main className={`${styles.main} ${isSignup ? styles.signupPage : styles.loginPage}`}>
      <section className={styles.card} aria-labelledby="auth-title">
        {isSignup ? (
          <header className={styles.signupHeading}>
            <h1 id="auth-title">Junte-se à Octacore</h1>
            <p>Crie seu perfil de atleta, torcedor ou apoiador da Computação</p>
          </header>
        ) : (
          <header className={styles.loginHeading}>
            <Image src="/images/logo-octacore.png" alt="Octacore" width={64} height={64} priority />
            <h1 id="auth-title">Acesse sua conta</h1>
          </header>
        )}

        <form ref={formRef} className={styles.form} onSubmit={handleSubmit} onChange={() => setMessage("")}>
          {isSignup && (
            <label className={styles.field}>
              Nome completo
              <input name="name" type="text" autoComplete="name" placeholder="Carlos Eduardo de Oliveira" required minLength={2} maxLength={100} />
            </label>
          )}
          <label className={styles.field}>
            {isSignup ? "E-mail institucional ou pessoal" : "E-mail UFAL ou cadastrado"}
            <input name="email" type="email" autoComplete="email" placeholder="carlos.eduardo@ic.ufal.br" required />
          </label>
          {isSignup && (
            <label className={styles.field}>
              Curso
              <input name="course" type="text" autoComplete="organization-title" placeholder="Ciência da Computação" required maxLength={100} />
            </label>
          )}
          <label className={styles.field}>
            {isSignup ? "Senha" : "Sua senha"}
            <input name="password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} placeholder="••••••••••••" required minLength={isSignup ? 8 : undefined} pattern={isSignup ? "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,128}" : undefined} title={isSignup ? "Use ao menos 8 caracteres, com letra minúscula, maiúscula e número." : undefined} />
          </label>
          {isSignup && <p className={styles.passwordHint}>Use ao menos 8 caracteres, com letra minúscula, maiúscula e número.</p>}
          {isSignup && (
            <label className={styles.field}>
              Confirmar senha
              <input name="confirmPassword" type="password" autoComplete="new-password" placeholder="••••••••••••" required minLength={8} />
            </label>
          )}

          {isSignup ? (
            <p className={styles.supportingText}>Ao se cadastrar, você concorda com a integração esportiva acadêmica.</p>
          ) : (
            <div className={styles.loginLinks}>
              <button type="button" onClick={() => void forgotPassword()}>Esqueci minha senha</button>
              <span>Não tem conta? <Link href="/cadastro">Cadastre-se</Link></span>
            </div>
          )}

          {message && <p className={styles.feedback} role="status">{message}</p>}
          <button className={`button buttonPrimary ${styles.submit}`} type="submit" disabled={submitting}>{submitting ? "Aguarde..." : isSignup ? "Criar minha conta" : "Entrar na conta"}</button>
        </form>
        {isSignup && <Link className={`button buttonOutline ${styles.backToLogin}`} href="/login">Fazer login</Link>}
      </section>
    </main>
  );
}
