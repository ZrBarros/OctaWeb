from datetime import UTC, datetime, timedelta
from typing import Literal

from fastapi import APIRouter, status
from sqlalchemy import func, or_, select, text

from app.dependencies import AdminUser, DbSession
from app.errors import conflict, not_found
from app.models import Evento, Noticia, Pedido, Produto, Usuario
from app.schemas import AdminUserInput
from app.serializers import user
from app.utils import page_result

router = APIRouter(prefix="/api/v1/admin", tags=["Administração"])


@router.get("/users")
def list_users(actor: AdminUser, db: DbSession, page: int = 1, pageSize: int = 20, search: str | None = None, role: Literal["USUARIO", "ADMIN"] | None = None) -> dict:
    filters = []
    if role:
        filters.append(Usuario.perfil == role)
    if search:
        filters.append(or_(Usuario.nome.ilike(f"%{search}%"), Usuario.email.ilike(f"%{search}%"), Usuario.curso.ilike(f"%{search}%")))
    total = db.scalar(select(func.count()).select_from(Usuario).where(*filters)) or 0
    items = list(db.scalars(select(Usuario).where(*filters).order_by(Usuario.nome).offset((page - 1) * pageSize).limit(pageSize)))
    return page_result([user(value) for value in items], total, page, pageSize)


@router.get("/users/{item_id}")
def get_user(item_id: int, actor: AdminUser, db: DbSession) -> dict:
    account = db.get(Usuario, item_id)
    if not account:
        raise not_found("Usuário")
    return {"data": user(account)}


@router.put("/users/{item_id}")
def update_user(item_id: int, data: AdminUserInput, actor: AdminUser, db: DbSession) -> dict:
    if item_id == actor.id and data.role != "ADMIN":
        raise conflict("Não é possível remover o próprio acesso administrativo.")
    account = db.get(Usuario, item_id)
    if not account:
        raise not_found("Usuário")
    owner = db.scalar(select(Usuario).where(func.lower(Usuario.email) == str(data.email).lower(), Usuario.id != item_id))
    if owner:
        raise conflict("Já existe uma conta com este e-mail.")
    account.nome, account.email, account.curso = data.name, str(data.email), data.course
    account.foto_url, account.perfil = data.photoUrl, data.role
    db.commit()
    db.refresh(account)
    return {"data": user(account)}


@router.delete("/users/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(item_id: int, actor: AdminUser, db: DbSession) -> None:
    if item_id == actor.id:
        raise conflict("Não é possível excluir a própria conta administrativa.")
    account = db.get(Usuario, item_id)
    if not account:
        raise not_found("Usuário")
    db.delete(account)
    db.commit()


@router.get("/dashboard")
def dashboard(actor: AdminUser, db: DbSession) -> dict:
    now = datetime.now(UTC)
    metrics = {
        "users": db.scalar(select(func.count()).select_from(Usuario)) or 0,
        "products": db.scalar(select(func.count()).select_from(Produto).where(Produto.ativo.is_(True))) or 0,
        "pendingOrders": db.scalar(select(func.count()).select_from(Pedido).where(Pedido.status == "PENDENTE")) or 0,
        "upcomingEvents": db.scalar(select(func.count()).select_from(Evento).where(Evento.data_hora >= now, Evento.data_hora <= now + timedelta(days=15))) or 0,
        "news": db.scalar(select(func.count()).select_from(Noticia)) or 0,
    }
    start = datetime(now.year if now.month > 11 else now.year - 1, (now.month - 11 - 1) % 12 + 1, 1, tzinfo=UTC)
    rows = db.execute(text("""
        SELECT date_trunc('month', criado_em) AS month, COALESCE(SUM(valor_total), 0) AS amount
        FROM octacore.pedido
        WHERE criado_em >= :start AND status <> 'CANCELADO'
        GROUP BY 1 ORDER BY 1
    """), {"start": start}).mappings()
    return {"data": {"metrics": metrics, "sales": [{"month": row["month"].isoformat(), "amountCents": round(float(row["amount"]) * 100)} for row in rows], "activities": []}}

