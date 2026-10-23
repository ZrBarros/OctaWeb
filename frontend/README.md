# Frontend Octacore

Aplicação Next.js 16 integrada à API Fastify da Octacore.

## Configuração

Copie `.env.example` para `.env.local`:

```dotenv
API_URL=http://localhost:3333/api/v1
NEXT_PUBLIC_API_URL=http://localhost:3333/api/v1
```

`API_URL` é usada pelos Server Components. `NEXT_PUBLIC_API_URL` é usada nas telas interativas no navegador.

```bash
npm install
npm run dev
```

Validação:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Integração

- `src/lib/server-api.ts`: consultas públicas em Server Components.
- `src/lib/api.ts`: cliente autenticado, refresh automático e upload.
- `src/lib/api-types.ts`: contratos recebidos da API.
- `src/lib/api-mappers.ts`: adaptação do modelo PostgreSQL aos componentes existentes.
- `src/lib/use-api.ts`: carregamento de dados em Client Components.
- `src/lib/cart.ts`: somente seleção local do carrinho; catálogo e pedido são reais.
- `src/components/auth-provider.tsx`: sessão compartilhada entre cabeçalho, conta e painel, com restauração pelo refresh cookie.
- `src/components/account-settings.tsx`: edição real de perfil e troca de senha.

Notícias, agenda, modalidades, mural, loja, autenticação, conta, pedidos e painel administrativo usam a API. O painel cobre usuários, modalidades/horários, notícias, eventos, integrantes, conquistas, história, resultados, produtos/estoque e pedidos. O perfil de atleta, ranking e presença/favorito de eventos permanecem demonstrativos porque o banco atual não representa esses dados.
