# Backend Octacore

API REST em TypeScript, Fastify e Prisma sobre o schema PostgreSQL existente em `../database/01_schema.sql`. O backend não cria nem altera o schema.

## Instalação

```bash
copy .env.example .env
npm install
npm run prisma:generate
npm run dev
```

O PostgreSQL deve estar acessível pela `DATABASE_URL`. Para recriar o banco local a partir dos SQLs oficiais:

```bash
npm run db:setup
```

Esse comando recria o schema e apaga seus dados; use somente em desenvolvimento.

## Scripts

- `npm run dev`: API com recarga automática.
- `npm run build`: compila para `dist/`.
- `npm start`: inicia a build.
- `npm run lint`: análise estática.
- `npm test`: testes automatizados.
- `npm run prisma:generate`: gera o cliente a partir do mapeamento fiel do banco.
- `npm run db:migrate` / `db:seed`: aplicam os SQLs existentes.

## Rotas

Prefixo: `/api/v1`.

- `/auth/register`, `/login`, `/refresh`, `/logout`, `/forgot-password`, `/reset-password`, `/me`.
- `/news`, `/modalities`, `/members`, `/events`, `/results`, `/achievements`, `/history`.
- `/products`, `/orders`.
- `/admin/*`: CRUD protegido das entidades anteriores, usuários, dashboard, pedidos e uploads.
- `/health`: conexão da aplicação e do banco.
- `/docs/openapi.json`: documento OpenAPI gerado.

Listagens aceitam paginação e, conforme o recurso, busca, categoria, modalidade, status, período e ordenação. Erros usam `{ "error": { "code", "message", "details?" } }`.

## Segurança

- bcrypt com custo 12 para novas senhas; hashes bcrypt do seed são compatíveis.
- Access token curto no cabeçalho e refresh token em cookie `httpOnly`, `SameSite=Strict`.
- RBAC validado na API; esconder controles no frontend não concede acesso.
- Zod em todas as entradas, CORS restrito, Helmet, rate limiting e queries parametrizadas pelo Prisma.
- Upload com limite, MIME e assinatura binária; leitura pública aceita apenas nomes UUID conhecidos.
- Logs ocultam autorização, cookies, tokens e senhas.

Em produção, use HTTPS, `COOKIE_SECURE=true`, segredos distintos e aleatórios, SMTP e armazenamento persistente/objeto para uploads.

## Limitações impostas pelo schema

Não há persistência para rascunhos, refresh/reset token revogável, presença/favorito, estatística individual, classificação, atividade administrativa, pagamento ou notificação. O backend não inventa essas tabelas. Consulte `DOCUMENTACAO.md` para sugestões.
