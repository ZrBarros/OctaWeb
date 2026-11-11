from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models import ItemPedido, Pedido, Produto, ProdutoVariacao, Usuario


class StoreRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_products(self, page: int, page_size: int, search: str | None, category: str | None, active: bool | None, public_only: bool, sort_by: str, sort: str) -> tuple[list[Produto], int]:
        filters = []
        if public_only:
            filters.append(Produto.ativo.is_(True))
        elif active is not None:
            filters.append(Produto.ativo.is_(active))
        if category:
            filters.append(Produto.categoria == category)
        if search:
            filters.append(or_(Produto.nome.ilike(f"%{search}%"), Produto.descricao.ilike(f"%{search}%")))
        total = self.db.scalar(select(func.count()).select_from(Produto).where(*filters)) or 0
        if sort_by == "stock":
            query = select(Produto).options(selectinload(Produto.variacoes)).where(*filters)
            items = list(self.db.scalars(query).unique())
            items.sort(key=lambda item: sum(row.estoque for row in item.variacoes), reverse=sort == "desc")
            start = (page - 1) * page_size
            return items[start : start + page_size], total
        column = Produto.preco if sort_by == "price" else Produto.nome
        order = column.asc() if sort == "asc" else column.desc()
        query = select(Produto).options(selectinload(Produto.variacoes)).where(*filters).order_by(order).offset((page - 1) * page_size).limit(page_size)
        return list(self.db.scalars(query).unique()), total

    def product_by_slug(self, slug: str, include_inactive: bool = False) -> Produto | None:
        filters = [Produto.slug == slug]
        if not include_inactive:
            filters.append(Produto.ativo.is_(True))
        return self.db.scalar(select(Produto).options(selectinload(Produto.variacoes)).where(*filters))

    def product_by_id(self, item_id: int) -> Produto | None:
        return self.db.scalar(select(Produto).options(selectinload(Produto.variacoes)).where(Produto.id == item_id))

    def order_by_id(self, item_id: int, lock: bool = False) -> Pedido | None:
        query = select(Pedido).options(joinedload(Pedido.usuario), selectinload(Pedido.itens).joinedload(ItemPedido.variacao).joinedload(ProdutoVariacao.produto)).where(Pedido.id == item_id).execution_options(populate_existing=True)
        if lock:
            query = query.with_for_update(of=Pedido)
        return self.db.scalar(query)

    def list_orders(self, page: int, page_size: int, search: str | None, status: str | None, sort: str, user_id: int | None = None) -> tuple[list[Pedido], int]:
        filters = []
        if user_id:
            filters.append(Pedido.usuario_id == user_id)
        if status:
            filters.append(Pedido.status == status)
        if search:
            terms = [Pedido.nome_contato.ilike(f"%{search}%"), Pedido.usuario.has(or_(Usuario.nome.ilike(f"%{search}%"), Usuario.email.ilike(f"%{search}%")))]
            if search.isdigit():
                terms.append(Pedido.id == int(search))
            filters.append(or_(*terms))
        total = self.db.scalar(select(func.count()).select_from(Pedido).where(*filters)) or 0
        order = Pedido.criado_em.asc() if sort == "asc" else Pedido.criado_em.desc()
        query = select(Pedido).options(joinedload(Pedido.usuario), selectinload(Pedido.itens).joinedload(ItemPedido.variacao).joinedload(ProdutoVariacao.produto)).where(*filters).order_by(order).offset((page - 1) * page_size).limit(page_size)
        return list(self.db.scalars(query).unique()), total

