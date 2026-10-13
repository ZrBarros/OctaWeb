import type { Metadata } from "next";
import Link from "next/link";
import { demoOrder } from "@/data/account";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Meus pedidos | Octacore" };

export default function MeusPedidosPage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <p className={styles.demoLabel}>Pedido de exemplo · nenhuma compra registrada</p>
        <h1>Meus Pedidos</h1>
        <p className={styles.intro}>Acompanhe o andamento e o status das suas encomendas com a diretoria</p>

        <article className={styles.orderCard} aria-labelledby="order-heading">
          <div className={styles.orderHeader}>
            <div><h2 id="order-heading">Pedido #{demoOrder.number}</h2><span className={styles.status}>{demoOrder.status}</span></div>
            <p>Data do Pedido: {demoOrder.date}</p>
          </div>

          <ul className={styles.items}>
            {demoOrder.items.map((item) => (
              <li key={item.name}>
                <span className={styles.imagePlaceholder} aria-hidden="true" />
                <span className={styles.itemText}><strong>{item.name}</strong><small>{item.detail}</small></span>
                <strong className={styles.itemPrice}>{item.price}</strong>
              </li>
            ))}
          </ul>

          <section className={styles.progress} aria-labelledby="progress-heading">
            <h3 id="progress-heading">Progresso da entrega</h3>
            <ol>
              {demoOrder.steps.map((step, index) => <li className={index === 0 ? styles.currentStep : ""} key={step}><span>{index === 0 ? "✓" : index + 1}</span><strong>{step}</strong></li>)}
            </ol>
          </section>

          <div className={styles.orderFooter}>
            <span>Forma de Pagamento: {demoOrder.payment}</span>
            <span>Valor Total Pago: <strong>{demoOrder.total}</strong></span>
          </div>
        </article>

        <section className={styles.history} id="historico" aria-labelledby="history-heading">
          <h2 id="history-heading">Histórico de Compras</h2>
          <p>Não há compras concluídas nesta demonstração.</p>
          <Link href="/minha-conta">← Voltar para Minha Conta</Link>
        </section>
      </div>
    </main>
  );
}
