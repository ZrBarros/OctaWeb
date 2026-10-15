"use client";

import { useState } from "react";
import { adminActivities, adminMetrics, demoSales } from "@/data/admin";
import { AdminIcon, AdminPageHeading, AdminToolbarSearch } from "./admin-shell";
import styles from "./admin.module.css";

export function AdminDashboard() {
  const [query, setQuery] = useState("");
  const activities = adminActivities.filter((activity) => `${activity.description} ${activity.person}`.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")));

  return <>
    <AdminToolbarSearch><label className={styles.search}><AdminIcon name="search" /><span className={styles.srOnly}>Buscar nas atividades recentes</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar atividades..." /></label></AdminToolbarSearch>

    <div className={styles.content}>
      <AdminPageHeading title="Visão Geral do Reino" />
      <p className={styles.demoNotice}>Prévia demonstrativa · acesso livre e dados fictícios</p>

      <section className={styles.metricGrid} aria-label="Indicadores de exemplo">
        {adminMetrics.map((metric) => <article className={styles.metricCard} key={metric.label}>
          <div className={styles.metricTop}><h2>{metric.label}</h2><span className={styles[metric.tone]}><AdminIcon name={metric.icon} /></span></div>
          <strong className={styles.metricValue}>{metric.value}</strong>
          <p>{metric.detail}</p>
        </article>)}
      </section>

      <div className={styles.dashboardGrid}>
        <section className={styles.panel} aria-labelledby="sales-title">
          <div className={styles.panelHeader}><h2 id="sales-title">Desempenho de Vendas (Octa Store)</h2><span>Últimos 6 meses</span></div>
          <div className={styles.chart} role="img" aria-label="Valores de exemplo: janeiro R$ 450, fevereiro R$ 800, março R$ 650, abril R$ 1.000, maio R$ 750, junho R$ 1.400">
            {demoSales.map((sale) => <div className={styles.barGroup} key={sale.month}>
              <span className={styles.barValue}>R$ {sale.amount.toLocaleString("pt-BR")}</span>
              <span className={styles.bar} style={{ height: `${Math.round(sale.amount / 1400 * 100)}%` }} />
              <span className={styles.barMonth}>{sale.month}</span>
            </div>)}
          </div>
        </section>

        <section className={styles.panel} aria-labelledby="activity-title">
          <div className={styles.panelHeader}><h2 id="activity-title">Atividades Recentes</h2></div>
          <ul className={styles.activityList}>
            {activities.map((activity) => <li key={activity.description}>
              <p>{activity.description}</p>
              <small><span>{activity.person}</span><span>{activity.time}</span></small>
            </li>)}
          </ul>
          {activities.length === 0 && <p className={styles.emptyState}>Nenhuma atividade encontrada.</p>}
        </section>
      </div>
    </div>
  </>;
}
