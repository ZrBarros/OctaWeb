from datetime import UTC, datetime, time
from decimal import Decimal
from typing import Any

from app import models


def iso_datetime(value: datetime) -> str:
    if value.tzinfo is None:
        value = value.replace(tzinfo=UTC)
    return value.isoformat().replace("+00:00", "Z")


def time_as_datetime(value: time | None) -> str | None:
    if value is None:
        return None
    return f"1970-01-01T{value.strftime('%H:%M:%S')}.000Z"


def decimal_string(value: Decimal | int | str) -> str:
    return f"{Decimal(value):.2f}"


def user(item: models.Usuario) -> dict[str, Any]:
    return {"id": item.id, "nome": item.nome, "email": item.email, "curso": item.curso, "fotoUrl": item.foto_url, "perfil": item.perfil, "criadoEm": iso_datetime(item.criado_em), "atualizadoEm": iso_datetime(item.atualizado_em)}


def news(item: models.Noticia) -> dict[str, Any]:
    return {"id": item.id, "slug": item.slug, "titulo": item.titulo, "resumo": item.resumo, "conteudo": item.conteudo, "imagemCapaUrl": item.imagem_capa_url, "categoria": item.categoria, "autorId": item.autor_id, "criadoEm": iso_datetime(item.criado_em), "atualizadoEm": iso_datetime(item.atualizado_em), "autor": {"id": item.autor.id, "nome": item.autor.nome}}


def schedule(item: models.HorarioTreino) -> dict[str, Any]:
    return {"id": item.id, "modalidadeId": item.modalidade_id, "diaSemana": item.dia_semana, "horaInicio": time_as_datetime(item.hora_inicio), "horaFim": time_as_datetime(item.hora_fim)}


def modality_scalar(item: models.Modalidade | None) -> dict[str, Any] | None:
    if item is None:
        return None
    return {"id": item.id, "nome": item.nome, "slug": item.slug, "descricao": item.descricao, "imagemUrl": item.imagem_url, "responsavel": item.responsavel, "localTreino": item.local_treino}


def modality(item: models.Modalidade, detail: bool = False, counts: dict[str, int] | None = None) -> dict[str, Any]:
    result = {**(modality_scalar(item) or {}), "horarios": [schedule(value) for value in sorted(item.horarios, key=lambda row: (row.dia_semana, row.hora_inicio))]}
    if counts is not None:
        result["_count"] = counts
    if detail:
        result["integrantes"] = [{"integranteId": link.integrante_id, "modalidadeId": link.modalidade_id, "integrante": member(link.integrante, include_modalities=False)} for link in item.integrantes]
        result["resultados"] = [sports_result(value, include_relations=False) for value in sorted(item.resultados, key=lambda row: row.data, reverse=True)[:10]]
        result["eventos"] = [event(value, include_relations=False) for value in sorted(item.eventos, key=lambda row: row.data_hora)[:10]]
    return result


def member(item: models.Integrante, include_modalities: bool = True) -> dict[str, Any]:
    result = {"id": item.id, "slug": item.slug, "nome": item.nome, "curso": item.curso, "funcao": item.funcao, "diretoria": item.diretoria, "fotoUrl": item.foto_url, "instagram": item.instagram}
    if include_modalities:
        result["modalidades"] = [{"integranteId": link.integrante_id, "modalidadeId": link.modalidade_id, "modalidade": modality_scalar(link.modalidade)} for link in item.modalidades]
    return result


def event(item: models.Evento, include_relations: bool = True) -> dict[str, Any]:
    result = {"id": item.id, "slug": item.slug, "titulo": item.titulo, "descricao": item.descricao, "tipo": item.tipo, "dataHora": iso_datetime(item.data_hora), "local": item.local, "imagemUrl": item.imagem_url, "modalidadeId": item.modalidade_id}
    if include_relations:
        result["modalidade"] = modality_scalar(item.modalidade)
        result["resultado"] = sports_result(item.resultado, include_relations=False) if item.resultado else None
    return result


def sports_result(item: models.Resultado, include_relations: bool = True) -> dict[str, Any]:
    result = {"id": item.id, "modalidadeId": item.modalidade_id, "eventoId": item.evento_id, "adversario": item.adversario, "placarOcta": item.placar_octa, "placarAdversario": item.placar_adversario, "campeonato": item.campeonato, "data": item.data.isoformat()}
    if include_relations:
        result["modalidade"] = modality_scalar(item.modalidade)
        result["evento"] = event(item.evento, include_relations=False) if item.evento else None
    return result


def achievement(item: models.Conquista) -> dict[str, Any]:
    return {"id": item.id, "titulo": item.titulo, "campeonato": item.campeonato, "colocacao": item.colocacao, "ano": item.ano, "descricao": item.descricao, "modalidadeId": item.modalidade_id, "modalidade": modality_scalar(item.modalidade)}


def milestone(item: models.MarcoHistorico) -> dict[str, Any]:
    return {"id": item.id, "ano": item.ano, "titulo": item.titulo, "descricao": item.descricao, "ordem": item.ordem}


def variation(item: models.ProdutoVariacao, include_product: bool = False) -> dict[str, Any]:
    result = {"id": item.id, "produtoId": item.produto_id, "tamanho": item.tamanho, "estoque": item.estoque}
    if include_product:
        result["produto"] = product(item.produto, include_variations=False)
    return result


def product(item: models.Produto, include_variations: bool = True) -> dict[str, Any]:
    result = {"id": item.id, "slug": item.slug, "nome": item.nome, "descricao": item.descricao, "preco": decimal_string(item.preco), "categoria": item.categoria, "imagemUrl": item.imagem_url, "ativo": item.ativo}
    if include_variations:
        result["variacoes"] = [variation(value) for value in sorted(item.variacoes, key=lambda row: row.id)]
    return result


def order(item: models.Pedido) -> dict[str, Any]:
    return {"id": item.id, "usuarioId": item.usuario_id, "status": item.status, "valorTotal": decimal_string(item.valor_total), "nomeContato": item.nome_contato, "telefoneContato": item.telefone_contato, "formaRetirada": item.forma_retirada, "observacoes": item.observacoes, "criadoEm": iso_datetime(item.criado_em), "atualizadoEm": iso_datetime(item.atualizado_em), "usuario": {"id": item.usuario.id, "nome": item.usuario.nome, "email": item.usuario.email}, "itens": [{"id": value.id, "pedidoId": value.pedido_id, "variacaoId": value.variacao_id, "quantidade": value.quantidade, "precoUnitario": decimal_string(value.preco_unitario), "variacao": variation(value.variacao, include_product=True)} for value in item.itens]}


def page(items: list[Any], total: int, page_number: int, page_size: int) -> dict[str, Any]:
    return {"data": items, "meta": {"page": page_number, "pageSize": page_size, "total": total, "totalPages": (total + page_size - 1) // page_size}}

