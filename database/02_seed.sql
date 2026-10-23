-- =====================================================================
-- Octacore — Dados de exemplo para desenvolvimento e demonstração
-- Execute após 01_schema.sql:  psql -U postgres -d octacore -f 02_seed.sql
-- Produtos, notícias e modalidades usam os mesmos slugs de frontend/src/data.
-- ATENÇÃO: as senhas abaixo são apenas para ambiente local de testes.
--          Troque-as e não use este script em produção.
-- =====================================================================
SET search_path TO octacore, public;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;   -- crypt()/gen_salt() geram hash bcrypt

BEGIN;

-- Usuários (senha de teste: Octa@2026)
INSERT INTO usuario (nome, email, senha_hash, curso, perfil) VALUES
 ('Diretoria Octacore', 'admin@octacore.dev', crypt('Octa@2026', gen_salt('bf', 10)), 'Ciência da Computação', 'ADMIN'),
 ('Maria Souza',        'maria@octacore.dev', crypt('Octa@2026', gen_salt('bf', 10)), 'Engenharia de Computação', 'USUARIO'),
 ('Pedro Lima',         'pedro@octacore.dev', crypt('Octa@2026', gen_salt('bf', 10)), 'Ciência da Computação', 'USUARIO');

-- Modalidades e horários
INSERT INTO modalidade (nome, slug, descricao, responsavel, local_treino) VALUES
 ('Futsal',   'futsal',   'Treinos focados na dinâmica de passes rápidos e finalização cirúrgica.', 'João Silva', 'Ginásio da UFAL'),
 ('Basquete', 'basquete', 'Tradição de arremessos de alta precisão e forte defesa na área do garrafão.', 'Ana Costa', 'Ginásio da UFAL'),
 ('Vôlei',    'volei',    'Equipe de vôlei da Octacore.',    'Lucas Melo', 'Quadra do IC'),
 ('Handebol', 'handebol', 'Equipe de handebol da Octacore.', 'Bia Santos', 'Ginásio da UFAL'),
 ('E-sports', 'e-sports', 'Equipe de e-sports da Octacore.', 'Rafa Gomes', 'Laboratório do IC');

INSERT INTO horario_treino (modalidade_id, dia_semana, hora_inicio, hora_fim) VALUES
 (1, 2, '18:00', '20:00'), (1, 4, '18:00', '20:00'),   -- futsal: terça e quinta
 (2, 1, '18:00', '20:00'), (2, 3, '18:00', '20:00'),
 (3, 3, '17:00', '19:00'),
 (5, 6, '14:00', '17:00');

-- Integrantes
INSERT INTO integrante (slug, nome, curso, funcao, diretoria, instagram) VALUES
 ('joao-silva',  'João Silva',  'Ciência da Computação',    'Presidente',           true,  '@joaosilva'),
 ('ana-costa',   'Ana Costa',   'Engenharia de Computação', 'Diretora de Esportes', true,  '@anacosta'),
 ('carlos-dias', 'Carlos Dias', 'Ciência da Computação',    'Atleta',               false, '@carlosdias'),
 ('julia-rocha', 'Júlia Rocha', 'Engenharia de Computação', 'Atleta',               false, NULL);

INSERT INTO integrante_modalidade (integrante_id, modalidade_id) VALUES
 (1, 1), (2, 2), (3, 1), (3, 3), (4, 3);

-- Eventos
INSERT INTO evento (slug, titulo, tipo, data_hora, local, modalidade_id) VALUES
 ('treino-de-basquete', 'Treino de Basquete', 'TREINO',   '2026-10-27 18:00-03', 'Ginásio da UFAL', 2),
 ('seletiva-de-volei',  'Seletiva de Vôlei',  'SELETIVA', '2026-10-29 17:00-03', 'Quadra do IC',    3),
 ('octa-x-atletica-x',  'Octa x Atlética X',  'JOGO',     '2026-10-10 20:00-03', 'Ginásio da UFAL', 1),
 ('festa-octacore',     'Festa Octacore',     'FESTA',    '2026-11-07 22:00-03', 'A definir',       NULL);

-- Resultados (o primeiro vinculado ao jogo do evento 3)
INSERT INTO resultado (modalidade_id, evento_id, adversario, placar_octa, placar_adversario, campeonato, data) VALUES
 (1, 3,    'Atlética X',          5,  2,  'Interatléticas 2026', '2026-10-10'),
 (2, NULL, 'Atlética Adversária', 72, 64, 'Universitário 2026',  '2026-09-20');

-- Mural: conquistas e história
INSERT INTO conquista (titulo, campeonato, colocacao, ano, modalidade_id) VALUES
 ('Campeão Interatléticas',     'Interatléticas',           'Campeão',      2026, 1),
 ('Vice-campeão Universitário', 'Campeonato Universitário', 'Vice-campeão', 2026, 2);

INSERT INTO marco_historico (ano, titulo, ordem) VALUES
 (2022, 'Fundação da Octacore', 1),
 (2023, 'Primeiro campeonato', 2),
 (2024, 'Primeiro título', 3),
 (2025, 'Expansão das modalidades', 4);

-- Notícias (autor = admin)
INSERT INTO noticia (slug, titulo, resumo, conteudo, categoria, autor_id) VALUES
 ('octa-conquista-titulo-no-interatleticas', 'Octa conquista título no Interatléticas',
  'A equipe de Futsal deu um show tático e garantiu a taça de campeã estadual em Maceió.',
  'Conteúdo de exemplo da notícia.', 'CAMPEONATOS', 1),
 ('seletiva-de-volei-aberta', 'Seletiva de vôlei aberta',
  'Inscrições abertas para a seletiva de vôlei.',
  'Conteúdo de exemplo da notícia.', 'SELETIVAS', 1);

-- Loja: mesmos slugs, nomes e preços de frontend/src/data/products.ts
INSERT INTO produto (slug, nome, descricao, preco, categoria, imagem_url) VALUES
 ('camisa-especial-octacore', 'Camisa Especial Octacore', 'Camisa esportiva premium · 2026',        59.90, 'CAMISAS',  NULL),
 ('tirante-octacore',         'Tirante Octacore',         'Acessório oficial da atlética',          39.90, 'TIRANTES', '/images/tirante-octacore-previa-fundo-branco.png'),
 ('caneca-octacore',          'Caneca Octacore',          'Perfeita para curtir os eventos',        45.00, 'COPOS',    '/images/caneca-octacore-previa-fundo-branco.png'),
 ('camisa-passeio-2026',      'Camisa Passeio 2026',      'Conforto e identidade para o dia a dia', 65.00, 'CAMISAS',  '/images/camisa-passeio-2026.png');

INSERT INTO produto_variacao (produto_id, tamanho, estoque) VALUES
 (1, 'P', 10), (1, 'M', 15), (1, 'G', 12), (1, 'GG', 5),
 (2, 'UNICO', 50), (3, 'UNICO', 30),
 (4, 'P', 8), (4, 'M', 10), (4, 'G', 10), (4, 'GG', 4);

-- Pedido de exemplo (total calculado pelo trigger: 59,90 + 2 x 39,90 = 139,70)
INSERT INTO pedido (usuario_id, nome_contato, telefone_contato, forma_retirada)
VALUES (2, 'Maria Souza', '82900000000', 'CAMPUS');

INSERT INTO item_pedido (pedido_id, variacao_id, quantidade, preco_unitario)
SELECT 1, v.id, x.qtd, p.preco
  FROM (VALUES (1, 'M', 1), (2, 'UNICO', 2)) AS x(produto_id, tamanho, qtd)
  JOIN produto_variacao v ON v.produto_id = x.produto_id AND v.tamanho = x.tamanho
  JOIN produto p          ON p.id = v.produto_id;

UPDATE produto_variacao v SET estoque = estoque - i.quantidade
  FROM item_pedido i WHERE i.variacao_id = v.id AND i.pedido_id = 1;

COMMIT;
