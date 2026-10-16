"use client";

import { useState, type FormEvent } from "react";
import { AdminIcon, AdminPageHeading, AdminToolbarSearch } from "../admin-shell";
import { adminResults, resultStatus, type AdminResult } from "@/data/admin-results";
import shared from "../admin.module.css";
import styles from "./page.module.css";

type ResultDraft = Omit<AdminResult, "id" | "ourScore" | "opponentScore"> & { ourScore: string; opponentScore: string };
type ResultFilter = "all" | "wins" | "losses";
const emptyDraft: ResultDraft = { modality: "", opponent: "", ourScore: "", opponentScore: "", competition: "", date: "" };
const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function formatDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return `${String(day).padStart(2, "0")} ${months[month - 1]} ${year}`;
}

function PencilIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" /><path d="m14 7 3 3" /></svg>; }
function TrashIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5" /></svg>; }

export function AdminResultsPage() {
  const [items, setItems] = useState<AdminResult[]>(adminResults);
  const [query, setQuery] = useState("");
  const [resultFilter, setResultFilter] = useState<ResultFilter>("all");
  const [draft, setDraft] = useState<ResultDraft | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const filtered = items.filter((item) => {
    const status = resultStatus(item);
    const matchesResult = resultFilter === "all" || (resultFilter === "wins" && status === "Vitória") || (resultFilter === "losses" && status === "Derrota");
    const matchesSearch = `${item.modality} ${item.opponent} ${item.competition}`.toLocaleLowerCase("pt-BR").includes(query.trim().toLocaleLowerCase("pt-BR"));
    return matchesResult && matchesSearch;
  }).sort((a, b) => b.date.localeCompare(a.date));
  const deletingItem = items.find((item) => item.id === deletingId);
  const draftScoresValid = draft && /^\d+$/.test(draft.ourScore) && /^\d+$/.test(draft.opponentScore);
  const draftStatus = draftScoresValid ? resultStatus({ ...draft, id: editingId ?? 0, ourScore: Number(draft.ourScore), opponentScore: Number(draft.opponentScore) }) : null;

  function openEditor(item?: AdminResult) {
    setEditingId(item?.id ?? null);
    setDraft(item ? { modality: item.modality, opponent: item.opponent, ourScore: String(item.ourScore), opponentScore: String(item.opponentScore), competition: item.competition, date: item.date } : { ...emptyDraft });
    setMessage("");
  }

  function saveResult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft || !/^\d+$/.test(draft.ourScore) || !/^\d+$/.test(draft.opponentScore)) return;
    const saved = { modality: draft.modality.trim(), opponent: draft.opponent.trim(), competition: draft.competition.trim(), date: draft.date, ourScore: Number(draft.ourScore), opponentScore: Number(draft.opponentScore) };
    if (!saved.modality || !saved.opponent || !saved.competition || !saved.date || !Number.isSafeInteger(saved.ourScore) || !Number.isSafeInteger(saved.opponentScore)) return;
    if (editingId === null) {
      setItems((current) => [...current, { ...saved, id: Date.now() }]);
      setMessage("Resultado criado somente nesta prévia; o site público não foi alterado.");
    } else {
      setItems((current) => current.map((item) => item.id === editingId ? { ...item, ...saved } : item));
      setMessage("Resultado editado somente nesta prévia; o site público não foi alterado.");
    }
    setDraft(null);
    setQuery("");
    setResultFilter("all");
  }

  function deleteResult() {
    setItems((current) => current.filter((item) => item.id !== deletingId));
    setDeletingId(null);
    setMessage("Resultado excluído somente desta prévia.");
  }

  return <>
    <AdminToolbarSearch><label className={shared.search}><AdminIcon name="search" /><span className={shared.srOnly}>Buscar resultados no painel</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar resultados..." /></label></AdminToolbarSearch>
    <div className={shared.content}>
      <AdminPageHeading title="Placar de Arena - Resultados" />
      <p className={shared.demoNotice}>Prévia demonstrativa · placares e alterações temporários</p>
      {message && <p className={styles.message} role="status">{message}</p>}
      <div className={styles.toolbar}>
        <div className={styles.filters} role="group" aria-label="Filtrar resultados">
          <button type="button" className={resultFilter === "all" ? styles.selectedFilter : styles.filter} aria-pressed={resultFilter === "all"} onClick={() => setResultFilter("all")}>Todos os Resultados</button>
          <button type="button" className={resultFilter === "wins" ? styles.selectedFilter : styles.filter} aria-pressed={resultFilter === "wins"} onClick={() => setResultFilter("wins")}>Só Vitórias</button>
          <button type="button" className={resultFilter === "losses" ? styles.selectedFilter : styles.filter} aria-pressed={resultFilter === "losses"} onClick={() => setResultFilter("losses")}>Só Derrotas</button>
        </div>
        <label className={styles.mobileFilter}>
          <span>Filtrar resultados</span>
          <select value={resultFilter} onChange={(event) => setResultFilter(event.target.value as ResultFilter)}>
            <option value="all">Todos os Resultados</option><option value="wins">Só Vitórias</option><option value="losses">Só Derrotas</option>
          </select>
        </label>
        <button className={styles.newButton} type="button" onClick={() => openEditor()}>+ <span>Registrar Resultado</span></button>
      </div>
      {(query || resultFilter !== "all") && <p className={styles.resultCount}>{filtered.length} {filtered.length === 1 ? "resultado encontrado" : "resultados encontrados"}<button type="button" onClick={() => { setQuery(""); setResultFilter("all"); }}>Limpar filtros</button></p>}
      <p className={styles.scrollHint}>Deslize a tabela para ver placar, status e ações →</p>
      <div className={styles.tablePanel}><div className={styles.tableScroll}>
        <table className={styles.table}><thead><tr><th>Modalidade</th><th>Adversário</th><th>Placar (Octa x Adv)</th><th>Campeonato</th><th>Data</th><th>Status</th><th>Ações</th></tr></thead><tbody>
          {filtered.map((item) => { const status = resultStatus(item); return <tr key={item.id}>
            <td className={styles.modality}>{item.modality}</td><td>{item.opponent}</td><td><span className={styles.score}><strong>{item.ourScore}</strong><span>×</span><strong>{item.opponentScore}</strong></span></td><td>{item.competition}</td><td><time dateTime={item.date}>{formatDate(item.date)}</time></td><td><span className={status === "Vitória" ? styles.win : status === "Derrota" ? styles.loss : styles.draw}>{status}</span></td><td><div className={styles.actions}><button type="button" className={styles.editButton} aria-label={`Editar resultado de ${item.modality} contra ${item.opponent}`} onClick={() => openEditor(item)}><PencilIcon /></button><button type="button" className={styles.deleteButton} aria-label={`Excluir resultado de ${item.modality} contra ${item.opponent}`} onClick={() => setDeletingId(item.id)}><TrashIcon /></button></div></td>
          </tr>; })}
        </tbody></table>
        {filtered.length === 0 && <p className={styles.empty}>Nenhum resultado encontrado. Tente outra busca ou registre um resultado.</p>}
      </div></div>
    </div>

    {draft && <div className={styles.overlay}><section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="result-dialog-title">
      <div className={styles.dialogHeader}><h2 id="result-dialog-title">{editingId === null ? "Registrar resultado" : "Editar resultado"}</h2><button type="button" aria-label="Fechar formulário" onClick={() => setDraft(null)}>×</button></div>
      <p>O status é calculado pelo placar. Os dados ficam nesta página até você recarregá-la.</p>
      <form className={styles.form} onSubmit={saveResult}>
        <div className={styles.formRow}><label>Modalidade<input autoFocus required maxLength={80} value={draft.modality} onChange={(event) => setDraft({ ...draft, modality: event.target.value })} placeholder="Ex.: Futsal Masculino" /></label><label>Adversário<input required maxLength={80} value={draft.opponent} onChange={(event) => setDraft({ ...draft, opponent: event.target.value })} placeholder="Ex.: Carcará Engenharia" /></label></div>
        <div className={styles.formRow}><label>Pontos da Octa<input required type="number" min="0" step="1" value={draft.ourScore} onChange={(event) => setDraft({ ...draft, ourScore: event.target.value })} /></label><label>Pontos do adversário<input required type="number" min="0" step="1" value={draft.opponentScore} onChange={(event) => setDraft({ ...draft, opponentScore: event.target.value })} /></label></div>
        {draftStatus && <p className={styles.calculatedStatus}>Status calculado: <strong>{draftStatus}</strong></p>}
        <div className={styles.formRow}><label>Campeonato<input required maxLength={100} value={draft.competition} onChange={(event) => setDraft({ ...draft, competition: event.target.value })} placeholder="Nome do campeonato" /></label><label>Data da partida<input required type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} /></label></div>
        <div className={styles.dialogActions}><button className={styles.cancelButton} type="button" onClick={() => setDraft(null)}>Cancelar</button><button className={styles.saveButton} type="submit">{editingId === null ? "Registrar resultado" : "Salvar alterações"}</button></div>
      </form>
    </section></div>}

    {deletingItem && <div className={styles.overlay}><section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="delete-result-title"><div className={styles.dialogHeader}><h2 id="delete-result-title">Excluir resultado?</h2><button type="button" aria-label="Cancelar exclusão" onClick={() => setDeletingId(null)}>×</button></div><p>Remover o resultado de {deletingItem.modality} contra {deletingItem.opponent} desta prévia? O site público não será alterado.</p><div className={styles.dialogActions}><button className={styles.cancelButton} type="button" onClick={() => setDeletingId(null)}>Cancelar</button><button className={styles.deleteConfirm} type="button" onClick={deleteResult}>Excluir resultado</button></div></section></div>}
  </>;
}
