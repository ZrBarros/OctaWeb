"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { AdminIcon, AdminPageHeading, AdminToolbarSearch } from "../admin-shell";
import { adminProductCategories, type AdminProduct } from "@/data/admin-products";
import { apiCategory } from "@/lib/api-mappers";
import { apiClient, uploadImage } from "@/lib/api";
import type { ApiItem, ApiPage, ApiProduct } from "@/lib/api-types";
import { formatPrice } from "@/data/products";
import shared from "../admin.module.css";
import styles from "./page.module.css";

type ProductDraft = Omit<AdminProduct, "id">;
const emptyDraft: ProductDraft = { name: "", category: "Camisas", priceCents: 0, stock: 0, variations: [], active: true };

function PencilIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" /><path d="m14 7 3 3" /></svg>;
}

function TrashIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5" /></svg>;
}

export function AdminProductsPage() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [imageError, setImageError] = useState("");
  const filteredItems = items.filter((item) => `${item.name} ${item.category}`.toLocaleLowerCase("pt-BR").includes(query.trim().toLocaleLowerCase("pt-BR")));
  const deletingItem = items.find((item) => item.id === deletingId);

  const mapProduct = (item: ApiProduct): AdminProduct => ({ id: item.id, name: item.nome, category: ({ CAMISAS: "Camisas", TIRANTES: "Tirantes", COPOS: "Copos", BONES: "Bonés", ACESSORIOS: "Acessórios", KITS: "Kits" } as Record<string, string>)[item.categoria] ?? item.categoria, priceCents: Math.round(Number(item.preco) * 100), stock: item.variacoes.reduce((total, variation) => total + variation.estoque, 0), image: item.imagemUrl ?? undefined, description: item.descricao ?? "", active: item.ativo, variations: item.variacoes.map((variation) => ({ id: variation.id, size: variation.tamanho, stock: variation.estoque })) });
  useEffect(() => { void apiClient<ApiPage<ApiProduct>>("/admin/products?pageSize=100", { auth: true }).then((response) => setItems(response.data.map(mapProduct))).catch((reason) => setMessage(reason instanceof Error ? reason.message : "Não foi possível carregar os produtos.")); }, []);

  async function changeStock(id: number, change: number) {
    const item = items.find((product) => product.id === id); if (!item) return;
    const variations = [...(item.variations ?? [{ size: "UNICO", stock: item.stock }])];
    const variationIndex = change < 0 ? variations.findIndex((variation) => variation.stock > 0) : 0;
    if (variationIndex < 0 || !variations[variationIndex]) return; variations[variationIndex] = { ...variations[variationIndex], stock: Math.max(0, variations[variationIndex].stock + change) };
    try { const response = await apiClient<ApiItem<ApiProduct>>(`/admin/products/${id}`, { method: "PUT", auth: true, body: JSON.stringify({ name: item.name, description: item.description ?? null, priceCents: item.priceCents, category: apiCategory(item.category), imageUrl: item.image ?? null, active: item.active ?? true, variations }) }); setItems((current) => current.map((product) => product.id === id ? mapProduct(response.data) : product)); setMessage("Estoque atualizado."); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : "Não foi possível atualizar o estoque."); }
  }

  function openEditor(item?: AdminProduct) {
    setEditingId(item?.id ?? null);
    setDraft(item ? { name: item.name, category: item.category, priceCents: item.priceCents, stock: item.stock, image: item.image } : { ...emptyDraft });
    setPriceInput(item ? (item.priceCents / 100).toFixed(2).replace(".", ",") : "");
    setImageError("");
    setMessage("");
  }

  async function readImage(event: React.ChangeEvent<HTMLInputElement>) {
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
    try { const url = await uploadImage(file); setDraft((current) => current ? { ...current, image: url } : null); }
    catch (reason) { setImageError(reason instanceof Error ? reason.message : "Não foi possível enviar a imagem."); }
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    const name = draft.name.trim();
    const price = Number(priceInput.replace(",", "."));
    if (!name || !Number.isFinite(price) || price <= 0 || !Number.isInteger(draft.stock) || draft.stock < 0) return;
    const baseVariations = draft.variations?.length ? draft.variations.map((variation) => ({ ...variation })) : [{ size: "UNICO", stock: 0 }];
    let remainingStock = draft.stock; for (const variation of baseVariations) { variation.stock = Math.min(variation.stock, remainingStock); remainingStock -= variation.stock; } baseVariations[0]!.stock += remainingStock;
    try { const response = await apiClient<ApiItem<ApiProduct>>(`/admin/products${editingId === null ? "" : `/${editingId}`}`, { method: editingId === null ? "POST" : "PUT", auth: true, body: JSON.stringify({ name, description: draft.description ?? null, priceCents: Math.round(price * 100), category: apiCategory(draft.category), imageUrl: draft.image ?? null, active: draft.active ?? true, variations: baseVariations }) }); const mapped = mapProduct(response.data); setItems((current) => editingId === null ? [mapped, ...current] : current.map((item) => item.id === editingId ? mapped : item)); setMessage(editingId === null ? "Produto cadastrado na loja." : "Produto atualizado."); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : "Não foi possível salvar o produto."); return; }
    setDraft(null);
    setQuery("");
  }

  async function deleteProduct() {
    if (deletingId === null) return;
    try { await apiClient<void>(`/admin/products/${deletingId}`, { method: "DELETE", auth: true }); setItems((current) => current.filter((item) => item.id !== deletingId)); setMessage("Produto desativado e removido da loja pública."); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : "Não foi possível desativar o produto."); }
    setDeletingId(null);
  }

  return <>
    <AdminToolbarSearch><label className={shared.search}><AdminIcon name="search" /><span className={shared.srOnly}>Buscar no painel</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar produto pelo nome..." /></label></AdminToolbarSearch>

    <div className={shared.content}>
      <AdminPageHeading title="Octa Store - Produtos" />
      <p className={shared.demoNotice}>Produtos e estoque integrados à loja pública</p>
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
        <p>As alterações serão salvas no banco e refletidas na loja.</p>
        <form className={styles.form} onSubmit={saveProduct}>
          <label>Nome do produto<input autoFocus required maxLength={100} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Ex.: Camisa Octacore" /></label>
          <div className={styles.formRow}>
            <label>Categoria<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>{adminProductCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
            <label>Preço (R$)<input required inputMode="decimal" pattern="[0-9]+([,.][0-9]{1,2})?" title="Digite um valor positivo com até duas casas decimais" value={priceInput} onChange={(event) => setPriceInput(event.target.value)} placeholder="59,90" /></label>
          </div>
          <label>Quantidade em estoque<input required type="number" min="0" step="1" value={draft.stock} onChange={(event) => setDraft({ ...draft, stock: Number(event.target.value) })} /></label>
          <label>Imagem do produto (opcional)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void readImage(event)} /><small>JPG, PNG ou WebP, até 2 MB.</small></label>
          {imageError && <span className={styles.imageError} role="alert">{imageError}</span>}
          {draft.image && <div className={styles.selectedImage}><Image src={draft.image} alt="Prévia da imagem do produto" width={82} height={82} unoptimized={draft.image.startsWith("data:")} /><button type="button" onClick={() => setDraft({ ...draft, image: undefined })}>Remover imagem</button></div>}
          <div className={styles.dialogActions}><button className={styles.cancelButton} type="button" onClick={() => setDraft(null)}>Cancelar</button><button className={styles.saveButton} type="submit">{editingId === null ? "Cadastrar produto" : "Salvar alterações"}</button></div>
        </form>
      </section>
    </div>}

    {deletingItem && <div className={styles.overlay}>
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="delete-product-title">
        <div className={styles.dialogHeader}><h2 id="delete-product-title">Excluir produto?</h2><button type="button" aria-label="Cancelar exclusão" onClick={() => setDeletingId(null)}>×</button></div>
        <p>Desativar “{deletingItem.name}”? O produto deixará de aparecer na loja pública.</p>
        <div className={styles.dialogActions}><button className={styles.cancelButton} type="button" onClick={() => setDeletingId(null)}>Cancelar</button><button className={styles.deleteConfirm} type="button" onClick={() => void deleteProduct()}>Desativar produto</button></div>
      </section>
    </div>}
  </>;
}
