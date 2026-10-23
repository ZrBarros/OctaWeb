"use client";

import Link from "next/link";
import type { ApiOrder, ApiPage } from "@/lib/api-types";
import { useApiData } from "@/lib/use-api";
import styles from "./page.module.css";

const statusLabels: Record<string, string> = { PENDENTE: "Pendente", CONFIRMADO: "Confirmado", EM_SEPARACAO: "Em separação", DISPONIVEL_RETIRADA: "Disponível", ENTREGUE: "Entregue", CANCELADO: "Cancelado" };
const progress = ["PENDENTE", "CONFIRMADO", "EM_SEPARACAO", "DISPONIVEL_RETIRADA", "ENTREGUE"];
const price = (value: string | number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value));

export default function MeusPedidosPage() {
  const { data: response, loading, error } = useApiData<ApiPage<ApiOrder>>("/orders?pageSize=100", { data: [], meta: { page: 1, pageSize: 100, total: 0, totalPages: 0 } }, true);
  const active = response.data.filter((order) => !["ENTREGUE", "CANCELADO"].includes(order.status));
  const history = response.data.filter((order) => ["ENTREGUE", "CANCELADO"].includes(order.status));

  return <main className={styles.main}><div className={styles.container}>
    <h1>Meus Pedidos</h1><p className={styles.intro}>Acompanhe o andamento e o status das suas encomendas com a diretoria</p>
    {loading ? <p>Carregando pedidos...</p> : error ? <p>{error} <Link href="/login">Fazer login</Link></p> : active.length === 0 ? <p>Nenhum pedido ativo.</p> : active.map((order) => <OrderCard order={order} key={order.id} />)}
    <section className={styles.history} id="historico" aria-labelledby="history-heading"><h2 id="history-heading">Histórico de Compras</h2>
      {history.length === 0 ? <p>Não há compras concluídas.</p> : history.map((order) => <OrderCard order={order} key={order.id} />)}
      <Link href="/minha-conta">← Voltar para Minha Conta</Link>
    </section>
  </div></main>;
}

function OrderCard({ order }: { order: ApiOrder }) {
  const current = progress.indexOf(order.status);
  return <article className={styles.orderCard} aria-labelledby={`order-${order.id}`}>
    <div className={styles.orderHeader}><div><h2 id={`order-${order.id}`}>Pedido #{order.id}</h2><span className={styles.status}>{statusLabels[order.status] ?? order.status}</span></div><p>Data do Pedido: {new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(order.criadoEm))}</p></div>
    <ul className={styles.items}>{order.itens.map((item) => <li key={item.id}><span className={styles.imagePlaceholder} aria-hidden="true" /><span className={styles.itemText}><strong>{item.variacao.produto.nome}</strong><small>{item.variacao.tamanho !== "UNICO" ? `Tamanho ${item.variacao.tamanho} · ` : ""}Quantidade: {item.quantidade}</small></span><strong className={styles.itemPrice}>{price(Number(item.precoUnitario) * item.quantidade)}</strong></li>)}</ul>
    {order.status !== "CANCELADO" && <section className={styles.progress}><h3>Progresso da entrega</h3><ol>{progress.slice(0, 4).map((step, index) => <li className={index <= current ? styles.currentStep : ""} key={step}><span>{index < current ? "✓" : index + 1}</span><strong>{statusLabels[step]}</strong></li>)}</ol></section>}
    <div className={styles.orderFooter}><span>Retirada: {order.formaRetirada === "CAMPUS" ? "Campus UFAL" : "A combinar"}</span><span>Valor Total: <strong>{price(order.valorTotal)}</strong></span></div>
  </article>;
}
