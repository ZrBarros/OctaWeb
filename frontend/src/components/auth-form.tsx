"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./auth-form.module.css";

type AuthMode = "login" | "cadastro";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const isSignup = mode === "cadastro";
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (isSignup) {
      const data = new FormData(event.currentTarget);
      if (data.get("password") !== data.get("confirmPassword")) {
        setMessage("As senhas precisam ser iguais.");
        return;
      }
    }

    setMessage(isSignup
      ? "O cadastro ainda não está disponível. Seus dados não foram enviados nem salvos."
      : "O acesso ainda não está disponível. Seus dados não foram enviados nem salvos.");
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

        <form className={styles.form} onSubmit={handleSubmit} onChange={() => setMessage("")}>
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
            <input name="password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} placeholder="••••••••••••" required minLength={isSignup ? 8 : undefined} />
          </label>
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
              <button type="button" onClick={() => setMessage("A recuperação de senha estará disponível quando a autenticação for integrada.")}>Esqueci minha senha</button>
              <span>Não tem conta? <Link href="/cadastro">Cadastre-se</Link></span>
            </div>
          )}

          {message && <p className={styles.feedback} role="status">{message}</p>}
          {!isSignup && message.startsWith("O acesso ainda") && (
            <Link className={styles.previewLink} href="/minha-conta">Explorar prévia de Minha Conta →</Link>
          )}
          <button className={`button buttonPrimary ${styles.submit}`} type="submit">{isSignup ? "Criar minha conta" : "Entrar na conta"}</button>
        </form>
        {isSignup && <Link className={`button buttonOutline ${styles.backToLogin}`} href="/login">Fazer login</Link>}
      </section>
    </main>
  );
}
