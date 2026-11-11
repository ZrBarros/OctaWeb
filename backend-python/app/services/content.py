from datetime import UTC, datetime, time

from sqlalchemy.orm import Session

from app.errors import not_found
from app.models import Conquista, Evento, HorarioTreino, Integrante, IntegranteModalidade, MarcoHistorico, Modalidade, Noticia, Resultado
from app.repositories.content import ContentRepository
from app.schemas import AchievementInput, EventInput, MemberInput, MilestoneInput, ModalityInput, NewsInput, ResultInput
from app.utils import make_slug


class ContentService:
    def __init__(self, repository: ContentRepository) -> None:
        self.repository = repository
        self.db: Session = repository.db

    def create_news(self, data: NewsInput, current_user_id: int) -> Noticia:
        now = datetime.now(UTC)
        item = Noticia(slug=data.slug or make_slug(data.title), titulo=data.title, resumo=data.summary, conteudo=data.content, imagem_capa_url=data.imageUrl, categoria=data.category, autor_id=data.authorId or current_user_id, criado_em=now, atualizado_em=now)
        self.repository.save(item)
        return self.repository.news_by_id(item.id)  # type: ignore[return-value]

    def update_news(self, item_id: int, data: NewsInput, current_user_id: int) -> Noticia:
        item = self.repository.news_by_id(item_id)
        if not item:
            raise not_found("Notícia")
        item.slug, item.titulo, item.resumo, item.conteudo = data.slug or make_slug(data.title), data.title, data.summary, data.content
        item.imagem_capa_url, item.categoria, item.autor_id = data.imageUrl, data.category, data.authorId or current_user_id
        self.repository.save(item)
        return self.repository.news_by_id(item.id)  # type: ignore[return-value]

    def delete_news(self, item_id: int) -> None:
        item = self.repository.news_by_id(item_id)
        if not item:
            raise not_found("Notícia")
        self.repository.delete(item)

    def create_modality(self, data: ModalityInput) -> Modalidade:
        item = Modalidade(nome=data.name, slug=data.slug or make_slug(data.name), descricao=data.description, imagem_url=data.imageUrl, responsavel=data.responsible, local_treino=data.trainingPlace)
        item.horarios = [HorarioTreino(dia_semana=row.dayOfWeek, hora_inicio=time.fromisoformat(row.startTime), hora_fim=time.fromisoformat(row.endTime) if row.endTime else None) for row in data.schedules or []]
        self.repository.save(item)
        return self.repository.modality_by_id(item.id)  # type: ignore[return-value]

    def update_modality(self, item_id: int, data: ModalityInput) -> Modalidade:
        item = self.repository.modality_by_id(item_id)
        if not item:
            raise not_found("Modalidade")
        item.nome, item.slug, item.descricao = data.name, data.slug or make_slug(data.name), data.description
        item.imagem_url, item.responsavel, item.local_treino = data.imageUrl, data.responsible, data.trainingPlace
        if data.schedules is not None:
            item.horarios = [HorarioTreino(dia_semana=row.dayOfWeek, hora_inicio=time.fromisoformat(row.startTime), hora_fim=time.fromisoformat(row.endTime) if row.endTime else None) for row in data.schedules]
        self.repository.save(item)
        return self.repository.modality_by_id(item.id)  # type: ignore[return-value]

    def delete_modality(self, item_id: int) -> None:
        item = self.repository.modality_by_id(item_id)
        if not item:
            raise not_found("Modalidade")
        self.repository.delete(item)

    def _modality_links(self, ids: list[int]) -> list[IntegranteModalidade]:
        return [IntegranteModalidade(modalidade_id=value) for value in ids]

    def create_member(self, data: MemberInput) -> Integrante:
        item = Integrante(slug=data.slug or make_slug(data.name), nome=data.name, curso=data.course, funcao=data.role, diretoria=data.boardMember, foto_url=data.photoUrl, instagram=data.instagram.lstrip("@") if data.instagram else None)
        item.modalidades = self._modality_links(data.modalityIds)
        self.repository.save(item)
        return self.repository.member_by_id(item.id)  # type: ignore[return-value]

    def update_member(self, item_id: int, data: MemberInput) -> Integrante:
        item = self.repository.member_by_id(item_id)
        if not item:
            raise not_found("Integrante")
        item.slug, item.nome, item.curso, item.funcao = data.slug or make_slug(data.name), data.name, data.course, data.role
        item.diretoria, item.foto_url, item.instagram = data.boardMember, data.photoUrl, data.instagram.lstrip("@") if data.instagram else None
        item.modalidades = self._modality_links(data.modalityIds)
        self.repository.save(item)
        return self.repository.member_by_id(item.id)  # type: ignore[return-value]

    def delete_member(self, item_id: int) -> None:
        item = self.repository.member_by_id(item_id)
        if not item:
            raise not_found("Integrante")
        self.repository.delete(item)

    def create_event(self, data: EventInput) -> Evento:
        item = Evento(slug=data.slug or make_slug(data.title), titulo=data.title, descricao=data.description, tipo=data.type, data_hora=data.dateTime, local=data.place, imagem_url=data.imageUrl, modalidade_id=data.modalityId)
        self.repository.save(item)
        return self.repository.event_by_id(item.id)  # type: ignore[return-value]

    def update_event(self, item_id: int, data: EventInput) -> Evento:
        item = self.repository.event_by_id(item_id)
        if not item:
            raise not_found("Evento")
        item.slug, item.titulo, item.descricao, item.tipo = data.slug or make_slug(data.title), data.title, data.description, data.type
        item.data_hora, item.local, item.imagem_url, item.modalidade_id = data.dateTime, data.place, data.imageUrl, data.modalityId
        self.repository.save(item)
        return self.repository.event_by_id(item.id)  # type: ignore[return-value]

    def delete_event(self, item_id: int) -> None:
        item = self.repository.event_by_id(item_id)
        if not item:
            raise not_found("Evento")
        self.repository.delete(item)

    def create_result(self, data: ResultInput) -> Resultado:
        item = Resultado(modalidade_id=data.modalityId, evento_id=data.eventId, adversario=data.opponent, placar_octa=data.ourScore, placar_adversario=data.opponentScore, campeonato=data.competition, data=data.date)
        self.repository.save(item)
        return self.repository.result_by_id(item.id)  # type: ignore[return-value]

    def update_result(self, item_id: int, data: ResultInput) -> Resultado:
        item = self.repository.result_by_id(item_id)
        if not item:
            raise not_found("Resultado")
        item.modalidade_id, item.evento_id, item.adversario = data.modalityId, data.eventId, data.opponent
        item.placar_octa, item.placar_adversario, item.campeonato, item.data = data.ourScore, data.opponentScore, data.competition, data.date
        self.repository.save(item)
        return self.repository.result_by_id(item.id)  # type: ignore[return-value]

    def delete_result(self, item_id: int) -> None:
        item = self.repository.result_by_id(item_id)
        if not item:
            raise not_found("Resultado")
        self.repository.delete(item)

    def create_achievement(self, data: AchievementInput) -> Conquista:
        item = Conquista(titulo=data.title, campeonato=data.competition, colocacao=data.placement, ano=data.year, descricao=data.description, modalidade_id=data.modalityId)
        self.repository.save(item)
        return self.repository.achievement_by_id(item.id)  # type: ignore[return-value]

    def update_achievement(self, item_id: int, data: AchievementInput) -> Conquista:
        item = self.repository.achievement_by_id(item_id)
        if not item:
            raise not_found("Conquista")
        item.titulo, item.campeonato, item.colocacao, item.ano = data.title, data.competition, data.placement, data.year
        item.descricao, item.modalidade_id = data.description, data.modalityId
        self.repository.save(item)
        return self.repository.achievement_by_id(item.id)  # type: ignore[return-value]

    def delete_achievement(self, item_id: int) -> None:
        item = self.repository.achievement_by_id(item_id)
        if not item:
            raise not_found("Conquista")
        self.repository.delete(item)

    def create_milestone(self, data: MilestoneInput) -> MarcoHistorico:
        return self.repository.save(MarcoHistorico(ano=data.year, titulo=data.title, descricao=data.description, ordem=data.order))

    def update_milestone(self, item_id: int, data: MilestoneInput) -> MarcoHistorico:
        item = self.repository.milestone_by_id(item_id)
        if not item:
            raise not_found("Marco histórico")
        item.ano, item.titulo, item.descricao, item.ordem = data.year, data.title, data.description, data.order
        return self.repository.save(item)

    def delete_milestone(self, item_id: int) -> None:
        item = self.repository.milestone_by_id(item_id)
        if not item:
            raise not_found("Marco histórico")
        self.repository.delete(item)

