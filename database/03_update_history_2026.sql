-- Atualiza os marcos demonstrativos de instalações já existentes.
-- Preserva outros registros criados pela diretoria.
BEGIN;

UPDATE octacore.marco_historico
SET ano = 2018,
    descricao = 'A Atlética Octacore foi fundada em 2018.',
    ordem = 1
WHERE ano = 2022 AND titulo = 'Fundação da Octacore';

DELETE FROM octacore.marco_historico
WHERE (ano = 2023 AND titulo = 'Primeiro campeonato')
   OR (ano = 2024 AND titulo = 'Primeiro título')
   OR (ano = 2025 AND titulo = 'Expansão das modalidades');

INSERT INTO octacore.marco_historico (ano, titulo, descricao, ordem)
SELECT 2026, 'Oito anos de Octacore', 'A atlética completou oito anos em 2026.', 2
WHERE NOT EXISTS (
  SELECT 1 FROM octacore.marco_historico
  WHERE ano = 2026 AND titulo = 'Oito anos de Octacore'
);

INSERT INTO octacore.marco_historico (ano, titulo, descricao, ordem)
SELECT 2026, 'Primeiro título do INTERENG', 'A Octacore foi campeã do INTERENG pela primeira vez em 2026.', 3
WHERE NOT EXISTS (
  SELECT 1 FROM octacore.marco_historico
  WHERE ano = 2026 AND titulo = 'Primeiro título do INTERENG'
);

COMMIT;
