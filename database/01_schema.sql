-- =====================================================================
-- Plataforma Web da Atlética Octacore — Esquema do banco (MVP)
-- SGBD: PostgreSQL 14+   |   Codificação: UTF-8
-- Baseado no MER Octacore (14 tabelas). Slugs alinhados às rotas do front end
-- (/noticias/[slug], /agenda/[slug], /loja/[slug], /modalidades/[slug], /mural/integrantes/[slug]).
-- Execução: psql -U postgres -d octacore -f 01_schema.sql
-- O script é idempotente: recria o schema "octacore" do zero.
-- =====================================================================

DROP SCHEMA IF EXISTS octacore CASCADE;
CREATE SCHEMA octacore;
SET search_path TO octacore, public;

-- ---------------------------------------------------------------------
-- Função utilitária: atualiza a coluna atualizado_em em todo UPDATE
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_set_atualizado_em()
RETURNS trigger AS $$
BEGIN
    NEW.atualizado_em := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- 1. ACESSO
-- =====================================================================
CREATE TABLE usuario (
    id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome          VARCHAR(120) NOT NULL,
    email         VARCHAR(160) NOT NULL,
    senha_hash    VARCHAR(255) NOT NULL,              -- nunca a senha em texto puro (RNF2)
    curso         VARCHAR(100) NOT NULL,
    foto_url      VARCHAR(255),
    perfil        VARCHAR(10)  NOT NULL DEFAULT 'USUARIO'
                  CHECK (perfil IN ('USUARIO', 'ADMIN')),
    criado_em     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT ck_usuario_email CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);
-- e-mail único sem diferenciar maiúsculas/minúsculas
CREATE UNIQUE INDEX uq_usuario_email ON usuario (lower(email));

-- =====================================================================
-- 2. CONTEÚDO
-- =====================================================================
CREATE TABLE noticia (
    id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug            VARCHAR(200) NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    titulo          VARCHAR(200) NOT NULL,
    resumo          VARCHAR(300),
    conteudo        TEXT         NOT NULL,
    imagem_capa_url VARCHAR(255),
    categoria       VARCHAR(20)  NOT NULL
                    CHECK (categoria IN ('CAMPEONATOS','JOGOS','RESULTADOS','SELETIVAS',
                                         'TREINOS','FESTAS','EVENTOS','COMUNICADOS')),
    autor_id        INTEGER      NOT NULL
                    REFERENCES usuario (id) ON DELETE RESTRICT,
    criado_em       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    atualizado_em   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX ix_noticia_autor     ON noticia (autor_id);
CREATE INDEX ix_noticia_criado_em ON noticia (criado_em DESC);

-- Regra: apenas administradores podem ser autores de notícias
CREATE OR REPLACE FUNCTION fn_noticia_autor_admin()
RETURNS trigger AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM usuario WHERE id = NEW.autor_id AND perfil = 'ADMIN') THEN
        RAISE EXCEPTION 'O autor da notícia (usuario %) deve ter perfil ADMIN', NEW.autor_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_noticia_autor_admin
    BEFORE INSERT OR UPDATE OF autor_id ON noticia
    FOR EACH ROW EXECUTE FUNCTION fn_noticia_autor_admin();

-- =====================================================================
-- 3. ESPORTES E MURAL
-- =====================================================================
CREATE TABLE modalidade (
    id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome         VARCHAR(80)  NOT NULL,
    slug         VARCHAR(80)  NOT NULL UNIQUE
                 CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),   -- ex.: futsal, e-sports
    descricao    TEXT,
    imagem_url   VARCHAR(255),
    responsavel  VARCHAR(120),
    local_treino VARCHAR(150)
);

CREATE TABLE horario_treino (
    id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    modalidade_id INTEGER  NOT NULL REFERENCES modalidade (id) ON DELETE CASCADE,
    dia_semana    SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),  -- 0 = domingo
    hora_inicio   TIME     NOT NULL,
    hora_fim      TIME,
    CONSTRAINT ck_horario_intervalo CHECK (hora_fim IS NULL OR hora_fim > hora_inicio),
    CONSTRAINT uq_horario UNIQUE (modalidade_id, dia_semana, hora_inicio)
);

CREATE TABLE integrante (
    id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug       VARCHAR(140) NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    nome       VARCHAR(120) NOT NULL,
    curso      VARCHAR(100),
    funcao     VARCHAR(80),                    -- ex.: Presidente, Atleta
    diretoria  BOOLEAN      NOT NULL DEFAULT false,
    foto_url   VARCHAR(255),
    instagram  VARCHAR(60)
);

CREATE TABLE integrante_modalidade (
    integrante_id INTEGER NOT NULL REFERENCES integrante (id) ON DELETE CASCADE,
    modalidade_id INTEGER NOT NULL REFERENCES modalidade (id) ON DELETE CASCADE,
    PRIMARY KEY (integrante_id, modalidade_id)
);
CREATE INDEX ix_int_mod_modalidade ON integrante_modalidade (modalidade_id);

CREATE TABLE evento (
    id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug          VARCHAR(160) NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    titulo        VARCHAR(150) NOT NULL,
    descricao     TEXT,
    tipo          VARCHAR(15)  NOT NULL
                  CHECK (tipo IN ('TREINO','JOGO','CAMPEONATO','SELETIVA','FESTA','REUNIAO','EVENTO')),
    data_hora     TIMESTAMPTZ  NOT NULL,
    local         VARCHAR(150) NOT NULL,
    imagem_url    VARCHAR(255),
    modalidade_id INTEGER REFERENCES modalidade (id) ON DELETE SET NULL
);
CREATE INDEX ix_evento_data_hora  ON evento (data_hora);
CREATE INDEX ix_evento_modalidade ON evento (modalidade_id);

CREATE TABLE resultado (
    id                INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    modalidade_id     INTEGER      NOT NULL REFERENCES modalidade (id) ON DELETE RESTRICT,
    evento_id         INTEGER      UNIQUE   REFERENCES evento (id) ON DELETE SET NULL,
    adversario        VARCHAR(120) NOT NULL,
    placar_octa       INTEGER      NOT NULL CHECK (placar_octa >= 0),
    placar_adversario INTEGER      NOT NULL CHECK (placar_adversario >= 0),
    campeonato        VARCHAR(150),
    data              DATE         NOT NULL
);
CREATE INDEX ix_resultado_modalidade ON resultado (modalidade_id, data DESC);

CREATE TABLE conquista (
    id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo        VARCHAR(150) NOT NULL,
    campeonato    VARCHAR(150) NOT NULL,
    colocacao     VARCHAR(40)  NOT NULL,             -- ex.: Campeão, Vice-campeão, 3º lugar
    ano           SMALLINT     NOT NULL CHECK (ano BETWEEN 2000 AND 2100),
    descricao     TEXT,
    modalidade_id INTEGER REFERENCES modalidade (id) ON DELETE SET NULL
);
CREATE INDEX ix_conquista_modalidade ON conquista (modalidade_id);

CREATE TABLE marco_historico (
    id        INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ano       SMALLINT     NOT NULL CHECK (ano BETWEEN 2000 AND 2100),
    titulo    VARCHAR(150) NOT NULL,
    descricao TEXT,
    ordem     INTEGER      NOT NULL DEFAULT 0
);

-- =====================================================================
-- 4. LOJA
-- =====================================================================
CREATE TABLE produto (
    id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug       VARCHAR(140)  NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    nome       VARCHAR(120)  NOT NULL,
    descricao  TEXT,
    preco      NUMERIC(10,2) NOT NULL CHECK (preco >= 0),
    categoria  VARCHAR(15)   NOT NULL
               CHECK (categoria IN ('CAMISAS','TIRANTES','COPOS','BONES','ACESSORIOS','KITS')),
    imagem_url VARCHAR(255),
    ativo      BOOLEAN       NOT NULL DEFAULT true    -- false = oculto na loja (preferir a excluir)
);

CREATE TABLE produto_variacao (
    id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    produto_id INTEGER     NOT NULL REFERENCES produto (id) ON DELETE CASCADE,
    tamanho    VARCHAR(10) NOT NULL DEFAULT 'UNICO',  -- P, M, G, GG ou UNICO
    estoque    INTEGER     NOT NULL DEFAULT 0 CHECK (estoque >= 0),   -- nunca negativo (RNF3)
    CONSTRAINT uq_variacao UNIQUE (produto_id, tamanho)
);

CREATE TABLE pedido (
    id               INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id       INTEGER       NOT NULL REFERENCES usuario (id) ON DELETE RESTRICT,
    status           VARCHAR(25)   NOT NULL DEFAULT 'PENDENTE'
                     CHECK (status IN ('PENDENTE','CONFIRMADO','EM_SEPARACAO',
                                       'DISPONIVEL_RETIRADA','ENTREGUE','CANCELADO')),
    valor_total      NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (valor_total >= 0),
    nome_contato     VARCHAR(120)  NOT NULL,
    telefone_contato VARCHAR(20)   NOT NULL,
    forma_retirada   VARCHAR(20)   NOT NULL
                     CHECK (forma_retirada IN ('CAMPUS','COMBINAR')),
    observacoes      TEXT,
    criado_em        TIMESTAMPTZ   NOT NULL DEFAULT now(),
    atualizado_em    TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX ix_pedido_usuario ON pedido (usuario_id, criado_em DESC);
CREATE INDEX ix_pedido_status  ON pedido (status);

CREATE TABLE item_pedido (
    id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pedido_id      INTEGER       NOT NULL REFERENCES pedido (id) ON DELETE CASCADE,
    variacao_id    INTEGER       NOT NULL REFERENCES produto_variacao (id) ON DELETE RESTRICT,
    quantidade     INTEGER       NOT NULL CHECK (quantidade > 0),
    preco_unitario NUMERIC(10,2) NOT NULL CHECK (preco_unitario >= 0),  -- preço na data da compra
    CONSTRAINT uq_item_pedido UNIQUE (pedido_id, variacao_id)
);
CREATE INDEX ix_item_variacao ON item_pedido (variacao_id);

-- Mantém pedido.valor_total = soma(quantidade * preco_unitario) dos itens
CREATE OR REPLACE FUNCTION fn_recalcular_total_pedido()
RETURNS trigger AS $$
DECLARE
    v_pedido INTEGER := COALESCE(NEW.pedido_id, OLD.pedido_id);
BEGIN
    UPDATE pedido
       SET valor_total = COALESCE((SELECT SUM(quantidade * preco_unitario)
                                     FROM item_pedido WHERE pedido_id = v_pedido), 0)
     WHERE id = v_pedido;
    IF TG_OP = 'UPDATE' AND OLD.pedido_id <> NEW.pedido_id THEN
        UPDATE pedido
           SET valor_total = COALESCE((SELECT SUM(quantidade * preco_unitario)
                                         FROM item_pedido WHERE pedido_id = OLD.pedido_id), 0)
         WHERE id = OLD.pedido_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_item_pedido_total
    AFTER INSERT OR UPDATE OR DELETE ON item_pedido
    FOR EACH ROW EXECUTE FUNCTION fn_recalcular_total_pedido();

-- =====================================================================
-- Triggers de atualizado_em
-- =====================================================================
CREATE TRIGGER tg_usuario_atualizado BEFORE UPDATE ON usuario
    FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();
CREATE TRIGGER tg_noticia_atualizado BEFORE UPDATE ON noticia
    FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();
CREATE TRIGGER tg_pedido_atualizado BEFORE UPDATE ON pedido
    FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

-- =====================================================================
-- Comentários (documentação no próprio banco)
-- =====================================================================
COMMENT ON TABLE usuario               IS 'Contas da plataforma; perfil USUARIO ou ADMIN.';
COMMENT ON TABLE noticia               IS 'Octa News; autor obrigatoriamente ADMIN.';
COMMENT ON TABLE evento                IS 'Agenda Octa; modalidade opcional (festas/reuniões).';
COMMENT ON TABLE modalidade            IS 'Esportes; slug usado na rota /modalidades/:slug.';
COMMENT ON TABLE horario_treino        IS 'Horários semanais de treino (0 = domingo).';
COMMENT ON TABLE integrante            IS 'Membros exibidos no Mural.';
COMMENT ON TABLE integrante_modalidade IS 'Associação N:N entre integrantes e modalidades.';
COMMENT ON TABLE resultado             IS 'Placares; ligação opcional 1:1 com o evento do jogo.';
COMMENT ON TABLE conquista             IS 'Títulos e colocações do Mural.';
COMMENT ON TABLE marco_historico       IS 'Linha do tempo da história da Octacore.';
COMMENT ON TABLE produto               IS 'Catálogo da Octa Store.';
COMMENT ON TABLE produto_variacao      IS 'Tamanho do produto com estoque próprio.';
COMMENT ON TABLE pedido                IS 'Pedido do checkout simulado (sem cobrança real).';
COMMENT ON TABLE item_pedido           IS 'Itens do pedido com preço congelado na compra.';
