"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import { AdminIcon, AdminPageHeading, AdminToolbarSearch } from "../admin-shell";
import { adminEventCategories, type AdminEvent } from "@/data/admin-events";
import { apiClient, uploadImage } from "@/lib/api";
import type { ApiEvent, ApiItem, ApiModality, ApiPage } from "@/lib/api-types";
import shared from "../admin.module.css";
import styles from "./page.module.css";

type EventDraft = Omit<AdminEvent, "id">;
const emptyDraft: EventDraft = { title: "", category: "Jogo", dateTime: "", description: "", place: "", modalityId: null };
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });
const eventTypeLabels: Record<string, string> = { EVENTO: "Outro", SELETIVA: "Seletiva", TREINO: "Treino", FESTA: "Festa", REUNIAO: "Reunião", JOGO: "Jogo", CAMPEONATO: "Campeonato" };

function eventDate(dateTime: string) { return new Date(`${dateTime}:00`); }
function formatEventDate(dateTime: string) { return `${dateFormatter.format(eventDate(dateTime))} · ${timeFormatter.format(eventDate(dateTime))}`; }
function monthTitle(date: Date) { const label = monthFormatter.format(date); return label.charAt(0).toLocaleUpperCase("pt-BR") + label.slice(1); }
function PencilIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" /><path d="m14 7 3 3" /></svg>; }
function TrashIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5" /></svg>; }
function PinIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>; }

export function AdminEventsPage() {
  const [items, setItems] = useState<AdminEvent[]>([]);
  const [modalities, setModalities] = useState<ApiModality[]>([]);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [month, setMonth] = useState(() => new Date(2026, 8, 1));
  const [draft, setDraft] = useState<EventDraft | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [imageError, setImageError] = useState("");
  const filtered = items.filter((item) => `${item.title} ${item.category} ${item.place} ${item.description}`.toLocaleLowerCase("pt-BR").includes(query.trim().toLocaleLowerCase("pt-BR"))).sort((a, b) => a.dateTime.localeCompare(b.dateTime));
  const deletingItem = items.find((item) => item.id === deletingId);
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const calendarDays = Array.from({ length: Math.ceil((firstDay + daysInMonth) / 7) * 7 }, (_, index) => index - firstDay + 1);

  useEffect(() => { void Promise.all([apiClient<ApiPage<ApiEvent>>("/admin/events?pageSize=100&sort=asc", { auth: true }), apiClient<ApiItem<ApiModality[]>>("/admin/modalities", { auth: true })]).then(([response, modalityResponse]) => { setModalities(modalityResponse.data); setItems(response.data.map((item) => ({ id: item.id, title: item.titulo, category: eventTypeLabels[item.tipo] ?? item.tipo, dateTime: item.dataHora.slice(0, 16), description: item.descricao ?? "", place: item.local, image: item.imagemUrl ?? undefined, modalityId: item.modalidadeId }))); }).catch((reason) => setMessage(reason instanceof Error ? reason.message : "Não foi possível carregar os eventos.")); }, []);

  function openEditor(item?: AdminEvent) {
    setEditingId(item?.id ?? null);
    setDraft(item ? { title: item.title, category: item.category, dateTime: item.dateTime, description: item.description, place: item.place, image: item.image, modalityId: item.modalityId } : { ...emptyDraft });
    setImageError("");
    setMessage("");
  }

  async function readImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setImageError("Escolha uma imagem JPG, PNG ou WebP."); return; }
    if (file.size > 2 * 1024 * 1024) { setImageError("A imagem deve ter no máximo 2 MB."); return; }
    setImageError("");
    try { const url = await uploadImage(file); setDraft((current) => current ? { ...current, image: url } : null); }
    catch (reason) { setImageError(reason instanceof Error ? reason.message : "Não foi possível enviar a imagem."); }
  }

  async function saveEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    const saved = { ...draft, title: draft.title.trim(), description: draft.description.trim(), place: draft.place.trim() };
    if (!saved.title || !saved.description || !saved.place || !saved.dateTime || Number.isNaN(eventDate(saved.dateTime).getTime())) return;
    const typeMap: Record<string, string> = { Jogo: "JOGO", Campeonato: "CAMPEONATO", Seletiva: "SELETIVA", Treino: "TREINO", Festa: "FESTA", Reunião: "REUNIAO", Outro: "EVENTO" };
    try {
      const response = await apiClient<ApiItem<ApiEvent>>(`/admin/events${editingId === null ? "" : `/${editingId}`}`, { method: editingId === null ? "POST" : "PUT", auth: true, body: JSON.stringify({ title: saved.title, type: typeMap[saved.category] ?? saved.category, dateTime: new Date(saved.dateTime).toISOString(), description: saved.description, place: saved.place, imageUrl: saved.image ?? null, modalityId: saved.modalityId ?? null }) });
      const item = response.data; const mapped = { id: item.id, title: item.titulo, category: eventTypeLabels[item.tipo] ?? item.tipo, dateTime: item.dataHora.slice(0, 16), description: item.descricao ?? "", place: item.local, image: item.imagemUrl ?? undefined, modalityId: item.modalidadeId };
      setItems((current) => editingId === null ? [...current, mapped] : current.map((old) => old.id === editingId ? mapped : old));
      setMessage(editingId === null ? "Evento criado e publicado na agenda." : "Evento atualizado.");
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Não foi possível salvar o evento."); return; }
    const savedDate = eventDate(saved.dateTime);
    setMonth(new Date(savedDate.getFullYear(), savedDate.getMonth(), 1));
    setDraft(null);
    setQuery("");
  }

  async function deleteEvent() {
    if (deletingId === null) return;
    try { await apiClient<void>(`/admin/events/${deletingId}`, { method: "DELETE", auth: true }); setItems((current) => current.filter((item) => item.id !== deletingId)); setMessage("Evento excluído."); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : "Não foi possível excluir o evento."); }
    setDeletingId(null);
  }

  return <>
    <AdminToolbarSearch><label className={shared.search}><AdminIcon name="search" /><span className={shared.srOnly}>Buscar eventos no painel</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar eventos..." /></label></AdminToolbarSearch>
    <div className={shared.content}>
      <AdminPageHeading title="Cronograma de Eventos" />
      <p className={shared.demoNotice}>Eventos integrados à agenda pública</p>
      {message && <p className={styles.message} role="status">{message}</p>}
      <div className={styles.toolbar}>
        <div className={styles.views} role="group" aria-label="Modo de visualização"><button type="button" className={view === "list" ? styles.selectedView : styles.viewButton} aria-pressed={view === "list"} onClick={() => setView("list")}>Lista Geral</button><button type="button" className={view === "calendar" ? styles.selectedView : styles.viewButton} aria-pressed={view === "calendar"} onClick={() => setView("calendar")}>Calendário Mensal</button></div>
        <button className={styles.newButton} type="button" onClick={() => openEditor()}>+ <span>Criar Evento</span></button>
      </div>
      {query && <p className={styles.resultCount}>{filtered.length} {filtered.length === 1 ? "evento encontrado" : "eventos encontrados"}<button type="button" onClick={() => setQuery("")}>Limpar busca</button></p>}

      {view === "list" ? <div className={styles.grid}>
        {filtered.map((item) => <article className={styles.card} key={item.id}>
          <div className={styles.cardImage}>{item.image ? <Image src={item.image} alt="" width={600} height={180} unoptimized={item.image.startsWith("data:")} /> : <div className={styles.imagePlaceholder}><AdminIcon name="events" /><span>Imagem do evento</span></div>}</div>
          <div className={styles.cardBody}>
            <div className={styles.cardMeta}><span className={styles.badge}>{item.category}</span><time dateTime={item.dateTime}>{formatEventDate(item.dateTime)}</time></div>
            <h2>{item.title}</h2><p>{item.description}</p><div className={styles.place}><PinIcon /> {item.place}</div>
            <div className={styles.cardActions}><button type="button" className={styles.editButton} onClick={() => openEditor(item)}><PencilIcon />Editar</button><button type="button" className={styles.deleteButton} onClick={() => setDeletingId(item.id)}><TrashIcon />Excluir</button></div>
          </div>
        </article>)}
        {filtered.length === 0 && <p className={styles.empty}>Nenhum evento encontrado. Tente outra busca ou crie um evento.</p>}
      </div> : <section className={styles.calendar} aria-label="Calendário mensal de eventos">
        <div className={styles.calendarHeader}><h2>{monthTitle(month)}</h2><div><button type="button" aria-label="Mês anterior" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>‹</button><button type="button" aria-label="Próximo mês" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>›</button></div></div>
        <div className={styles.calendarScroll}><div className={styles.calendarGrid}>
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => <strong className={styles.weekday} key={day}>{day}</strong>)}
          {calendarDays.map((day, index) => {
            const dayEvents = day > 0 && day <= daysInMonth ? filtered.filter((item) => { const date = eventDate(item.dateTime); return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth() && date.getDate() === day; }) : [];
            return <div className={day > 0 && day <= daysInMonth ? styles.calendarDay : styles.outsideDay} key={index}>{day > 0 && day <= daysInMonth && <><span>{day}</span>{dayEvents.map((item) => <button type="button" key={item.id} onClick={() => openEditor(item)} title={`Editar ${item.title}`}>{timeFormatter.format(eventDate(item.dateTime))} · {item.title}</button>)}</>}</div>;
          })}
        </div></div>
        {!filtered.some((item) => { const date = eventDate(item.dateTime); return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth(); }) && <p className={styles.calendarEmpty}>Nenhum evento neste mês.</p>}
      </section>}
    </div>

    {draft && <div className={styles.overlay}><section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="event-dialog-title">
      <div className={styles.dialogHeader}><h2 id="event-dialog-title">{editingId === null ? "Criar evento" : "Editar evento"}</h2><button type="button" aria-label="Fechar formulário" onClick={() => setDraft(null)}>×</button></div>
      <p>As alterações serão salvas no banco e refletidas na agenda pública.</p>
      <form className={styles.form} onSubmit={saveEvent}>
        <label>Título<input autoFocus required maxLength={120} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Nome do evento" /></label>
        <div className={styles.formRow}><label>Categoria<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>{adminEventCategories.map((category) => <option key={category}>{category}</option>)}</select></label><label>Data e hora<input required type="datetime-local" value={draft.dateTime} onChange={(event) => setDraft({ ...draft, dateTime: event.target.value })} /></label></div>
        <label>Modalidade vinculada<select value={draft.modalityId ?? ""} onChange={(event) => setDraft({ ...draft, modalityId: event.target.value ? Number(event.target.value) : null })}><option value="">Evento geral</option>{modalities.map((item) => <option value={item.id} key={item.id}>{item.nome}</option>)}</select></label>
        <label>Local<input required maxLength={100} value={draft.place} onChange={(event) => setDraft({ ...draft, place: event.target.value })} placeholder="Onde será o evento" /></label>
        <label>Descrição<textarea required maxLength={300} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Apresente o evento em poucas palavras" /></label>
        <label>Imagem do evento (opcional)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void readImage(event)} /><small>JPG, PNG ou WebP, até 2 MB.</small></label>
        {imageError && <span className={styles.imageError} role="alert">{imageError}</span>}
        {draft.image && <div className={styles.selectedImage}><Image src={draft.image} alt="Prévia da imagem do evento" width={160} height={90} unoptimized={draft.image.startsWith("data:")} /><button type="button" onClick={() => setDraft({ ...draft, image: undefined })}>Remover imagem</button></div>}
        <div className={styles.dialogActions}><button className={styles.cancelButton} type="button" onClick={() => setDraft(null)}>Cancelar</button><button className={styles.saveButton} type="submit">{editingId === null ? "Criar evento" : "Salvar alterações"}</button></div>
      </form>
    </section></div>}

    {deletingItem && <div className={styles.overlay}><section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="delete-event-title"><div className={styles.dialogHeader}><h2 id="delete-event-title">Excluir evento?</h2><button type="button" aria-label="Cancelar exclusão" onClick={() => setDeletingId(null)}>×</button></div><p>Remover “{deletingItem.title}”? A exclusão também afeta a agenda pública.</p><div className={styles.dialogActions}><button className={styles.cancelButton} type="button" onClick={() => setDeletingId(null)}>Cancelar</button><button className={styles.deleteConfirm} type="button" onClick={() => void deleteEvent()}>Excluir evento</button></div></section></div>}
  </>;
}
