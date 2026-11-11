from datetime import datetime

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models import Conquista, Evento, Integrante, IntegranteModalidade, MarcoHistorico, Modalidade, Noticia, Resultado


class ContentRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def save(self, item):
        self.db.add(item)
        self.db.commit()
        return item

    def delete(self, item) -> None:
        self.db.delete(item)
        self.db.commit()

    def list_news(self, page: int, page_size: int, search: str | None, category: str | None, sort: str) -> tuple[list[Noticia], int]:
        filters = []
        if category:
            filters.append(Noticia.categoria == category.upper())
        if search:
            filters.append(or_(Noticia.titulo.ilike(f"%{search}%"), Noticia.resumo.ilike(f"%{search}%"), Noticia.conteudo.ilike(f"%{search}%")))
        total = self.db.scalar(select(func.count()).select_from(Noticia).where(*filters)) or 0
        order = Noticia.criado_em.asc() if sort == "asc" else Noticia.criado_em.desc()
        query = select(Noticia).options(joinedload(Noticia.autor)).where(*filters).order_by(order).offset((page - 1) * page_size).limit(page_size)
        return list(self.db.scalars(query).unique()), total

    def news_by_slug(self, slug: str) -> Noticia | None:
        return self.db.scalar(select(Noticia).options(joinedload(Noticia.autor)).where(Noticia.slug == slug))

    def news_by_id(self, item_id: int) -> Noticia | None:
        return self.db.scalar(select(Noticia).options(joinedload(Noticia.autor)).where(Noticia.id == item_id))

    def modalities(self, search: str | None = None) -> list[Modalidade]:
        filters = [or_(Modalidade.nome.ilike(f"%{search}%"), Modalidade.descricao.ilike(f"%{search}%"))] if search else []
        query = select(Modalidade).options(selectinload(Modalidade.horarios), selectinload(Modalidade.integrantes), selectinload(Modalidade.eventos), selectinload(Modalidade.resultados)).where(*filters).order_by(Modalidade.nome)
        return list(self.db.scalars(query).unique())

    def modality_by_slug(self, slug: str) -> Modalidade | None:
        query = select(Modalidade).options(selectinload(Modalidade.horarios), selectinload(Modalidade.integrantes).joinedload(IntegranteModalidade.integrante), selectinload(Modalidade.resultados), selectinload(Modalidade.eventos)).where(Modalidade.slug == slug)
        return self.db.scalar(query)

    def modality_by_id(self, item_id: int) -> Modalidade | None:
        return self.db.scalar(select(Modalidade).options(selectinload(Modalidade.horarios)).where(Modalidade.id == item_id))

    def list_members(self, page: int, page_size: int, search: str | None, modality_id: int | None, board_only: bool, sort: str) -> tuple[list[Integrante], int]:
        filters = []
        if search:
            filters.append(or_(Integrante.nome.ilike(f"%{search}%"), Integrante.curso.ilike(f"%{search}%"), Integrante.funcao.ilike(f"%{search}%")))
        if modality_id:
            filters.append(Integrante.modalidades.any(IntegranteModalidade.modalidade_id == modality_id))
        if board_only:
            filters.append(Integrante.diretoria.is_(True))
        total = self.db.scalar(select(func.count()).select_from(Integrante).where(*filters)) or 0
        order = Integrante.nome.asc() if sort == "asc" else Integrante.nome.desc()
        query = select(Integrante).options(selectinload(Integrante.modalidades).joinedload(IntegranteModalidade.modalidade)).where(*filters).order_by(order).offset((page - 1) * page_size).limit(page_size)
        return list(self.db.scalars(query).unique()), total

    def member_by_slug(self, slug: str) -> Integrante | None:
        return self.db.scalar(select(Integrante).options(selectinload(Integrante.modalidades).joinedload(IntegranteModalidade.modalidade)).where(Integrante.slug == slug))

    def member_by_id(self, item_id: int) -> Integrante | None:
        return self.db.scalar(select(Integrante).options(selectinload(Integrante.modalidades)).where(Integrante.id == item_id))

    def list_events(self, page: int, page_size: int, search: str | None, category: str | None, modality_id: int | None, start: datetime | None, end: datetime | None, sort: str) -> tuple[list[Evento], int]:
        filters = []
        if category:
            filters.append(Evento.tipo == category.upper())
        if modality_id:
            filters.append(Evento.modalidade_id == modality_id)
        if start:
            filters.append(Evento.data_hora >= start)
        if end:
            filters.append(Evento.data_hora <= end)
        if search:
            filters.append(or_(Evento.titulo.ilike(f"%{search}%"), Evento.local.ilike(f"%{search}%"), Evento.descricao.ilike(f"%{search}%")))
        total = self.db.scalar(select(func.count()).select_from(Evento).where(*filters)) or 0
        order = Evento.data_hora.asc() if sort == "asc" else Evento.data_hora.desc()
        query = select(Evento).options(joinedload(Evento.modalidade), joinedload(Evento.resultado)).where(*filters).order_by(order).offset((page - 1) * page_size).limit(page_size)
        return list(self.db.scalars(query).unique()), total

    def event_by_slug(self, slug: str) -> Evento | None:
        return self.db.scalar(select(Evento).options(joinedload(Evento.modalidade), joinedload(Evento.resultado)).where(Evento.slug == slug))

    def event_by_id(self, item_id: int) -> Evento | None:
        return self.db.scalar(select(Evento).options(joinedload(Evento.modalidade), joinedload(Evento.resultado)).where(Evento.id == item_id))

    def list_results(self, page: int, page_size: int, search: str | None, modality_id: int | None, start: datetime | None, end: datetime | None, sort: str) -> tuple[list[Resultado], int]:
        filters = []
        if modality_id:
            filters.append(Resultado.modalidade_id == modality_id)
        if start:
            filters.append(Resultado.data >= start.date())
        if end:
            filters.append(Resultado.data <= end.date())
        if search:
            filters.append(or_(Resultado.adversario.ilike(f"%{search}%"), Resultado.campeonato.ilike(f"%{search}%"), Resultado.modalidade.has(Modalidade.nome.ilike(f"%{search}%"))))
        total = self.db.scalar(select(func.count()).select_from(Resultado).where(*filters)) or 0
        order = Resultado.data.asc() if sort == "asc" else Resultado.data.desc()
        query = select(Resultado).options(joinedload(Resultado.modalidade), joinedload(Resultado.evento)).where(*filters).order_by(order).offset((page - 1) * page_size).limit(page_size)
        return list(self.db.scalars(query).unique()), total

    def result_by_id(self, item_id: int) -> Resultado | None:
        return self.db.scalar(select(Resultado).options(joinedload(Resultado.modalidade), joinedload(Resultado.evento)).where(Resultado.id == item_id))

    def achievements(self, modality_id: int | None = None) -> list[Conquista]:
        filters = [Conquista.modalidade_id == modality_id] if modality_id else []
        return list(self.db.scalars(select(Conquista).options(joinedload(Conquista.modalidade)).where(*filters).order_by(Conquista.ano.desc(), Conquista.id.desc())).unique())

    def achievement_by_id(self, item_id: int) -> Conquista | None:
        return self.db.scalar(select(Conquista).options(joinedload(Conquista.modalidade)).where(Conquista.id == item_id))

    def milestones(self) -> list[MarcoHistorico]:
        return list(self.db.scalars(select(MarcoHistorico).order_by(MarcoHistorico.ordem, MarcoHistorico.ano)))

    def milestone_by_id(self, item_id: int) -> MarcoHistorico | None:
        return self.db.get(MarcoHistorico, item_id)

