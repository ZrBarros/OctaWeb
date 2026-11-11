"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import type { ApiOrder, ApiPage } from "@/lib/api-types";
import { useApiData } from "@/lib/use-api";
import styles from "./page.module.css";

const statusLabels: Record<string, string> = { PENDENTE: "Pendente", CONFIRMADO: "Confirmado", EM_SEPARACAO: "Em separação", DISPONIVEL_RETIRADA: "Disponível", ENTREGUE: "Entregue", CANCELADO: "Cancelado" };
const progress = ["PENDENTE", "CONFIRMADO", "EM_SEPARACAO", "DISPONIVEL_RETIRADA", "ENTREGUE"];
const price = (value: string | number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value));
const activeStatuses = ["PENDENTE", "CONFIRMADO", "EM_SEPARACAO", "DISPONIVEL_RETIRADA"];

function subscribeToSection(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("popstate", onChange);
  };
}

function getSection() {
  return window.location.hash === "#historico" ? "historico" : "ativos";
}

function getServerSection() {
  return "ativos";
}

export default function MeusPedidosPage() {
  const section = useSyncExternalStore(subscribeToSection, getSection, getServerSection);
  const { data: response, loading, error } = useApiData<ApiPage<ApiOrder>>("/orders?pageSize=100", { data: [], meta: { page: 1, pageSize: 100, total: 0, totalPages: 0 } }, true);
  const active = response.data.filter((order) => activeStatuses.includes(order.status));
  const history = response.data.filter((order) => ["ENTREGUE", "CANCELADO"].includes(order.status));
  const showingHistory = section === "historico";
  const visibleOrders = showingHistory ? history : active;

  return <main className={styles.main}><div className={styles.container}>
    <h1>Meus Pedidos</h1><p className={styles.intro}>Acompanhe o andamento e o status das suas encomendas com a diretoria</p>
    <nav className={styles.tabs} aria-label="Categorias de pedidos">
      <a href="#ativos" aria-current={!showingHistory ? "page" : undefined}>Pedidos ativos</a>
      <a href="#historico" aria-current={showingHistory ? "page" : undefined}>Histórico de pedidos</a>
    </nav>
    <section className={styles.orders} id={section} aria-labelledby="orders-heading" aria-busy={loading}>
      <h2 className={styles.sectionHeading} id="orders-heading">{showingHistory ? "Histórico de pedidos" : "Pedidos ativos"}</h2>
      <p className={styles.sectionDescription}>{showingHistory ? "Pedidos entregues ou cancelados." : "Pedidos em andamento, até ficarem disponíveis para retirada."}</p>
      {loading ? <p role="status">Carregando pedidos...</p> : error ? <p role="alert">{error} <Link href="/login">Fazer login</Link></p> : visibleOrders.length === 0 ? <p className={styles.empty}>{showingHistory ? "Nenhum pedido entregue ou cancelado no histórico." : "Nenhum pedido ativo no momento."}</p> : <div className={styles.orderList}>{visibleOrders.map((order) => <OrderCard order={order} key={order.id} />)}</div>}
    </section>
    <Link className={styles.backLink} href="/minha-conta">← Voltar para Minha Conta</Link>
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
