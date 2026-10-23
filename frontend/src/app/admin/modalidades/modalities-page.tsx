"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { apiClient, uploadImage } from "@/lib/api";
import type { ApiItem, ApiModality } from "@/lib/api-types";
import { AdminIcon, AdminPageHeading, AdminToolbarSearch } from "../admin-shell";
import shared from "../admin.module.css";
import styles from "../manage.module.css";

type ScheduleDraft = { dayOfWeek: number; startTime: string; endTime: string };
type Draft = { id?: number; name: string; description: string; responsible: string; trainingPlace: string; imageUrl: string; schedules: ScheduleDraft[] };
const days = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const emptyDraft = (): Draft => ({ name: "", description: "", responsible: "", trainingPlace: "", imageUrl: "", schedules: [] });
const apiTime = (value: string) => value.includes("T") ? new Date(value).toISOString().slice(11, 16) : value.slice(0, 5);

export function AdminModalitiesPage() {
  const [items, setItems] = useState<ApiModality[]>([]);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [deleting, setDeleting] = useState<ApiModality | null>(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => { void apiClient<ApiItem<ApiModality[]>>("/admin/modalities", { auth: true }).then((response) => setItems(response.data)).catch((reason) => setMessage(reason instanceof Error ? reason.message : "Não foi possível carregar as modalidades.")); }, []);
  const filtered = useMemo(() => items.filter((item) => `${item.nome} ${item.responsavel ?? ""} ${item.localTreino ?? ""}`.toLocaleLowerCase("pt-BR").includes(query.trim().toLocaleLowerCase("pt-BR"))), [items, query]);

  function edit(item: ApiModality) {
    setDraft({ id: item.id, name: item.nome, description: item.descricao ?? "", responsible: item.responsavel ?? "", trainingPlace: item.localTreino ?? "", imageUrl: item.imagemUrl ?? "", schedules: item.horarios.map((schedule) => ({ dayOfWeek: schedule.diaSemana, startTime: apiTime(schedule.horaInicio), endTime: schedule.horaFim ? apiTime(schedule.horaFim) : "" })) });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!draft) return;
    try {
      const response = await apiClient<ApiItem<ApiModality>>(`/admin/modalities${draft.id ? `/${draft.id}` : ""}`, { method: draft.id ? "PUT" : "POST", auth: true, body: JSON.stringify({ name: draft.name, description: draft.description || null, responsible: draft.responsible || null, trainingPlace: draft.trainingPlace || null, imageUrl: draft.imageUrl || null, schedules: draft.schedules.map((item) => ({ ...item, endTime: item.endTime || null })) }) });
      setItems((current) => draft.id ? current.map((item) => item.id === draft.id ? response.data : item) : [...current, response.data].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")));
      setDraft(null); setMessage(draft.id ? "Modalidade atualizada." : "Modalidade cadastrada.");
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Não foi possível salvar a modalidade."); }
  }

  async function remove() {
    if (!deleting) return;
    try { await apiClient<void>(`/admin/modalities/${deleting.id}`, { method: "DELETE", auth: true }); setItems((current) => current.filter((item) => item.id !== deleting.id)); setDeleting(null); setMessage("Modalidade excluída."); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : "Não foi possível excluir a modalidade."); }
  }

  async function selectImage(file?: File) {
    if (!file || !draft) return;
    setUploading(true);
    try { const url = await uploadImage(file); setDraft((current) => current ? { ...current, imageUrl: url } : current); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : "Não foi possível enviar a imagem."); }
    finally { setUploading(false); }
  }

  return <>
    <AdminToolbarSearch><label className={shared.search}><AdminIcon name="search" /><span className={shared.srOnly}>Buscar modalidades</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar modalidades..." /></label></AdminToolbarSearch>
    <div className={shared.content}><AdminPageHeading title="Modalidades" /><p className={shared.demoNotice}>Modalidades e horários integrados ao site</p>
      <div className={styles.toolbar}><span className={styles.badge}>{filtered.length} modalidades</span><button className={styles.newButton} type="button" onClick={() => setDraft(emptyDraft())}>Nova modalidade</button></div>
      {message && <p className={styles.message} role="status">{message}</p>}
      <div className={styles.cards}>{filtered.map((item) => <article className={styles.card} key={item.id}><h2>{item.nome}</h2><p>{item.descricao || "Sem descrição."}</p><p><strong>Responsável:</strong> {item.responsavel || "Não informado"}</p><p><strong>Treino:</strong> {item.localTreino || "Local não informado"}</p><div className={styles.cardMeta}>{item.horarios.map((schedule) => <span className={styles.badge} key={schedule.id}>{days[schedule.diaSemana]} {apiTime(schedule.horaInicio)}</span>)}</div><div className={styles.rowActions}><button type="button" onClick={() => edit(item)}>Editar</button><button type="button" onClick={() => setDeleting(item)}>Excluir</button></div></article>)}</div>
      {filtered.length === 0 && <p className={styles.empty}>Nenhuma modalidade encontrada.</p>}
    </div>
    {draft && <div className={styles.overlay}><section className={`${styles.dialog} ${styles.dialogWide}`} role="dialog" aria-modal="true" aria-labelledby="modality-title"><div className={styles.dialogHeader}><h2 id="modality-title">{draft.id ? "Editar modalidade" : "Nova modalidade"}</h2><button type="button" aria-label="Fechar" onClick={() => setDraft(null)}>×</button></div><form className={styles.form} onSubmit={save}>
      <div className={styles.formRow}><label>Nome<input autoFocus required minLength={2} maxLength={80} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label><label>Responsável<input maxLength={120} value={draft.responsible} onChange={(event) => setDraft({ ...draft, responsible: event.target.value })} /></label></div>
      <label>Descrição<textarea maxLength={10000} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
      <label>Local de treino<input maxLength={150} value={draft.trainingPlace} onChange={(event) => setDraft({ ...draft, trainingPlace: event.target.value })} /></label>
      <label>Imagem<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(event) => void selectImage(event.target.files?.[0])} /><small>{uploading ? "Enviando..." : draft.imageUrl ? "Imagem armazenada na API." : "JPG, PNG ou WebP de até 2 MB."}</small></label>
      <div className={styles.scheduleList}><strong>Horários de treino</strong>{draft.schedules.map((schedule, index) => <div className={styles.scheduleRow} key={`${index}-${schedule.dayOfWeek}`}><select aria-label="Dia da semana" value={schedule.dayOfWeek} onChange={(event) => setDraft({ ...draft, schedules: draft.schedules.map((item, itemIndex) => itemIndex === index ? { ...item, dayOfWeek: Number(event.target.value) } : item) })}>{days.map((day, dayIndex) => <option value={dayIndex} key={day}>{day}</option>)}</select><input aria-label="Início" type="time" required value={schedule.startTime} onChange={(event) => setDraft({ ...draft, schedules: draft.schedules.map((item, itemIndex) => itemIndex === index ? { ...item, startTime: event.target.value } : item) })} /><input aria-label="Fim" type="time" value={schedule.endTime} onChange={(event) => setDraft({ ...draft, schedules: draft.schedules.map((item, itemIndex) => itemIndex === index ? { ...item, endTime: event.target.value } : item) })} /><button type="button" aria-label="Remover horário" onClick={() => setDraft({ ...draft, schedules: draft.schedules.filter((_, itemIndex) => itemIndex !== index) })}>×</button></div>)}<button className={styles.secondary} type="button" onClick={() => setDraft({ ...draft, schedules: [...draft.schedules, { dayOfWeek: 1, startTime: "18:00", endTime: "19:00" }] })}>Adicionar horário</button></div>
      <div className={styles.dialogActions}><button className={styles.cancel} type="button" onClick={() => setDraft(null)}>Cancelar</button><button className={styles.primary} type="submit" disabled={uploading}>Salvar modalidade</button></div>
    </form></section></div>}
    {deleting && <div className={styles.overlay}><section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="delete-modality-title"><div className={styles.dialogHeader}><h2 id="delete-modality-title">Excluir modalidade?</h2><button type="button" aria-label="Fechar" onClick={() => setDeleting(null)}>×</button></div><p>Excluir <strong>{deleting.nome}</strong>? Vínculos existentes podem impedir a operação.</p><div className={styles.dialogActions}><button className={styles.cancel} type="button" onClick={() => setDeleting(null)}>Cancelar</button><button className={styles.danger} type="button" onClick={() => void remove()}>Excluir modalidade</button></div></section></div>}
  </>;
}
