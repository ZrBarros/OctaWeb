"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import { InstagramIcon } from "@/components/instagram-icon";
import { type AdminMember } from "@/data/admin-members";
import { apiClient, uploadImage } from "@/lib/api";
import { displayImageUrl } from "@/lib/display-image-url";
import type { ApiItem, ApiMember, ApiModality, ApiPage } from "@/lib/api-types";
import { AdminIcon, AdminPageHeading, AdminToolbarSearch } from "../admin-shell";
import { AdminDialogPortal } from "../admin-dialog-portal";
import shared from "../admin.module.css";
import styles from "./page.module.css";

type MemberDraft = Omit<AdminMember, "id">;
const emptyDraft: MemberDraft = { name: "", role: "", course: "", instagram: "", modalityIds: [], boardMember: false };

function initials(name: string) {
  return name.split(" ").filter((part) => part && !part.startsWith('"')).slice(0, 2).map((part) => part.charAt(0).toLocaleUpperCase("pt-BR")).join("");
}

export function AdminMembersPage() {
  const [items, setItems] = useState<AdminMember[]>([]);
  const [modalities, setModalities] = useState<ApiModality[]>([]);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<MemberDraft | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [imageError, setImageError] = useState("");
  const [message, setMessage] = useState("");
  const filtered = items.filter((item) => item.name.toLocaleLowerCase("pt-BR").includes(query.trim().toLocaleLowerCase("pt-BR")));
  const removingMember = items.find((item) => item.id === removingId);

  useEffect(() => { void Promise.all([apiClient<ApiPage<ApiMember>>("/admin/members?pageSize=100", { auth: true }), apiClient<ApiItem<ApiModality[]>>("/admin/modalities", { auth: true })]).then(([response, modalityResponse]) => { setModalities(modalityResponse.data); setItems(response.data.map((item) => ({ id: item.id, name: item.nome, role: item.funcao ?? "Integrante", course: item.curso ?? "", instagram: item.instagram ?? "", image: item.fotoUrl ?? undefined, modalityIds: item.modalidades.map((entry) => entry.modalidade.id), boardMember: item.diretoria }))); }).catch((reason) => setMessage(reason instanceof Error ? reason.message : "Não foi possível carregar os integrantes.")); }, []);

  function openEditor(item?: AdminMember) {
    setEditingId(item?.id ?? null);
    setDraft(item ? { name: item.name, role: item.role, course: item.course, instagram: item.instagram, image: item.image, modalityIds: item.modalityIds ?? [], boardMember: item.boardMember ?? false } : { ...emptyDraft });
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
    catch (reason) { setImageError(reason instanceof Error ? reason.message : "Não foi possível enviar a foto."); }
  }

  async function saveMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    const saved = { ...draft, name: draft.name.trim(), role: draft.role.trim(), course: draft.course.trim(), instagram: draft.instagram.trim().replace(/^@/, "") };
    if (!saved.name || !saved.role || !saved.course || !/^[a-zA-Z0-9._]{1,30}$/.test(saved.instagram)) return;
    try {
      const response = await apiClient<ApiItem<ApiMember>>(`/admin/members${editingId === null ? "" : `/${editingId}`}`, { method: editingId === null ? "POST" : "PUT", auth: true, body: JSON.stringify({ name: saved.name, role: saved.role, course: saved.course, instagram: saved.instagram, photoUrl: saved.image ?? null, boardMember: saved.boardMember ?? false, modalityIds: saved.modalityIds ?? [] }) });
      const item = response.data; const mapped = { id: item.id, name: item.nome, role: item.funcao ?? "Integrante", course: item.curso ?? "", instagram: item.instagram ?? "", image: item.fotoUrl ?? undefined, modalityIds: item.modalidades.map((entry) => entry.modalidade.id), boardMember: item.diretoria };
      setItems((current) => editingId === null ? [...current, mapped] : current.map((old) => old.id === editingId ? mapped : old));
      setMessage(editingId === null ? "Integrante cadastrado." : "Integrante atualizado.");
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Não foi possível salvar o integrante."); return; }
    setDraft(null);
    setQuery("");
  }

  async function removeMember() {
    if (removingId === null) return;
    try { await apiClient<void>(`/admin/members/${removingId}`, { method: "DELETE", auth: true }); setItems((current) => current.filter((item) => item.id !== removingId)); setMessage("Integrante removido."); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : "Não foi possível remover o integrante."); }
    setRemovingId(null);
  }

  return <>
    <AdminToolbarSearch><label className={shared.search}><AdminIcon name="search" /><span className={shared.srOnly}>Buscar integrantes no painel</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar integrantes..." /></label></AdminToolbarSearch>
    <div className={shared.content}>
      <AdminPageHeading title="Gente de Arena - Integrantes" />
      <p className={shared.demoNotice}>Integrantes sincronizados com o mural público</p>
      {message && <p className={styles.message} role="status">{message}</p>}
      <div className={styles.toolbar}>
        <button className={styles.newButton} type="button" onClick={() => openEditor()}>+ <span>Novo Integrante</span></button>
      </div>
      {query && <p className={styles.resultCount}>{filtered.length} {filtered.length === 1 ? "integrante encontrado" : "integrantes encontrados"}<button type="button" onClick={() => setQuery("")}>Limpar busca</button></p>}
      <div className={styles.grid}>
        {filtered.map((item) => <article className={styles.card} key={item.id}>
          <button className={styles.cardMain} type="button" onClick={() => openEditor(item)} aria-label={`Editar ${item.name}`}>
            <div className={styles.avatar}>{item.image ? <Image src={displayImageUrl(item.image)} alt={`Foto de ${item.name}`} width={76} height={76} unoptimized /> : <span aria-label={`Foto de ${item.name} pendente`}>{initials(item.name)}</span>}</div>
            <div className={styles.cardContent}><h2>{item.name}</h2><p className={styles.role}>{item.role}</p><p className={styles.course}>{item.course}</p><p className={styles.instagram}><InstagramIcon /><span>@{item.instagram}</span></p></div>
          </button>
          <div className={styles.cardActions}><button type="button" onClick={() => openEditor(item)} aria-label={`Editar ${item.name}`}>Editar</button><button type="button" onClick={() => setRemovingId(item.id)} aria-label={`Remover ${item.name}`}>Remover</button></div>
        </article>)}
        {filtered.length === 0 && <p className={styles.empty}>Nenhum integrante encontrado. Tente outro nome ou cadastre um integrante.</p>}
      </div>
    </div>

    {draft && <AdminDialogPortal><div className={styles.overlay}><section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="member-dialog-title">
      <div className={styles.dialogHeader}><h2 id="member-dialog-title">{editingId === null ? "Novo integrante" : "Editar integrante"}</h2><button type="button" aria-label="Fechar formulário" onClick={() => setDraft(null)}>×</button></div>
      <p>As alterações serão salvas no banco.</p>
      <form className={styles.form} onSubmit={saveMember}>
        <label>Nome<input autoFocus required maxLength={100} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Nome do integrante" /></label>
        <label>Função<input required maxLength={100} value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value })} placeholder="Ex.: Atleta" /></label>
        <label>Curso<input required maxLength={100} value={draft.course} onChange={(event) => setDraft({ ...draft, course: event.target.value })} placeholder="Ex.: Ciência da Computação" /></label>
        <fieldset className={styles.modalityFieldset}><legend>Modalidades praticadas</legend><div className={styles.modalityOptions}>
          {modalities.map((item) => <label className={styles.checkOption} key={item.id}><input type="checkbox" checked={(draft.modalityIds ?? []).includes(item.id)} onChange={(event) => setDraft((current) => current ? { ...current, modalityIds: event.target.checked ? [...(current.modalityIds ?? []), item.id] : (current.modalityIds ?? []).filter((id) => id !== item.id) } : null)} /><span>{item.nome}</span></label>)}
          {modalities.length === 0 && <small>Nenhuma modalidade cadastrada.</small>}
        </div></fieldset>
        <label className={styles.boardOption}><input type="checkbox" checked={draft.boardMember ?? false} onChange={(event) => setDraft({ ...draft, boardMember: event.target.checked })} /><span>Integrante da diretoria</span></label>
        <label>Usuário do Instagram<input required pattern="@?[a-zA-Z0-9._]{1,30}" title="Use até 30 letras, números, pontos ou sublinhados, com @ opcional" value={draft.instagram} onChange={(event) => setDraft({ ...draft, instagram: event.target.value })} placeholder="@usuario" /></label>
        <label>Foto (opcional)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void readImage(event)} /><small>JPG, PNG ou WebP, até 2 MB.</small></label>
        {imageError && <span className={styles.imageError} role="alert">{imageError}</span>}
        {draft.image && <div className={styles.selectedImage}><Image src={displayImageUrl(draft.image)} alt="Prévia da foto do integrante" width={76} height={76} unoptimized /><button type="button" onClick={() => setDraft({ ...draft, image: undefined })}>Remover foto</button></div>}
        <div className={styles.dialogActions}><button className={styles.cancelButton} type="button" onClick={() => setDraft(null)}>Cancelar</button><button className={styles.saveButton} type="submit">{editingId === null ? "Cadastrar integrante" : "Salvar alterações"}</button></div>
      </form>
    </section></div></AdminDialogPortal>}

    {removingMember && <AdminDialogPortal><div className={styles.overlay}><section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="remove-member-title"><div className={styles.dialogHeader}><h2 id="remove-member-title">Remover integrante?</h2><button type="button" aria-label="Cancelar remoção" onClick={() => setRemovingId(null)}>×</button></div><p>Remover “{removingMember.name}”? A alteração afeta o mural público.</p><div className={styles.dialogActions}><button className={styles.cancelButton} type="button" onClick={() => setRemovingId(null)}>Cancelar</button><button className={styles.removeConfirm} type="button" onClick={() => void removeMember()}>Remover integrante</button></div></section></div></AdminDialogPortal>}
  </>;
}
