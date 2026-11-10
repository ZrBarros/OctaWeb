from typing import Annotated, Literal

from fastapi import APIRouter, Query, status

from app.dependencies import AdminUser, CurrentUser, DbSession
from app.errors import not_found
from app.repositories.store import StoreRepository
from app.schemas import CreateOrderInput, ProductInput, UpdateOrderStatusInput
from app.serializers import order, product
from app.services.store import StoreService
from app.utils import page_result

public_router = APIRouter(prefix="/api/v1", tags=["Loja"])
admin_router = APIRouter(prefix="/api/v1/admin", tags=["Administração da loja"])


def validate_page(page: int, page_size: int) -> None:
    if page < 1 or page_size < 1 or page_size > 100:
        raise not_found("Página")


@public_router.get("/products")
def list_products(db: DbSession, page: int = 1, pageSize: int = 20, search: str | None = None, category: str | None = None, active: bool | None = None, sortBy: Literal["name", "price", "stock"] = "name", sort: Literal["asc", "desc"] = "asc") -> dict:
    validate_page(page, pageSize)
    items, total = StoreRepository(db).list_products(page, pageSize, search, category, active, True, sortBy, sort)
    return page_result([product(value) for value in items], total, page, pageSize)


@public_router.get("/products/{slug}")
def get_product(slug: str, db: DbSession) -> dict:
    item = StoreRepository(db).product_by_slug(slug)
    if not item:
        raise not_found("Produto")
    return {"data": product(item)}


@public_router.post("/orders", status_code=status.HTTP_201_CREATED)
def create_order(data: CreateOrderInput, actor: CurrentUser, db: DbSession) -> dict:
    return {"data": order(StoreService(StoreRepository(db)).create_order(actor.id, data))}


@public_router.get("/orders")
def list_my_orders(actor: CurrentUser, db: DbSession, page: int = 1, pageSize: int = 20, search: str | None = None, status_: Annotated[str | None, Query(alias="status")] = None, sort: Literal["asc", "desc"] = "desc") -> dict:
    validate_page(page, pageSize)
    items, total = StoreRepository(db).list_orders(page, pageSize, search, status_, sort, actor.id)
    return page_result([order(value) for value in items], total, page, pageSize)


@public_router.get("/orders/{item_id}")
def get_order(item_id: int, actor: CurrentUser, db: DbSession) -> dict:
    return {"data": order(StoreService(StoreRepository(db)).order_by_id(item_id, actor))}


@admin_router.get("/products")
def admin_products(actor: AdminUser, db: DbSession, page: int = 1, pageSize: int = 20, search: str | None = None, category: str | None = None, active: bool | None = None, sortBy: Literal["name", "price", "stock"] = "name", sort: Literal["asc", "desc"] = "asc") -> dict:
    validate_page(page, pageSize)
    items, total = StoreRepository(db).list_products(page, pageSize, search, category, active, False, sortBy, sort)
    return page_result([product(value) for value in items], total, page, pageSize)


@admin_router.get("/products/{slug}")
def admin_product(slug: str, actor: AdminUser, db: DbSession) -> dict:
    item = StoreRepository(db).product_by_slug(slug, True)
    if not item:
        raise not_found("Produto")
    return {"data": product(item)}


@admin_router.post("/products", status_code=status.HTTP_201_CREATED)
def create_product(data: ProductInput, actor: AdminUser, db: DbSession) -> dict:
    return {"data": product(StoreService(StoreRepository(db)).create_product(data))}


@admin_router.put("/products/{item_id}")
def update_product(item_id: int, data: ProductInput, actor: AdminUser, db: DbSession) -> dict:
    return {"data": product(StoreService(StoreRepository(db)).update_product(item_id, data))}


@admin_router.delete("/products/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_product(item_id: int, actor: AdminUser, db: DbSession) -> None:
    StoreService(StoreRepository(db)).deactivate_product(item_id)


@admin_router.get("/orders")
def admin_orders(actor: AdminUser, db: DbSession, page: int = 1, pageSize: int = 20, search: str | None = None, status_: Annotated[str | None, Query(alias="status")] = None, sort: Literal["asc", "desc"] = "desc") -> dict:
    validate_page(page, pageSize)
    items, total = StoreRepository(db).list_orders(page, pageSize, search, status_, sort)
    return page_result([order(value) for value in items], total, page, pageSize)


@admin_router.get("/orders/{item_id}")
def admin_order(item_id: int, actor: AdminUser, db: DbSession) -> dict:
    return {"data": order(StoreService(StoreRepository(db)).order_by_id(item_id, actor))}


@admin_router.patch("/orders/{item_id}/status")
def update_order_status(item_id: int, data: UpdateOrderStatusInput, actor: AdminUser, db: DbSession) -> dict:
    return {"data": order(StoreService(StoreRepository(db)).update_order_status(item_id, data.status))}

