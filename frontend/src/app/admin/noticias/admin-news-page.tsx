"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AdminIcon, AdminPageHeading, AdminToolbarSearch } from "../admin-shell";
import { adminNewsCategories, type AdminNewsItem, type AdminNewsCategory, type AdminNewsStatus } from "@/data/admin-news";
import { apiCategory } from "@/lib/api-mappers";
import { apiClient, uploadImage } from "@/lib/api";
import type { ApiItem, ApiNews, ApiPage } from "@/lib/api-types";
import shared from "../admin.module.css";
import styles from "./page.module.css";

type NewsDraft = Omit<AdminNewsItem, "id" | "date">;
const emptyDraft: NewsDraft = { title: "", summary: "", body: "", category: "Comunicados", author: "Diretoria Octacore", status: "Publicado", imageAlt: "" };
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const maxImageBytes = 2 * 1024 * 1024;

function PencilIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" /><path d="m14 7 3 3" /></svg>;
}

function TrashIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5" /></svg>;
}

export function AdminNewsPage() {
  const [items, setItems] = useState<AdminNewsItem[]>([]);
  const [filter, setFilter] = useState<"Todos" | AdminNewsCategory>("Todos");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<NewsDraft | null>(null);
  const [editorStep, setEditorStep] = useState<"edit" | "preview">("edit");
  const [imageError, setImageError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const availableFilters = ["Todos", ...adminNewsCategories.filter((category) => items.some((item) => item.category === category))] as const;
  const filteredItems = items.filter((item) => (filter === "Todos" || item.category === filter) && `${item.title} ${item.category} ${item.author}`.toLocaleLowerCase("pt-BR").includes(query.trim().toLocaleLowerCase("pt-BR")));
  const deletingItem = items.find((item) => item.id === deletingId);

  useEffect(() => { void apiClient<ApiPage<ApiNews>>("/admin/news?pageSize=100", { auth: true }).then((response) => setItems(response.data.map((item) => ({ id: item.id, title: item.titulo, summary: item.resumo ?? "", body: item.conteudo, category: ({ CAMPEONATOS: "Campeonatos", SELETIVAS: "Seletivas", JOGOS: "Jogos", RESULTADOS: "Resultados", COMUNICADOS: "Comunicados", TREINOS: "Treinos", FESTAS: "Festas", EVENTOS: "Eventos" } as Record<string, AdminNewsCategory>)[item.categoria] ?? "Comunicados", author: item.autor.nome, date: new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(item.criadoEm)), status: "Publicado", imageSrc: item.imagemCapaUrl ?? undefined, imageAlt: item.titulo })))).catch((reason) => setMessage(reason instanceof Error ? reason.message : "Não foi possível carregar as notícias.")); }, []);

  function closeEditor() {
    setDraft(null);
    setEditorStep("edit");
    setImageError("");
  }

  function openEditor(item?: AdminNewsItem) {
    setEditingId(item?.id ?? null);
    setDraft(item ? { title: item.title, summary: item.summary, body: item.body, category: item.category, author: item.author, status: item.status, imageSrc: item.imageSrc, imageAlt: item.imageAlt } : { ...emptyDraft });
    setEditorStep("edit");
    setImageError("");
    setMessage("");
  }

  async function readImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    if (!allowedImageTypes.includes(file.type)) {
      setImageError("Escolha uma imagem JPG, PNG ou WebP.");
      return;
    }
    if (file.size > maxImageBytes) {
      setImageError("A imagem deve ter no máximo 2 MB.");
      return;
    }
    setImageError("");
    try { const url = await uploadImage(file); setDraft((current) => current ? { ...current, imageSrc: url } : null); }
    catch (reason) { setImageError(reason instanceof Error ? reason.message : "Não foi possível enviar a imagem."); }
  }

  async function saveDraft() {
    if (!draft) return;
    const normalized: NewsDraft = { ...draft, title: draft.title.trim(), summary: draft.summary.trim(), body: draft.body.trim(), author: draft.author.trim(), imageAlt: draft.imageAlt.trim() };
    if (!normalized.title || !normalized.summary || !normalized.body || !normalized.author || (normalized.imageSrc && !normalized.imageAlt)) return;
    try {
      const response = await apiClient<ApiItem<ApiNews>>(`/admin/news${editingId === null ? "" : `/${editingId}`}`, { method: editingId === null ? "POST" : "PUT", auth: true, body: JSON.stringify({ title: normalized.title, summary: normalized.summary, content: normalized.body, category: apiCategory(normalized.category), imageUrl: normalized.imageSrc ?? null, status: "Publicado" }) });
      const item = response.data; const mapped: AdminNewsItem = { id: item.id, title: item.titulo, summary: item.resumo ?? "", body: item.conteudo, category: normalized.category, author: item.autor.nome, date: new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(item.criadoEm)), status: "Publicado", imageSrc: item.imagemCapaUrl ?? undefined, imageAlt: normalized.imageAlt };
      setItems((current) => editingId === null ? [mapped, ...current] : current.map((old) => old.id === editingId ? mapped : old));
      setMessage(editingId === null ? "Notícia publicada." : "Notícia atualizada.");
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Não foi possível salvar a notícia."); return; }
    closeEditor();
    setEditingId(null);
    setFilter(normalized.category);
    setQuery("");
  }

  async function deleteItem() {
    if (deletingId === null) return;
    try { await apiClient<void>(`/admin/news/${deletingId}`, { method: "DELETE", auth: true }); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : "Não foi possível excluir a notícia."); return; }
    const remaining = items.filter((item) => item.id !== deletingId);
    setItems(remaining);
    if (filter !== "Todos" && !remaining.some((item) => item.category === filter)) setFilter("Todos");
    setDeletingId(null);
    setMessage("Notícia excluída.");
  }

  return <>
    <AdminToolbarSearch><label className={shared.search}><AdminIcon name="search" /><span className={shared.srOnly}>Buscar notícias no painel</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar notícias..." /></label></AdminToolbarSearch>

    <div className={shared.content}>
      <AdminPageHeading title="Mural de Notícias" />
      <p className={shared.demoNotice}>Notícias publicadas no site</p>
      {message && <p className={styles.message} role="status">{message}</p>}

      <div className={styles.toolbar}>
        <div className={styles.filters} role="group" aria-label="Filtrar notícias por categoria">
          {availableFilters.map((category) => <button key={category} type="button" className={filter === category ? styles.selectedFilter : styles.filter} aria-pressed={filter === category} onClick={() => setFilter(category)}>{category}</button>)}
        </div>
        <label className={styles.mobileFilter}>
          <span>Filtrar por categoria</span>
          <select value={filter} onChange={(event) => setFilter(event.target.value as "Todos" | AdminNewsCategory)}>
            {availableFilters.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>
        <button className={styles.newButton} type="button" onClick={() => openEditor()}>＋ <span>Nova Notícia</span></button>
      </div>

      <div className={styles.resultBar}>
        <p role="status">{filteredItems.length} {filteredItems.length === 1 ? "notícia encontrada" : "notícias encontradas"}{filter !== "Todos" ? ` em ${filter}` : ""}{query.trim() ? ` para “${query.trim()}”` : ""}.</p>
        {(filter !== "Todos" || query) && <button type="button" onClick={() => { setFilter("Todos"); setQuery(""); }}>Limpar filtros</button>}
      </div>

      <div className={styles.tablePanel}>
        <div className={styles.tableScroll}>
          <table className={styles.newsTable}>
            <thead><tr><th scope="col">Título</th><th scope="col">Categoria</th><th scope="col">Autor</th><th scope="col">Data</th><th scope="col">Status</th><th scope="col">Ações</th></tr></thead>
            <tbody>{filteredItems.map((item) => <tr key={item.id}>
              <td className={styles.titleCell} data-label="Título">{item.title}</td>
              <td data-label="Categoria">{item.category}</td>
              <td data-label="Autor">{item.author}</td>
              <td className={styles.dateCell} data-label="Data">{item.date}</td>
              <td data-label="Status"><span className={item.status === "Publicado" ? styles.published : styles.draft}>{item.status}</span></td>
              <td data-label="Ações"><div className={styles.actions}>
                <button className={styles.editButton} type="button" aria-label={`Editar ${item.title}`} title="Editar" onClick={() => openEditor(item)}><PencilIcon /></button>
                <button className={styles.deleteButton} type="button" aria-label={`Excluir ${item.title}`} title="Excluir" onClick={() => setDeletingId(item.id)}><TrashIcon /></button>
              </div></td>
            </tr>)}</tbody>
          </table>
        </div>
        {filteredItems.length === 0 && <p className={styles.empty}>Nenhuma notícia corresponde aos filtros atuais. Use “Limpar filtros” para ver a lista completa.</p>}
      </div>
    </div>

    {draft && typeof document !== "undefined" && createPortal(<div className={styles.overlay} role="presentation">
      <section className={`${styles.dialog} ${styles.editorDialog}`} role="dialog" aria-modal="true" aria-labelledby="news-dialog-title" onKeyDown={(event) => { if (event.key === "Escape") closeEditor(); }}>
        <div className={styles.dialogHeader}><h2 id="news-dialog-title">{editorStep === "preview" ? "Prévia da notícia" : editingId === null ? "Nova notícia" : "Editar notícia"}</h2><button autoFocus type="button" aria-label="Fechar" onClick={closeEditor}>×</button></div>
        <p>Salvar publica a notícia no site. O schema atual não possui estado de rascunho.</p>

        {editorStep === "edit" ? <form onSubmit={(event) => { event.preventDefault(); setEditorStep("preview"); }} className={styles.form}>
          <label>Título<input required maxLength={160} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
          <label>Resumo<textarea required rows={3} maxLength={300} value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} placeholder="Uma apresentação curta da notícia" /></label>
          <label>Texto da notícia<textarea required rows={8} value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} placeholder="Escreva o conteúdo completo. Separe os parágrafos com uma linha em branco." /></label>
          <div className={styles.formRow}>
            <label>Categoria<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as AdminNewsCategory })}>{adminNewsCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
            <label>Status<select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as AdminNewsStatus })}><option>Publicado</option></select></label>
          </div>
          <label>Autor<input required readOnly value={draft.author} /><small>O autor será confirmado pela conta administrativa conectada.</small></label>
          <div className={styles.imageInput}>
            <label>Imagem de destaque (opcional)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void readImage(event)} /></label>
            <small>JPG, PNG ou WebP, até 2 MB.</small>
            <button className={styles.sampleImageButton} type="button" onClick={() => { setDraft({ ...draft, imageSrc: "/images/imagem-galeria.png", imageAlt: "Registro da galeria da Octacore" }); setImageError(""); }}>Usar imagem da galeria como exemplo</button>
            {imageError && <span className={styles.imageError} role="alert">{imageError}</span>}
            {draft.imageSrc && <div className={styles.selectedImage}>
              <Image src={draft.imageSrc} alt={draft.imageAlt || "Imagem selecionada para a notícia"} width={960} height={540} unoptimized />
              <button type="button" onClick={() => setDraft({ ...draft, imageSrc: undefined, imageAlt: "" })}>Remover imagem</button>
            </div>}
            {draft.imageSrc && <label>Descrição da imagem<input required value={draft.imageAlt} onChange={(event) => setDraft({ ...draft, imageAlt: event.target.value })} placeholder="Descreva o que aparece na imagem" /></label>}
          </div>
          <div className={styles.dialogActions}><button type="button" className={styles.cancelButton} onClick={closeEditor}>Cancelar</button><button type="submit" className={styles.saveButton}>Pré-visualizar</button></div>
        </form> : <>
          <article className={styles.articlePreview} aria-label="Prévia visual da notícia">
            <div className={styles.previewTop}><span className={styles.previewCategory}>{draft.category}</span><span className={styles.published}>{draft.status}</span></div>
            <h3>{draft.title.trim()}</h3>
            <div className={styles.previewMeta}>Por {draft.author.trim()} <span aria-hidden="true">•</span> {editingId === null ? "Hoje" : items.find((item) => item.id === editingId)?.date}</div>
            {draft.imageSrc ? <Image className={styles.previewImage} src={draft.imageSrc} alt={draft.imageAlt.trim()} width={960} height={540} unoptimized /> : <div className={styles.previewPlaceholder} role="img" aria-label="Imagem da notícia ainda não adicionada" />}
            <p className={styles.previewLead}>{draft.summary.trim()}</p>
            <div className={styles.previewBody}>{draft.body.trim().split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
          </article>
          <div className={styles.dialogActions}><button type="button" className={styles.cancelButton} onClick={() => setEditorStep("edit")}>Voltar à edição</button><button type="button" className={styles.saveButton} onClick={() => void saveDraft()}>Publicar notícia</button></div>
        </>}
      </section>
    </div>, document.body)}

    {deletingItem && typeof document !== "undefined" && createPortal(<div className={styles.overlay} role="presentation"><section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title" onKeyDown={(event) => { if (event.key === "Escape") setDeletingId(null); }}>
      <div className={styles.dialogHeader}><h2 id="delete-dialog-title">Excluir notícia?</h2><button type="button" aria-label="Fechar" onClick={() => setDeletingId(null)}>×</button></div>
      <p>“{deletingItem.title}” será removida do site e do banco.</p>
      <div className={styles.dialogActions}><button autoFocus type="button" className={styles.cancelButton} onClick={() => setDeletingId(null)}>Cancelar</button><button type="button" className={styles.deleteConfirm} onClick={() => void deleteItem()}>Excluir notícia</button></div>
    </section></div>, document.body)}
  </>;
}
