"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { formatPrice, products } from "@/data/products";
import { useCart } from "@/lib/cart";
import styles from "./page.module.css";

type Confirmation = { name: string; pickup: string; totalCents: number };

export function CheckoutContent() {
  const items = useCart();
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [error, setError] = useState("");
  const lines = items?.flatMap((item) => {
    const product = products.find((candidate) => candidate.slug === item.slug);
    return product ? [{ ...item, product }] : [];
  }) ?? [];
  const totalCents = lines.reduce((total, item) => total + item.product.priceCents * item.quantity, 0);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lines.length === 0) return;

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").replace(/\D/g, "");
    const pickup = String(data.get("pickup") ?? "");
    if (name.length < 2 || !/^\d{10,11}$/.test(phone) || !["campus", "combinar"].includes(pickup)) {
      setError("Confira o nome, o telefone com DDD e a forma de retirada.");
      return;
    }

    setError("");
    setConfirmation({ name, pickup: pickup === "campus" ? "No campus da UFAL" : "A combinar com a atlética", totalCents });
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Caminho da página">
          <Link href="/loja">Loja</Link><span aria-hidden="true">/</span><Link href="/carrinho">Carrinho</Link><span aria-hidden="true">/</span><span>Checkout</span>
        </nav>

        {confirmation ? (
          <section className={styles.confirmation} role="status" aria-labelledby="confirmation-title">
            <span className={styles.badge}>Demonstração concluída</span>
            <h1 id="confirmation-title">Simulação finalizada</h1>
            <p>Obrigado, {confirmation.name}. Este pedido foi apenas uma demonstração: nenhuma informação foi enviada à atlética e não houve cobrança.</p>
            <div className={styles.confirmationDetails}>
              <div><span>Retirada escolhida</span><strong>{confirmation.pickup}</strong></div>
              <div><span>Total simulado</span><strong>{formatPrice(confirmation.totalCents)}</strong></div>
              <div><span>Status</span><strong>Pendente · demonstração</strong></div>
            </div>
            <Link className="button buttonPrimary" href="/loja">Voltar à loja</Link>
          </section>
        ) : (
          <>
            <div className={styles.kicker}><span>Loja</span><i /></div>
            <h1>Checkout simulado</h1>
            <p className={styles.intro}>Confira seus produtos e preencha os dados para testar o fluxo de pedido.</p>

            {items === null ? (
              <p className={styles.loading} role="status">Carregando carrinho...</p>
            ) : lines.length === 0 ? (
              <section className={styles.empty} aria-label="Carrinho vazio">
                <h2>Seu carrinho está vazio</h2>
                <p>Adicione um produto antes de iniciar o checkout.</p>
                <Link className="button buttonPrimary" href="/loja">Explorar a loja</Link>
              </section>
            ) : (
              <div className={styles.layout}>
                <form className={styles.form} onSubmit={handleSubmit}>
                  <h2>Dados para retirada</h2>
                  <p className={styles.formIntro}>Esta simulação não envia seus dados nem registra um pedido real.</p>
                  <div className={styles.fields}>
                    <label>
                      Nome completo
                      <input type="text" name="name" autoComplete="name" required minLength={2} maxLength={100} />
                    </label>
                    <label>
                      Telefone com DDD
                      <input type="tel" name="phone" autoComplete="tel" inputMode="tel" placeholder="(82) 99999-9999" required maxLength={20} />
                    </label>
                    <label className={styles.fullWidth}>
                      Forma de retirada
                      <select name="pickup" defaultValue="" required>
                        <option value="" disabled>Escolha uma opção</option>
                        <option value="campus">No campus da UFAL</option>
                        <option value="combinar">A combinar com a atlética</option>
                      </select>
                    </label>
                    <label className={styles.fullWidth}>
                      <div>Observações <span>(opcional)</span></div>
                      <textarea name="notes" rows={4} maxLength={500} placeholder="Algo que a atlética precisa saber sobre a retirada?" />
                    </label>
                  </div>
                  {error && <p className={styles.error} role="alert">{error}</p>}
                  <button className="button buttonPrimary" type="submit">Simular pedido</button>
                </form>

                <aside className={styles.summary} aria-labelledby="summary-title">
                  <h2 id="summary-title">Resumo do pedido</h2>
                  <ul>
                    {lines.map(({ slug, size, quantity, product }) => (
                      <li key={`${slug}:${size ?? ""}`}>
                        <div><strong>{product.name}</strong><span>{size ? `Tamanho ${size} · ` : ""}Qtd. {quantity}</span></div>
                        <strong>{formatPrice(product.priceCents * quantity)}</strong>
                      </li>
                    ))}
                  </ul>
                  <div className={styles.total}><span>Total</span><strong>{formatPrice(totalCents)}</strong></div>
                  <p>Sem pagamento real. A confirmação vale apenas para esta demonstração.</p>
                  <Link href="/carrinho">← Editar carrinho</Link>
                </aside>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
