# Front-end da Octacore

Aplicação Next.js com TypeScript para as telas da Atlética Octacore. O NestJS ficará responsável pela API, autenticação e regras de negócio.

O estado completo do projeto, as pendências e o histórico de desenvolvimento ficam em [DOCUMENTACAO.md](../DOCUMENTACAO.md). Atualize esse documento ao concluir uma funcionalidade relevante.

## Executar

Na pasta `frontend`:

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. Para conferir o código, use `npm run lint` e `npm run build`.

## Onde está cada parte

- `src/app/layout.tsx`: estrutura compartilhada pelas páginas e carregamento da fonte Outfit.
- `src/app/page.tsx`: conteúdo da home. Os dados de eventos ainda são exemplos baseados no Figma.
- `src/app/loja/page.tsx`: catálogo inicial, com busca e filtros por categoria.
- `src/app/loja/[slug]`: página individual de cada produto. O `slug` identifica qual item de `src/data/products.ts` será exibido.
- `src/app/carrinho`: carrinho visual com quantidade, remoção e total; os itens ficam salvos no navegador até a integração com o backend.
- `src/app/checkout`: formulário e confirmação de demonstração, sem envio de dados nem cobrança real.
- `src/lib/cart.ts`: leitura e atualização dos itens salvos no navegador.
- `src/app/noticias`: listagem com filtros e páginas individuais das notícias.
- `src/app/modalidades`: catálogo das modalidades e páginas de detalhes.
- `src/app/atletas/[slug]`: perfil público demonstrativo de João Silva, ligado ao elenco do Futsal; os dados estão em `src/data/athletes.ts` e a foto ainda é provisória.
- `src/app/ranking`: indicadores e classificação esportiva de exemplo, acessíveis pela página de Modalidades; os valores estão em `src/data/ranking.ts`.
- `src/app/agenda`: compromissos com filtros por categoria; a Home mostra os futuros com acesso direto aos detalhes.
- `src/app/agenda/[slug]`: detalhes demonstrativos de eventos com favorito e presença temporários; o conteúdo está em `src/data/event-details.ts`.
- `src/app/mural`: página principal, história, integrantes e conquistas com galeria.
- `src/data`: conteúdo de exemplo do protótipo, separado das telas para facilitar a futura integração com a API.
- `src/data/products.ts`: dados de exemplo dos produtos, compartilhados pela home e pela loja.
- `src/app/page.module.css`: estilos específicos da home, inclusive ajustes para celular.
- `src/app/globals.css`: cores e estilos globais.
- `src/components`: cabeçalho e rodapé reutilizáveis.
- `src/components/auth-form.tsx`: formulário compartilhado pelas telas de login e cadastro; ainda não realiza autenticação.
- `src/components/site-chrome.tsx`: mantém cabeçalho e rodapé nas páginas públicas; `/admin` usa uma estrutura visual própria.
- `src/app/minha-conta` e `src/app/meus-pedidos`: prévias do painel e de um pedido, com dados fictícios de `src/data/account.ts`.
- `src/app/admin`: dashboard, notícias, produtos, eventos, integrantes, resultados e pedidos administrativos do Figma. O `layout.tsx` compartilha a barra lateral; os dados demonstrativos estão em `src/data/admin.ts` e nos arquivos `src/data/admin-*.ts`. As ações locais permitem explorar os fluxos sem publicar mudanças no site. As rotas ainda não exigem login.
- `public/images`: cópias das imagens utilizadas pelo site. Os arquivos originais permanecem em `../assets`.

## Próximos passos

A Home, Notícias, Modalidades, Ranking, o perfil público do atleta, Agenda com detalhe de evento e presença simulada, Mural, Login, Cadastro, Minha Conta, Meus Pedidos, o dashboard, as telas administrativas de notícias, produtos, eventos, integrantes, resultados e pedidos, e o fluxo visual da Loja até o checkout simulado já têm interfaces. Os conteúdos de exemplo, incluindo os tamanhos das camisas e as opções de retirada, ainda precisam de revisão da atlética. A próxima etapa é revisar telas e dados com a equipe; depois, as interfaces serão ligadas à API NestJS com controle de acesso.
