"use client";

import { useState } from "react";
import Link from "next/link";
import { useApiData } from "@/lib/use-api";
import type { ApiItem } from "@/lib/api-types";
import { AdminIcon, AdminPageHeading, AdminToolbarSearch } from "./admin-shell";
import styles from "./admin.module.css";

export function AdminDashboard() {
  const { data: dashboard, loading, error } = useApiData<ApiItem<{ metrics: { users: number; products: number; pendingOrders: number; upcomingEvents: number; news: number }; sales: { month: string; amountCents: number }[]; activities: { description: string; person: string; time: string; category: string }[] }>>("/admin/dashboard", { data: { metrics: { users: 0, products: 0, pendingOrders: 0, upcomingEvents: 0, news: 0 }, sales: [], activities: [] } }, true);
  const adminMetrics = [
    { label: "Usuários cadastrados", value: String(dashboard.data.metrics.users), detail: "Contas no banco", tone: "orange", icon: "users", href: "/admin/usuarios", action: "Gerenciar usuários" },
    { label: "Produtos cadastrados", value: String(dashboard.data.metrics.products), detail: "Produtos ativos", tone: "purple", icon: "products", href: "/admin/produtos", action: "Ver produtos" },
    { label: "Pedidos pendentes", value: String(dashboard.data.metrics.pendingOrders), detail: "Requer atenção", tone: "orange", icon: "orders", href: "/admin/pedidos", action: "Ver pedidos" },
    { label: "Eventos próximos", value: String(dashboard.data.metrics.upcomingEvents), detail: "Dentro dos próximos 15 dias", tone: "mint", icon: "events", href: "/admin/eventos", action: "Ver eventos" },
    { label: "Notícias publicadas", value: String(dashboard.data.metrics.news), detail: "Registros publicados", tone: "white", icon: "news", href: "/admin/noticias", action: "Ver notícias" },
  ] as const;
  const demoSales = dashboard.data.sales.map((sale) => ({ month: new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(sale.month)).replace(".", ""), amount: sale.amountCents / 100 }));
  const adminActivities = dashboard.data.activities;
  const [query, setQuery] = useState("");
  const [activityCategory, setActivityCategory] = useState("Todas");
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [salesPeriod, setSalesPeriod] = useState<6 | 12>(6);
  const [selectedSale, setSelectedSale] = useState<(typeof demoSales)[number] | null>(null);
  const activityCategories = ["Todas", ...Array.from(new Set(adminActivities.map((activity) => activity.category)))];
  const filteredActivities = adminActivities.filter((activity) =>
    (activityCategory === "Todas" || activity.category === activityCategory) &&
    `${activity.description} ${activity.person}`.toLocaleLowerCase("pt-BR").includes(query.trim().toLocaleLowerCase("pt-BR")),
  );
  const activities = showAllActivities ? filteredActivities : filteredActivities.slice(0, 3);
  const sales = demoSales.slice(-salesPeriod);
  const maxSales = Math.max(1, ...sales.map((sale) => sale.amount));
  const formatSales = (amount: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(amount);

  return <>
    <AdminToolbarSearch><label className={styles.search}><AdminIcon name="search" /><span className={styles.srOnly}>Buscar nas atividades recentes</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar atividades..." /></label></AdminToolbarSearch>

    <div className={styles.content}>
      <AdminPageHeading title="Visão Geral do Reino" />
      <p className={styles.demoNotice}>{loading ? "Carregando indicadores..." : error || "Indicadores calculados a partir do banco"}</p>

      <section className={styles.metricGrid} aria-label="Indicadores de exemplo">
        {adminMetrics.map((metric) => <Link className={styles.metricCard} href={metric.href} aria-label={`${metric.label}: ${metric.value}. ${metric.action}.`} key={metric.label}>
          <div className={styles.metricTop}><h2>{metric.label}</h2><span className={styles[metric.tone]}><AdminIcon name={metric.icon} /></span></div>
          <strong className={styles.metricValue}>{metric.value}</strong>
          <p>{metric.detail}</p>
          <span className={styles.metricAction}>{metric.action} <span aria-hidden="true">→</span></span>
        </Link>)}
      </section>

      <div className={styles.dashboardGrid}>
        <section className={styles.panel} aria-labelledby="sales-title">
          <div className={styles.panelHeader}><h2 id="sales-title">Desempenho de Vendas (Octa Store)</h2>
            <label className={styles.chartPeriod}><span className={styles.srOnly}>Período do gráfico</span><select value={salesPeriod} onChange={(event) => { setSalesPeriod(Number(event.target.value) as 6 | 12); setSelectedSale(null); }}><option value={6}>6 meses</option><option value={12}>12 meses</option></select></label>
          </div>
          <div className={`${styles.chart} ${salesPeriod === 12 ? styles.chartTwelve : ""}`} aria-label={`Pedidos nos últimos ${salesPeriod} meses`}>
            {sales.map((sale) => <button className={`${styles.barGroup} ${selectedSale?.month === sale.month ? styles.selectedBar : ""}`} type="button" aria-label={`${sale.month}: ${formatSales(sale.amount)} em pedidos`} aria-pressed={selectedSale?.month === sale.month} onClick={() => setSelectedSale((current) => current?.month === sale.month ? null : sale)} key={sale.month}>
              <span className={styles.barValue}>{formatSales(sale.amount)}</span>
              <span className={styles.bar} style={{ height: `${Math.max(8, Math.round(sale.amount / maxSales * 100))}%` }} />
              <span className={styles.barMonth}>{sale.month}</span>
            </button>)}
          </div>
          <p className={styles.chartSelection} aria-live="polite">{selectedSale ? <><strong>{selectedSale.month}</strong> · {formatSales(selectedSale.amount)} em pedidos</> : "Selecione uma barra para ver o valor do mês."}</p>
        </section>

        <section className={styles.panel} aria-labelledby="activity-title">
          <div className={styles.panelHeader}><h2 id="activity-title">Atividades Recentes</h2><span>{filteredActivities.length} {filteredActivities.length === 1 ? "registro" : "registros"}</span></div>
          <label className={styles.activityFilter}><span>Filtrar por área</span><select value={activityCategory} onChange={(event) => { setActivityCategory(event.target.value); setShowAllActivities(false); }}>
            {activityCategories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select></label>
          <ul className={styles.activityList}>
            {activities.map((activity) => <li key={activity.description}>
              <p>{activity.description}</p>
              <small><span>{activity.person}</span><span>{activity.time}</span><span className={styles.activityCategory}>{activity.category}</span></small>
            </li>)}
          </ul>
          {filteredActivities.length === 0 && <p className={styles.emptyState}>Nenhuma atividade encontrada. Confira a busca ou o filtro.</p>}
          {filteredActivities.length > 3 && <button className={styles.showActivities} type="button" onClick={() => setShowAllActivities((visible) => !visible)}>{showAllActivities ? "Ver menos" : "Ver mais atividades"} <span aria-hidden="true">{showAllActivities ? "↑" : "↓"}</span></button>}
        </section>
      </div>
    </div>
  </>;
}
