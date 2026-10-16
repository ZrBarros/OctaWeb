"use client";

import { useEffect, useState } from "react";
import { AdminIcon, AdminPageHeading, AdminToolbarSearch } from "../admin-shell";
import { adminOrders, orderStatuses, orderTotalCents, type AdminOrder, type OrderStatus } from "@/data/admin-orders";
import shared from "../admin.module.css";
import styles from "./page.module.css";

const filters: { label: string; status: OrderStatus | "Todos" }[] = [
  { label: "Todos", status: "Todos" },
  { label: "Pendente", status: "Pendente" },
  { label: "Confirmado", status: "Confirmado" },
  { label: "Em separação", status: "Em separação" },
  { label: "Disponível para retirada", status: "Disponível para retirada" },
  { label: "Entregue", status: "Entregue" },
  { label: "Cancelado", status: "Cancelado" },
];

const statusDescriptions: Record<OrderStatus, string> = {
  Pendente: "Aguardando confirmação de pagamento",
  Confirmado: "Pagamento recebido",
  "Em separação": "Preparando no estoque da atlética",
  "Disponível para retirada": "Pronto na quadra/diretoria",
  Entregue: "Retirado pelo acadêmico",
  Cancelado: "Pedido cancelado",
};

const statusIcons: Record<OrderStatus, string> = {
  Pendente: "◷", Confirmado: "✓", "Em separação": "▣", "Disponível para retirada": "◇", Entregue: "◎", Cancelado: "⊗",
};

const formatDate = (date: string) => date.split("-").reverse().join("/");
const formatPrice = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
const statusClass = (status: OrderStatus) => status === "Em separação" ? styles.separation : status === "Disponível para retirada" ? styles.pickup : styles[status.toLocaleLowerCase("pt-BR")];

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>(adminOrders);
  const [filter, setFilter] = useState<OrderStatus | "Todos">("Todos");
  const [query, setQuery] = useState("");
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<OrderStatus>("Pendente");
  const [message, setMessage] = useState("");
  const selectedOrder = orders.find((order) => order.number === selectedNumber);
  const visibleOrders = orders.filter((order) => {
    const matchesStatus = filter === "Todos" || order.status === filter;
    const matchesSearch = `${order.number} ${order.customer}`.toLocaleLowerCase("pt-BR").includes(query.trim().toLocaleLowerCase("pt-BR"));
    return matchesStatus && matchesSearch;
  });

  function manageOrder(order: AdminOrder) {
    setSelectedNumber(order.number);
    setDraftStatus(order.status);
    setMessage("");
  }

  function saveStatus() {
    if (!selectedOrder || selectedOrder.status === draftStatus) return;
    setOrders((current) => current.map((order) => order.number === selectedOrder.number ? { ...order, status: draftStatus } : order));
    setMessage(`Status do pedido #${selectedOrder.number} alterado apenas nesta prévia. Nenhum cliente foi avisado.`);
    setSelectedNumber(null);
  }

  useEffect(() => {
    if (!selectedOrder) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedNumber(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [selectedOrder]);

  return <>
    <AdminToolbarSearch><label className={shared.search}><AdminIcon name="search" /><span className={shared.srOnly}>Buscar pedido por número ou cliente</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar pedidos..." /></label></AdminToolbarSearch>
    <div className={shared.content}>
      <AdminPageHeading title="Gerenciador de Pedidos" role="Financeiro" />
      <p className={shared.demoNotice}>Prévia demonstrativa · pedidos fictícios e alterações temporárias</p>
      {message && <p className={styles.message} role="status">{message}</p>}
      <div className={styles.toolbar}>
        <div className={styles.filters} role="group" aria-label="Filtrar pedidos por status">
          {filters.map((item) => <button key={item.status} type="button" className={filter === item.status ? styles.activeFilter : styles.filter} aria-pressed={filter === item.status} onClick={() => setFilter(item.status)}>{item.label}</button>)}
        </div>
        <label className={styles.mobileFilter}>
          <span>Filtrar pedidos</span>
          <select value={filter} onChange={(event) => setFilter(event.target.value as OrderStatus | "Todos")}>
            {filters.map((item) => <option key={item.status} value={item.status}>{item.label}</option>)}
          </select>
        </label>
      </div>
      {(filter !== "Todos" || query) && <p className={styles.count}>{visibleOrders.length} {visibleOrders.length === 1 ? "pedido encontrado" : "pedidos encontrados"}<button type="button" onClick={() => { setFilter("Todos"); setQuery(""); }}>Limpar filtros</button></p>}
      <div className={styles.layout}>
        <section className={styles.tablePanel} aria-label="Pedidos demonstrativos">
          <p className={styles.scrollHint}>Deslize a tabela para ver status e ações →</p>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead><tr><th>Pedido</th><th>Cliente</th><th>Data</th><th>Total</th><th>Status</th><th>Ações</th></tr></thead>
              <tbody>{visibleOrders.map((order) => <tr key={order.number}>
                <td className={styles.orderNumber}>#{order.number}</td>
                <td>{order.customer}</td>
                <td><time dateTime={order.date}>{formatDate(order.date)}</time></td>
                <td className={styles.total}>{formatPrice(orderTotalCents(order))}</td>
                <td><span className={`${styles.status} ${statusClass(order.status)}`}>{order.status}</span></td>
                <td><button className={styles.manage} type="button" onClick={() => manageOrder(order)} aria-label={`Gerenciar pedido #${order.number} de ${order.customer}`}>Gerenciar</button></td>
              </tr>)}</tbody>
            </table>
            {visibleOrders.length === 0 && <p className={styles.empty}>Nenhum pedido encontrado. Tente outra busca ou status.</p>}
          </div>
        </section>

        <section className={styles.mobileOrders} aria-label="Pedidos demonstrativos em cartões">
          {visibleOrders.length === 0 ? <p className={styles.mobileEmpty}>Nenhum pedido encontrado. Tente outra busca ou status.</p> : visibleOrders.map((order) => <article className={styles.orderCard} key={order.number}>
            <div className={styles.cardHeader}><strong>Pedido #{order.number}</strong><span className={`${styles.status} ${statusClass(order.status)}`}>{order.status}</span></div>
            <p className={styles.cardCustomer}>{order.customer}</p>
            <div className={styles.cardFacts}><span>Data <strong><time dateTime={order.date}>{formatDate(order.date)}</time></strong></span><span>Total <strong>{formatPrice(orderTotalCents(order))}</strong></span></div>
            <button type="button" onClick={() => manageOrder(order)} aria-label={`Gerenciar pedido #${order.number} de ${order.customer}`}>Gerenciar pedido <span aria-hidden="true">→</span></button>
          </article>)}
        </section>
      </div>
    </div>

    {selectedOrder && <div className={styles.overlay} onClick={(event) => { if (event.target === event.currentTarget) setSelectedNumber(null); }}>
      <section className={styles.orderDialog} role="dialog" aria-modal="true" aria-labelledby="order-dialog-title">
        <div className={styles.dialogHeader}>
          <div><p>Gerenciar pedido</p><h2 id="order-dialog-title">Pedido #{selectedOrder.number}</h2></div>
          <button type="button" aria-label="Fechar edição do pedido" onClick={() => setSelectedNumber(null)}>×</button>
        </div>
        <p className={styles.dialogCustomer}>{selectedOrder.customer} · {formatDate(selectedOrder.date)}</p>
        <div className={styles.editGrid}>
          <section className={styles.orderDetails} aria-labelledby="order-items-title">
            <h3 id="order-items-title">Itens do pedido</h3>
            <ul className={styles.itemList}>{selectedOrder.items.map((item, index) => <li key={`${selectedOrder.number}-${index}`}>
              <div><strong>{item.name}</strong><small>{item.detail ? `${item.detail} · ` : ""}Quantidade: {item.quantity}</small></div>
              <span>{formatPrice(item.quantity * item.unitPriceCents)}</span>
            </li>)}</ul>
            <div className={styles.detailsTotal}><span>Total do pedido</span><strong>{formatPrice(orderTotalCents(selectedOrder))}</strong></div>
          </section>
          <section className={styles.statusPanel} aria-labelledby="status-panel-title">
            <h3 id="status-panel-title">Status do pedido</h3>
            <p className={styles.editing}>Escolha a nova etapa deste pedido.</p>
            <fieldset className={styles.statusOptions}><legend className={shared.srOnly}>Novo status do pedido</legend>
              {orderStatuses.map((status) => <label key={status} className={draftStatus === status ? styles.selectedOption : styles.option}>
                <input type="radio" name="order-status" value={status} checked={draftStatus === status} onChange={() => setDraftStatus(status)} />
                <span className={styles.statusIcon} aria-hidden="true">{statusIcons[status]}</span>
                <span><strong>{status}</strong><small>{statusDescriptions[status]}</small></span>
              </label>)}
            </fieldset>
          </section>
        </div>
        <div className={styles.dialogActions}>
          <button className={styles.cancelButton} type="button" onClick={() => setSelectedNumber(null)}>Cancelar</button>
          <button className={styles.saveButton} type="button" disabled={draftStatus === selectedOrder.status} onClick={saveStatus}>Salvar novo status</button>
        </div>
      </section>
    </div>}
  </>;
}
