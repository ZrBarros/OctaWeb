from collections import defaultdict
from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app.dependencies import AuthUser
from app.errors import conflict, forbidden, not_found, unprocessable
from app.models import ItemPedido, Pedido, Produto, ProdutoVariacao
from app.repositories.store import StoreRepository
from app.schemas import CreateOrderInput, ProductInput
from app.utils import make_slug

ALLOWED_TRANSITIONS = {
    "PENDENTE": ["CONFIRMADO", "CANCELADO"],
    "CONFIRMADO": ["EM_SEPARACAO", "CANCELADO"],
    "EM_SEPARACAO": ["DISPONIVEL_RETIRADA", "CANCELADO"],
    "DISPONIVEL_RETIRADA": ["ENTREGUE", "CANCELADO"],
    "ENTREGUE": [],
    "CANCELADO": [],
}


class StoreService:
    def __init__(self, repository: StoreRepository) -> None:
        self.repository = repository
        self.db = repository.db

    def create_product(self, data: ProductInput) -> Produto:
        item = Produto(slug=data.slug or make_slug(data.name), nome=data.name, descricao=data.description, preco=Decimal(data.priceCents) / 100, categoria=data.category, imagem_url=data.imageUrl, ativo=data.active)
        item.variacoes = [ProdutoVariacao(tamanho=row.size, estoque=row.stock) for row in data.variations]
        self.db.add(item)
        self.db.commit()
        return self.repository.product_by_id(item.id)  # type: ignore[return-value]

    def update_product(self, item_id: int, data: ProductInput) -> Produto:
        item = self.repository.product_by_id(item_id)
        if not item:
            raise not_found("Produto")
        current = {row.id: row for row in item.variacoes}
        requested_ids = {row.id for row in data.variations if row.id is not None}
        if any(value not in current for value in requested_ids):
            raise unprocessable("Uma variação não pertence ao produto informado.")
        for variation in list(item.variacoes):
            if variation.id not in requested_ids:
                self.db.delete(variation)
        for row in data.variations:
            if row.id:
                current[row.id].tamanho, current[row.id].estoque = row.size, row.stock
            else:
                item.variacoes.append(ProdutoVariacao(tamanho=row.size, estoque=row.stock))
        item.slug, item.nome, item.descricao = data.slug or make_slug(data.name), data.name, data.description
        item.preco, item.categoria, item.imagem_url, item.ativo = Decimal(data.priceCents) / 100, data.category, data.imageUrl, data.active
        self.db.commit()
        return self.repository.product_by_id(item.id)  # type: ignore[return-value]

    def deactivate_product(self, item_id: int) -> None:
        item = self.repository.product_by_id(item_id)
        if not item:
            raise not_found("Produto")
        item.ativo = False
        self.db.commit()

    def create_order(self, user_id: int, data: CreateOrderInput) -> Pedido:
        combined: dict[int, int] = defaultdict(int)
        for row in data.items:
            combined[row.variationId] += row.quantity
        if any(value > 99 for value in combined.values()):
            raise unprocessable("A quantidade máxima por variação é 99.")
        try:
            self.db.connection(execution_options={"isolation_level": "SERIALIZABLE"})
            now = datetime.now(UTC)
            order = Pedido(usuario_id=user_id, status="PENDENTE", valor_total=Decimal(0), nome_contato=data.contactName, telefone_contato=data.contactPhone, forma_retirada=data.pickupMethod, observacoes=data.notes, criado_em=now, atualizado_em=now)
            self.db.add(order)
            self.db.flush()
            for variation_id, quantity in combined.items():
                variation = self.db.scalar(select(ProdutoVariacao).options(joinedload(ProdutoVariacao.produto)).where(ProdutoVariacao.id == variation_id).with_for_update(of=ProdutoVariacao))
                if not variation or not variation.produto.ativo:
                    raise unprocessable(f"Variação {variation_id} indisponível.")
                if variation.estoque < quantity:
                    raise conflict(f"Estoque insuficiente para {variation.produto.nome}, tamanho {variation.tamanho}.")
                variation.estoque -= quantity
                self.db.add(ItemPedido(pedido_id=order.id, variacao_id=variation.id, quantidade=quantity, preco_unitario=variation.produto.preco))
            self.db.commit()
            return self.repository.order_by_id(order.id)  # type: ignore[return-value]
        except Exception:
            self.db.rollback()
            raise

    def order_by_id(self, item_id: int, actor: AuthUser) -> Pedido:
        item = self.repository.order_by_id(item_id)
        if not item:
            raise not_found("Pedido")
        if actor.perfil != "ADMIN" and item.usuario_id != actor.id:
            raise forbidden()
        return item

    def update_order_status(self, item_id: int, new_status: str) -> Pedido:
        try:
            item = self.repository.order_by_id(item_id, lock=True)
            if not item:
                raise not_found("Pedido")
            if new_status not in ALLOWED_TRANSITIONS.get(item.status, []):
                raise unprocessable(f"Transição de {item.status} para {new_status} não permitida.")
            if new_status == "CANCELADO":
                for order_item in item.itens:
                    order_item.variacao.estoque += order_item.quantidade
            item.status = new_status
            self.db.commit()
            return self.repository.order_by_id(item.id)  # type: ignore[return-value]
        except Exception:
            self.db.rollback()
            raise

