from datetime import date, datetime, time
from decimal import Decimal

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Numeric, SmallInteger, String, Text, Time, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

SCHEMA = "octacore"


class Base(DeclarativeBase):
    pass


class Usuario(Base):
    __tablename__ = "usuario"
    __table_args__ = {"schema": SCHEMA}
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nome: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(160))
    senha_hash: Mapped[str] = mapped_column(String(255))
    curso: Mapped[str] = mapped_column(String(100))
    foto_url: Mapped[str | None] = mapped_column(String(255))
    perfil: Mapped[str] = mapped_column(String(10), default="USUARIO")
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    atualizado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    noticias: Mapped[list["Noticia"]] = relationship(back_populates="autor")
    pedidos: Mapped[list["Pedido"]] = relationship(back_populates="usuario")


class Noticia(Base):
    __tablename__ = "noticia"
    __table_args__ = {"schema": SCHEMA}
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(200), unique=True)
    titulo: Mapped[str] = mapped_column(String(200))
    resumo: Mapped[str | None] = mapped_column(String(300))
    conteudo: Mapped[str] = mapped_column(Text)
    imagem_capa_url: Mapped[str | None] = mapped_column(String(255))
    categoria: Mapped[str] = mapped_column(String(20))
    autor_id: Mapped[int] = mapped_column(ForeignKey(f"{SCHEMA}.usuario.id", ondelete="RESTRICT"))
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    atualizado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    autor: Mapped[Usuario] = relationship(back_populates="noticias")


class Modalidade(Base):
    __tablename__ = "modalidade"
    __table_args__ = {"schema": SCHEMA}
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nome: Mapped[str] = mapped_column(String(80))
    slug: Mapped[str] = mapped_column(String(80), unique=True)
    descricao: Mapped[str | None] = mapped_column(Text)
    imagem_url: Mapped[str | None] = mapped_column(String(255))
    responsavel: Mapped[str | None] = mapped_column(String(120))
    local_treino: Mapped[str | None] = mapped_column(String(150))
    horarios: Mapped[list["HorarioTreino"]] = relationship(back_populates="modalidade", cascade="all, delete-orphan")
    integrantes: Mapped[list["IntegranteModalidade"]] = relationship(back_populates="modalidade", cascade="all, delete-orphan")
    eventos: Mapped[list["Evento"]] = relationship(back_populates="modalidade")
    resultados: Mapped[list["Resultado"]] = relationship(back_populates="modalidade")
    conquistas: Mapped[list["Conquista"]] = relationship(back_populates="modalidade")


class HorarioTreino(Base):
    __tablename__ = "horario_treino"
    __table_args__ = (UniqueConstraint("modalidade_id", "dia_semana", "hora_inicio"), {"schema": SCHEMA})
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    modalidade_id: Mapped[int] = mapped_column(ForeignKey(f"{SCHEMA}.modalidade.id", ondelete="CASCADE"))
    dia_semana: Mapped[int] = mapped_column(SmallInteger)
    hora_inicio: Mapped[time] = mapped_column(Time)
    hora_fim: Mapped[time | None] = mapped_column(Time)
    modalidade: Mapped[Modalidade] = relationship(back_populates="horarios")


class Integrante(Base):
    __tablename__ = "integrante"
    __table_args__ = {"schema": SCHEMA}
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(140), unique=True)
    nome: Mapped[str] = mapped_column(String(120))
    curso: Mapped[str | None] = mapped_column(String(100))
    funcao: Mapped[str | None] = mapped_column(String(80))
    diretoria: Mapped[bool] = mapped_column(Boolean, default=False)
    foto_url: Mapped[str | None] = mapped_column(String(255))
    instagram: Mapped[str | None] = mapped_column(String(60))
    modalidades: Mapped[list["IntegranteModalidade"]] = relationship(back_populates="integrante", cascade="all, delete-orphan")


class IntegranteModalidade(Base):
    __tablename__ = "integrante_modalidade"
    __table_args__ = {"schema": SCHEMA}
    integrante_id: Mapped[int] = mapped_column(ForeignKey(f"{SCHEMA}.integrante.id", ondelete="CASCADE"), primary_key=True)
    modalidade_id: Mapped[int] = mapped_column(ForeignKey(f"{SCHEMA}.modalidade.id", ondelete="CASCADE"), primary_key=True)
    integrante: Mapped[Integrante] = relationship(back_populates="modalidades")
    modalidade: Mapped[Modalidade] = relationship(back_populates="integrantes")


class Evento(Base):
    __tablename__ = "evento"
    __table_args__ = {"schema": SCHEMA}
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True)
    titulo: Mapped[str] = mapped_column(String(150))
    descricao: Mapped[str | None] = mapped_column(Text)
    tipo: Mapped[str] = mapped_column(String(15))
    data_hora: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    local: Mapped[str] = mapped_column(String(150))
    imagem_url: Mapped[str | None] = mapped_column(String(255))
    modalidade_id: Mapped[int | None] = mapped_column(ForeignKey(f"{SCHEMA}.modalidade.id", ondelete="SET NULL"))
    modalidade: Mapped[Modalidade | None] = relationship(back_populates="eventos")
    resultado: Mapped["Resultado | None"] = relationship(back_populates="evento", uselist=False)


class Resultado(Base):
    __tablename__ = "resultado"
    __table_args__ = {"schema": SCHEMA}
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    modalidade_id: Mapped[int] = mapped_column(ForeignKey(f"{SCHEMA}.modalidade.id", ondelete="RESTRICT"))
    evento_id: Mapped[int | None] = mapped_column(ForeignKey(f"{SCHEMA}.evento.id", ondelete="SET NULL"), unique=True)
    adversario: Mapped[str] = mapped_column(String(120))
    placar_octa: Mapped[int] = mapped_column(Integer)
    placar_adversario: Mapped[int] = mapped_column(Integer)
    campeonato: Mapped[str | None] = mapped_column(String(150))
    data: Mapped[date] = mapped_column(Date)
    modalidade: Mapped[Modalidade] = relationship(back_populates="resultados")
    evento: Mapped[Evento | None] = relationship(back_populates="resultado")


class Conquista(Base):
    __tablename__ = "conquista"
    __table_args__ = {"schema": SCHEMA}
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    titulo: Mapped[str] = mapped_column(String(150))
    campeonato: Mapped[str] = mapped_column(String(150))
    colocacao: Mapped[str] = mapped_column(String(40))
    ano: Mapped[int] = mapped_column(SmallInteger)
    descricao: Mapped[str | None] = mapped_column(Text)
    modalidade_id: Mapped[int | None] = mapped_column(ForeignKey(f"{SCHEMA}.modalidade.id", ondelete="SET NULL"))
    modalidade: Mapped[Modalidade | None] = relationship(back_populates="conquistas")


class MarcoHistorico(Base):
    __tablename__ = "marco_historico"
    __table_args__ = {"schema": SCHEMA}
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ano: Mapped[int] = mapped_column(SmallInteger)
    titulo: Mapped[str] = mapped_column(String(150))
    descricao: Mapped[str | None] = mapped_column(Text)
    ordem: Mapped[int] = mapped_column(Integer, default=0)


class Produto(Base):
    __tablename__ = "produto"
    __table_args__ = {"schema": SCHEMA}
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(140), unique=True)
    nome: Mapped[str] = mapped_column(String(120))
    descricao: Mapped[str | None] = mapped_column(Text)
    preco: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    categoria: Mapped[str] = mapped_column(String(15))
    imagem_url: Mapped[str | None] = mapped_column(String(255))
    ativo: Mapped[bool] = mapped_column(Boolean, default=True)
    variacoes: Mapped[list["ProdutoVariacao"]] = relationship(back_populates="produto", cascade="all, delete-orphan")


class ProdutoVariacao(Base):
    __tablename__ = "produto_variacao"
    __table_args__ = (UniqueConstraint("produto_id", "tamanho"), {"schema": SCHEMA})
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    produto_id: Mapped[int] = mapped_column(ForeignKey(f"{SCHEMA}.produto.id", ondelete="CASCADE"))
    tamanho: Mapped[str] = mapped_column(String(10), default="UNICO")
    estoque: Mapped[int] = mapped_column(Integer, default=0)
    produto: Mapped[Produto] = relationship(back_populates="variacoes")
    itens: Mapped[list["ItemPedido"]] = relationship(back_populates="variacao")


class Pedido(Base):
    __tablename__ = "pedido"
    __table_args__ = {"schema": SCHEMA}
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey(f"{SCHEMA}.usuario.id", ondelete="RESTRICT"))
    status: Mapped[str] = mapped_column(String(25), default="PENDENTE")
    valor_total: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    nome_contato: Mapped[str] = mapped_column(String(120))
    telefone_contato: Mapped[str] = mapped_column(String(20))
    forma_retirada: Mapped[str] = mapped_column(String(20))
    observacoes: Mapped[str | None] = mapped_column(Text)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    atualizado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    usuario: Mapped[Usuario] = relationship(back_populates="pedidos")
    itens: Mapped[list["ItemPedido"]] = relationship(back_populates="pedido", cascade="all, delete-orphan")


class ItemPedido(Base):
    __tablename__ = "item_pedido"
    __table_args__ = (UniqueConstraint("pedido_id", "variacao_id"), {"schema": SCHEMA})
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    pedido_id: Mapped[int] = mapped_column(ForeignKey(f"{SCHEMA}.pedido.id", ondelete="CASCADE"))
    variacao_id: Mapped[int] = mapped_column(ForeignKey(f"{SCHEMA}.produto_variacao.id", ondelete="RESTRICT"))
    quantidade: Mapped[int] = mapped_column(Integer)
    preco_unitario: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    pedido: Mapped[Pedido] = relationship(back_populates="itens")
    variacao: Mapped[ProdutoVariacao] = relationship(back_populates="itens")

