# OctaWeb

Plataforma da Associação Atlética Acadêmica de Computação da UFAL (Octacore), com site público, loja, conta, painel administrativo, API REST e PostgreSQL.

## Stack

- Frontend: Next.js 16, React 19 e TypeScript.
- Backend: Node.js, TypeScript, Fastify, Prisma e OpenAPI.
- Banco: PostgreSQL, schema `octacore` com 14 tabelas.
- Deploy local: Docker Compose com frontend, API e banco.

## Executar tudo com Docker

Pré-requisito: Docker com Compose.

```bash
docker compose up --build
```

- Site: http://localhost:3000
- API: http://localhost:3333
- OpenAPI: http://localhost:3333/docs/openapi.json
- Health check: http://localhost:3333/health
- PostgreSQL no host: `localhost:5433`

O compose é uma configuração local. Antes de publicar, troque os três segredos JWT, ative cookies seguros, configure os domínios reais e forneça SMTP.

## Executar sem Docker

Inicie PostgreSQL e aplique `database/01_schema.sql` seguido de `database/02_seed.sql`. Depois:

```bash
cd backend
copy .env.example .env
npm install
npm run prisma:generate
npm run dev
```

Em outro terminal:

```bash
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

As credenciais locais criadas pelo seed estão em [`database/README.md`](database/README.md). Não use os dados do seed em produção.

## Verificação

```bash
cd backend
npm run lint
npm run build
npm test
npm audit --omit=dev

cd ../frontend
npm run lint
npx tsc --noEmit
npm run build
```

## Estado funcional

- Cadastro, login, refresh por cookie `httpOnly`, logout, perfil, alteração e recuperação de senha.
- Autorização `USUARIO`/`ADMIN` aplicada na API.
- Notícias, modalidades/horários, integrantes, eventos, resultados, conquistas, história e produtos vindos do PostgreSQL.
- Checkout autenticado cria pedido em transação, congela preços e desconta estoque.
- O cabeçalho acompanha a sessão; a conta edita perfil, troca senha e consulta pedidos reais.
- O painel gerencia usuários, modalidades/horários, notícias, eventos, integrantes, conquistas, história, resultados, produtos, estoque e pedidos.
- Upload administrativo de JPG, PNG e WebP, limitado a 2 MB e validado por assinatura.

O carrinho continua no `localStorage`, mas preços, variações e estoque vêm da API. Pagamento não foi implementado porque o schema não possui transação financeira. Presença/favorito em eventos, estatísticas individuais, classificação e log de atividades continuam como interface demonstrativa porque não existem tabelas correspondentes.

## Estrutura

- [`frontend/`](frontend/) — aplicação Next.js e integração com a API.
- [`backend/`](backend/) — API, Prisma, testes, upload e documentação operacional.
- [`database/`](database/) — schema SQL oficial, seed e MER.
- [`DOCUMENTACAO.md`](DOCUMENTACAO.md) — estado detalhado, limitações e histórico.
