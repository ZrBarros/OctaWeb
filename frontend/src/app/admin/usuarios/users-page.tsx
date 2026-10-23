"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth-provider";
import { apiClient } from "@/lib/api";
import type { ApiItem, ApiPage, ApiUser } from "@/lib/api-types";
import { AdminIcon, AdminPageHeading, AdminToolbarSearch } from "../admin-shell";
import shared from "../admin.module.css";
import styles from "../manage.module.css";

export function AdminUsersPage() {
  const { user: currentUser, updateUser } = useAuth();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("TODOS");
  const [editing, setEditing] = useState<ApiUser | null>(null);
  const [deleting, setDeleting] = useState<ApiUser | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void apiClient<ApiPage<ApiUser>>("/admin/users?pageSize=100", { auth: true })
      .then((response) => setUsers(response.data))
      .catch((reason) => setMessage(reason instanceof Error ? reason.message : "Não foi possível carregar os usuários."));
  }, []);

  const filtered = useMemo(() => users.filter((user) => (role === "TODOS" || user.perfil === role) && `${user.nome} ${user.email} ${user.curso}`.toLocaleLowerCase("pt-BR").includes(query.trim().toLocaleLowerCase("pt-BR"))), [query, role, users]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editing) return;
    const data = new FormData(event.currentTarget);
    try {
      const response = await apiClient<ApiItem<ApiUser>>(`/admin/users/${editing.id}`, { method: "PUT", auth: true, body: JSON.stringify({ name: data.get("name"), email: data.get("email"), course: data.get("course"), photoUrl: editing.fotoUrl ?? null, role: editing.id === currentUser?.id ? editing.perfil : data.get("role") }) });
      setUsers((items) => items.map((item) => item.id === editing.id ? response.data : item));
      if (response.data.id === currentUser?.id) updateUser(response.data);
      setEditing(null); setMessage("Usuário atualizado.");
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Não foi possível atualizar o usuário."); }
  }

  async function remove() {
    if (!deleting) return;
    try {
      await apiClient<void>(`/admin/users/${deleting.id}`, { method: "DELETE", auth: true });
      setUsers((items) => items.filter((item) => item.id !== deleting.id)); setDeleting(null); setMessage("Usuário excluído.");
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Não foi possível excluir o usuário."); }
  }

  return <>
    <AdminToolbarSearch><label className={shared.search}><AdminIcon name="search" /><span className={shared.srOnly}>Buscar usuários</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar usuários..." /></label></AdminToolbarSearch>
    <div className={shared.content}>
      <AdminPageHeading title="Usuários" />
      <p className={shared.demoNotice}>Contas e permissões integradas ao banco</p>
      <div className={styles.toolbar}><div className={styles.toolbarGroup}><label><span className={shared.srOnly}>Filtrar por perfil</span><select value={role} onChange={(event) => setRole(event.target.value)}><option value="TODOS">Todos os perfis</option><option value="USUARIO">Usuários</option><option value="ADMIN">Administradores</option></select></label><span className={styles.badge}>{filtered.length} contas</span></div></div>
      {message && <p className={styles.message} role="status">{message}</p>}
      <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Usuário</th><th>Curso</th><th>Perfil</th><th>Cadastrado em</th><th><span className={shared.srOnly}>Ações</span></th></tr></thead><tbody>
        {filtered.map((user) => <tr key={user.id}><td><strong>{user.nome}</strong><small>{user.email}</small></td><td>{user.curso}</td><td><span className={styles.badge}>{user.perfil}</span></td><td>{new Intl.DateTimeFormat("pt-BR").format(new Date(user.criadoEm))}</td><td><div className={styles.rowActions}><button type="button" onClick={() => setEditing(user)}>Editar</button><button type="button" disabled={user.id === currentUser?.id} title={user.id === currentUser?.id ? "Você não pode excluir sua própria conta." : undefined} onClick={() => setDeleting(user)}>Excluir</button></div></td></tr>)}
      </tbody></table>{filtered.length === 0 && <p className={styles.empty}>Nenhum usuário encontrado.</p>}</div>
    </div>
    {editing && <div className={styles.overlay}><section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="edit-user-title"><div className={styles.dialogHeader}><h2 id="edit-user-title">Editar usuário</h2><button type="button" aria-label="Fechar" onClick={() => setEditing(null)}>×</button></div><form className={styles.form} onSubmit={save}><label>Nome<input autoFocus name="name" defaultValue={editing.nome} required minLength={2} maxLength={120} /></label><label>E-mail<input name="email" type="email" defaultValue={editing.email} required maxLength={160} /></label><label>Curso<input name="course" defaultValue={editing.curso} required minLength={2} maxLength={100} /></label><label>Perfil<select name="role" defaultValue={editing.perfil} disabled={editing.id === currentUser?.id}><option value="USUARIO">Usuário</option><option value="ADMIN">Administrador</option></select>{editing.id === currentUser?.id && <small>Seu próprio perfil administrativo não pode ser rebaixado nesta sessão.</small>}</label><div className={styles.dialogActions}><button className={styles.cancel} type="button" onClick={() => setEditing(null)}>Cancelar</button><button className={styles.primary} type="submit">Salvar</button></div></form></section></div>}
    {deleting && <div className={styles.overlay}><section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="delete-user-title"><div className={styles.dialogHeader}><h2 id="delete-user-title">Excluir usuário?</h2><button type="button" aria-label="Fechar" onClick={() => setDeleting(null)}>×</button></div><p>Excluir a conta de <strong>{deleting.nome}</strong>? Pedidos ou notícias vinculadas podem impedir a exclusão.</p><div className={styles.dialogActions}><button className={styles.cancel} type="button" onClick={() => setDeleting(null)}>Cancelar</button><button className={styles.danger} type="button" onClick={() => void remove()}>Excluir usuário</button></div></section></div>}
  </>;
}
