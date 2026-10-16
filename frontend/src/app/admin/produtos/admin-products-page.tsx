"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { AdminIcon, AdminPageHeading, AdminToolbarSearch } from "../admin-shell";
import { adminProducts, adminProductCategories, type AdminProduct } from "@/data/admin-products";
import { formatPrice } from "@/data/products";
import shared from "../admin.module.css";
import styles from "./page.module.css";

type ProductDraft = Omit<AdminProduct, "id">;
const emptyDraft: ProductDraft = { name: "", category: "Uniformes", priceCents: 0, stock: 0 };

function PencilIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" /><path d="m14 7 3 3" /></svg>;
}

function TrashIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5" /></svg>;
}

export function AdminProductsPage() {
  const [items, setItems] = useState<AdminProduct[]>(adminProducts);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [imageError, setImageError] = useState("");
  const filteredItems = items.filter((item) => `${item.name} ${item.category}`.toLocaleLowerCase("pt-BR").includes(query.trim().toLocaleLowerCase("pt-BR")));
  const deletingItem = items.find((item) => item.id === deletingId);

  function changeStock(id: number, change: number) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, stock: Math.max(0, item.stock + change) } : item));
    setMessage("Estoque alterado somente nesta prévia; a loja pública não foi atualizada.");
  }

  function openEditor(item?: AdminProduct) {
    setEditingId(item?.id ?? null);
    setDraft(item ? { name: item.name, category: item.category, priceCents: item.priceCents, stock: item.stock, image: item.image } : { ...emptyDraft });
    setPriceInput(item ? (item.priceCents / 100).toFixed(2).replace(".", ",") : "");
    setImageError("");
    setMessage("");
  }

  function readImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImageError("Escolha uma imagem JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError("A imagem deve ter no máximo 2 MB.");
      return;
    }
    setImageError("");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setDraft((current) => current ? { ...current, image: reader.result as string } : null);
      else setImageError("Não foi possível ler a imagem. Tente outra.");
    };
    reader.onerror = () => setImageError("Não foi possível ler a imagem. Tente outra.");
    reader.readAsDataURL(file);
  }

  function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    const name = draft.name.trim();
    const price = Number(priceInput.replace(",", "."));
    if (!name || !Number.isFinite(price) || price <= 0 || !Number.isInteger(draft.stock) || draft.stock < 0) return;
    const saved = { ...draft, name, priceCents: Math.round(price * 100) };
    if (editingId === null) {
      setItems((current) => [{ ...saved, id: Date.now() }, ...current]);
      setMessage("Produto criado somente nesta prévia; ele não aparece na loja pública.");
    } else {
      setItems((current) => current.map((item) => item.id === editingId ? { ...item, ...saved } : item));
      setMessage("Produto editado somente nesta prévia; a loja pública não foi atualizada.");
    }
    setDraft(null);
    setQuery("");
  }

  function deleteProduct() {
    setItems((current) => current.filter((item) => item.id !== deletingId));
    setDeletingId(null);
    setMessage("Produto excluído somente desta prévia.");
  }

  return <>
    <AdminToolbarSearch><label className={shared.search}><AdminIcon name="search" /><span className={shared.srOnly}>Buscar no painel</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar produto pelo nome..." /></label></AdminToolbarSearch>

    <div className={shared.content}>
      <AdminPageHeading title="Octa Store - Produtos" />
      <p className={shared.demoNotice}>Prévia demonstrativa · estoque e alterações temporários</p>
      {message && <p className={styles.message} role="status">{message}</p>}
      <div className={styles.toolbar}>
        <button className={styles.newButton} type="button" onClick={() => openEditor()}>+ <span>Cadastrar Produto</span></button>
      </div>
      <p className={styles.resultCount}>{filteredItems.length} {filteredItems.length === 1 ? "produto encontrado" : "produtos encontrados"}{query && <button type="button" onClick={() => setQuery("")}>Limpar busca</button>}</p>
      <div className={styles.tablePanel}>
        <div className={styles.tableScroll}>
          <table className={styles.productTable}>
            <thead><tr><th>Imagem</th><th>Nome do Produto</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Ações</th></tr></thead>
            <tbody>
              {filteredItems.map((item) => <tr key={item.id}>
                <td data-label="Imagem"><span className={styles.thumbnail}>{item.image ? <Image src={item.image} alt="" width={48} height={48} unoptimized={item.image.startsWith("data:")} /> : <AdminIcon name="products" />}</span></td>
                <td data-label="Produto" className={styles.productName}>{item.name}</td>
                <td data-label="Categoria">{item.category}</td>
                <td data-label="Preço" className={styles.price}>{formatPrice(item.priceCents)}</td>
                <td data-label="Estoque"><div className={styles.stockControl} aria-label={`Estoque de ${item.name}: ${item.stock}`}><button type="button" aria-label={`Diminuir estoque de ${item.name}`} disabled={item.stock === 0} onClick={() => changeStock(item.id, -1)}>−</button><output>{item.stock}</output><button type="button" aria-label={`Aumentar estoque de ${item.name}`} onClick={() => changeStock(item.id, 1)}>+</button></div></td>
                <td data-label="Ações"><div className={styles.actions}><button className={styles.editButton} type="button" aria-label={`Editar ${item.name}`} onClick={() => openEditor(item)}><PencilIcon /></button><button className={styles.deleteButton} type="button" aria-label={`Excluir ${item.name}`} onClick={() => setDeletingId(item.id)}><TrashIcon /></button></div></td>
              </tr>)}
            </tbody>
          </table>
          {filteredItems.length === 0 && <p className={styles.empty}>Nenhum produto encontrado. Tente outra busca ou cadastre um produto.</p>}
        </div>
      </div>
    </div>

    {draft && <div className={styles.overlay}>
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="product-dialog-title">
        <div className={styles.dialogHeader}><h2 id="product-dialog-title">{editingId === null ? "Cadastrar produto" : "Editar produto"}</h2><button type="button" aria-label="Fechar formulário" onClick={() => setDraft(null)}>×</button></div>
        <p>Os dados ficam nesta página até você recarregá-la.</p>
        <form className={styles.form} onSubmit={saveProduct}>
          <label>Nome do produto<input autoFocus required maxLength={100} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Ex.: Camisa Octacore" /></label>
          <div className={styles.formRow}>
            <label>Categoria<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>{adminProductCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
            <label>Preço (R$)<input required inputMode="decimal" pattern="[0-9]+([,.][0-9]{1,2})?" title="Digite um valor positivo com até duas casas decimais" value={priceInput} onChange={(event) => setPriceInput(event.target.value)} placeholder="59,90" /></label>
          </div>
          <label>Quantidade em estoque<input required type="number" min="0" step="1" value={draft.stock} onChange={(event) => setDraft({ ...draft, stock: Number(event.target.value) })} /></label>
          <label>Imagem do produto (opcional)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={readImage} /><small>JPG, PNG ou WebP, até 2 MB. A imagem fica apenas nesta prévia.</small></label>
          {imageError && <span className={styles.imageError} role="alert">{imageError}</span>}
          {draft.image && <div className={styles.selectedImage}><Image src={draft.image} alt="Prévia da imagem do produto" width={82} height={82} unoptimized={draft.image.startsWith("data:")} /><button type="button" onClick={() => setDraft({ ...draft, image: undefined })}>Remover imagem</button></div>}
          <div className={styles.dialogActions}><button className={styles.cancelButton} type="button" onClick={() => setDraft(null)}>Cancelar</button><button className={styles.saveButton} type="submit">{editingId === null ? "Cadastrar produto" : "Salvar alterações"}</button></div>
        </form>
      </section>
    </div>}

    {deletingItem && <div className={styles.overlay}>
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="delete-product-title">
        <div className={styles.dialogHeader}><h2 id="delete-product-title">Excluir produto?</h2><button type="button" aria-label="Cancelar exclusão" onClick={() => setDeletingId(null)}>×</button></div>
        <p>Remover “{deletingItem.name}” desta prévia? A loja pública não será alterada.</p>
        <div className={styles.dialogActions}><button className={styles.cancelButton} type="button" onClick={() => setDeletingId(null)}>Cancelar</button><button className={styles.deleteConfirm} type="button" onClick={deleteProduct}>Excluir produto</button></div>
      </section>
    </div>}
  </>;
}
