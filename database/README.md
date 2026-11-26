# Banco de dados do OctaWeb

Esquema PostgreSQL da versão 1 (MVP) da plataforma da Octacore, derivado do MER do projeto. Esta pasta registra a estrutura oficial do banco usada pelo backend FastAPI; mudanças de estrutura devem ser versionadas aqui.

| Arquivo | Conteúdo |
|---|---|
| `01_schema.sql` | Cria o schema `octacore` com 16 tabelas, incluindo `foto_mural` e `favorito_evento`, chaves, índices, restrições e triggers. **Apaga e recria tudo** a cada execução. |
| `02_seed.sql` | Dados de exemplo para desenvolvimento e demonstração. |
| `03_update_history_2026.sql` | Corrige os marcos históricos em bancos já criados, preservando outros registros. Execute uma vez; não reinicializa o banco. |
| `docker-compose.yml` | Alternativa opcional: sobe o banco em Docker já com os dois scripts aplicados. |

## Como criar o banco localmente

Escolha **uma** das opções.

### Opção A — PostgreSQL instalado (pgAdmin ou psql)

1. Crie um banco vazio chamado `octacore`.
2. Execute `01_schema.sql` e, em seguida, `02_seed.sql` nesse banco.

No terminal, a partir desta pasta:

```bash
psql -U postgres -c "CREATE DATABASE octacore"
psql -U postgres -d octacore -f 01_schema.sql
psql -U postgres -d octacore -f 02_seed.sql
```

No pgAdmin: clique em `octacore` → **Tools → Query Tool**, abra cada arquivo (ícone de pasta) e execute com **F5**, na ordem. Se aparecer *"current transaction is aborted"*, execute `ROLLBACK;` e repita.

### Opção B — Docker

```bash
cd database
docker compose up -d
```

O banco fica disponível na porta **5433**, com usuário `postgres` e senha `postgres` (apenas para uso local). Para voltar ao estado inicial: `docker compose down -v && docker compose up -d`.

Se o banco já existia antes da correção dos marcos históricos de 2026, execute na raiz do projeto, com o Compose principal em funcionamento:

```bash
docker compose exec -T db psql -v ON_ERROR_STOP=1 -U postgres -d octacore < database/03_update_history_2026.sql
```

O script corrige a fundação para 2018, substitui os marcos demonstrativos antigos e registra os oito anos da Octacore e seu primeiro título do INTERENG em 2026. Bancos novos recebem esses dados diretamente de `02_seed.sql`.

Para bancos existentes, a API FastAPI cria `foto_mural` e `favorito_evento` na inicialização, se ainda não existirem, e adiciona `resultado.destaque_home` com índice que permite apenas um destaque na Home. Essas atualizações preservam os registros anteriores. As imagens enviadas ficam no volume de uploads do Compose.

### Conferência

```sql
SET search_path TO octacore;
SELECT (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'octacore') AS tabelas,
       (SELECT valor_total FROM pedido WHERE id = 1) AS total_pedido_exemplo;
-- esperado após o schema novo: 16 | 139.70
```

## Conexão para o backend

As tabelas ficam no schema **`octacore`**, não no `public`. Configure isso no ORM ou na string de conexão.

```
DATABASE_URL=postgresql://postgres:SUA_SENHA@localhost:5432/octacore?schema=octacore
```

- Com Docker, use a porta `5433` e a senha `postgres`.
- **Prisma:** o parâmetro `?schema=octacore` já resolve; `npx prisma db pull` gera os models a partir do banco.
- **TypeORM:** informe `schema: 'octacore'` na configuração da conexão.
- Guarde as credenciais em um arquivo `.env` dentro da pasta do backend. O `.gitignore` do repositório já ignora `.env*`, portanto senhas não devem ir para o GitHub.

## Tabelas

| Área | Tabelas |
|---|---|
| Acesso | `usuario` (perfil `USUARIO` ou `ADMIN`) |
| Conteúdo | `noticia`, `evento` |
| Esportes e Mural | `modalidade`, `horario_treino`, `integrante`, `integrante_modalidade` (N:N), `resultado`, `conquista`, `marco_historico` |
| Loja | `produto`, `produto_variacao` (tamanho + estoque), `pedido`, `item_pedido` |

`noticia`, `evento`, `modalidade`, `integrante` e `produto` têm `slug` único, igual ao usado nas rotas do front end (`/noticias/[slug]`, `/agenda/[slug]`, `/modalidades/[slug]`, `/mural/integrantes/[slug]`, `/loja/[slug]`).

### Valores aceitos (CHECK)

| Coluna | Valores no banco | Rótulo no front end |
|---|---|---|
| `noticia.categoria` | `CAMPEONATOS`, `JOGOS`, `RESULTADOS`, `SELETIVAS`, `TREINOS`, `FESTAS`, `EVENTOS`, `COMUNICADOS` | Campeonatos, Jogos, … |
| `evento.tipo` | `TREINO`, `JOGO`, `CAMPEONATO`, `SELETIVA`, `FESTA`, `REUNIAO`, `EVENTO` | Treino, Jogo, …, Reunião |
| `produto.categoria` | `CAMISAS`, `TIRANTES`, `COPOS`, `BONES`, `ACESSORIOS`, `KITS` | Camisas, Tirantes, Copos, … |
| `pedido.status` | `PENDENTE`, `CONFIRMADO`, `EM_SEPARACAO`, `DISPONIVEL_RETIRADA`, `ENTREGUE`, `CANCELADO` | Pendente, …, Disponível para retirada |
| `pedido.forma_retirada` | `CAMPUS`, `COMBINAR` | `campus`, `combinar` no checkout |
| `produto_variacao.tamanho` | `P`, `M`, `G`, `GG` ou `UNICO` | Tamanhos da loja |

A API deve converter entre o código do banco e o rótulo exibido.

## Regras garantidas pelo banco

- Apenas usuários `ADMIN` podem ser autores de notícias (trigger).
- Estoque nunca negativo; quantidade do item maior que zero.
- E-mail único sem diferenciar maiúsculas de minúsculas.
- `pedido.valor_total` é recalculado automaticamente sempre que um item é incluído, alterado ou removido.
- `atualizado_em` é atualizado automaticamente em `usuario`, `noticia` e `pedido`.
- `item_pedido.preco_unitario` guarda o preço do momento da compra.

## Responsabilidades do backend

- Gerar o hash da senha (bcrypt) no cadastro; nunca gravar a senha em texto.
- No checkout, em **uma transação**: validar o estoque de cada variação, criar o pedido e os itens com o preço atual e baixar o estoque. Se algo falhar, desfazer tudo.
- Restringir as rotas administrativas ao perfil `ADMIN` e garantir que cada usuário veja apenas os próprios pedidos.
- Preferir `produto.ativo = false` a excluir produtos que já tenham sido vendidos (a exclusão é bloqueada pelo banco).

## Dados de exemplo

- Usuários: `admin@octacore.dev` (ADMIN), `maria@octacore.dev` e `pedro@octacore.dev`, todos com a senha de teste `Octa@2026`.
- Produtos com os mesmos slugs, nomes e preços de `frontend/src/data/products.ts`.
- Um pedido da Maria no valor de R$ 139,70.

## Fora do MVP

Ranking, estatísticas, perfil de atleta (`/atletas/[slug]`) e notificações ainda não têm tabelas. Presença e favoritos de eventos usam tabelas criadas pela API em bancos existentes e declaradas no schema para novas instalações.
