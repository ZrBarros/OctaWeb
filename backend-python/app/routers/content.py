from datetime import datetime
from typing import Annotated, Literal

from fastapi import APIRouter, Query, status

from app.dependencies import AdminUser, DbSession
from app.errors import not_found
from app.repositories.content import ContentRepository
from app.schemas import AchievementInput, EventInput, MemberInput, MilestoneInput, ModalityInput, NewsInput, ResultInput
from app.serializers import achievement, event, member, milestone, modality, news, sports_result
from app.services.content import ContentService
from app.utils import page_result

public_router = APIRouter(prefix="/api/v1", tags=["Conteúdo"])
admin_router = APIRouter(prefix="/api/v1/admin", tags=["Administração de conteúdo"])


def svc(db: DbSession) -> ContentService:
    return ContentService(ContentRepository(db))


def valid_pagination(page: int, page_size: int) -> None:
    if page < 1 or page_size < 1 or page_size > 100:
        raise not_found("Página")


@public_router.get("/news")
def list_news(db: DbSession, page: int = 1, pageSize: int = 20, search: str | None = None, sort: Literal["asc", "desc"] = "desc", category: str | None = None) -> dict:
    valid_pagination(page, pageSize)
    items, total = ContentRepository(db).list_news(page, pageSize, search, category, sort)
    return page_result([news(value) for value in items], total, page, pageSize)


@public_router.get("/news/{slug}")
def get_news(slug: str, db: DbSession) -> dict:
    item = ContentRepository(db).news_by_slug(slug)
    if not item:
        raise not_found("Notícia")
    return {"data": news(item)}


@public_router.get("/modalities")
def list_modalities(db: DbSession, search: str | None = None) -> dict:
    items = ContentRepository(db).modalities(search)
    return {"data": [modality(value, counts={"integrantes": len(value.integrantes), "eventos": len(value.eventos), "resultados": len(value.resultados)}) for value in items]}


@public_router.get("/modalities/{slug}")
def get_modality(slug: str, db: DbSession) -> dict:
    item = ContentRepository(db).modality_by_slug(slug)
    if not item:
        raise not_found("Modalidade")
    return {"data": modality(item, detail=True)}


@public_router.get("/members")
def list_members(db: DbSession, page: int = 1, pageSize: int = 20, search: str | None = None, sort: Literal["asc", "desc"] = "desc", category: str | None = None, modalityId: int | None = None) -> dict:
    valid_pagination(page, pageSize)
    items, total = ContentRepository(db).list_members(page, pageSize, search, modalityId, category == "DIRETORIA", sort)
    return page_result([member(value) for value in items], total, page, pageSize)


@public_router.get("/members/{slug}")
def get_member(slug: str, db: DbSession) -> dict:
    item = ContentRepository(db).member_by_slug(slug)
    if not item:
        raise not_found("Integrante")
    return {"data": member(item)}


@public_router.get("/events")
def list_events(db: DbSession, page: int = 1, pageSize: int = 20, search: str | None = None, sort: Literal["asc", "desc"] = "desc", category: str | None = None, modalityId: int | None = None, from_: Annotated[datetime | None, Query(alias="from")] = None, to: datetime | None = None) -> dict:
    valid_pagination(page, pageSize)
    items, total = ContentRepository(db).list_events(page, pageSize, search, category, modalityId, from_, to, sort)
    return page_result([event(value) for value in items], total, page, pageSize)


@public_router.get("/events/{slug}")
def get_event(slug: str, db: DbSession) -> dict:
    item = ContentRepository(db).event_by_slug(slug)
    if not item:
        raise not_found("Evento")
    return {"data": event(item)}


@public_router.get("/results")
def list_results(db: DbSession, page: int = 1, pageSize: int = 20, search: str | None = None, sort: Literal["asc", "desc"] = "desc", modalityId: int | None = None, from_: Annotated[datetime | None, Query(alias="from")] = None, to: datetime | None = None) -> dict:
    valid_pagination(page, pageSize)
    items, total = ContentRepository(db).list_results(page, pageSize, search, modalityId, from_, to, sort)
    return page_result([sports_result(value) for value in items], total, page, pageSize)


@public_router.get("/achievements")
def list_achievements(db: DbSession, modalityId: int | None = None) -> dict:
    return {"data": [achievement(value) for value in ContentRepository(db).achievements(modalityId)]}


@public_router.get("/history")
def list_history(db: DbSession) -> dict:
    return {"data": [milestone(value) for value in ContentRepository(db).milestones()]}


@admin_router.get("/news")
def admin_news(actor: AdminUser, db: DbSession, page: int = 1, pageSize: int = 20, search: str | None = None, sort: Literal["asc", "desc"] = "desc", category: str | None = None) -> dict:
    return list_news(db, page, pageSize, search, sort, category)


@admin_router.post("/news", status_code=status.HTTP_201_CREATED)
def create_news(data: NewsInput, actor: AdminUser, db: DbSession) -> dict:
    return {"data": news(svc(db).create_news(data, actor.id))}


@admin_router.put("/news/{item_id}")
def update_news(item_id: int, data: NewsInput, actor: AdminUser, db: DbSession) -> dict:
    return {"data": news(svc(db).update_news(item_id, data, actor.id))}


@admin_router.delete("/news/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_news(item_id: int, actor: AdminUser, db: DbSession) -> None:
    svc(db).delete_news(item_id)


@admin_router.get("/modalities")
def admin_modalities(actor: AdminUser, db: DbSession, search: str | None = None) -> dict:
    return list_modalities(db, search)


@admin_router.post("/modalities", status_code=status.HTTP_201_CREATED)
def create_modality(data: ModalityInput, actor: AdminUser, db: DbSession) -> dict:
    return {"data": modality(svc(db).create_modality(data))}


@admin_router.put("/modalities/{item_id}")
def update_modality(item_id: int, data: ModalityInput, actor: AdminUser, db: DbSession) -> dict:
    return {"data": modality(svc(db).update_modality(item_id, data))}


@admin_router.delete("/modalities/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_modality(item_id: int, actor: AdminUser, db: DbSession) -> None:
    svc(db).delete_modality(item_id)


@admin_router.get("/members")
def admin_members(actor: AdminUser, db: DbSession, page: int = 1, pageSize: int = 20, search: str | None = None, sort: Literal["asc", "desc"] = "desc", category: str | None = None, modalityId: int | None = None) -> dict:
    return list_members(db, page, pageSize, search, sort, category, modalityId)


@admin_router.post("/members", status_code=status.HTTP_201_CREATED)
def create_member(data: MemberInput, actor: AdminUser, db: DbSession) -> dict:
    return {"data": member(svc(db).create_member(data))}


@admin_router.put("/members/{item_id}")
def update_member(item_id: int, data: MemberInput, actor: AdminUser, db: DbSession) -> dict:
    return {"data": member(svc(db).update_member(item_id, data))}


@admin_router.delete("/members/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(item_id: int, actor: AdminUser, db: DbSession) -> None:
    svc(db).delete_member(item_id)


@admin_router.get("/events")
def admin_events(actor: AdminUser, db: DbSession, page: int = 1, pageSize: int = 20, search: str | None = None, sort: Literal["asc", "desc"] = "desc", category: str | None = None, modalityId: int | None = None, from_: Annotated[datetime | None, Query(alias="from")] = None, to: datetime | None = None) -> dict:
    return list_events(db, page, pageSize, search, sort, category, modalityId, from_, to)


@admin_router.post("/events", status_code=status.HTTP_201_CREATED)
def create_event(data: EventInput, actor: AdminUser, db: DbSession) -> dict:
    return {"data": event(svc(db).create_event(data))}


@admin_router.put("/events/{item_id}")
def update_event(item_id: int, data: EventInput, actor: AdminUser, db: DbSession) -> dict:
    return {"data": event(svc(db).update_event(item_id, data))}


@admin_router.delete("/events/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(item_id: int, actor: AdminUser, db: DbSession) -> None:
    svc(db).delete_event(item_id)


@admin_router.get("/results")
def admin_results(actor: AdminUser, db: DbSession, page: int = 1, pageSize: int = 20, search: str | None = None, sort: Literal["asc", "desc"] = "desc", modalityId: int | None = None, from_: Annotated[datetime | None, Query(alias="from")] = None, to: datetime | None = None) -> dict:
    return list_results(db, page, pageSize, search, sort, modalityId, from_, to)


@admin_router.post("/results", status_code=status.HTTP_201_CREATED)
def create_result(data: ResultInput, actor: AdminUser, db: DbSession) -> dict:
    return {"data": sports_result(svc(db).create_result(data))}


@admin_router.put("/results/{item_id}")
def update_result(item_id: int, data: ResultInput, actor: AdminUser, db: DbSession) -> dict:
    return {"data": sports_result(svc(db).update_result(item_id, data))}


@admin_router.delete("/results/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_result(item_id: int, actor: AdminUser, db: DbSession) -> None:
    svc(db).delete_result(item_id)


@admin_router.get("/achievements")
def admin_achievements(actor: AdminUser, db: DbSession, modalityId: int | None = None) -> dict:
    return list_achievements(db, modalityId)


@admin_router.post("/achievements", status_code=status.HTTP_201_CREATED)
def create_achievement(data: AchievementInput, actor: AdminUser, db: DbSession) -> dict:
    return {"data": achievement(svc(db).create_achievement(data))}


@admin_router.put("/achievements/{item_id}")
def update_achievement(item_id: int, data: AchievementInput, actor: AdminUser, db: DbSession) -> dict:
    return {"data": achievement(svc(db).update_achievement(item_id, data))}


@admin_router.delete("/achievements/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_achievement(item_id: int, actor: AdminUser, db: DbSession) -> None:
    svc(db).delete_achievement(item_id)


@admin_router.get("/history")
def admin_history(actor: AdminUser, db: DbSession) -> dict:
    return list_history(db)


@admin_router.post("/history", status_code=status.HTTP_201_CREATED)
def create_milestone(data: MilestoneInput, actor: AdminUser, db: DbSession) -> dict:
    return {"data": milestone(svc(db).create_milestone(data))}


@admin_router.put("/history/{item_id}")
def update_milestone(item_id: int, data: MilestoneInput, actor: AdminUser, db: DbSession) -> dict:
    return {"data": milestone(svc(db).update_milestone(item_id, data))}


@admin_router.delete("/history/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_milestone(item_id: int, actor: AdminUser, db: DbSession) -> None:
    svc(db).delete_milestone(item_id)

