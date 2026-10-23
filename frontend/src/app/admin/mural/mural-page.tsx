"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { apiClient } from "@/lib/api";
import type { ApiAchievement, ApiItem, ApiMilestone, ApiModality } from "@/lib/api-types";
import { AdminIcon, AdminPageHeading, AdminToolbarSearch } from "../admin-shell";
import shared from "../admin.module.css";
import styles from "../manage.module.css";

type Tab = "achievements" | "history";
type AchievementDraft = { id?: number; title: string; competition: string; placement: string; year: number; description: string; modalityId: string };
type MilestoneDraft = { id?: number; title: string; year: number; description: string; order: number };

export function AdminMuralPage() {
  const [tab, setTab] = useState<Tab>("achievements");
  const [achievements, setAchievements] = useState<ApiAchievement[]>([]);
  const [milestones, setMilestones] = useState<ApiMilestone[]>([]);
  const [modalities, setModalities] = useState<ApiModality[]>([]);
  const [query, setQuery] = useState("");
  const [achievementDraft, setAchievementDraft] = useState<AchievementDraft | null>(null);
  const [milestoneDraft, setMilestoneDraft] = useState<MilestoneDraft | null>(null);
  const [deleting, setDeleting] = useState<{ type: Tab; id: number; title: string } | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => { void Promise.all([apiClient<ApiItem<ApiAchievement[]>>("/admin/achievements", { auth: true }), apiClient<ApiItem<ApiMilestone[]>>("/admin/history", { auth: true }), apiClient<ApiItem<ApiModality[]>>("/admin/modalities", { auth: true })]).then(([achievementResponse, historyResponse, modalityResponse]) => { setAchievements(achievementResponse.data); setMilestones(historyResponse.data); setModalities(modalityResponse.data); }).catch((reason) => setMessage(reason instanceof Error ? reason.message : "Não foi possível carregar o mural.")); }, []);

  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const visibleAchievements = useMemo(() => achievements.filter((item) => `${item.titulo} ${item.campeonato} ${item.colocacao} ${item.ano}`.toLocaleLowerCase("pt-BR").includes(normalizedQuery)), [achievements, normalizedQuery]);
  const visibleMilestones = useMemo(() => milestones.filter((item) => `${item.titulo} ${item.descricao ?? ""} ${item.ano}`.toLocaleLowerCase("pt-BR").includes(normalizedQuery)), [milestones, normalizedQuery]);

  async function saveAchievement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!achievementDraft) return;
    try {
      const response = await apiClient<ApiItem<ApiAchievement>>(`/admin/achievements${achievementDraft.id ? `/${achievementDraft.id}` : ""}`, { method: achievementDraft.id ? "PUT" : "POST", auth: true, body: JSON.stringify({ title: achievementDraft.title, competition: achievementDraft.competition, placement: achievementDraft.placement, year: achievementDraft.year, description: achievementDraft.description || null, modalityId: achievementDraft.modalityId ? Number(achievementDraft.modalityId) : null }) });
      setAchievements((items) => achievementDraft.id ? items.map((item) => item.id === achievementDraft.id ? response.data : item) : [response.data, ...items]); setAchievementDraft(null); setMessage("Conquista salva e publicada no mural.");
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Não foi possível salvar a conquista."); }
  }

  async function saveMilestone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!milestoneDraft) return;
    try {
      const response = await apiClient<ApiItem<ApiMilestone>>(`/admin/history${milestoneDraft.id ? `/${milestoneDraft.id}` : ""}`, { method: milestoneDraft.id ? "PUT" : "POST", auth: true, body: JSON.stringify({ title: milestoneDraft.title, year: milestoneDraft.year, description: milestoneDraft.description || null, order: milestoneDraft.order }) });
      setMilestones((items) => (milestoneDraft.id ? items.map((item) => item.id === milestoneDraft.id ? response.data : item) : [...items, response.data]).sort((a, b) => a.ordem - b.ordem || a.ano - b.ano)); setMilestoneDraft(null); setMessage("Marco histórico salvo e publicado no mural.");
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Não foi possível salvar o marco histórico."); }
  }

  async function remove() {
    if (!deleting) return;
    const path = deleting.type === "achievements" ? "achievements" : "history";
    try {
      await apiClient<void>(`/admin/${path}/${deleting.id}`, { method: "DELETE", auth: true });
      if (deleting.type === "achievements") setAchievements((items) => items.filter((item) => item.id !== deleting.id)); else setMilestones((items) => items.filter((item) => item.id !== deleting.id));
      setDeleting(null); setMessage("Registro removido do mural.");
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Não foi possível remover o registro."); }
  }

  function openAchievement(item?: ApiAchievement) { setAchievementDraft(item ? { id: item.id, title: item.titulo, competition: item.campeonato, placement: item.colocacao, year: item.ano, description: item.descricao ?? "", modalityId: item.modalidadeId ? String(item.modalidadeId) : "" } : { title: "", competition: "", placement: "", year: new Date().getFullYear(), description: "", modalityId: "" }); }
  function openMilestone(item?: ApiMilestone) { setMilestoneDraft(item ? { id: item.id, title: item.titulo, year: item.ano, description: item.descricao ?? "", order: item.ordem } : { title: "", year: new Date().getFullYear(), description: "", order: milestones.length }); }

  return <>
    <AdminToolbarSearch><label className={shared.search}><AdminIcon name="search" /><span className={shared.srOnly}>Buscar no mural</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar no mural..." /></label></AdminToolbarSearch>
    <div className={shared.content}><AdminPageHeading title="Mural" /><p className={shared.demoNotice}>Conquistas e história integradas ao site público</p>
      <div className={styles.tabs} role="tablist"><button className={tab === "achievements" ? styles.activeTab : ""} type="button" role="tab" aria-selected={tab === "achievements"} onClick={() => setTab("achievements")}>Conquistas</button><button className={tab === "history" ? styles.activeTab : ""} type="button" role="tab" aria-selected={tab === "history"} onClick={() => setTab("history")}>História</button></div>
      <div className={styles.toolbar}><span className={styles.badge}>{tab === "achievements" ? visibleAchievements.length : visibleMilestones.length} registros</span><button className={styles.newButton} type="button" onClick={() => tab === "achievements" ? openAchievement() : openMilestone()}>{tab === "achievements" ? "Nova conquista" : "Novo marco"}</button></div>
      {message && <p className={styles.message} role="status">{message}</p>}
      <div className={styles.cards}>{tab === "achievements" ? visibleAchievements.map((item) => <article className={styles.card} key={item.id}><h2>{item.titulo}</h2><p>{item.campeonato} · {item.colocacao}</p><p>{item.descricao || "Sem descrição."}</p><div className={styles.cardMeta}><span className={styles.badge}>{item.ano}</span>{item.modalidade && <span className={styles.badge}>{item.modalidade.nome}</span>}</div><div className={styles.rowActions}><button type="button" onClick={() => openAchievement(item)}>Editar</button><button type="button" onClick={() => setDeleting({ type: "achievements", id: item.id, title: item.titulo })}>Excluir</button></div></article>) : visibleMilestones.map((item) => <article className={styles.card} key={item.id}><h2>{item.titulo}</h2><p>{item.descricao || "Sem descrição."}</p><div className={styles.cardMeta}><span className={styles.badge}>{item.ano}</span><span className={styles.badge}>Ordem {item.ordem}</span></div><div className={styles.rowActions}><button type="button" onClick={() => openMilestone(item)}>Editar</button><button type="button" onClick={() => setDeleting({ type: "history", id: item.id, title: item.titulo })}>Excluir</button></div></article>)}</div>
      {(tab === "achievements" ? visibleAchievements.length : visibleMilestones.length) === 0 && <p className={styles.empty}>Nenhum registro encontrado.</p>}
    </div>
    {achievementDraft && <div className={styles.overlay}><section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="achievement-title"><div className={styles.dialogHeader}><h2 id="achievement-title">{achievementDraft.id ? "Editar conquista" : "Nova conquista"}</h2><button type="button" aria-label="Fechar" onClick={() => setAchievementDraft(null)}>×</button></div><form className={styles.form} onSubmit={saveAchievement}><label>Título<input autoFocus required minLength={2} maxLength={150} value={achievementDraft.title} onChange={(event) => setAchievementDraft({ ...achievementDraft, title: event.target.value })} /></label><div className={styles.formRow}><label>Campeonato<input required minLength={2} maxLength={150} value={achievementDraft.competition} onChange={(event) => setAchievementDraft({ ...achievementDraft, competition: event.target.value })} /></label><label>Colocação<input required maxLength={40} value={achievementDraft.placement} onChange={(event) => setAchievementDraft({ ...achievementDraft, placement: event.target.value })} /></label></div><div className={styles.formRow}><label>Ano<input type="number" min={2000} max={2100} required value={achievementDraft.year} onChange={(event) => setAchievementDraft({ ...achievementDraft, year: Number(event.target.value) })} /></label><label>Modalidade<select value={achievementDraft.modalityId} onChange={(event) => setAchievementDraft({ ...achievementDraft, modalityId: event.target.value })}><option value="">Geral</option>{modalities.map((item) => <option value={item.id} key={item.id}>{item.nome}</option>)}</select></label></div><label>Descrição<textarea maxLength={50000} value={achievementDraft.description} onChange={(event) => setAchievementDraft({ ...achievementDraft, description: event.target.value })} /></label><div className={styles.dialogActions}><button className={styles.cancel} type="button" onClick={() => setAchievementDraft(null)}>Cancelar</button><button className={styles.primary} type="submit">Salvar conquista</button></div></form></section></div>}
    {milestoneDraft && <div className={styles.overlay}><section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="milestone-title"><div className={styles.dialogHeader}><h2 id="milestone-title">{milestoneDraft.id ? "Editar marco" : "Novo marco"}</h2><button type="button" aria-label="Fechar" onClick={() => setMilestoneDraft(null)}>×</button></div><form className={styles.form} onSubmit={saveMilestone}><label>Título<input autoFocus required minLength={2} maxLength={150} value={milestoneDraft.title} onChange={(event) => setMilestoneDraft({ ...milestoneDraft, title: event.target.value })} /></label><div className={styles.formRow}><label>Ano<input type="number" min={2000} max={2100} required value={milestoneDraft.year} onChange={(event) => setMilestoneDraft({ ...milestoneDraft, year: Number(event.target.value) })} /></label><label>Ordem de exibição<input type="number" required value={milestoneDraft.order} onChange={(event) => setMilestoneDraft({ ...milestoneDraft, order: Number(event.target.value) })} /></label></div><label>Descrição<textarea maxLength={50000} value={milestoneDraft.description} onChange={(event) => setMilestoneDraft({ ...milestoneDraft, description: event.target.value })} /></label><div className={styles.dialogActions}><button className={styles.cancel} type="button" onClick={() => setMilestoneDraft(null)}>Cancelar</button><button className={styles.primary} type="submit">Salvar marco</button></div></form></section></div>}
    {deleting && <div className={styles.overlay}><section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="delete-mural-title"><div className={styles.dialogHeader}><h2 id="delete-mural-title">Excluir registro?</h2><button type="button" aria-label="Fechar" onClick={() => setDeleting(null)}>×</button></div><p>Remover <strong>{deleting.title}</strong> do mural público?</p><div className={styles.dialogActions}><button className={styles.cancel} type="button" onClick={() => setDeleting(null)}>Cancelar</button><button className={styles.danger} type="button" onClick={() => void remove()}>Excluir</button></div></section></div>}
  </>;
}
