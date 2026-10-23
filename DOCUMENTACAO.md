# Documentação de desenvolvimento — Octacore

**Última atualização:** 23/10/2026

**Estado:** MVP full stack integrado; backend e banco prontos para execução, com limitações de schema documentadas

**Referência visual:** protótipo [Projeto P3 — Octacore no Figma](https://www.figma.com/design/BcgJnC6UWsDG5W5B5mO7V6/Projeto-P3---Octacore?node-id=0-1)

Este é o registro contínuo do site da Associação Atlética Acadêmica de Computação da UFAL. Ele descreve o que já funciona, o que é apenas demonstração e o que falta construir. Deve ser atualizado no mesmo trabalho em que uma funcionalidade relevante for alterada.

## 1. Objetivo e limites do MVP

O site reúne informações da atlética, notícias, modalidades, agenda, mural e produtos. O frontend está conectado a uma API REST que aplica autenticação, autorização, regras de estoque, pedidos e administração de conteúdo sobre o PostgreSQL existente.

- **Front end escolhido:** Next.js, React e TypeScript.
- **Backend implementado:** Node.js, TypeScript, Fastify e Prisma, em `backend/`.
- **Banco:** PostgreSQL, com as 14 tabelas oficiais do schema `octacore`; o backend apenas mapeia o schema e não o altera.
- **Integração real:** autenticação, conteúdo público, administração, uploads, estoque e pedidos.
- **Ainda demonstrativo:** pagamento, presença/favorito em eventos, ranking, estatística individual e atividades administrativas, pois o schema não possui entidades correspondentes.

Os documentos de planejamento originais estão em `assets/`. Esta página registra o estado **implementado**; ideias desses documentos só passam para “pronto” depois de aparecerem no código e serem verificadas.

## 1.1 Perfis de acesso planejados

O MVP possui três tipos de acesso. A API aplica autenticação e autorização nas operações protegidas, e a interface reflete a sessão ativa.

| Perfil | Acesso previsto | Estado atual |
| --- | --- | --- |
| Visitante | Navegar pelas páginas públicas, consultar notícias, modalidades, agenda, mural e loja; montar carrinho no navegador. | Conteúdo vem da API; o carrinho permanece local e não exige conta. |
| Usuário autenticado | Tudo do visitante, mais conta própria e acompanhamento de pedidos. | Cadastro, login, refresh, logout, perfil e pedidos reais estão integrados; presença e favorito não persistem. |
| Administrador | Tudo do usuário autenticado, mais acesso autorizado ao painel e gestão de conteúdo, integrantes, resultados e pedidos. | API e interface exigem conta `ADMIN`; CRUD e alterações persistem no PostgreSQL. |

A separação é validada pela API em cada rota protegida. A interface também redireciona usuários sem acesso, mas a autorização do servidor é a barreira efetiva.

## 1.2 Arquitetura integrada

- O frontend usa `API_URL` em Server Components e `NEXT_PUBLIC_API_URL` nas telas interativas.
- A API usa camadas de rotas/controladores, serviços e repositórios, validação Zod, Prisma, erros padronizados, logs com redação de segredos, CORS, Helmet e rate limiting.
- O access token fica em memória no navegador; o refresh token usa cookie `httpOnly` e é renovado automaticamente. Sem tabela de tokens, logout remove o cookie do cliente, mas não mantém lista de revogação no servidor.
- O checkout exige usuário autenticado. A criação do pedido usa transação serializável, valida estoque, desconta quantidades e congela o preço nos itens; o trigger do banco recalcula o total.
- Uploads administrativos aceitam JPG, PNG ou WebP de até 2 MB, conferem assinatura binária e são servidos apenas por nome UUID validado.
- `docker-compose.yml` inicia frontend, API e PostgreSQL; o OpenAPI fica em `/docs/openapi.json` e o health check em `/health`.

## 2. Estado das telas

| Rota | O que existe hoje | Estado |
| --- | --- | --- |
| `/` | Página inicial com apresentação, mascote, destaques, produtos e até três compromissos futuros. | **Integração real:** produtos e agenda vêm da API; destaques esportivos permanecem editoriais na tela |
| Todas as rotas do App Router | O conteúdo da rota entra com fade em 180 ms; cabeçalho/estrutura compartilhada permanecem estáveis. | Animação de interface local; sem dependência de backend |
| `/motion-octaweb.html` | Peça animada de apresentação do OctaWeb, com identidade visual da Octacore, apresentação da plataforma e seus principais espaços. | Apresentação em HTML/CSS; animação local no navegador, sem exportação de vídeo |
| `/noticias` e `/noticias/[slug]` | Lista com filtro por categoria e página individual de cada notícia; no mobile, os filtros ocupam um seletor compacto. | **Integração real:** notícias publicadas no PostgreSQL |
| `/modalidades` e `/modalidades/[slug]` | Lista e páginas de modalidades, horários, responsáveis, elenco, resultados e próximos eventos disponíveis. | **Integração real:** dados relacionais da API |
| `/atletas/[slug]` | Perfil público de João Silva, com modalidade, camisa, estatísticas e resultados recentes. | **Prévia visual:** dados de exemplo; foto pendente |
| `/ranking` | Indicadores da temporada, classificação geral e aproveitamento por modalidade. Acesso pela página de Modalidades. | **Prévia visual:** números de exemplo, sem cálculo automático |
| `/agenda` | Eventos listados em ordem cronológica, com filtro por categoria e links para páginas de detalhe; filtro compacto em celular. | **Integração real:** eventos da API |
| `/agenda/[slug]` | Detalhe do evento persistido, com imagem, modalidade, data, local e descrição. | **Integração parcial:** conteúdo real; presença e favorito continuam simulações no navegador porque não há tabelas correspondentes |
| `/mural`, `/mural/historia`, `/mural/integrantes`, `/mural/conquistas` | Apresentação da atlética, história, integrantes e conquistas; filtro compacto na lista. | **Integração real:** história, integrantes e conquistas vêm da API; parte das imagens é placeholder |
| `/mural/integrantes/[slug]` | Perfil de integrante com função, curso e modalidades. | **Integração real:** dados do PostgreSQL; foto pode estar pendente |
| `/loja` | Catálogo com busca, filtro, variações disponíveis, estoque e carrinho. | **Integração real:** catálogo/estoque da API; seleção do carrinho no navegador |
| `/loja/[slug]` | Detalhe de produto com variação, quantidade e estoque disponível. | **Integração real:** produto da API |
| `/carrinho` | Alteração de quantidade, remoção e cálculo com preços atuais. | **Integração parcial:** seleção local, catálogo/preços reais |
| `/checkout` | Dados de retirada e criação de pedido autenticado. | **Integração real:** pedido transacional e estoque; sem cobrança/pagamento |
| `/login`, `/cadastro` e `/redefinir-senha` | Cadastro, login, recuperação e redefinição. | **Integração real:** bcrypt, JWT e cookie `httpOnly` |
| `/minha-conta` | Painel do usuário conectado, edição de nome/curso, troca de senha e logout. | **Integração real:** sessão compartilhada, perfil e credenciais da API |
| `/meus-pedidos` | Pedidos ativos, progresso e histórico. | **Integração real:** pedidos do usuário autenticado |
| `/admin` | Indicadores e vendas derivados do banco; atividades recentes ficam vazias por falta de tabela de auditoria. | **Integração real:** rota protegida por ADMIN |
| `/admin/perfil` | Perfil da conta administrativa, edição de dados, troca de senha e atalhos. | **Integração real:** usa a mesma sessão e operações da conta |
| `/admin/noticias` | Busca, filtros, editor, upload, publicação, edição e exclusão. | **Integração real:** publica no site; apenas status Publicado porque não existe coluna de rascunho |
| `/admin/produtos` | Busca, estoque, cadastro, edição, desativação e upload. | **Integração real:** altera loja e estoque |
| `/admin/eventos` | Lista/calendário, busca, criação, edição, exclusão e upload. | **Integração real:** altera agenda pública |
| `/admin/modalidades` | Cadastro, edição, exclusão, imagem, responsável, local e horários de treino. | **Integração real:** altera páginas de modalidades e seus vínculos |
| `/admin/integrantes` | Busca, cadastro, edição, remoção e foto. | **Integração real:** altera mural público |
| `/admin/mural` | Gestão de conquistas e marcos históricos. | **Integração real:** altera as duas páginas públicas do mural |
| `/admin/resultados` | Busca, filtros, cadastro, edição e remoção. | **Integração real:** persiste resultados |
| `/admin/pedidos` | Busca, filtros, itens e transições válidas de status. | **Integração real:** gerencia pedidos; notificações ao cliente não existem |
| `/admin/usuarios` | Busca, filtro, edição de dados/perfil e exclusão controlada. | **Integração real:** gerencia contas; impede autoexclusão e autorrebaixamento administrativo |

“Interface pronta” indica que a página foi construída no front end, não que seu conteúdo esteja aprovado para publicação ou conectado à API.

## 3. Como executar e conferir

No terminal, a partir da pasta `frontend`:

```bash
npm install
npm run dev -- --hostname 0.0.0.0
```

Abra `http://localhost:3000`. Para conferir em celular ou tablet na mesma rede Wi-Fi, use `http://IP-DO-MAC:3000`; o Next está configurado para permitir os recursos de desenvolvimento a partir de endereços IPv4 privados. Para verificar o front end depois de alterações de código:

```bash
npm run lint
npm run build
```

Se a prévia não abrir, confira se o servidor iniciado por `npm run dev` continua ativo e use o endereço mostrado por ele. As rotas são criadas pelos arquivos `page.tsx` dentro de `frontend/src/app`; não é preciso executar um arquivo de página separadamente.

## 4. Organização do código

| Caminho | Responsabilidade |
| --- | --- |
| `frontend/src/app/` | Rotas, estrutura e estilos de cada página. Uma pasta com `page.tsx` representa uma rota. |
| `frontend/src/app/layout.tsx` | Estrutura compartilhada e fonte Outfit. |
| `frontend/src/app/globals.css` | Cores, tokens de movimento, transições para controles, entrada de diálogos e estilos globais. |
| `frontend/src/app/template.tsx` e `template.module.css` | Entrada animada curta do conteúdo de cada rota; respeita movimento reduzido definido globalmente. |
| `frontend/src/components/` | Componentes reutilizados, como cabeçalho, rodapé e cards. |
| `frontend/src/lib/api.ts`, `server-api.ts`, `api-types.ts`, `api-mappers.ts` | Clientes HTTP, autenticação, contratos e adaptação dos dados da API. |
| `frontend/src/data/` | Tipos, rótulos e dados que continuam demonstrativos; não é mais a fonte dos módulos integrados. |
| `frontend/src/lib/cart.ts` | Seleção do carrinho no navegador; a API revalida produto, variação, preço e estoque no checkout. |
| `backend/src/modules/` | Rotas/controladores, serviços, repositórios e validações de autenticação, conteúdo, loja e administração. |
| `backend/prisma/schema.prisma` | Mapeamento ORM fiel às 14 tabelas; não cria migrações. |
| `backend/tests/` | Testes de validação, tokens e endpoints de autenticação. |
| `docker-compose.yml` | Frontend, API e PostgreSQL com health checks. |
| `frontend/src/components/auth-form.tsx` | Formulário compartilhado pelas telas de login e cadastro. |
| `frontend/src/data/account.ts` | Legado visual; conta e pedidos integrados não usam mais estes valores. |
| `frontend/src/data/athletes.ts` | Perfil esportivo demonstrativo e resultados recentes do atleta no Figma. |
| `frontend/src/data/ranking.ts` | Indicadores, classificação e aproveitamento demonstrativos do quadro de ranking. |
| `frontend/src/data/event-details.ts` | Tipo visual do detalhe; presença/confirmados continuam sem persistência. |
| `frontend/src/components/site-chrome.tsx` | Exibe cabeçalho e rodapé públicos nas rotas do site; omite ambos na área `/admin`, que usa estrutura própria. |
| `frontend/src/data/admin.ts` | Referência visual legada; dashboard integrado usa métricas da API. |
| `frontend/src/app/admin/layout.tsx` e `admin-shell.tsx` | Estrutura e barra superior compartilhadas entre as telas administrativas; em celular a busca contextual fica abaixo do título. |
| `frontend/src/data/admin-*.ts` | Tipos/rótulos e referências visuais legadas; as telas administrativas carregam a API. |
| `frontend/public/images/` | Imagens servidas pelo site; originais e referências ficam em `assets/`. |
| `frontend/README.md` | Guia rápido de execução e mapa resumido do front end. |

As páginas usam CSS Modules (`*.module.css`) para estilos próprios. A identidade visual segue o Figma: fonte Outfit, paleta da Octacore e imagens fornecidas em `assets/`. Os retângulos brancos de galeria, mural e integrantes são espaços reservados intencionais.

## 5. Onde alterar o conteúdo

Notícias, produtos, estoque, modalidades, horários, agenda, integrantes, resultados, conquistas, história, usuários e pedidos devem ser alterados pela API/painel ou diretamente no PostgreSQL em operações controladas. Os arrays antigos em `frontend/src/data` não alimentam mais essas telas integradas.

| Conteúdo | Arquivo |
| --- | --- |
| Conteúdo, catálogo, esporte e pedidos integrados | Painel `/admin`, API `/api/v1` e PostgreSQL |
| Contratos e regras do banco | `database/01_schema.sql` e `backend/prisma/schema.prisma` |
| Configuração de API no frontend | `frontend/.env.local` |
| Configuração da API | `backend/.env` |
| Detalhe visual de presença em evento | `frontend/src/data/event-details.ts` (somente tipos/limitação visual) |
| Perfil e estatísticas do atleta | `frontend/src/data/athletes.ts` |
| Ranking e estatísticas esportivas gerais | `frontend/src/data/ranking.ts` |
| Indicadores, gráfico e atividades do painel | `frontend/src/data/admin.ts` |
| Linhas iniciais do mural administrativo | `frontend/src/data/admin-news.ts` |
| Linhas iniciais da gestão demonstrativa de produtos | `frontend/src/data/admin-products.ts` |
| Cartões iniciais do cronograma administrativo | `frontend/src/data/admin-events.ts` |
| Cartões iniciais dos integrantes administrativos | `frontend/src/data/admin-members.ts` |
| Linhas iniciais dos resultados administrativos | `frontend/src/data/admin-results.ts` |
| Linhas iniciais dos pedidos administrativos | `frontend/src/data/admin-orders.ts` |
| Textos e destaques específicos da Home | `frontend/src/app/page.tsx` |

Preços são enviados pela interface em centavos e persistidos pelo PostgreSQL como `NUMERIC(10,2)`. A API nunca confia no preço enviado pelo carrinho: consulta o produto no banco e grava `preco_unitario` no momento da compra.

## 6. Fluxo atual da loja

1. A lista em `/loja` consulta produtos ativos e variações da API; cada card oferece compra rápida e link explícito para `/loja/<slug>`.
2. O detalhe consulta o produto pelo `slug` e limita a quantidade ao estoque disponível.
3. Ao adicionar, `cart.ts` grava identificador, tamanho e quantidade em `localStorage`, na chave `octacore-cart`. A pessoa permanece na loja ou no detalhe e vê uma confirmação por 3,5 segundos; o acesso ao carrinho exibe a contagem de itens. A quantidade por produto e tamanho é limitada a 99.
4. `/carrinho` lê esses itens, consulta os preços atuais da API e calcula o total.
5. `/checkout` exige sessão, revalida variações e envia nome, telefone, retirada e observações. A API cria pedido e itens em transação, congela preços e desconta estoque.

O carrinho persiste no mesmo navegador; ele não acompanha o usuário em outros dispositivos. Se o armazenamento estiver bloqueado, há uma cópia temporária apenas na aba. Estoque e pedidos estão integrados; frete, desconto e pagamento não existem no schema atual.

### Acesso e cadastro

O cabeçalho consulta um estado compartilhado de autenticação: visitantes abrem `/login`, usuários conectados veem o primeiro nome e abrem `/minha-conta`, e administradores abrem `/admin`. Login e cadastro validam localmente e enviam dados à API; após autenticação, usuários vão para `/minha-conta` e administradores para `/admin`. O access token fica em memória e é reemitido pelo refresh cookie após recarregar ou reabrir o site. “Esqueci minha senha” solicita e-mail por SMTP quando configurado e `/redefinir-senha` aplica o token recebido.

`/minha-conta` exibe o usuário autenticado, atualiza nome e curso, troca a senha e encerra a sessão. A troca de senha invalida o refresh cookie e exige novo login. `/meus-pedidos` separa pedidos ativos e históricos vindos da API.

### Painel administrativo

`/admin` usa sessão real e redireciona quem não possui `ADMIN`. Indicadores, vendas, conteúdo, estoque, eventos, integrantes, resultados e pedidos vêm da API. O logout remove o refresh cookie e limpa o access token. Atividades recentes permanecem vazias, pois o banco não possui auditoria.

`/admin/noticias` publica, edita e exclui notícias reais. Imagens passam pelo upload validado; o autor é a conta administrativa autenticada. O formulário oferece apenas “Publicado”, porque `noticia` não possui coluna de rascunho.

`/admin/produtos` consulta produtos/variações reais. Cadastro, edição, desativação, preço, estoque e upload persistem e alimentam Home, Loja e checkout. A interface resume o estoque das variações; ao editar, preserva as variações existentes.

`/admin/eventos` consulta e altera a mesma tabela usada por Agenda e Home. Lista, calendário, busca, CRUD, upload e vínculo opcional com modalidade persistem na API.

`/admin/modalidades` gerencia modalidades, imagens, responsáveis, locais e múltiplos horários de treino. `/admin/mural` gerencia conquistas e marcos históricos. As alterações alimentam imediatamente as respectivas páginas públicas.

`/admin/integrantes` consulta e altera integrantes do mural. Nome, função, curso, Instagram, foto, participação na diretoria e múltiplos vínculos com modalidades persistem na edição.

`/admin/resultados` consulta e persiste partidas ligadas a uma modalidade cadastrada e, opcionalmente, a um evento sem resultado. Busca, filtros, CRUD e cálculo de vitória/empate/derrota continuam na interface; a tabela pode rolar horizontalmente em telas estreitas.

`/admin/pedidos` lista os pedidos criados pelo checkout e seus itens com preço congelado. A API aceita somente transições válidas de status; cancelamento devolve estoque uma única vez. A interface não envia notificações ao cliente porque não há entidade ou integração para isso.

`/admin/usuarios` lista e filtra contas, permite atualizar nome, e-mail, curso e perfil, e oferece exclusão quando os relacionamentos do banco permitem. A própria conta administrativa não pode ser excluída nem perder o perfil `ADMIN`.

`/atletas/joao-silva` segue o quadro `octacore-perfil-atleta` do Figma: perfil de João Silva, Futsal Masculino, camisa 10, quatro estatísticas e três resultados recentes. O elenco da página de Futsal agora leva ao perfil; a posição exibida foi alinhada ao protótipo como “Ala”. A foto do quadro não está nos arquivos fornecidos, então as iniciais “JS” ocupam seu espaço provisoriamente. Os números são exemplos em `data/athletes.ts`, independentes dos resultados administrativos e do perfil de conta; **não há atualização automática nem integração com backend**. Esta é uma página pública de atleta, distinta de `/minha-conta`.

`/ranking` segue o quadro `octacore-ranking-estatisticas` do Figma: quatro indicadores da temporada, três posições no Campeonato Universitário e barras de aproveitamento para Futsal, Basquete, Voleibol e Handebol. O link “Ver ranking e estatísticas” em `/modalidades` leva à página. Os valores estão em `data/ranking.ts` e são exemplos independentes das partidas em `data/admin-results.ts` e do perfil do atleta; **não são calculados a partir de resultados nem sincronizados com o backend**.

`/agenda/treino-volei-octacore` segue o quadro `octacore-evento-presenca` do Figma. A imagem de capa foi exportada do próprio protótipo para `public/images/treino-volei-hero.png`. O treino foi acrescentado à Agenda e seu cartão abre o detalhe. Favoritar e confirmar presença mudam apenas a interface aberta: a confirmação mostra “Você (prévia)” e soma um ao contador demonstrativo, mas tudo é descartado ao sair ou recarregar. O quadro mostra 18 confirmados e só fornece cinco nomes; “Ver todos os confirmados” explica essa limitação, sem inventar as demais pessoas. A Agenda ordena os compromissos por data. **Não há autenticação, inscrição ou registro de presença no backend.**

A navegação administrativa mantém o comportamento responsivo anterior. A navbar reúne marca, busca, perfil autenticado e saída real; a API volta a verificar `ADMIN` em cada operação. Tabelas largas rolam no próprio painel e pedidos usam cartões no celular.

## 7. Próximos passos

1. Validar o compose e os fluxos de ponta a ponta em uma máquina com Docker/PostgreSQL, incluindo concorrência de estoque, uploads e SMTP.
2. Decidir e versionar uma evolução de schema para refresh/reset tokens revogáveis, presença/favoritos, rascunhos, auditoria, estatísticas/classificação e, se necessário, pagamento/notificações.
3. Revisar acessibilidade/responsividade em dispositivos físicos e substituir placeholders pelas imagens aprovadas.

Esta ordem pode mudar por decisão da equipe; registre a decisão abaixo quando acontecer.

## 8. Decisões e limites conhecidos

- O frontend usa **Next.js + TypeScript**; o backend implementado usa **Fastify + TypeScript + Prisma**, escolha feita para compartilhar linguagem, reduzir boilerplate e manter o schema PostgreSQL existente.
- O banco de dados é **PostgreSQL**, com as tabelas no schema `octacore`. A estrutura oficial fica em `database/01_schema.sql`, derivada do MER do projeto; mudanças de estrutura devem ser feitas nesse arquivo e versionadas. Os slugs de notícias, eventos, modalidades, integrantes e produtos seguem as rotas do front end.
- O protótipo do Figma orienta a interface; a fonte Outfit e os arquivos em `assets/` compõem a identidade visual atual.
- Fotos ainda indisponíveis permanecem como placeholders, conforme combinado para galeria, mural e integrantes.
- Conteúdo, preços e detalhes de produtos são dados de exemplo e precisam de confirmação da atlética.
- A Home mantém alguns destaques diretamente na página; ao integrar a API, vale reunir dados compartilhados para evitar divergências.
- O checkout registra pedido real e desconta estoque, mas não cobra: não existe integração de pagamento no schema ou na interface.
- Login, cadastro, refresh, logout e recuperação de senha são reais. A recuperação só envia e-mail quando SMTP é configurado; sem tabela de token, reset e refresh não têm revogação individual no servidor.
- “Minha Conta” e “Meus Pedidos” usam sessão, perfil, troca de senha e pedidos reais. O cabeçalho acompanha login, atualização de nome e logout sem depender da rota atual.
- O perfil público do atleta também usa dados fixos e não compartilha ainda estatísticas com as outras páginas.
- O ranking público usa números fixos do Figma e não é recalculado a partir das partidas do painel ou das estatísticas individuais.
- Favoritar evento e confirmar presença alteram somente o estado da tela atual. A contagem de 18 e os cinco nomes visíveis vêm do Figma; nenhuma presença real é criada.
- O painel exige `ADMIN` e persiste notícias, produtos, estoque, eventos, integrantes, resultados e status de pedidos. Atividades recentes não são fabricadas: permanecem vazias sem uma tabela de auditoria.
- Os quadros de login e cadastro do Figma usam cartões centralizados sobre fundo roxo escuro; os formulários foram ajustados a essa estrutura. O rodapé mantém a alteração posterior solicitada para “Comunidade acadêmica”.

## 9. Histórico de desenvolvimento

### 23/10/2026 — Sessão global e cobertura completa da administração

- Adicionado `AuthProvider` compartilhado no layout: o cabeçalho agora identifica a sessão restaurada pelo refresh cookie, mostra o primeiro nome e aponta para conta ou painel conforme o perfil. Login, cadastro, atualização de perfil, troca de senha e logout atualizam toda a interface de forma consistente.
- Implementados os formulários reais de edição de nome/curso e troca de senha em `/minha-conta` e `/admin/perfil`. A validação de senha aparece antes do envio e os erros de campo retornados pela API são exibidos diretamente.
- Criadas as telas `/admin/usuarios`, `/admin/modalidades` e `/admin/mural`, cobrindo gestão de contas, modalidades/horários, conquistas e história. Eventos passaram a aceitar modalidade e resultados passaram a aceitar evento vinculado.
- Corrigida a ordem do tratamento global de erros do Fastify, que fazia validações Zod retornarem `500`; respostas inválidas agora usam `422`. Requisições sem corpo também deixam de declarar JSON indevidamente no cliente.
- Verificação: frontend `npm run lint`, `npx tsc --noEmit` e `npm run build` com 30 páginas; backend `npm run lint`, `npm run build` e `npm test` com 9 testes. O Docker Compose foi reconstruído, PostgreSQL e API ficaram saudáveis, e login, `/auth/me`, refresh e consultas administrativas foram verificados contra o banco real.

### 23/10/2026 — Backend completo e integração real do frontend

- Criado `backend/` com Fastify, TypeScript, Prisma, Zod, autenticação bcrypt/JWT, autorização `USUARIO`/`ADMIN`, tratamento global de erros, logs com redação de segredos, CORS, Helmet, rate limiting, upload validado, OpenAPI e health check. O Prisma mapeia as 14 tabelas existentes sem alterar `database/01_schema.sql`.
- Implementados CRUDs e consultas de usuários, notícias, modalidades/horários, integrantes/associações, eventos, resultados, conquistas, história, produtos/variações e pedidos. O checkout cria pedido em transação serializável, valida/desconta estoque e usa o preço do banco; cancelamento devolve o estoque e status seguem transições controladas.
- Integrados no Next.js: autenticação/recuperação, sessão, conta, pedidos, notícias, agenda, modalidades, mural, loja/estoque/checkout e todas as telas administrativas. O carrinho permanece no navegador, enquanto catálogo e pedido são reais. Ranking, perfil estatístico do atleta, presença/favorito, rascunhos, auditoria, pagamento e notificações continuam explicitamente limitados pelo schema.
- Adicionados `.env.example`, READMEs, testes, Dockerfiles e `docker-compose.yml` para frontend, API e PostgreSQL.
- Verificação: backend `npm run lint`, `npm run build`, `npm test` (8 testes incluindo endpoint de login/cookie) e `npm audit --omit=dev` (0 vulnerabilidades); frontend `npm run lint`, `npx tsc --noEmit` e `npm run build`. `git diff --check` também foi conferido. Não foi possível executar o compose nem testes reais contra PostgreSQL nesta máquina porque Docker e serviço PostgreSQL não estão instalados; essa validação de infraestrutura permanece pendente.

### 22/10/2026 — Esquema do banco de dados PostgreSQL

- Criada a pasta `database/` com o esquema do MVP (`01_schema.sql`, 14 tabelas no schema `octacore`), dados de exemplo (`02_seed.sql`), `docker-compose.yml` opcional e instruções de conexão para o backend em `database/README.md`.
- O banco garante: autor de notícia apenas `ADMIN`, estoque não negativo por tamanho (`produto_variacao`), e-mail único e recálculo automático do total do pedido. Slugs, categorias, status e formas de retirada foram alinhados aos dados atuais de `frontend/src/data` e ao checkout.
- Estado: estrutura do banco pronta; **o front end continua sem integração** e a API NestJS ainda não existe. Confirmação de presença, ranking, estatísticas, perfil de atleta, favoritos e notificações não têm tabelas.
- Verificação: scripts executados do zero e reexecutados no PostgreSQL 16; a versão anterior, sem os slugs, foi aplicada no PostgreSQL 18 pelo pgAdmin. Conferidas as 14 tabelas, o total do pedido de exemplo e os bloqueios de autor não administrador, estoque negativo e e-mail duplicado.

### 21/10/2026 — Cabeçalho visível após navegar pela home

- A rolagem suave global foi declarada ao Next.js no layout raiz para que a troca de rota interrompa corretamente a rolagem em andamento. Links da home para agenda, modalidades e detalhes da loja passam a abrir no topo, com o cabeçalho visível.
- Estado: correção de navegação da interface; não envolve backend.
- Verificação: navegação visual no navegador a partir dos cartões e botões da home para agenda, modalidades e detalhe de produto; lint e checagem de tipos.

### 21/10/2026 — Faixa de navegação da loja

- O acesso ao carrinho foi movido para junto dos filtros e da busca, imediatamente depois do campo de pesquisa. A faixa permanece visível durante a rolagem dos produtos; em tablet e celular, divide-se em duas linhas para preservar o espaço dos controles.
- Estado: ajuste de interface; filtros, busca e carrinho continuam funcionando somente com dados e armazenamento locais.
- Verificação: lint, checagem de tipos e inspeção visual da faixa no topo e durante a rolagem em desktop, tablet e celular.

### 21/10/2026 — Ajuste do hover e da confirmação na loja

- O destaque do cartão agora responde somente à posição do mouse; selecionar tamanho ou quantidade não mantém a borda roxa quando o cursor sai. Mensagens de adição e avisos de validação desaparecem após 3,5 segundos, inclusive na página de detalhe. A quantidade total continua visível no acesso ao carrinho.
- Estado: ajuste de interface e feedback local; não há integração com estoque ou backend.
- Verificação: lint e checagem de tipos passaram; regra de hover revisada sem `focus-within`. No navegador, a mensagem de adição apareceu e desapareceu após 3,5 segundos, enquanto a contagem do carrinho permaneceu; o item usado no teste foi removido em seguida.

### 21/10/2026 — Compra rápida e clareza na loja

- Os cartões da loja agora separam “Ver detalhes” de “Adicionar ao carrinho”, oferecem tamanho para camisas e controle de quantidade. A adição confirma a ação sem redirecionar e o acesso ao carrinho mostra o total de unidades. O detalhe do produto também aceita quantidade e mantém a pessoa na página após adicionar. No celular, a lista usa uma coluna para acomodar os controles.
- Estado: interações e carrinho locais no navegador; não há estoque real nem integração com pedidos ou backend.
- Verificação: lint, checagem de tipos, inspeção visual da loja em desktop e celular e teste de adicionar itens ao carrinho.

### 21/10/2026 — Imagens da Caneca e do Tirante

- Criadas imagens quadradas separadas em fundo branco para a Caneca Octacore e o Tirante Octacore, com base na referência enviada. As novas prévias de duas vistas substituíram as imagens anteriormente usadas no catálogo e nas páginas de detalhe; os arquivos de origem ficam em `assets/` e as cópias exibidas pelo site em `frontend/public/images/`.
- Estado: imagens geradas por IA para apresentação visual; preço e demais informações seguem como dados locais, sem integração com estoque ou pedidos.
- Verificação: cópias de `assets/` e `frontend/public/images/` conferidas por hash; lint e `git diff --check` executados. Revisar fidelidade dos logotipos e detalhes de fabricação antes de tratar as imagens como fotos oficiais dos produtos.

### 21/10/2026 — Imagem da Camisa Passeio 2026

- Criada uma imagem quadrada de produto em fundo branco com as vistas frontal e traseira da camisa baseada na referência enviada; removidos o fundo de apresentação e o texto externo. A imagem foi adicionada ao cartão da Camisa Passeio 2026 e também aparece em sua página de detalhe.
- Estado: imagem gerada por IA a partir da arte fornecida; preço, tamanhos e demais dados continuam locais, sem integração de estoque ou pedidos.
- Verificação: lint e `git diff --check` concluídos. O build foi tentado, mas não conseguiu baixar a fonte Outfit do Google Fonts por indisponibilidade de conexão. Revisar visualmente a fidelidade dos logotipos e detalhes da camisa antes de tratar a imagem como fotografia oficial do produto.

### 19/10/2026 — Correção do modal de notícias cortado

- O editor de criação/edição mantinha altura ilimitada em larguras de iPad e podia ficar parcialmente atrás da barra administrativa porque as transições global e administrativa aplicavam `transform` aos ancestrais do modal fixo. As duas entradas agora usam fade sem deslocamento; o editor e a confirmação de exclusão são renderizados diretamente no `body`, e o editor mantém altura máxima baseada na janela e rolagem interna em toda a viewport.
- Estado: correção de interface; o formulário ainda salva somente na prévia local e não publica notícias.
- Verificação: lint e build de produção executados; no Chrome, título e botão de fechar aparecem no topo, e a rolagem interna alcança imagem e ações no fim. Ainda falta conferir diretamente em iPad e celular.

### 19/10/2026 — Transição discreta entre páginas

- Adicionada animação de entrada de 180 ms ao conteúdo das rotas por meio do template global do App Router. O cabeçalho compartilhado permanece fora do wrapper e não é animado; movimento reduzido desativa o efeito pela regra global.
- Conferida a hierarquia oficial do template na documentação local do Next.js 16 e verificada a formatação do diff. A inspeção visual no navegador continua pendente.

### 19/10/2026 — Animação reforçada nas rotas administrativas

- A navegação entre telas do painel agora reinicia uma animação de entrada no conteúdo da página, enquanto a barra superior e o menu permanecem estáveis. O template global continua cobrindo as demais rotas.
- Estado: comportamento visual implementado no front end; não envolve simulação de dados nem integração com backend.
- Verificação: lint e build de produção executados após a alteração.

### 19/10/2026 — Mascote isolado animado na página inicial

- Adicionada ao hero da Home uma versão PNG isolada do polvo laranja, gerada a partir da logo oficial e aprovada pelo usuário, com movimento lento de flutuação, rotação e escala; o conteúdo textual fica acima da arte. O efeito é mais discreto em telas móveis e é desligado quando o sistema solicita movimento reduzido. A ilustração gerada pode diferir de detalhes do arquivo original.
- Estado: arte em PNG transparente e animação CSS executada localmente no navegador, sem vídeo ou backend.
- Verificação: lint e build de produção executados; inspeção visual manual em dispositivos continua pendente.

- Verificação: lint, build de produção e `git diff --check` executados; inspeção visual manual em dispositivos continua pendente.

### 19/10/2026 — Padrão de transições e movimento reduzido

- Definidos tempos e curvas de movimento globais para controles, cards e botões; diálogos administrativos agora entram com animação curta de opacidade e deslocamento discreto. A preferência do sistema por movimento reduzido desativa animações, transições e rolagem suave.
- Conferidos os estilos compartilhados e os componentes administrativos que usam `role="dialog"`; `git diff --check` passou. A animação foi validada estaticamente; a inspeção visual manual em dispositivos continua pendente.

### 19/10/2026 — Logo do painel retorna ao Dashboard

- Alterado o destino da logo administrativa de `/` para `/admin`, para que o clique retorne à página inicial do painel. Atualizado também o nome acessível do link para descrever esse destino.
- Conferido o destino no componente compartilhado do painel e a formatação da alteração; a navegação continua sendo apenas front end, sem autenticação.

### 16/10/2026 — Apresentação animada do OctaWeb

- Criada uma apresentação animada curta em formato 16:9, com logo e mascote disponíveis no projeto, paleta da Octacore e cenas sobre notícias, modalidades, agenda e loja. A página inclui adaptação para telas estreitas e opção para assistir novamente.
- Verificado o HTML/CSS e os caminhos das imagens no projeto; a peça roda no navegador como página estática. Não foi exportada como arquivo de vídeo.

### 16/10/2026 — Perfil administrativo demonstrativo

- Criada `/admin/perfil` com os dados demonstrativos de Zeca Rocha, cargo, nível de acesso, atalhos administrativos e avisos sobre autenticação ainda ausente. O nome/avatar no cabeçalho abre essa página; no celular, ela também está disponível no menu.
- Conferidos lint, TypeScript, build e `git diff --check`. A página não autentica o usuário nem altera dados; edição de perfil, senha e permissões reais dependem do backend.

### 16/10/2026 — Registro dos perfis de acesso previstos

- Documentados os três perfis do produto (visitante, usuário autenticado e administrador), suas permissões esperadas e o estado atual do front. Registrado que login, presença em eventos e proteção do painel ainda não estão integrados.
- Conferi a descrição com o formulário de acesso, o layout administrativo e as prévias de conta/evento; o código confirma que ainda não há sessão nem controle de permissões.

### 16/10/2026 — Interações adicionais no dashboard

- Os cinco indicadores agora levam às áreas correspondentes. O gráfico permite selecionar 6 ou 12 meses e clicar em uma barra para ver o valor demonstrativo. Atividades recentes podem ser filtradas por área, pesquisadas e expandidas.
- Conferidos lint, TypeScript, build e `git diff --check`. Os indicadores, valores, filtros e atividades ainda usam exemplos locais; sem API, autenticação ou registro real de ações.

### 16/10/2026 — Filtros compactos nas demais telas

- Mantidos os botões de filtro em telas maiores e adicionado o mesmo seletor compacto usado no mural de notícias para celular nas páginas de Agenda, Loja, Integrantes, Notícias administrativas, Resultados e Pedidos. A seleção atual continua sincronizada com a lista filtrada.
- Conferidos lint, TypeScript, build e `git diff --check`; o build gerou as rotas das telas. Os filtros continuam operando sobre dados locais, sem integração com backend.

### 16/10/2026 — Acesso aos perfis de integrantes

- Os dados na área principal do cartão administrativo abrem o formulário de edição; as ações Editar e Remover continuam disponíveis separadamente. Os cartões do mural agora abrem perfis individuais em `/mural/integrantes/[slug]`.
- Conferidos lint, TypeScript, build e rotas geradas para os quatro perfis demonstrativos. Os dados permanecem em memória/local; imagens e integração com backend pendentes.

### 16/10/2026 — Edição de pedido em painel individual

- “Gerenciar pedido” agora abre um painel do pedido selecionado com itens, total e opções de status. Salvar aplica a alteração apenas na prévia e fecha o painel; também é possível fechar pelo botão, Escape ou tocando fora.
- Conferidos lint, TypeScript, build e diff. Os pedidos seguem fictícios e nenhuma notificação é enviada ao cliente.

### 16/10/2026 — Filtros de notícias e cartões de produto no mobile

- Na página pública de notícias, as categorias agora usam um seletor compacto em telas estreitas. No admin de produtos, a tabela vira cartões e mantém estoque e ações de editar/excluir visíveis sem rolagem horizontal.
- Conferidos lint, TypeScript, build e diff. Filtros, estoque e alterações continuam sendo interações locais, sem integração com backend.

### 15/10/2026 — Agenda compacta na Home

- A Home passou a listar até três compromissos futuros em ordem cronológica, com link em cada item para seu detalhe e “Ver mais” para abrir a agenda completa. O grid foi ajustado ao link para manter os títulos legíveis. As páginas da reunião do Intereng e do jogo Octa x Protendidos são prévias sem imagens ou confirmações reais.
- Verificados lint, TypeScript, build e acesso do card à página de evento no navegador. O conteúdo permanece local; presença e favorito continuam simulados, sem integração com backend.

### 15/10/2026 — Remoção da seta de retorno do painel

- Removida a seta dos títulos administrativos. O menu segue oferecendo acesso ao Dashboard e a marca aponta para o site público, evitando repetir esses destinos junto de cada título.
- Validado no navegador o título sem seta; lint, TypeScript e diff verificados.

### 15/10/2026 — Organização mobile do painel administrativo

- Em telas até 650 px, a barra superior agora mantém marca, menu e saída em uma linha compacta. A busca contextual aparece abaixo do título na área principal, sem alterar a apresentação de PC e iPad. Os filtros de notícias rolam horizontalmente, e a tabela vira cartões com título, categoria, autor, data, status e ações.
- Conferidos visualmente Notícias no celular (529 px) e desktop (1440 px): busca e cartões ficam legíveis no celular e a tabela continua no desktop. A regra responsiva do painel preserva o padrão para iPad acima de 650 px; sem teste em dispositivo físico. `npm run lint`, `npx tsc --noEmit` e `git diff --check` verificados. Os dados e ações continuam simulados no navegador, sem integração com backend.

### 15/10/2026 — Ajuste do modal de notícias em telas baixas

- O editor de criação/edição considera a altura dinâmica da tela e áreas seguras do celular; o foco inicial no campo de título deixou de deslocar o topo do modal.
- Conferido o modal aberto no navegador mobile com o cabeçalho visível; `npm run lint`, `npx tsc --noEmit`, `npm run build` e `git diff --check` verificados. Os dados salvos continuam temporários nesta prévia.

### 15/10/2026 — Rolagem integral do modal de notícias em mobile e iPad

- Em larguras de até 1366 px, ajustada a área do modal para rolar como um todo quando o conteúdo excede a altura disponível; o cartão inicia no topo e os botões “Cancelar” e “Pré-visualizar” seguem no fluxo do formulário, sem ficarem fixos. Em telas maiores, o modal mantém a apresentação centralizada com rolagem interna.
- As setas de Categoria e Status foram afastadas da borda direita dos seletores.
- Conferidos criação no iPad simulado (701 × 722 px), incluindo a rolagem até a borda inferior e os botões, e a abertura mobile. `npm run lint`, `npx tsc --noEmit`, `npm run build` e `git diff --check` passaram. A edição usa o mesmo modal; valores continuam temporários, sem publicação ou backend.

### 15/10/2026 — Navbar unificada e títulos na área principal

- Reunidos na faixa superior administrativa a marca, o menu, a busca contextual da página, o nome/ícone do perfil e a saída. Os títulos e a seta de retorno agora aparecem no começo do conteúdo principal. A busca segue conectada ao filtro local de cada tela.
- Conferidos visualmente dashboard em desktop e Notícias no celular; testei a busca da navbar em Notícias e ela filtrou e restaurou os cinco registros. `npm run lint`, `npx tsc --noEmit` e `git diff --check` passaram. A saída segue demonstrativa; perfil e buscas não têm integração com backend.

### 15/10/2026 — Menu administrativo recolhível em todas as telas

- Removida a coluna lateral permanente do painel. Em PC e iPad, a marca acompanha um ícone de três linhas no canto superior esquerdo; no celular, permanece o botão “Menu” com o nome da seção. Os destinos aparecem em um card flutuante ao clicar, com três colunas em desktop/tablet e duas no celular. O menu fecha ao navegar, tocar fora ou pressionar Escape.
- Conferi visualmente o ícone e o card aberto no desktop (1280 px), e o botão largo/card em celular (387 px), incluindo o fechamento ao tocar fora. A faixa de tablet usa o padrão de ícone e card adaptados; não houve teste em iPad físico. `npm run lint`, `npx tsc --noEmit` e `git diff --check` passaram. A navegação continua sendo apenas front end, sem autenticação ou backend.

### 15/10/2026 — Fechamento do menu público ao tocar fora

- A navegação móvel do site público agora fecha quando o usuário toca em qualquer área fora do card. Também fecha com a tecla Escape, além de continuar fechando após a seleção de uma rota.
- Verificado no navegador em tela móvel: abri o menu da Home e toquei numa área livre do conteúdo; os links do menu desapareceram sem mudar de página. `npm run lint`, `npx tsc --noEmit` e `git diff --check` passaram.

### 15/10/2026 — Menu administrativo como card flutuante

- Em telas de até 650 px, os destinos do menu agora abrem em um card com fundo, borda arredondada e sombra, sobre a página. A navegação deixa de ocupar espaço no fluxo e não desloca o conteúdo abaixo.
- Conferido visualmente em 387 px na tela de Notícias: o card cobre temporariamente a área sob o botão Menu, enquanto a página permanece na mesma posição. A navegação continua em duas colunas e os links continuam selecionáveis. `npm run lint`, `npx tsc --noEmit` e `git diff --check` passaram. O menu segue sendo navegação local de front end, sem autenticação.

### 15/10/2026 — Acesso móvel por IP na prévia de desenvolvimento

- O Next bloqueava recursos de desenvolvimento quando a página era aberta pelo IP local, o que pode deixar o HTML visível sem ativar filtros e outros controles. `next.config.ts` agora permite origens IPv4 de redes privadas (`10/8`, `172.16/12` e `192.168/16`) para esses recursos em desenvolvimento.
- Na prévia local, confirmei que os filtros de Notícias alteram a seleção e a contagem. `npm run lint`, `npx tsc --noEmit` e `git diff --check` passaram. O acesso pelo dispositivo físico ainda precisa ser recarregado após o Next reiniciar; a integração continua sendo apenas front end.

### 15/10/2026 — Ícone de saída no cabeçalho desktop

- Realocado o ícone de saída para o extremo direito do cabeçalho administrativo, logo depois do avatar, em todas as sete telas. Em telas pequenas, o ícone continua junto à marca. As duas posições compartilham o mesmo aviso demonstrativo de saída.
- Conferidos no navegador o ícone depois do avatar em tela de PC e a manutenção do ícone ao lado da logo no mobile; o clique continua exibindo o aviso da prévia. `npm run lint`, `npm run build` e `git diff --check` passaram. A saída real continua pendente de autenticação no backend.

### 15/10/2026 — Menu administrativo recolhível no celular

- Substituída a grade permanente de atalhos por um botão “Menu” compacto, com o nome da seção atual. Ao expandir, os sete destinos aparecem em duas colunas; selecionar uma rota fecha o menu e atualiza a indicação da seção.
- Conferidos no navegador o estado recolhido, a expansão em duas colunas, a navegação para Integrantes e o fechamento automático após a seleção em 387 px. `npm run lint`, `npm run build` e `git diff --check` passaram. O comportamento continua sendo navegação de front end, sem autenticação ou backend.

### 15/10/2026 — Navegação móvel e cabeçalho administrativo

- O menu público agora fecha ao escolher um destino. No painel, o retorno foi movido para uma seta ao lado do título; ela leva ao site no dashboard e ao dashboard nas páginas internas. O ícone vermelho no topo exibe a saída demonstrativa, sem encerrar sessão real. Removidas as ações inferiores e as divisórias do topo no mobile.
- Em 387 px, conferidos visualmente dashboard, notícias, produtos, eventos, integrantes, resultados e pedidos; não houve rolagem horizontal da página. As tabelas de produtos e resultados mantêm rolagem local; Pedidos troca a tabela por cartões. Também foi aberto o menu público, selecionada Notícias e confirmado que o menu voltou fechado.
- `npm run lint`, `npm run build` e `git diff --check` passaram. A responsividade em 387 px foi testada no navegador; pontos a melhorar: indicar a rolagem das tabelas de notícias e produtos e revisar faixas intermediárias e celulares menores. Painel e logout continuam sendo apenas prévias, sem autenticação.

### 15/10/2026 — Detalhe demonstrativo de evento e presença

- Conferido o quadro `octacore-evento-presenca` no Figma; exportada a capa do treino e criada `/agenda/treino-volei-octacore` com informações, descrição, lista de cinco nomes visíveis e botão de retorno. O treino foi incluído na Agenda com link para o detalhe; os cartões da Agenda passaram a ser ordenados por data.
- Favorito, confirmação e expansão da informação sobre a lista respondem na interface, mas são descartados ao sair ou recarregar. A página informa que não registra presença; os 18 confirmados são um número demonstrativo do protótipo.
- Conferidos no navegador a rota, a imagem, os controles, a mudança de 18 para 19 na prévia, o retorno à Agenda e a restauração do estado ao entrar novamente. `npm run lint` e `npm run build` passaram. A regra para celular está no CSS; a revisão visual em largura menor permanece pendente.

### 15/10/2026 — Ranking e estatísticas esportivas demonstrativos

- Conferido o quadro `octacore-ranking-estatisticas` no Figma e criada `/ranking` com indicadores, classificação e barras de aproveitamento. A página de Modalidades recebeu o link de acesso.
- Os valores de `data/ranking.ts` são exemplos do protótipo, separados dos resultados administrativos, sem atualização automática ou backend.
- Conferidos no navegador o conteúdo da nova rota, o link em Modalidades e o layout em largura de celular; `npm run lint`, `npm run build` e `git diff --check` passaram.

### 15/10/2026 — Perfil público demonstrativo do atleta

- Conferido o quadro `octacore-perfil-atleta` no Figma e criada `/atletas/joao-silva` com apresentação, camisa 10, estatísticas e três resultados recentes. O nome de João Silva no elenco de Futsal agora é um link para esse perfil; sua posição foi alinhada ao quadro como “Ala”.
- A foto do Figma não está nos arquivos do projeto e foi representada por iniciais. Os dados em `data/athletes.ts` são apenas exemplos, sem sincronização com elenco, resultados administrativos ou backend.
- Conferidos no navegador o carregamento do perfil, seus dados e a navegação de ida e volta pelo elenco de Futsal. Conferidos `npm run lint` e `npm run build`; o comportamento em largura móvel foi preparado no CSS, mas ainda precisa de revisão visual em dispositivo menor.

### 15/10/2026 — Cartões móveis para Pedidos

- Em larguras de até 650 px, a lista de pedidos passa a usar cartões com número, cliente, data, valor, status e botão “Gerenciar pedido”. Ao tocar no botão, o pedido é selecionado e a página leva aos seus itens e à alteração de status. A tabela original continua em telas maiores.
- Conferidos no navegador os cartões em largura de celular, a seleção de outro pedido e o filtro de cancelados. Conferidos `npm run lint` e `npm run build`. Os dados e as alterações continuam demonstrativos e locais ao navegador.

### 15/10/2026 — Itens e filtros adicionais em Pedidos

- Incluídos no painel os itens, variações, quantidades e valores do pedido selecionado; o total da tabela agora é calculado a partir desses itens fictícios.
- Adicionados filtros específicos para “Disponível para retirada” e “Cancelado”, além dos status já existentes. Conferidos no navegador a seleção de outro pedido, o filtro de cancelados e o filtro de retirada após salvar uma mudança temporária de status. Conferidos `npm run lint` e `npm run build`. A tela permanece sem integração com checkout, cliente ou backend.

### 15/10/2026 — Gestão demonstrativa de pedidos

- Conferido o quadro `octacore-admin-pedidos` no Figma e criada `/admin/pedidos` com quatro pedidos fictícios, busca, filtros por status e painel para alterar o status selecionado. A barra lateral agora leva à rota.
- Os dados em `data/admin-orders.ts` são separados do checkout, de “Meus Pedidos” e dos indicadores do dashboard. Salvar altera apenas a tabela local enquanto a página permanece aberta; não registra compra, não envia mensagens e não chama backend.
- Conferidos no navegador filtro combinado à busca, seleção de pedido, alteração de status, restauração ao recarregar e layout em largura menor. Conferidos `npm run lint` e `npm run build`.

### 15/10/2026 — Filtro de derrotas no painel

- Acrescentado “Só Derrotas” à tabela de resultados. Os três filtros são exclusivos e combinam com a busca; “Limpar filtros” restaura a lista completa. Alteração apenas na interface demonstrativa, sem integração com backend.
- Conferidos `npm run lint`, `npm run build` e o filtro no navegador.

### 15/10/2026 — Gestão demonstrativa de resultados

- Conferido o quadro `octacore-admin-resultados` no Figma e criada `/admin/resultados` com cinco partidas, busca, filtro de vitórias, formulário de cadastro/edição e confirmação de exclusão. A barra lateral agora leva à rota.
- O status é derivado dos dois placares; os dados em `data/admin-results.ts` são apenas exemplos do painel. Recarregar restaura as partidas originais, sem alterar qualquer página pública ou backend.
- Conferidos no navegador o filtro combinado à busca, criação de empate, edição para vitória, exclusão, restauração após recarregar e layout em largura de celular com tabela rolável. Conferidos `npm run lint` e `npm run build`.

### 15/10/2026 — Gestão demonstrativa de integrantes

- Conferido o quadro `octacore-admin-integrantes` no Figma e criada `/admin/integrantes` com seis cartões, busca por nome, formulário de cadastro/edição e confirmação de remoção. A barra lateral agora leva à rota.
- Os exemplos do painel ficaram em `data/admin-members.ts`, separados do mural público. Os retratos do Figma ainda não estão no projeto; iniciais marcam a foto pendente, e o formulário aceita imagem local opcional de até 2 MB sem enviá-la ao servidor.
- Conferidos `npm run lint`, `npm run build`, busca, criação, edição, remoção e restauração após recarregar no navegador. O layout foi conferido em 430 px de largura; a seleção de foto permanece para teste manual em navegador comum.

### 15/10/2026 — Cronograma administrativo de eventos

- Conferido o quadro `octacore-admin-eventos` no Figma e criada `/admin/eventos` com quatro cartões, lista/calendário mensal, busca, formulário de criação/edição e confirmação de exclusão. A barra lateral agora leva à rota.
- Mantidos dados separados da agenda pública em `data/admin-events.ts`. As imagens do Figma não estão nos arquivos do projeto, então os cartões usam áreas provisórias; o formulário aceita imagem local de até 2 MB, sem envio ao servidor.
- Conferidos `npm run lint`, `npm run build`, alternância de visualização, navegação entre meses, busca, cadastro, edição e exclusão no navegador, além do layout em largura de celular. A seleção de arquivo de imagem permanece para teste manual em navegador comum.

### 15/10/2026 — Gestão demonstrativa de produtos

- Conferido o quadro `octacore-admin-produtos` no Figma e criada `/admin/produtos` com seus cinco produtos de exemplo, busca, tabela, controles de estoque, formulário de cadastro/edição, miniatura opcional e confirmação de exclusão.
- As alterações são temporárias e separadas dos produtos da loja pública. Fotos ainda não fornecidas são representadas por um ícone provisório; o envio local de imagem aceita JPG, PNG ou WebP de até 2 MB, sem servidor.
- Conferidos `npm run lint`, `npm run build`, busca, ajuste de estoque, cadastro, edição, exclusão e restauração após recarregar no navegador. Conferido o layout em largura de celular; a tabela permite rolagem horizontal. A seleção de arquivo de imagem permanece para teste manual em navegador comum.

### 15/10/2026 — Editor e prévia de notícias administrativas

- Ampliado o formulário administrativo com resumo, texto em parágrafos, imagem de destaque opcional e descrição da imagem. A prévia mostra o conteúdo no estilo da notícia pública antes de salvar somente na tabela demonstrativa.
- As cinco linhas iniciais receberam textos de exemplo para que a edição e a prévia já possam ser exploradas. Incluídos limites de tipo e tamanho para imagens locais e uma imagem da galeria como opção de demonstração.
- Conferidos `npm run lint`, `npm run build`, criação, prévia, salvamento, reabertura e imagem de exemplo no navegador. O carregamento de imagem local não pôde ser automatizado porque a extensão do Chrome bloqueou o acesso a arquivos; essa seleção deve ser conferida manualmente. Não há publicação real nem integração com a página pública.

### 14/10/2026 — Correção dos filtros administrativos

- Os filtros de `/admin/noticias` passaram a acompanhar as categorias presentes nas linhas: “Treinos”, “Festas” e “Loja” aparecem com seus conteúdos; “Jogos” e “Comunicados” só aparecem quando houver notícias dessas categorias. Adicionadas contagem de resultados e ação para limpar busca e categoria.
- As buscas do Dashboard e do mural receberam textos específicos para deixar claro seu alcance. Os indicadores do Dashboard continuam demonstrativos e independentes da tabela.
- Conferidos no navegador os filtros de Treinos e Seletivas, a combinação com busca, a limpeza dos filtros e o surgimento de Jogos após criar uma notícia temporária. Conferidos `npm run lint` e `npm run build`. Ainda faltam os campos completos do editor, publicação real e integração com o Dashboard.

### 14/10/2026 — Mural administrativo de notícias

- Conferido o quadro `octacore-admin-noticias` no Figma e criada `/admin/noticias`, com a tabela, os filtros e a busca. A barra lateral foi compartilhada entre as duas telas administrativas, com indicação da rota ativa.
- Incluídos formulários de criação e edição e confirmação de exclusão apenas na memória da página. Esses dados não alteram o site público e são restaurados ao recarregar.
- Conferidos `npm run lint`, `npm run build`, navegação, filtro e visual responsivo no navegador, além de criação, edição e exclusão temporárias. Permanecem pendentes autenticação, API e as demais telas administrativas.

### 14/10/2026 — Ajuste visual da barra lateral administrativa

- Alinhados logo, divisórias, posição dos itens e destaque do Dashboard ao segundo print enviado pela equipe.
- Conferida a aparência do painel no navegador em desktop e celular; a navegação e os dados permanecem demonstrativos.

### 14/10/2026 — Dashboard administrativo

- Conferido o quadro `octacore-admin-dashboard` no Figma e criada a rota `/admin`, com barra lateral própria, cinco indicadores, gráfico de seis meses e atividades recentes fictícias.
- A busca filtra as atividades locais; seções futuras e saída do painel mostram avisos. O cabeçalho e o rodapé públicos ficam fora da área administrativa.
- Conferidos `npm run lint`, `npm run build`, busca, navegação e visual no navegador em desktop e celular. Ainda faltam as demais telas administrativas, autenticação e dados reais.

### 12/10/2026 — Prévia de Minha Conta e Meus Pedidos

- Criados o painel de conta e a página de pedidos conforme os quadros do Figma, com perfil, pedido e progresso de entrega de exemplo.
- Ligadas as ações de pedidos e histórico às novas telas. O login oferece acesso à prévia após informar que a autenticação ainda não existe; as demais ações mostram avisos claros.
- Conferidos `npm run lint`, `npm run build`, navegação e aparência no navegador em tamanhos de desktop e celular. Permanecem pendentes autenticação, pedidos reais e edição dos dados.

### 12/10/2026 — Retorno ao login no cadastro

- Adicionado botão secundário “Voltar ao login” abaixo do formulário de cadastro, para completar a navegação entre as duas telas.
- Conferida a navegação no navegador. A autenticação real continua pendente.

### 12/10/2026 — Revisão visual de login e cadastro conforme o Figma

- Conferidos os quadros no Figma. O login usa cartão central de 500 px, logo, título, dois campos e links de recuperação/cadastro; o cadastro usa cartão de 550 px, cinco campos (incluindo curso) e texto de apoio.
- Removido o painel lateral criado inicialmente; cores, bordas, largura, espaçamento e textos foram alinhados aos quadros. O cabeçalho mostra “Minha conta” nessas duas rotas.
- Conferidos `npm run lint`, `npm run build` e a aparência das duas telas no navegador; o login também foi verificado em largura de celular. A autenticação real continua pendente.

### 12/10/2026 — Telas de acesso e cadastro

- Criadas `/login` e `/cadastro` com formulário compartilhado, validação local e mensagem explícita de indisponibilidade da autenticação.
- Conferidos `npm run lint`, `npm run build` e a navegação entre as duas telas no navegador. O envio do login e a validação de senhas diferentes no cadastro foram testados com dados fictícios; a tela de cadastro também foi inspecionada em largura de celular.
- Pendentes autenticação real, conta do usuário e administração.

### 11/10/2026 — Início da documentação contínua

- Registradas as telas existentes, as fontes de dados locais, o fluxo simulado da loja e as pendências do MVP.
- Adicionado um ponto de entrada no README e uma instrução de manutenção para futuros trabalhos no projeto.

Para cada mudança relevante, acrescente uma entrada curta com **data**, **o que mudou**, **como foi conferido** e **o que continua pendente**. Atualize também as seções acima: o histórico sozinho não substitui o estado atual.

## 10. Como manter este documento

Ao concluir uma tela ou funcionalidade:

1. Atualize a linha correspondente em **Estado das telas** e as seções de fluxo ou arquitetura afetadas.
2. Marque com clareza o que é visual, simulado ou integrado ao backend.
3. Registre decisões que alterem o escopo ou a fonte dos dados.
4. Adicione uma entrada no **Histórico de desenvolvimento**, citando a verificação feita.
5. Atualize a data no início do arquivo.

Mantenha explicações práticas e curtas. O código continua sendo a referência para detalhes de implementação.

## Glossário rápido

- **TypeScript (`.ts`)**: JavaScript com tipos, usado principalmente para dados e regras.
- **TSX (`.tsx`)**: TypeScript com JSX, usado para escrever componentes e páginas React.
- **Slug**: identificador legível na URL, como `camisa-especial-octacore` em `/loja/camisa-especial-octacore`.
- **CSS Module**: arquivo de estilos associado a uma página ou componente, com classes isoladas.
- **API**: interface pela qual o front end poderá ler e gravar dados no backend.
- **`localStorage`**: armazenamento do próprio navegador, usado provisoriamente pelo carrinho.
