# Documentação de desenvolvimento — Octacore

**Última atualização:** 25/11/2026

**Estado:** MVP full stack integrado; backend Python/FastAPI ativo no Docker Compose e banco preservado, com limitações de schema documentadas

**Referência visual:** protótipo [Projeto P3 — Octacore no Figma](https://www.figma.com/design/BcgJnC6UWsDG5W5B5mO7V6/Projeto-P3---Octacore?node-id=0-1)

Este é o registro contínuo do site da Associação Atlética Acadêmica de Computação da UFAL. Ele descreve o que já funciona, o que é apenas demonstração e o que falta construir. Deve ser atualizado no mesmo trabalho em que uma funcionalidade relevante for alterada.

## 1. Objetivo e limites do MVP

O site reúne informações da atlética, notícias, modalidades, agenda, mural e produtos. O frontend está conectado a uma API REST que aplica autenticação, autorização, regras de estoque, pedidos e administração de conteúdo sobre o PostgreSQL existente.

- **Front end escolhido:** Next.js, React e TypeScript.
- **Backend implementado:** Python 3.13, FastAPI, SQLAlchemy 2, Pydantic e psycopg, em `backend-python/`; a pasta antiga `backend/`, com Fastify, foi removida.
- **Banco:** PostgreSQL no schema `octacore`; as tabelas existentes são preservadas, e a API cria idempotentemente `presenca_evento` para confirmações de presença, `favorito_evento` para eventos salvos e `foto_mural` para a galeria administrativa.
- **Integração real:** autenticação, conteúdo público, administração, uploads, estoque, pedidos e presenças em eventos.
- **Ainda demonstrativo:** pagamento, ranking, estatística individual e atividades administrativas. Presenças e favoritos em eventos persistem por usuário autenticado.

Os documentos de planejamento originais ficam em `assets/` apenas no ambiente local; a pasta é ignorada pelo Git. Esta página registra o estado **implementado**; ideias desses documentos só passam para “pronto” depois de aparecerem no código e serem verificadas.

## 1.1 Perfis de acesso planejados

O MVP possui três tipos de acesso. A API aplica autenticação e autorização nas operações protegidas, e a interface reflete a sessão ativa.

| Perfil | Acesso previsto | Estado atual |
| --- | --- | --- |
| Visitante | Navegar pelas páginas públicas, consultar notícias, modalidades, agenda, mural e loja; montar carrinho no navegador. | Conteúdo vem da API; o carrinho permanece local e não exige conta. |
| Usuário autenticado | Tudo do visitante, mais conclusão e acompanhamento de pedidos, edição da conta, confirmação de presença e favoritos em eventos. | Cadastro, login, refresh, logout, perfil, pedidos, presença e favoritos persistem; navegação pública e carrinho não exigem conta. |
| Administrador | Tudo do usuário autenticado, mais acesso autorizado ao painel e gestão de conteúdo, integrantes, resultados e pedidos. | API e interface exigem conta `ADMIN`; CRUD e alterações persistem no PostgreSQL. |

A separação é validada pela API em cada rota protegida. A interface também redireciona usuários sem acesso, mas a autorização do servidor é a barreira efetiva.

## 1.2 Arquitetura integrada

- O frontend usa `API_URL` em Server Components e `NEXT_PUBLIC_API_URL` nas telas interativas.
- A API usa rotas FastAPI, serviços e repositórios, validação Pydantic, SQLAlchemy/psycopg, erros padronizados, CORS, cabeçalhos de segurança e rate limiting. Os modelos mapeiam o schema existente; `presenca_evento`, `favorito_evento` e `foto_mural` são criadas de forma idempotente em bancos existentes.
- O access token fica em memória no navegador; o refresh token usa cookie `httpOnly` e é renovado automaticamente. Sem tabela de tokens, logout remove o cookie do cliente, mas não mantém lista de revogação no servidor.
- O checkout exige usuário autenticado. A criação do pedido usa transação serializável, valida estoque, desconta quantidades e congela o preço nos itens; o trigger do banco recalcula o total.
- A API aceita uploads administrativos JPG, PNG ou WebP de até 6 MB, confere assinatura binária e serve os arquivos apenas por nome UUID validado. O formulário da galeria do Mural usa esse limite; os demais formulários ainda limitam a seleção a 2 MB na interface.
- `docker-compose.yml` inicia frontend, API e PostgreSQL; o OpenAPI fica em `/docs/openapi.json` e o health check em `/health`.

## 2. Estado das telas

| Rota | O que existe hoje | Estado |
| --- | --- | --- |
| `/` | Página inicial com apresentação, mascote, próximo jogo e resultado em destaque, produtos e até três compromissos futuros. O destaque usa o resultado escolhido no admin; sem escolha, usa o mais recente até hoje. Os cards esportivos abrem o evento ou a modalidade correspondente; quando faltam registros, mostram estados vazios com navegação. | **Integração real:** produtos, agenda e resultados vêm da API/PostgreSQL; apenas a apresentação visual é de interface |
| Todas as rotas do App Router | O conteúdo da rota entra com opacidade, leve deslocamento e desfoque em 440 ms; seções, cartões, formulários e tabelas abaixo da dobra são revelados progressivamente durante o scroll. Cabeçalho e estruturas compartilhadas permanecem estáveis. | Animação local no navegador, com `IntersectionObserver` e respeito a `prefers-reduced-motion`; sem dependência de backend |
| `/motion-octaweb.html` | Peça animada de apresentação do OctaWeb, com identidade visual da Octacore, apresentação da plataforma e seus principais espaços. | Apresentação em HTML/CSS; animação local no navegador, sem exportação de vídeo |
| `/noticias` e `/noticias/[slug]` | Lista com filtro por categoria e página individual de cada notícia; no mobile, os filtros ocupam um seletor compacto. A lista e o detalhe compartilham o gradiente da navbar. O detalhe mostra a capa cadastrada sem bloco vazio quando não existe foto e alinha à capa cartões compactos de outras notícias. | **Integração real:** notícias e capas vêm do PostgreSQL/API; o efeito de vidro, o gradiente e a disposição dos cartões são somente de interface |
| `/modalidades` e `/modalidades/[slug]` | Lista e páginas de modalidades, horários, responsáveis, elenco, resultados e próximos eventos disponíveis. Ambas compartilham o fundo contínuo com a navbar e cartões roxos translúcidos discretos; imagens cadastradas aparecem na lista e no detalhe, enquanto modalidades sem imagem não reservam uma área vazia. Os cards da lista são inteiros clicáveis. | **Integração real:** dados e imagens da API; fundo, cartões e navegação ampliada são tratamento de interface |
| `/atletas/[slug]` | Perfil público de João Silva, com modalidade, camisa, estatísticas e resultados recentes. | **Prévia visual:** dados de exemplo; foto pendente |
| `/ranking` | Indicadores da temporada, classificação geral e aproveitamento por modalidade. Acesso pela página de Modalidades. Fundo contínuo com a navbar, cartões translúcidos discretos e aviso de números ilustrativos. | **Prévia visual:** números de exemplo, sem cálculo automático ou integração com a API; o tratamento visual é somente de interface |
| `/agenda` | A lista mostra eventos futuros e os ocorridos há no máximo sete dias, em ordem cronológica, com filtro por categoria. O calendário mensal permite consultar também os eventos anteriores e abrir seus detalhes. A página busca todas as páginas de eventos da API. | **Integração real:** lista e calendário usam eventos da API/PostgreSQL; ocultar eventos antigos da lista é regra de apresentação, sem exclusão no banco |
| `/agenda/[slug]` | Detalhe do evento, placar quando há resultado vinculado e lista atualizada de confirmações. Usuários autenticados podem confirmar ou cancelar presença e favoritar/desfavoritar; após login retornam ao evento solicitado. | **Integração real:** conteúdo, resultado vinculado, presença e favoritos por conta/evento no PostgreSQL |
| `/mural`, `/mural/historia`, `/mural/integrantes`, `/mural/conquistas` | Apresentação da atlética, história, integrantes e conquistas; filtro compacto na lista. As telas do Mural compartilham um fundo contínuo com a navbar e superfícies roxas discretas. A História ordena os marcos por ano. Conquistas mostra estado vazio quando não há títulos; a galeria mostra apenas fotos cadastradas e estado vazio quando não há fotos. | **Integração real:** história, integrantes, conquistas e galeria vêm da API/PostgreSQL; o upload de fotos de até 6 MB foi confirmado no Docker pelo usuário. Gradiente e cartões são apenas interface |
| `/mural/integrantes/[slug]` | Perfil de integrante com função, curso e modalidades. | **Integração real:** dados do PostgreSQL; foto pode estar pendente |
| `/loja` | Catálogo com busca, filtro, variações disponíveis, estoque e carrinho. A abertura usa fundo contínuo com a navbar; os cards têm superfícies roxas discretas e a barra recebe sua camada escura somente quando fica fixa durante a rolagem. | **Integração real:** catálogo/estoque da API; seleção do carrinho no navegador; novo tratamento visual somente de interface |
| `/loja/[slug]` | Detalhe de produto com variação, quantidade e estoque disponível. | **Integração real:** produto da API |
| `/carrinho` | Alteração de quantidade, remoção com confirmação visual própria e cálculo com preços atuais. | **Integração parcial:** seleção local, catálogo/preços reais |
| `/checkout` | Dados de retirada, resumo, estados vazio/erro e confirmação do pedido com gradiente contínuo desde a navbar e superfícies roxas discretas como no Carrinho. | **Integração real:** pedido transacional e estoque; tratamento visual somente de interface, sem cobrança/pagamento |
| `/login`, `/cadastro` e `/redefinir-senha` | Cadastro, login, recuperação e redefinição. Login e cadastro compartilham o gradiente contínuo com a navbar, cartão roxo translúcido e campos de alto contraste; explicam que a conta serve para concluir/acompanhar pedidos e confirmar presença, enquanto a navegação pública não exige conta. O retorno ao evento é preservado ao alternar entre login e cadastro. | **Integração real:** bcrypt, JWT e cookie `httpOnly`; o visual e os textos são de interface e o retorno usa a navegação existente |
| `/minha-conta` | Painel do usuário conectado, edição de nome/curso, troca de senha, lista de eventos favoritos e logout. Para administradores, também oferece acesso ao painel admin; o cabeçalho do site mostra separadamente conta e painel. | **Integração real:** sessão compartilhada, perfil, credenciais e favoritos da API/PostgreSQL; alternar entre site e painel preserva a sessão |
| `/meus-pedidos` e `/meus-pedidos#historico` | Abas separadas de pedidos ativos e histórico; apenas a lista selecionada aparece. Ativos incluem Pendente, Confirmado, Em separação e Disponível para retirada; histórico inclui Entregue e Cancelado. | **Integração real:** pedidos do usuário autenticado, classificados pelo status retornado pela API |
| `/admin` | Visão geral com cartões de indicadores, gráfico de vendas e atalhos; usa superfícies roxas translúcidas e estados vazios claros. Indicadores e vendas vêm do banco; atividades recentes ficam vazias por falta de tabela de auditoria. O cabeçalho do painel oferece “Ver site” sem encerrar a sessão; “Sair da conta” encerra a sessão. | **Integração real:** rota protegida por ADMIN; navegação entre áreas usa a sessão existente, tratamento visual somente de interface |
| `/admin/perfil` | Perfil da conta administrativa, edição de dados, troca de senha e atalhos; cartões acompanham o visual do painel. | **Integração real:** usa a mesma sessão e operações da conta |
| `/admin/noticias` | Busca, filtros, editor, upload, publicação, edição e exclusão; resumo é opcional e o autor vem da sessão. Tabela e editor seguem as superfícies do painel. | **Integração real:** publica no site; apenas status Publicado porque não existe coluna de rascunho |
| `/admin/produtos` | Busca, estoque, cadastro, edição, desativação e upload; tabela e formulário seguem as superfícies do painel. | **Integração real:** altera loja e estoque |
| `/admin/eventos` | Lista/calendário, busca, criação, edição, exclusão e upload; descrição e local são opcionais. Datas anteriores ao dia atual não podem ser cadastradas; sem local, salva “Local a definir”. Eventos históricos continuam editáveis sem alterar a data. | **Integração real:** interface e API validam datas; alterações persistem e afetam a agenda pública |
| `/admin/modalidades` | Cadastro, edição, exclusão, imagem com prévia e remoção, responsável, local e horários de treino. A edição preserva horários que não mudaram; cartões e formulários seguem as superfícies do painel. | **Integração real:** persiste dados e imagens na API e altera as páginas de modalidades |
| `/admin/integrantes` | Busca, cadastro, edição, remoção e foto; nome e curso são obrigatórios, função e Instagram opcionais. Cartões e formulário seguem as superfícies do painel. | **Integração real:** altera mural público |
| `/admin/mural` | Gestão de conquistas, marcos históricos e fotos da galeria; marcos são exibidos por ano e não pedem ordem manual. A aba Fotos permite adicionar, trocar e remover imagens, com descrição obrigatória e legenda opcional. | **Integração real:** História e Conquistas existentes usam PostgreSQL; a nova gestão de fotos está conectada no código, com persistência real ainda pendente de teste no Docker |
| `/admin/resultados` | Busca, filtros, cadastro, edição e remoção; campeonato é opcional. O vínculo de resultado aceita apenas eventos do tipo Jogo ou Treino. O formulário permite marcar um resultado para destaque na Home; somente um pode estar marcado. A tabela identifica o selecionado. | **Integração real:** API valida o tipo do evento e persiste resultados e escolha do destaque no PostgreSQL |
| `/admin/pedidos` | Busca, filtros, itens e transições válidas de status; tabela, cartões móveis e detalhes seguem as superfícies do painel. | **Integração real:** gerencia pedidos; notificações ao cliente não existem |
| `/admin/usuarios` | Busca, filtro, edição de dados/perfil e exclusão controlada; usa os cartões e formulários compartilhados do painel. | **Integração real:** gerencia contas; impede autoexclusão e autorrebaixamento administrativo |

“Interface pronta” indica que a página foi construída no front end, não que seu conteúdo esteja aprovado para publicação ou conectado à API.

## 3. Como executar e conferir

Para executar frontend, API Python e banco juntos, rode na raiz do projeto:

```bash
docker compose up -d --build
docker compose ps
```

O site fica em `http://localhost:3000`, o Swagger em `http://localhost:3333/docs` e a saúde da API em `http://localhost:3333/health`. O serviço `api` usa `backend-python/`; a instância opcional `api-python` na porta 3334 pode permanecer parada. A conexão externa ao PostgreSQL usa `localhost:5433`.

Para desenvolver somente o frontend, com API e banco já disponíveis, execute a partir da pasta `frontend`:

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
| `frontend/src/app/template.tsx`, `template.module.css` e `components/page-motion.tsx` | Transição global entre rotas e revelação progressiva de blocos durante o scroll; respeita a preferência por movimento reduzido. |
| `frontend/src/components/` | Componentes reutilizados, como cabeçalho, rodapé e cards. |
| `frontend/src/lib/api.ts`, `server-api.ts`, `api-types.ts`, `api-mappers.ts` | Clientes HTTP, autenticação, contratos e adaptação dos dados da API. O navegador usa `/api/v1` no mesmo endereço do site; o Next.js encaminha a chamada à API configurada em `API_URL`. |
| `frontend/src/data/` | Tipos, rótulos e dados que continuam demonstrativos; não é mais a fonte dos módulos integrados. |
| `frontend/src/lib/cart.ts` | Seleção do carrinho no navegador; a API revalida produto, variação, preço e estoque no checkout. |
| `backend-python/app/routers/`, `services/` e `repositories/` | Rotas FastAPI, regras de negócio e acesso SQLAlchemy de autenticação, conteúdo, loja e administração. |
| `backend-python/app/models.py` | Mapeamento SQLAlchemy fiel às 14 tabelas; não cria migrações. |
| `backend-python/tests/` | Testes Pytest de validação, tokens e bcrypt. |
| `docker-compose.yml` | Frontend, API e PostgreSQL com health checks. |
| `frontend/src/components/auth-form.tsx` | Formulário compartilhado pelas telas de login e cadastro. |
| `frontend/src/data/account.ts` | Legado visual; conta e pedidos integrados não usam mais estes valores. |
| `frontend/src/data/athletes.ts` | Perfil esportivo demonstrativo e resultados recentes do atleta no Figma. |
| `frontend/src/data/ranking.ts` | Indicadores, classificação e aproveitamento demonstrativos do quadro de ranking. |
| `frontend/src/data/event-details.ts` | Referência visual legada do detalhe; as confirmações reais de presença vêm da API. |
| `frontend/src/components/site-chrome.tsx` | Exibe cabeçalho e rodapé públicos nas rotas do site; omite ambos na área `/admin`, que usa estrutura própria. |
| `frontend/src/data/admin.ts` | Referência visual legada; dashboard integrado usa métricas da API. |
| `frontend/src/app/admin/layout.tsx` e `admin-shell.tsx` | Estrutura e barra superior compartilhadas entre as telas administrativas; em celular a busca contextual fica abaixo do título. |
| `frontend/src/data/admin-*.ts` | Tipos/rótulos e referências visuais legadas; as telas administrativas carregam a API. |
| `frontend/public/images/` | Imagens versionadas e servidas pelo site; originais e referências ficam na pasta local `assets/`, fora do Git. |
| `frontend/README.md` | Guia rápido de execução e mapa resumido do front end. |

As páginas usam CSS Modules (`*.module.css`) para estilos próprios. A identidade visual segue o Figma: fonte Outfit, paleta da Octacore e cópias versionadas das imagens em `frontend/public/images/`. Os originais fornecidos ficam em `assets/` somente no ambiente local. Os retângulos brancos de galeria, mural e integrantes são espaços reservados intencionais.

## 5. Onde alterar o conteúdo

Notícias, produtos, estoque, modalidades, horários, agenda, integrantes, resultados, conquistas, história, usuários e pedidos devem ser alterados pela API/painel ou diretamente no PostgreSQL em operações controladas. Os arrays antigos em `frontend/src/data` não alimentam mais essas telas integradas.

| Conteúdo | Arquivo |
| --- | --- |
| Conteúdo, catálogo, esporte e pedidos integrados | Painel `/admin`, API `/api/v1` e PostgreSQL |
| Contratos e regras do banco | `database/01_schema.sql` e `backend-python/app/models.py` |
| Configuração de API no frontend | `frontend/.env.local` |
| Configuração da API | `backend-python/.env` |
| Confirmações de presença em evento | API `/api/v1/events/<slug>/attendance` e PostgreSQL; `frontend/src/data/event-details.ts` permanece como referência visual legada |
| Eventos favoritos | API `/api/v1/events/favorites` e `/api/v1/events/<slug>/favorite`, tabela `favorito_evento`; lista em `/minha-conta` |
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
3. Ao adicionar, `cart.ts` grava identificador, tamanho e quantidade em `localStorage`, na chave `octacore-cart`. A pessoa permanece na loja ou no detalhe; abre-se um painel lateral modal com todos os itens do carrinho, incluindo cada tamanho, quantidade, preço por linha e total somado. O produto recém-adicionado recebe um aviso no topo. Os dados dos produtos são consultados na API; o painel oferece ações para ver o carrinho ou continuar comprando. O botão também confirma brevemente a adição. O acesso fixo ao carrinho exibe a contagem de itens. A quantidade por produto e tamanho é limitada a 99 e pela disponibilidade da variação.
4. `/carrinho` lê esses itens, consulta preços e estoque atuais da API e calcula o total. O controle de quantidade não ultrapassa o estoque da variação; quantidades antigas acima do estoque recebem aviso e ação para ajustar, bloqueando a ida ao checkout.
5. `/checkout` exige sessão, revalida variações e quantidades disponíveis e envia nome, telefone, retirada e observações. A API cria pedido e itens em transação, congela preços e desconta estoque; a API faz a validação final para evitar venda concorrente acima do estoque.

O carrinho persiste no mesmo navegador; ele não acompanha o usuário em outros dispositivos. Se o armazenamento estiver bloqueado, há uma cópia temporária apenas na aba. Estoque e pedidos estão integrados; frete, desconto e pagamento não existem no schema atual.

### Acesso e cadastro

O cabeçalho consulta um estado compartilhado de autenticação: visitantes abrem `/login`, usuários conectados veem o primeiro nome e abrem `/minha-conta`, e administradores abrem `/admin`. Login e cadastro validam localmente e enviam dados à API; após autenticação, usuários vão para `/minha-conta` e administradores para `/admin`. O access token fica em memória e é reemitido pelo refresh cookie após recarregar ou reabrir o site. “Esqueci minha senha” solicita e-mail por SMTP quando configurado e `/redefinir-senha` aplica o token recebido.

`/minha-conta` exibe o usuário autenticado, atualiza nome e curso, troca a senha e encerra a sessão. A troca de senha invalida o refresh cookie e exige novo login. `/meus-pedidos` abre a aba de pedidos ativos, com status de Pendente até Disponível para retirada. O atalho `/meus-pedidos#historico` abre diretamente o histórico, que exibe somente Entregue e Cancelado. As abas mostram uma lista por vez e acompanham a navegação voltar/avançar do navegador. A classificação usa o status real da API ao carregar a página; não há atualização em tempo real entre sessões administrativas e do cliente. A consulta atual mantém o limite de 100 pedidos.

### Painel administrativo

`/admin` usa sessão real e redireciona quem não possui `ADMIN`. Indicadores, vendas, conteúdo, estoque, eventos, integrantes, resultados e pedidos vêm da API. O logout remove o refresh cookie e limpa o access token. Atividades recentes permanecem vazias, pois o banco não possui auditoria.

`/admin/noticias` publica, edita e exclui notícias reais. Imagens passam pelo upload validado; o autor é a conta administrativa autenticada. O formulário oferece apenas “Publicado”, porque `noticia` não possui coluna de rascunho.

`/admin/produtos` consulta produtos/variações reais. Cadastro, edição, desativação, preço, estoque e upload persistem e alimentam Home, Loja e checkout. Camisas têm estoque individual para P, M, G e GG; as demais categorias usam estoque único. Ao editar uma camisa antiga cadastrada com estoque `UNICO`, o administrador deve distribuir as unidades pelos tamanhos antes de salvar. A variação antiga fica com estoque zero e preservada para não alterar pedidos já vinculados a ela.

`/admin/eventos` consulta e altera a mesma tabela usada por Agenda e Home. Lista, calendário, busca, CRUD, upload e vínculo opcional com modalidade persistem na API. Novos registros e mudanças de data não aceitam dias anteriores ao atual no fuso de Maceió. O local vazio é salvo como “Local a definir”.

`/admin/modalidades` gerencia modalidades, imagens, responsáveis, locais e múltiplos horários de treino. O formulário mostra a prévia da imagem enviada e permite removê-la antes de salvar. Na edição, horários existentes são mantidos quando seus dias e horas iniciais não mudam, evitando conflito com a chave única do banco; horários repetidos no mesmo dia e início são recusados com mensagem específica. `/admin/mural` gerencia conquistas e marcos históricos. As alterações alimentam imediatamente as respectivas páginas públicas.

`/admin/integrantes` consulta e altera integrantes do mural. Nome, função, curso, Instagram, foto, participação na diretoria e múltiplos vínculos com modalidades persistem na edição. As modalidades são selecionadas por caixas de marcação, sem exigir teclas modificadoras.

`/admin/resultados` consulta e persiste partidas ligadas a uma modalidade cadastrada e, opcionalmente, a um evento do tipo Jogo ou Treino sem resultado. A API impede vínculos com outros tipos e impede mudar um evento com resultado para outro tipo. Busca, filtros, CRUD e cálculo de vitória/empate/derrota continuam na interface; a tabela pode rolar horizontalmente em telas estreitas.

`/admin/pedidos` lista os pedidos criados pelo checkout e seus itens com preço congelado. A API aceita somente transições válidas de status; cancelamento devolve estoque uma única vez. A interface não envia notificações ao cliente porque não há entidade ou integração para isso.

`/admin/usuarios` lista e filtra contas, permite atualizar nome, e-mail, curso e perfil, e oferece exclusão quando os relacionamentos do banco permitem. A própria conta administrativa não pode ser excluída nem perder o perfil `ADMIN`.

`/atletas/joao-silva` segue o quadro `octacore-perfil-atleta` do Figma: perfil de João Silva, Futsal Masculino, camisa 10, quatro estatísticas e três resultados recentes. O elenco da página de Futsal agora leva ao perfil; a posição exibida foi alinhada ao protótipo como “Ala”. A foto do quadro não está nos arquivos fornecidos, então as iniciais “JS” ocupam seu espaço provisoriamente. Os números são exemplos em `data/athletes.ts`, independentes dos resultados administrativos e do perfil de conta; **não há atualização automática nem integração com backend**. Esta é uma página pública de atleta, distinta de `/minha-conta`.

`/ranking` segue o quadro `octacore-ranking-estatisticas` do Figma: quatro indicadores da temporada, três posições no Campeonato Universitário e barras de aproveitamento para Futsal, Basquete, Voleibol e Handebol. O link “Ver ranking e estatísticas” em `/modalidades` leva à página. Os valores estão em `data/ranking.ts` e são exemplos independentes das partidas em `data/admin-results.ts` e do perfil do atleta; **não são calculados a partir de resultados nem sincronizados com o backend**.

`/agenda/treino-volei-octacore` segue o quadro `octacore-evento-presenca` do Figma. A imagem de capa foi exportada do próprio protótipo para `public/images/treino-volei-hero.png`. O treino foi acrescentado à Agenda e seu cartão abre o detalhe. Usuários autenticados confirmam/cancelam presença, identificada pela conta, e veem a lista real; a restrição única por usuário/evento evita duplicatas. A API cria as tabelas `presenca_evento` e `favorito_evento` com `checkfirst` na inicialização, sem recriar nem alterar as tabelas pré-existentes. A autenticação é exigida para alterar presença ou favorito, e visitantes são direcionados ao login com retorno ao evento. Os favoritos aparecem em Minha Conta. Dados de presença do protótipo (18 confirmações e cinco nomes) não são tratados como registros reais.

A navegação administrativa mantém o comportamento responsivo anterior. A navbar reúne marca, busca, perfil autenticado e saída real; a API volta a verificar `ADMIN` em cada operação. Tabelas largas rolam no próprio painel e pedidos usam cartões no celular.

## 7. Próximos passos

1. Configurar e validar SMTP real; os demais fluxos do Compose, banco, autenticação, conteúdo, pedido/estoque e uploads já foram exercitados contra PostgreSQL.
2. Planejar evolução de schema para refresh/reset tokens revogáveis, rascunhos, auditoria, estatísticas/classificação e, se necessário, pagamento/notificações.
3. Revisar acessibilidade/responsividade em dispositivos físicos e substituir placeholders pelas imagens aprovadas. Avaliar os cards de vidro em Notícias antes de levar o estilo a outras telas.

Esta ordem pode mudar por decisão da equipe; registre a decisão abaixo quando acontecer.

## 8. Decisões e limites conhecidos

- O frontend usa **Next.js + TypeScript**; em 10/11/2026 o backend principal foi migrado para **Python + FastAPI + SQLAlchemy + Pydantic + psycopg** para facilitar a manutenção pela equipe. O contrato HTTP e o schema PostgreSQL foram preservados. A pasta Fastify/Prisma foi removida; uma recuperação da implementação antiga depende de um commit anterior que a contenha.
- O banco de dados é **PostgreSQL**, com as tabelas no schema `octacore`. A estrutura oficial fica em `database/01_schema.sql`, derivada do MER do projeto; mudanças de estrutura devem ser feitas nesse arquivo e versionadas. Os slugs de notícias, eventos, modalidades, integrantes e produtos seguem as rotas do front end.
- O protótipo do Figma orienta a interface; a fonte Outfit e os arquivos em `assets/` compõem a identidade visual atual.
- Fotos ainda indisponíveis permanecem como placeholders, conforme combinado para galeria, mural e integrantes.
- A fundação em 2018, os oito anos e o primeiro título do INTERENG em 2026 foram informados pela equipe. Os demais conteúdos, preços e detalhes de produtos são dados de exemplo e precisam de confirmação da atlética.
- A Home consulta agenda e resultados para os destaques esportivos; o próximo jogo considera eventos futuros dos tipos JOGO e CAMPEONATO. O resultado em destaque é escolhido em `/admin/resultados`; sem seleção, aparece o placar de data mais recente até hoje. O placar de Futsal Octacore 5 × 2 Atlética X é **dado de exemplo** de `database/02_seed.sql`, vinculado ao evento de 10/10/2026; não deve ser apresentado como resultado oficial sem confirmação da atlética. Os textos de apresentação continuam editoriais.
- O checkout registra pedido real e desconta estoque, mas não cobra: não existe integração de pagamento no schema ou na interface.
- Login, cadastro, refresh, logout e recuperação de senha são reais. A recuperação só envia e-mail quando SMTP é configurado; sem tabela de token, reset e refresh não têm revogação individual no servidor.
- “Minha Conta” e “Meus Pedidos” usam sessão, perfil, troca de senha e pedidos reais. O cabeçalho acompanha login, atualização de nome e logout sem depender da rota atual.
- O perfil público do atleta também usa dados fixos e não compartilha ainda estatísticas com as outras páginas.
- O ranking público usa números fixos do Figma e não é recalculado a partir das partidas do painel ou das estatísticas individuais.
- Favoritos e presenças em eventos são vinculados às contas autenticadas no banco e não reutilizam os números ou nomes demonstrativos do Figma.
- O painel exige `ADMIN` e persiste notícias, produtos, estoque, eventos, integrantes, resultados e status de pedidos. Atividades recentes não são fabricadas: permanecem vazias sem uma tabela de auditoria.
- Os quadros de login e cadastro do Figma usam cartões centralizados sobre fundo roxo escuro; os formulários foram ajustados a essa estrutura. O rodapé mantém a alteração posterior solicitada para “Comunidade acadêmica”.

## 9. Histórico de desenvolvimento

### 26/11/2026 — Vínculo de resultados apenas com jogos e treinos

- O seletor de evento do resultado agora exibe apenas jogos e treinos disponíveis. A API valida o mesmo critério ao criar ou editar resultados e impede alterar o tipo de um evento com resultado vinculado para outra categoria. Um vínculo antigo inválido precisa ser removido ou trocado antes de salvar o resultado; registros antigos não foram apagados automaticamente.
- Verificação: lint, checagem de tipos, compilação Python e `git diff --check`. Operações com banco no Docker ainda pendentes de conferência manual.

### 26/11/2026 — Limite de compra pelo estoque disponível

- O carrinho passou a limitar o botão de aumento ao estoque real da variação, por tamanho, além do limite de 99. Itens antigos salvos acima do estoque mostram aviso e botão para ajustar a quantidade; o checkout fica bloqueado até a correção. Catálogo e detalhe também impedem selecionar ou adicionar mais unidades do que a disponibilidade atual.
- A verificação final de estoque continua na API durante a criação transacional do pedido, pois outro comprador pode esgotar o item depois de a página carregar. Verificação: lint, checagem de tipos e `git diff --check`; teste manual com estoque baixo no navegador ainda pendente.

### 26/11/2026 — Confirmação visual para remover item do carrinho

- A lixeira ao lado da quantidade abre um diálogo no visual do site, com nome e tamanho do produto, ações de cancelar e remover e fechamento por Escape. A remoção só acontece após a confirmação; o carrinho continua armazenado localmente no navegador.
- Verificação: lint, checagem de tipos e `git diff --check`. Interação no navegador ainda pendente.

### 26/11/2026 — Resumo completo na barra lateral da Loja

- O painel aberto após adicionar um produto passou a listar todos os itens do carrinho local, cada tamanho como linha própria, com quantidade, preço da linha e total somado. Os produtos e preços são consultados na API; o aviso do item recém-adicionado permanece no topo. A lista rola quando há muitos itens, mantendo total e ações visíveis.
- Verificação: lint, checagem de tipos e `git diff --check`. Conferência manual com múltiplos produtos no navegador ainda pendente.

### 26/11/2026 — Agenda pública e validação de eventos

- A lista da Agenda mostra eventos futuros e os realizados há até sete dias; o calendário mensal mantém a consulta dos eventos passados e seus detalhes. Os eventos não são apagados do banco e a página consulta todas as páginas da API.
- O cadastro administrativo impede novos eventos em dias anteriores ao atual no fuso de Maceió, com validação na interface e na API. A edição de eventos históricos sem mudança de data continua possível. Local tornou-se opcional; quando deixado vazio no formulário, a API recebe e persiste “Local a definir”.
- Verificação: lint e checagem de tipos do frontend, compilação Python com cache temporário e `git diff --check`. Interação manual no navegador e persistência com serviços Docker ainda pendentes.

### 25/11/2026 — Escolha administrativa do resultado em destaque

- O formulário de resultados ganhou “Destacar na Home”. A API salva a escolha em `resultado.destaque_home` e desmarca o destaque anterior na mesma transação; índice único parcial impede dois destaques simultâneos. A inicialização da API adiciona a coluna e o índice em bancos existentes sem apagar resultados. A Home usa o resultado selecionado e, quando não há seleção, retorna ao resultado mais recente até hoje. A tabela administrativa indica o destaque atual.
- Verificação: lint, checagem de tipos, build do frontend, compilação Python e `git diff --check`. Persistência e visualização no Docker ainda precisam de teste após reconstrução dos serviços.

### 25/11/2026 — Origem do placar exibido na Home

- Identificado que o 5 × 2 contra a Atlética X veio do seed de demonstração e está registrado em `resultado` com vínculo ao evento `octa-x-atletica-x`. O detalhe desse evento passou a exibir o placar cadastrado, de modo que o card da Home leva ao contexto correspondente; o card agora usa o rótulo “Resultado cadastrado”. O registro de exemplo permanece no banco até a equipe confirmar ou remover esse conteúdo no painel administrativo.
- Verificação: rastreamento do seed, da consulta da API e do vínculo com o evento; lint, checagem de tipos, build do frontend e `git diff --check`. Conferência visual no Docker ainda pendente.

### 25/11/2026 — Destaques esportivos reais na Home

- Os cards de próximo jogo e resultado recente deixaram de exibir placares, adversário e data fictícios. A Home usa eventos e resultados da API, calcula vitória/empate/derrota pelo placar e liga cada card ao detalhe do evento ou da modalidade. Sem dados, os cards mostram uma mensagem clara e um caminho para Agenda ou Modalidades.
- Verificação: lint, checagem de tipos, build do frontend e `git diff --check`. A conferência visual com dados do banco no Docker ainda está pendente.

### 25/11/2026 — Eventos favoritos por conta

- A API cria idempotentemente `favorito_evento` em bancos existentes. Contas autenticadas podem consultar, adicionar e remover favoritos por evento; a restrição única evita duplicatas. O detalhe do evento carrega o estado salvo e Minha Conta lista os favoritos com links para a Agenda. Visitantes são encaminhados ao login com retorno ao evento.
- Verificação: compilação do backend, lint, tipos e build do frontend, `git diff --check`. A persistência real e a navegação no Docker ainda precisam de teste após reconstruir os serviços.

### 25/11/2026 — Identidade visual da tela de cadastro

- O cadastro passou a compartilhar o fundo contínuo da navbar e o acabamento do login: logo, cartão roxo translúcido, bordas suaves, campos com contraste reforçado e ações consistentes em desktop e celular. Formulário e integração real com a API permanecem os mesmos.
- Verificação: lint, checagem de tipos, build do frontend e `git diff --check`. Inspeção visual no navegador fica pendente após reconstruir o frontend no Docker.

### 25/11/2026 — Papel da conta comum no acesso

- Login e cadastro explicam os benefícios efetivos da conta: concluir e acompanhar pedidos e confirmar presença em eventos. O cadastro deixa claro que a navegação pública não exige conta. O retorno à página solicitada é preservado entre login e cadastro, inclusive ao criar uma conta a partir de um evento.
- Verificação: lint, checagem de tipos, build do frontend e `git diff --check`. O fluxo completo no navegador ainda precisa de conferência após reconstruir o frontend no Docker.

### 25/11/2026 — Navegação entre site e painel administrativo

- O cabeçalho público separa “Minha conta” de “Painel admin” para contas ADMIN, inclusive no menu móvel. A conta oferece atalho de volta ao painel, enquanto o painel oferece “Ver site” em desktop e no menu móvel. Essa alternância usa a sessão existente; sair da conta continua encerrando a sessão.
- Verificação: lint, checagem de tipos, build do frontend e `git diff --check`. A navegação visual no navegador ainda precisa ser conferida após reconstruir o frontend no Docker.

### 25/11/2026 — Limite de 6 MB para fotos do Mural

- A aba Fotos do Mural aceita imagens JPG, PNG ou WebP de até 6 MB e informa esse limite no formulário. O limite da API e as configurações de Docker foram ajustados para permitir a persistência de arquivos desse tamanho; os demais formulários de imagem continuam limitados a 2 MB na interface. O usuário confirmou o upload real após reconstruir o Docker.
- Verificação: checagem de tipos do frontend, compilação do backend e `git diff --check`.

### 25/11/2026 — Galeria de fotos administrável no Mural

- A galeria fixa de `/mural/conquistas` foi substituída por fotos reais consultadas na API. `/admin/mural` ganhou aba Fotos para incluir, editar e remover registros, com upload JPG/PNG/WebP de até 6 MB, descrição acessível obrigatória e legenda opcional. Uma tabela `foto_mural` é criada no schema SQL de novas instalações e pela API de forma idempotente em bancos existentes, sem alterar os outros dados.
- A exclusão remove o registro da galeria; o arquivo físico enviado permanece no volume de uploads, pois o sistema ainda não faz limpeza de arquivos sem referência. Verificação: lint, checagem de tipos, build do frontend, compilação Python e `git diff --check` passaram. Testes de API, upload e inspeção visual ficaram pendentes porque o Docker Desktop não respondeu, mesmo após encerramento e nova abertura; `docker info` excedeu 20 segundos.

### 25/11/2026 — Revisão dos campos obrigatórios no cadastro administrativo

- Notícias agora podem ser publicadas sem resumo; o autor é mostrado a partir da sessão, sem campo obrigatório manual. Integrantes exigem nome e curso, enquanto função e Instagram são opcionais. Eventos aceitam descrição vazia, e resultados aceitam campeonato vazio. Produtos, modalidades e conquistas mantêm os campos essenciais já configurados.
- A lista administrativa e a página pública da História passaram a ordenar marcos por ano, com ID como desempate; o formulário não pede mais ordem de exibição. A API passou a exigir curso no cadastro/edição de integrantes e a retornar marcos por ano. Esses cadastros e a história continuam integrados à API/PostgreSQL, não são simulações. Verificação: lint, checagem de tipos, build do frontend, compilação dos módulos Python e `git diff --check` passaram. Os testes Pytest não rodaram porque o Python local não tem as dependências do backend; a reconstrução no Docker e o teste no navegador ficaram pendentes porque o serviço Docker deixou de responder (`docker info` excedeu 12 segundos).

### 25/11/2026 — Atualização visual do Login

- `/login` passou a compartilhar o gradiente com a navbar. O formulário recebeu um cartão roxo translúcido discreto, texto de orientação, campos mais legíveis e apresentação clara das ações de recuperação de senha e cadastro.
- Mudança apenas de interface; login, redirecionamento e recuperação continuam usando a API real. Verificação: lint, checagem de tipos, build e `git diff --check` passaram; frontend reconstruído no Docker e `/login` aberto no navegador com campos, links e botão visíveis. A autenticação não foi exercitada nesta verificação. O primeiro build Docker parou por falta de espaço; foram removidos 19,3 GB de cache de compilação, sem excluir volumes de banco ou uploads, e a reconstrução seguinte concluiu.

### 25/11/2026 — Visual do detalhe de notícias

- `/noticias/[slug]` agora exibe a capa cadastrada, quando existe, e não reserva um bloco branco para notícias sem imagem. A página acompanha o gradiente da navbar; os cartões de outras notícias ficaram compactos e começam alinhados à área da capa principal.
- Mudança de interface usando os dados e arquivos reais já servidos pela API/PostgreSQL. Verificação: lint, checagem de tipos, build e `git diff --check` passaram; frontend reconstruído no Docker. A notícia `henry-florinda` foi aberta no navegador com a capa carregada, e a borda superior do primeiro cartão relacionado coincidiu com a da capa principal. Conferência em diferentes larguras de tela ainda pendente.

### 25/11/2026 — Atualização visual do Ranking

- `/ranking` passou a compartilhar o fundo contínuo da navbar com Modalidades. Indicadores, classificação e barras receberam superfícies roxas translúcidas discretas, melhor contraste e disposição responsiva; o aviso de números ilustrativos ficou mais visível.
- Mudança apenas de interface. Indicadores e classificação continuam fixos em `frontend/src/data/ranking.ts`, sem vínculo com resultados da API/PostgreSQL. Verificação: lint, checagem de tipos, build e `git diff --check` passaram; frontend reconstruído no Docker e rota `/ranking` aberta no navegador. Conferência visual em diferentes tamanhos de tela ainda pendente.

### 25/11/2026 — Visual da lista e dos detalhes de modalidades

- Os detalhes de `/modalidades/[slug]` passaram a compartilhar o gradiente da lista e da navbar. A foto cadastrada é exibida no destaque; sem foto, não há bloco branco. Informações, resultados, próximos eventos e elenco receberam superfícies roxas discretas e estados vazios claros. A lista ganhou cards inteiros clicáveis e estado vazio sem altura excessiva. “Próximo desafio” agora considera apenas eventos futuros e exibe a data no horário de Maceió.
- Mudança de interface e apresentação dos eventos reais consultados na API, sem alteração do backend ou banco. Verificação: lint, checagem de tipos e build do frontend passaram; o container foi reconstruído e a lista e o detalhe foram abertos no navegador com os serviços ativos. A inspeção visual fina em diferentes tamanhos de tela continua pendente.

### 25/11/2026 — Integração das alterações visuais e históricas pendentes

- Reunidas na `main` as superfícies visuais do painel administrativo, Checkout, História e Conquistas do Mural. Incluídos o seed e o script para os marcos de 2018 e 2026, preservando a confirmação de presença real em eventos já existente na API/PostgreSQL.
- As mudanças de aparência são apenas de interface; história e conquistas continuam consultando a API. O script para bancos existentes foi versionado, mas não foi executado novamente nesta integração. Verificação: lint, TypeScript e build do frontend (30 páginas), compilação dos módulos Python e `git diff --check` passaram. A inspeção visual autenticada do painel continua pendente.

### 25/11/2026 — Tamanhos no cadastro de camisas

- O cadastro administrativo de produtos passou a solicitar estoque por tamanho para a categoria Camisas, criando variações P, M, G e GG reais na API. A loja só oferece os tamanhos cadastrados para camisas, mostra os esgotados como indisponíveis e bloqueia a compra de camisas antigas ainda sem tamanhos definidos.
- Camisas antigas com variação `UNICO` podem ser corrigidas pelo editor: o estoque anterior precisa ser distribuído, e a variação antiga é mantida com estoque zero para preservar o histórico dos pedidos. Alteração de formulário e mapeamento da interface sobre a API e o banco existentes, sem migração. Verificação: lint, checagem de tipos e `git diff --check` passaram; validação no navegador com os serviços iniciados ainda pendente.

### 25/11/2026 — Feedback ao adicionar produtos na Loja

- Cards e detalhes do produto agora abrem um painel lateral após a adição, com imagem e dados do item, contagem atual e ações para ver o carrinho ou continuar comprando. O botão confirma brevemente a ação. O painel pode ser fechado pelo botão, pelo fundo ou pela tecla Escape; não há recomendações de outros produtos. Falhas de disponibilidade recebem aviso distinto. O detalhe usa o estoque real da variação no lugar da mensagem genérica de disponibilidade a confirmar.
- Alteração de interface sobre o carrinho local existente. Catálogo e estoque continuam vindo da API; não houve mudança na criação real de pedidos, no banco ou na API. Verificação: lint, checagem de tipos e `git diff --check` passaram. A inspeção do fluxo no navegador ainda depende de iniciar os serviços; o checkout de um pedido não faz parte desta alteração.

### 25/11/2026 — Atualização visual do Checkout

- A rota `/checkout` passou a compartilhar o gradiente da Loja e do Carrinho com a navbar. Formulário, resumo fixo em telas largas, campos, erros, estados vazios e confirmação usam superfícies roxas translúcidas discretas e layout responsivo.
- Mudança somente de interface. O carrinho continua local no navegador; criação real do pedido, validação de estoque e valores na API/PostgreSQL permanecem como antes, sem cobrança online. Verificação: lint, build do frontend no Docker e inspeção visual do formulário com um item no carrinho; o envio de um pedido de teste não foi realizado nesta revisão.

### 25/11/2026 — Identidade visual nas demais telas administrativas

- Cabeçalho, navegação, fundos, tabelas, cartões, filtros, formulários, diálogos e estados vazios das rotas `/admin/noticias`, `/admin/produtos`, `/admin/eventos`, `/admin/modalidades`, `/admin/integrantes`, `/admin/mural`, `/admin/resultados`, `/admin/pedidos`, `/admin/usuarios` e `/admin/perfil` passaram a seguir as superfícies roxas translúcidas discretas da Visão Geral. Fotos ainda pendentes usam fundo escuro em vez de branco na tabela de produtos e na prévia de notícias.
- Alteração visual, sem mudança nas operações da API ou no banco. Conteúdo e cadastros continuam integrados ao backend; atividades recentes do dashboard continuam sem simulação. Verificação: lint e build do frontend no Docker. A inspeção visual autenticada ainda precisa ser feita por um administrador no navegador.

### 25/11/2026 — Atualização visual da Visão Geral administrativa

- O dashboard `/admin` recebeu fundo roxo contínuo, cabeçalho e navegação com superfícies discretas, cartões de indicadores e painéis de vendas/atividades alinhados à identidade visual pública. Os estados sem vendas ou atividades agora têm mensagens claras; o título de indicadores deixou de chamá-los de exemplo.
- Mudança visual e de apresentação dos estados vazios, sem alterar regras ou métricas. Números e vendas continuam vindo da API/PostgreSQL; atividades não são simuladas sem tabela de auditoria. Verificação: lint e build do frontend no Docker. A inspeção visual com dados reais ainda depende de abrir a rota com uma sessão administrativa; o navegador de verificação redirecionou para login.

### 25/11/2026 — Atualização visual de Conquistas no Mural

- A rota `/mural/conquistas` passou a compartilhar o gradiente contínuo do Mural desde a navbar. Os cartões de conquistas receberam roxo translúcido discreto; a galeria usa espaços escuros para fotos pendentes em vez de blocos brancos. Incluído um estado vazio para ausência de conquistas.
- Mudança de interface, sem alterar a integração: conquistas continuam vindo da API/PostgreSQL; as imagens pendentes seguem como placeholders. Verificação: lint, build do frontend no Docker e inspeção visual no navegador.

### 25/11/2026 — Correção dos marcos históricos

- A fundação da Octacore foi corrigida para 2018. A linha do tempo agora registra que a atlética completou oito anos em 2026 e conquistou seu primeiro título do INTERENG no mesmo ano. Os antigos marcos demonstrativos de 2023 a 2025 foram retirados.
- O seed foi atualizado para instalações novas e `database/03_update_history_2026.sql` foi aplicado ao PostgreSQL local já existente, sem apagar outros marcos administrativos. A página continua lendo os dados reais da API; não usa a lista legada do frontend. Verificação: execução do script no banco local e consulta da API `/history`.

### 25/11/2026 — Atualização visual da História do Mural

- A rota `/mural/historia` passou a compartilhar o gradiente contínuo do Mural desde a navbar. A linha do tempo recebeu eixo contínuo, cartões roxos translúcidos e layout responsivo; um estado vazio substitui a lista quando não há registros. Chaves de lista agora distinguem marcos com o mesmo ano.
- Mudança de interface, sem alteração da integração: os marcos continuam vindos da API e do PostgreSQL. Verificação: lint, build do frontend no Docker e inspeção visual no navegador em desktop.

### 12/11/2026 — Atualização visual do detalhe de evento

- As rotas `/agenda/[slug]` passaram a usar o gradiente contínuo da Agenda. A imagem de capa foi alinhada à largura do conteúdo e os cartões de informações, confirmação visual e participantes receberam superfícies roxas translúcidas.
- Alteração somente de interface. Eventos e imagens continuam consultados na API; favoritar e confirmar presença seguem como simulações no navegador, sem persistência. Verificação: lint e build do frontend no Docker.

### 12/11/2026 — Atualização visual dos Integrantes no Mural

- A lista e os perfis em `/mural/integrantes` passaram a compartilhar o gradiente contínuo do Mural e cartões roxos translúcidos. Os filtros acompanham o estilo das outras páginas públicas.
- Fotos cadastradas pela diretoria agora aparecem na lista e no perfil público; quando não há foto, as iniciais substituem o antigo bloco branco. Dados e fotos vêm da API. Verificação: lint e build do frontend no Docker.

### 12/11/2026 — Atualização visual do detalhe de produto

- As rotas `/loja/[slug]` passaram a compartilhar o gradiente contínuo da Loja desde a navbar. Imagem e informações do produto receberam cartões roxos translúcidos e os seletores de tamanho e quantidade foram alinhados ao tratamento visual do carrinho.
- Alteração somente de interface. Consulta de produto e estoque pela API e adição ao carrinho no navegador permanecem como antes. Verificação: lint e build do frontend no Docker.

### 12/11/2026 — Atualização visual do Carrinho

- A rota `/carrinho` passou a usar gradiente contínuo desde a navbar, superfícies roxas translúcidas nos produtos e no resumo, controles de quantidade mais legíveis e resumo fixo durante a rolagem em telas largas.
- Alteração somente de interface. O carrinho continua no navegador, os produtos e preços são consultados na API e o checkout mantém o registro real de pedidos sem cobrança online. Verificação: lint e build do frontend no Docker.

### 12/11/2026 — Atualização visual de Minha Conta

- A tela `/minha-conta` recebeu cabeçalho alinhado às páginas públicas recentes, cartão de perfil mais compacto e ações em lista dentro de um painel. O gradiente contínuo entre navbar e conteúdo evita a divisão brusca de cor; as superfícies usam roxo translúcido discreto, bordas suaves e alternativa sem transparência.
- Alteração somente de interface. Os dados do perfil, a troca de senha, os links para pedidos e o logout continuam conectados à API como antes. Verificação: lint e build de produção do frontend concluídos.

### 12/11/2026 — Acesso à API em outro computador

- As chamadas feitas pelo navegador passaram a usar `/api/v1` no endereço do próprio site. O Next.js encaminha essas requisições à API pelo endereço interno, evitando que `localhost:3333` aponte para o computador do visitante. Imagens enviadas à API continuam servidas por `/uploads` no mesmo endereço do site.
- Mudança de integração real entre frontend e backend, sem alteração no banco. Verificação: build do frontend e requisições ao proxy em ambiente Docker. Para desenvolvimento sem Docker, `NEXT_PUBLIC_API_URL` deve permanecer `/api/v1` no `.env.local`; o acesso por outro dispositivo ainda depende de ambos estarem na mesma rede e da porta 3000 estar acessível.

### 11/11/2026 — Materiais de origem fora do Git

- A pasta `assets/`, usada para originais, documentos e renders de trabalho, foi incluída no `.gitignore` e retirada do índice sem apagar os arquivos locais. As imagens necessárias ao site permanecem versionadas em `frontend/public/images/`.
- Verificação: conferidos os arquivos rastreados, as referências da aplicação e o comportamento de `git check-ignore`. A remoção vale para a versão atual do repositório após o merge; arquivos já publicados continuam no histórico antigo.

### 11/11/2026 — Transição da barra fixa da Loja

- Removida a camada escura da faixa de filtros enquanto ela está na posição inicial, eliminando a divisão de cor com a apresentação da Loja. Ao ficar fixa no topo, a faixa recebe uma camada roxa com desfoque para manter os controles legíveis sobre os produtos.
- Mudança somente de interface, sem alteração no catálogo ou no carrinho. Verificação: build do frontend no Docker e inspeção visual no navegador antes e depois da rolagem, com filtros, busca e carrinho visíveis.

### 11/11/2026 — Tratamento visual do catálogo da Loja

- Integrado o fundo da rota `/loja` à navbar por gradiente contínuo. A barra fixa de categorias, busca e carrinho ganhou superfície roxa escura com desfoque discreto e opacidade suficiente para separar os produtos durante a rolagem. Os cards de produtos receberam tons roxos naturais, bordas finas e hover menos intenso.
- A mudança é visual no catálogo; produtos e estoque continuam vindo da API, e o carrinho permanece no navegador. Verificação: build do frontend no Docker e inspeção visual da abertura e da barra fixa durante a rolagem em desktop. O detalhe do produto e a estrutura móvel não foram alterados.

### 11/11/2026 — Navegação pelos cards do Mural

- Os três cards de história, integrantes e conquistas passaram a ser links completos, com foco de teclado visível. A chamada do card de integrantes foi alterada de “Ver diretoria” para “Ver integrantes”. Os destinos e os dados das páginas continuam os mesmos.
- Verificação: build do frontend no Docker, inspeção visual e clique no centro do card de integrantes no navegador, abrindo `/mural/integrantes`.

### 11/11/2026 — Tratamento visual da abertura do Mural

- Integrado o fundo da rota `/mural` à navbar por um gradiente contínuo. O destaque inicial e os três cards de navegação receberam tons roxos mais naturais, bordas finas e reflexos discretos, mantendo texto e ilustração legíveis.
- A mudança é apenas de interface na abertura do Mural; as páginas de história, integrantes e conquistas e suas integrações com a API permanecem como antes. Verificação: build do frontend no Docker e inspeção visual do destaque e dos cards em desktop no navegador.

### 11/11/2026 — Transição superior e navegação pelos cards da Agenda

- Removido o fundo próprio do cabeçalho na rota `/agenda`, permitindo que o gradiente da página atravesse a parte superior sem faixa de cor. Cada compromisso com página de detalhe passou a ter toda a área do card clicável, com foco visível para navegação por teclado.
- A navegação continua usando o slug real recebido da API; a alteração não muda dados ou presença. Verificação: build no Docker, inspeção visual em desktop e clique na área da data de um card, abrindo a página correta do evento.

### 11/11/2026 — Tratamento visual da Agenda

- Integrado o fundo da Agenda à navbar com gradiente contínuo. Cards de compromissos, filtros e painel de informações receberam superfícies roxas discretas, bordas suaves e reflexos contidos, preservando a leitura das datas e categorias.
- A alteração é somente de interface: listagem e filtros continuam usando os eventos da API. Verificação: build do frontend no Docker e inspeção visual da Agenda carregada em desktop no navegador. O layout móvel conserva a estrutura responsiva anterior.

### 11/11/2026 — Ajuste de contraste dos cards de Modalidades

- Reduzidos o brilho cinza, a borda clara e a sombra dos cards da lista pública. A nova superfície usa tons roxos escuros com transparência e reflexo discreto para acompanhar o fundo da página. Os dados e imagens continuam vindo da API.
- Verificação: build do frontend no Docker e inspeção visual da lista em desktop no navegador. A versão móvel mantém a mesma grade responsiva anterior; não houve mudança nas páginas individuais.

### 11/11/2026 — Edição e imagem no cadastro de Modalidades

- Corrigida a edição de modalidades que falhava com conflito de dados únicos ao reenviar horários existentes. A API agora preserva esses registros e altera somente horários adicionados, modificados ou removidos.
- O campo de imagem do modal administrativo ganhou apresentação alinhada ao cadastro de Notícias, com validação de tipo e tamanho, prévia, remoção e erros visíveis no próprio formulário. O upload e o salvamento continuam integrados à API; a prévia é comportamento da interface.
- Verificação: lint e build do frontend, compilação Python e edição de uma modalidade real em transação revertida no PostgreSQL, confirmando a alteração da descrição e a preservação dos IDs de dois horários. O formulário visual ainda precisa ser conferido em uma sessão administrativa no navegador.

### 11/11/2026 — Vidro discreto na lista de Modalidades

- A lista de Modalidades recebeu cards com superfície neutra translúcida, reflexo e borda suaves, seguindo a direção aprovada em Notícias. Navbar e conteúdo compartilham um gradiente contínuo. Imagens cadastradas na API aparecem nos cards; sem imagem, o card fica compacto e não exibe um placeholder vazio.
- A mudança é de interface sobre modalidades reais da API. As páginas individuais não receberam esse novo tratamento nesta etapa. Verificação: lint e build do frontend passaram; frontend reconstruído no Docker. Conferidos desktop em 1440 px e celular em 390 px, com quatro cards da API, sem rolagem horizontal. As quatro modalidades atuais não têm imagem cadastrada, portanto a exibição de imagem real nesta tela depende de conteúdo com foto.

### 11/11/2026 — Gradiente contínuo entre navbar e Notícias

- O cabeçalho e a lista de Notícias passaram a compartilhar o mesmo fundo, com o gradiente aplicado ao contêiner das duas áreas. A separação brusca entre as cores da navbar e do topo da página foi removida. A mudança é apenas visual; dados e filtros continuam integrados à API.
- Verificação: lint e build do frontend passaram; frontend reconstruído no Docker. Conferida a continuidade visual em 1440 px e 390 px, sem rolagem horizontal no celular.

### 11/11/2026 — Cards padronizados com vidro em Notícias

- Todos os cards da lista de Notícias agora têm o mesmo tamanho e a linguagem visual discreta do card de compromissos da Home: superfície roxa translúcida, reflexos sutis e fundo opaco para navegadores sem desfoque ou com transparência reduzida. A versão inicial com um card de destaque maior foi removida após avaliação visual.
- Após avaliar a versão roxa mais opaca, os cards receberam uma superfície neutra e mais translúcida, com reflexos suaves, borda e sombra discretas. O roxo agora vem principalmente do fundo da página.
- Os cards passaram a mostrar a imagem de capa quando ela está cadastrada na API; notícias sem capa conservam um espaço provisório. É uma alteração de interface sobre dados reais, sem alteração na API ou no banco.
- Verificação: `npm run lint` e `npm run build` passaram nas etapas anteriores, e o build passou após o ajuste final de transparência; frontend reconstruído no Docker. Conferidos visualmente desktop de 1440 px e celular de 390 px, sem rolagem horizontal. As imagens cadastradas na API apareceram com proporção uniforme; os três primeiros cards mediram 411 × 414 px no desktop.

### 11/11/2026 — Alinhamento dos blocos da Home

- Os cards de Destaques de Arena e Próximos Compromissos agora começam na mesma linha. O card Faça parte começa na linha dos produtos da loja; Nossas Modalidades acompanha a apresentação da loja. A grade compartilha as linhas entre as duas colunas, preservando o alinhamento mesmo quando a lista de eventos mudar de altura.
- No celular, as seções seguem a ordem de leitura do documento em uma coluna. A alteração é somente de interface; os dados de produtos e eventos continuam vindo da API, e os destaques fixos da Arena permanecem como antes. Verificação: lint e build de produção passaram, além da conferência visual em desktop (inícios dos cards alinhados) e celular sem rolagem horizontal.

### 11/11/2026 — Protótipo de vidro no cabeçalho público e na Home

- Cabeçalho público com formato arredondado, transparência roxa discreta, reflexos suaves, indicação da página ativa em cápsula e botão de conta no mesmo estilo. O menu móvel passa a aparecer até 960 px para acomodar a navegação. O card de próximos compromissos da Home recebeu a mesma linguagem visual, com intensidade menor para preservar a leitura.
- Na Home, o cabeçalho e o conteúdo compartilham o mesmo gradiente de fundo, suavizando a transição entre eles. As outras páginas mantêm seus próprios fundos. Verificação deste ajuste: lint e build passaram, o frontend foi reconstruído no Docker e a Home foi conferida no navegador.
- Os efeitos têm fundo opaco quando o navegador não suporta desfoque ou solicita transparência reduzida. O cabeçalho continua no fluxo normal da página; a barra da loja mantém o visual anterior. Alteração de interface sobre os dados reais existentes, sem mudanças na API ou no banco.
- Verificação: lint e build de produção passaram; frontend reconstruído no Docker. Conferidos visualmente o cabeçalho e card em 1440 px e o cabeçalho/menu aberto em 390 px, sem rolagem horizontal. O card mostrou corretamente o estado vazio, pois não há eventos futuros cadastrados no momento da conferência.

### 11/11/2026 — Permissões dos volumes de imagens no Docker

- Corrigida a inicialização da API Python para ajustar o proprietário do volume persistente de uploads antes de executar o servidor com o usuário sem privilégios. Sem isso, o envio de imagens recebia `500` por `PermissionError` ao gravar em `/app/uploads`, e o navegador mostrava “Failed to fetch”. O upload continua integrado à API e ao PostgreSQL; não é uma simulação.
- O contêiner do frontend agora prepara o cache de imagens do Next com permissão de escrita para o usuário de execução, evitando falhas `EACCES` ao exibir imagens otimizadas. Verificação: os logs identificaram ambos os erros; `docker compose up -d --build` concluiu, banco e API ficaram saudáveis, o usuário `octacore` conseguiu escrever no volume e o usuário `node` no cache de imagens; `git diff --check` passou. O envio autenticado pelo navegador após a correção ainda precisa de conferência manual.

### 11/11/2026 — Integração das correções da branch Zeca com a API Python

- Resolvido o merge preservando a API FastAPI atual e as correções de formulários e imagens no frontend. A rota de upload Fastify do backend removido não foi restaurada; a API Python mantém o upload e a leitura pública, e o frontend continua exibindo as imagens pelo caminho `/uploads/...` do próprio site.
- O histórico anterior do backend Fastify foi mantido como registro da evolução do projeto. Verificação: lint e build do frontend (30 páginas), compilação dos módulos Python e `git diff --check` passaram. O fluxo de upload e edição no navegador após o merge permanece para conferência manual.

### 11/11/2026 — Abas de pedidos ativos e histórico

- Substituída a exibição simultânea das duas listas por navegação entre Pedidos ativos e Histórico de pedidos, com estados de carregamento, erro e lista vazia para a visualização selecionada.
- Ativos exibem apenas `PENDENTE`, `CONFIRMADO`, `EM_SEPARACAO` e `DISPONIVEL_RETIRADA`. `ENTREGUE` e `CANCELADO` aparecem exclusivamente no histórico quando os dados atualizados são carregados da API.
- Preservados os atalhos da Minha Conta e o acesso direto por `#historico`, com seleção sincronizada ao endereço do navegador. A alteração é de interface sobre a integração real existente, sem mudanças no banco ou nas regras administrativas.
- Verificação: revisão dos filtros e atalhos, `npm run lint`, `npx tsc --noEmit`, `npm run build` (30 páginas) e `git diff --check` passaram. Inspeção interativa no navegador pendente.

### 10/11/2026 — Documentação após remoção do backend legado

- Atualizados os READMEs e o estado atual desta documentação após a exclusão de `backend/`. A única implementação de backend presente no projeto é `backend-python/`.
- Esclarecido que o serviço principal `api` já executa Python na porta 3333 e que a instância paralela `api-python` na porta 3334 é opcional. Mantidos os registros históricos da implementação Fastify e da migração.
- Verificação: confirmada a ausência de `backend/` e o caminho `build: ./backend-python` no Compose principal; revisão documental e `git diff --check`. Não houve alteração de código, dados ou integração nesta atualização.

### 10/11/2026 — Migração integral do backend para Python/FastAPI

- Criado `backend-python/` com Python 3.13, FastAPI, SQLAlchemy 2, Pydantic, psycopg, PyJWT e bcrypt. Os 14 modelos apontam para o schema `octacore` existente, sem recriar tabelas ou perder dados.
- Reimplementadas as 41 rotas de autenticação, conteúdo público, administração, loja, pedidos, usuários, dashboard e uploads. Foram preservados URLs, envelopes JSON, nomes dos campos, JWT HS256, cookie `httpOnly`, hashes bcrypt, permissões `USUARIO`/`ADMIN`, validações e erros padronizados.
- Pedidos mantêm transação serializável, bloqueio de estoque, preço congelado, trigger de total e devolução de estoque no cancelamento. A conexão psycopg configura `search_path=octacore,public` para compatibilidade com os triggers existentes.
- `docker-compose.yml` passou a construir `backend-python/` como serviço `api`. Na etapa inicial da migração, `backend/` foi mantido como referência/rollback e removido posteriormente. `docker-compose.python.yml` permite uma segunda instância Python de teste na porta 3334.
- Verificação: `compileall`, Pytest com 7 testes, Ruff e o build de produção das 30 páginas passaram. A API paralela foi comparada ao Fastify nas listagens públicas; depois, o Compose principal foi recriado com FastAPI e ficou saudável na porta 3333, com 49 caminhos no OpenAPI e frontend `200` na porta 3000. Login, refresh, `/auth/me`, usuários, dashboard, CRUD completo de conteúdo, pedido real, redução/restauração de estoque, upload e leitura pública foram testados contra PostgreSQL; todos os registros e arquivos temporários foram removidos.

### 09/11/2026 — Edição de imagem em produtos existentes

- O formulário de edição administrativa agora mantém a descrição, o estado ativo e os IDs das variações do produto. Antes, esses dados eram descartados ao abrir o modal e o salvamento tentava substituir as variações por uma nova `UNICO`, o que podia falhar quando havia pedidos vinculados. A troca de imagem usa o upload real da API e atualiza o mesmo produto no PostgreSQL.
- Erros ao salvar passam a aparecer dentro do formulário, visíveis mesmo com o modal aberto. Verificação: `npm run lint`, `npx tsc --noEmit`, `git diff --check` e reconstrução do frontend no Docker (30 páginas) passaram; a edição com conta administrativa no navegador ainda requer teste manual.

### 09/11/2026 — Exibição de uploads no backend Fastify e espaçamento dos controles administrativos

- Na implementação Fastify de então, a API já salvava imagens enviadas e persistia seus URLs em eventos e produtos, mas a rota pública respondia com `Cross-Origin-Resource-Policy: same-origin`; como o site e a API usavam portas diferentes, o navegador bloqueava as prévias e imagens após salvar. A rota `/uploads/:filename` passou a autorizar o uso da imagem em outra origem, mantendo a validação de nome UUID, tipo de arquivo e os demais cabeçalhos de segurança. O upload e a persistência continuavam integrados ao backend e PostgreSQL.
- Selects das telas e formulários administrativos receberam seta branca com margem interna uniforme; campos de data e hora usam ícone compatível com o tema escuro e afastamento da borda.
- Verificação: teste da rota pública com Helmet confirmou resposta `200`, tipo de imagem e `Cross-Origin-Resource-Policy: cross-origin`; backend `npm run lint`, `npm test` (10 testes) e `npm run build`, frontend `npm run lint`, `npx tsc --noEmit` e `npm run build` (30 páginas) passaram.

### 09/11/2026 — Correção complementar da exibição de imagens

- A verificação anterior cobria a resposta direta da API, mas o Next tentava otimizar as URLs absolutas de uploads e retornava `400` no endereço `/_next/image`. As imagens já persistidas em produtos, eventos, integrantes e notícias continuam no banco com URL absoluta; a interface agora converte URLs de upload da API para o caminho `/uploads/...` do próprio site. Um rewrite encaminha esse caminho à API, e as imagens dinâmicas usam a URL diretamente, sem o otimizador. Isso atende prévias e páginas públicas em dispositivos que acessam o site pela rede local.
- O fluxo continua integrado à API e ao PostgreSQL; não é uma simulação. Verificação: a URL antiga de otimização retornou `400`; frontend `npm run lint`, `npx tsc --noEmit` e build do Docker (30 páginas) passaram. Após reconstruir o frontend, uma imagem de produto já salva retornou `200 OK` e `image/jpeg` pelo endereço `http://localhost:3000/uploads/...`. A inspeção visual no navegador ainda depende de conferência manual.

### 09/11/2026 — Formulários administrativos e seleção de modalidades

- Os modais de cadastro, edição e confirmação de integrantes, eventos, produtos, resultados, pedidos, modalidades, mural e usuários são renderizados acima da estrutura animada do painel. O cartão respeita a altura visível da janela e rola internamente, preservando acesso ao título, fechamento e ações em telas baixas.
- O cadastro de integrantes substituiu a lista múltipla nativa por checkboxes com rótulos clicáveis, estados selecionados visíveis e disposição responsiva. A função foi separada da seleção de modalidades. Os vínculos continuam sendo enviados à API e persistidos no PostgreSQL, sem alteração do contrato.
- Verificação: `npm run lint`, `npx tsc --noEmit`, `npm run build` (30 páginas) e `git diff --check` passaram. A inspeção visual no navegador ficou pendente porque o site local não estava em execução nesta sessão.

### 26/10/2026 — Transições de rota e revelação no scroll

- Unificada a animação de navegação pública e administrativa: ao trocar de rota, o conteúdo entra em 440 ms com opacidade, leve deslocamento vertical e desfoque, enquanto cabeçalhos e estruturas compartilhadas permanecem estáveis.
- Adicionada revelação progressiva de seções, cartões, formulários e tabelas quando entram na área visível. O comportamento usa `IntersectionObserver`, aplica pequenos atrasos alternados aos blocos e também cobre conteúdo inserido depois do carregamento.
- A preferência `prefers-reduced-motion` desativa as animações e mantém todo o conteúdo imediatamente visível. A mudança é somente de interface no navegador e não altera integrações ou dados do backend.
- Verificação: `npm.cmd run lint`, `npx.cmd tsc --noEmit` e `npm.cmd run build` passaram; o Next.js compilou as 30 páginas. A inspeção visual fina em diferentes navegadores/dispositivos continua recomendada.

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
