"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { apiClient, uploadImage } from "@/lib/api";
import { displayImageUrl } from "@/lib/display-image-url";
import type { ApiGalleryPhoto, ApiItem } from "@/lib/api-types";
import { AdminDialogPortal } from "../admin-dialog-portal";
import shared from "../manage.module.css";
import styles from "./gallery-manager.module.css";

type PhotoDraft = { id?: number; imageUrl: string; description: string; caption: string };

export function GalleryManager() {
  const [photos, setPhotos] = useState<ApiGalleryPhoto[]>([]);
  const [draft, setDraft] = useState<PhotoDraft | null>(null);
  const [deleting, setDeleting] = useState<ApiGalleryPhoto | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { void apiClient<ApiItem<ApiGalleryPhoto[]>>("/admin/gallery", { auth: true }).then((response) => setPhotos(response.data)).catch((error) => setMessage(error instanceof Error ? error.message : "Não foi possível carregar as fotos.")); }, []);

  async function selectImage(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 6 * 1024 * 1024) {
      setMessage("Escolha uma imagem JPG, PNG ou WebP de até 6 MB."); return;
    }
    setMessage(""); setBusy(true);
    try { const imageUrl = await uploadImage(file); setDraft((current) => current ? { ...current, imageUrl } : null); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível enviar a imagem."); }
    finally { setBusy(false); }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!draft || busy || !draft.imageUrl || !draft.description.trim()) return;
    setBusy(true); setMessage("");
    try {
      const response = await apiClient<ApiItem<ApiGalleryPhoto>>(`/admin/gallery${draft.id ? `/${draft.id}` : ""}`, { method: draft.id ? "PUT" : "POST", auth: true, body: JSON.stringify({ imageUrl: draft.imageUrl, description: draft.description.trim(), caption: draft.caption.trim() || null }) });
      setPhotos((current) => draft.id ? current.map((photo) => photo.id === draft.id ? response.data : photo) : [response.data, ...current]);
      setDraft(null); setMessage(draft.id ? "Foto atualizada na galeria." : "Foto adicionada à galeria.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível salvar a foto."); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!deleting || busy) return;
    setBusy(true); setMessage("");
    try { await apiClient<void>(`/admin/gallery/${deleting.id}`, { method: "DELETE", auth: true }); setPhotos((current) => current.filter((photo) => photo.id !== deleting.id)); setDeleting(null); setMessage("Foto removida da galeria."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível remover a foto."); }
    finally { setBusy(false); }
  }

  return <>
    <div className={shared.toolbar}><span className={shared.badge}>{photos.length} fotos</span><button className={shared.newButton} type="button" onClick={() => { setMessage(""); setDraft({ imageUrl: "", description: "", caption: "" }); }}>Nova foto</button></div>
    {message && <p className={shared.message} role="status">{message}</p>}
    {photos.length ? <div className={shared.cards}>{photos.map((photo) => <article className={shared.card} key={photo.id}>
      <Image className={styles.thumbnail} src={displayImageUrl(photo.imageUrl)} alt={photo.description} width={420} height={250} unoptimized />
      <h2>{photo.caption || photo.description}</h2><p>{photo.description}</p>
      <div className={shared.rowActions}><button type="button" onClick={() => setDraft({ id: photo.id, imageUrl: photo.imageUrl, description: photo.description, caption: photo.caption ?? "" })}>Editar</button><button type="button" onClick={() => setDeleting(photo)}>Remover</button></div>
    </article>)}</div> : <p className={shared.empty}>Nenhuma foto cadastrada. Adicione uma imagem para exibi-la no Mural.</p>}

    {draft && <AdminDialogPortal><div className={shared.overlay}><section className={shared.dialog} role="dialog" aria-modal="true" aria-labelledby="gallery-dialog-title">
      <div className={shared.dialogHeader}><h2 id="gallery-dialog-title">{draft.id ? "Editar foto" : "Nova foto"}</h2><button type="button" aria-label="Fechar" onClick={() => setDraft(null)}>×</button></div>
      <form className={shared.form} onSubmit={save}>
        <div className={shared.imageInput}><label>Imagem{draft.id ? " (trocar)" : ""}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ""; void selectImage(file); }} /></label><small>JPG, PNG ou WebP, até 6 MB.</small></div>
        {draft.imageUrl && <Image className={styles.preview} src={displayImageUrl(draft.imageUrl)} alt="Prévia da foto" width={420} height={250} unoptimized />}
        <label>Descrição da foto<input required minLength={2} maxLength={200} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Descreva o que aparece na foto" /></label>
        <label>Legenda (opcional)<input maxLength={200} value={draft.caption} onChange={(event) => setDraft({ ...draft, caption: event.target.value })} placeholder="Texto exibido abaixo da foto" /></label>
        {message && <p className={shared.formError} role="alert">{message}</p>}
        <div className={shared.dialogActions}><button className={shared.cancel} type="button" onClick={() => setDraft(null)}>Cancelar</button><button className={shared.primary} type="submit" disabled={busy || !draft.imageUrl}>{busy ? "Aguarde..." : "Salvar foto"}</button></div>
      </form>
    </section></div></AdminDialogPortal>}
    {deleting && <AdminDialogPortal><div className={shared.overlay}><section className={shared.dialog} role="dialog" aria-modal="true" aria-labelledby="delete-photo-title"><div className={shared.dialogHeader}><h2 id="delete-photo-title">Remover foto?</h2><button type="button" aria-label="Fechar" onClick={() => setDeleting(null)}>×</button></div><p>A foto deixará de aparecer no Mural.</p><div className={shared.dialogActions}><button className={shared.cancel} type="button" onClick={() => setDeleting(null)}>Cancelar</button><button className={shared.danger} type="button" disabled={busy} onClick={() => void remove()}>Remover foto</button></div></section></div></AdminDialogPortal>}
  </>;
}
