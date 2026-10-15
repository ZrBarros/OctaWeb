# Documentação de desenvolvimento — Octacore

**Última atualização:** 15/10/2026

**Estado:** MVP em desenvolvimento; interfaces do front end em construção

**Referência visual:** protótipo [Projeto P3 — Octacore no Figma](https://www.figma.com/design/BcgJnC6UWsDG5W5B5mO7V6/Projeto-P3---Octacore?node-id=0-1)

Este é o registro contínuo do site da Associação Atlética Acadêmica de Computação da UFAL. Ele descreve o que já funciona, o que é apenas demonstração e o que falta construir. Deve ser atualizado no mesmo trabalho em que uma funcionalidade relevante for alterada.

## 1. Objetivo e limites do MVP

O site reúne informações da atlética, notícias, modalidades, agenda, mural e produtos. A primeira etapa prioriza as telas e a navegação. Depois, o front end será conectado a uma API para autenticação, administração de conteúdo e pedidos.

- **Front end escolhido:** Next.js, React e TypeScript.
- **Backend planejado:** NestJS. Ainda não existe nesta pasta de trabalho.
- **Nesta etapa:** dados de exemplo no código, imagens disponíveis e espaços reservados para as fotos que serão adicionadas depois.
- **Fora do funcionamento atual:** login real, banco de dados, publicação de conteúdo por administradores, registro de pedidos e pagamento.

Os documentos de planejamento originais estão em `assets/`. Esta página registra o estado **implementado**; ideias desses documentos só passam para “pronto” depois de aparecerem no código e serem verificadas.

## 2. Estado das telas

| Rota | O que existe hoje | Estado |
| --- | --- | --- |
| `/` | Página inicial com apresentação, destaques, loja e até três compromissos futuros com links para detalhes e acesso à agenda completa. | Interface pronta; lista filtrada por data, conteúdo local |
| `/noticias` e `/noticias/[slug]` | Lista com filtro por categoria e página individual de cada notícia. | Interface pronta; notícias locais |
| `/modalidades` e `/modalidades/[slug]` | Lista e páginas de modalidades. Futsal e basquete têm dados de detalhes próprios. | Interface pronta; conteúdo local |
| `/atletas/[slug]` | Perfil público de João Silva, com modalidade, camisa, estatísticas e resultados recentes. | **Prévia visual:** dados de exemplo; foto pendente |
| `/ranking` | Indicadores da temporada, classificação geral e aproveitamento por modalidade. Acesso pela página de Modalidades. | **Prévia visual:** números de exemplo, sem cálculo automático |
| `/agenda` | Eventos listados em ordem cronológica, com filtro por categoria e links para páginas de detalhe. | Interface pronta; eventos locais |
| `/agenda/[slug]` | Detalhe demonstrativo do treino de Vôlei, da reunião do Intereng e do jogo Octa x Protendidos. | **Simulação no navegador:** presença e favorito não são persistidos; imagens e confirmações dos próximos eventos pendentes |
| `/mural`, `/mural/historia`, `/mural/integrantes`, `/mural/conquistas` | Apresentação da atlética, história, integrantes e conquistas; filtro na lista de integrantes. | Interface pronta; parte das imagens é placeholder |
| `/loja` | Catálogo com busca por nome e filtro por categoria. | Interface pronta; produtos locais |
| `/loja/[slug]` | Detalhe de produto, escolha de tamanho quando necessário e adição ao carrinho. | Interação local funcionando |
| `/carrinho` | Alteração de quantidade, remoção de itens e cálculo do total. | Funciona no navegador; sem servidor |
| `/checkout` | Formulário, validação básica e confirmação visual. | **Simulação:** não cria pedido, envia dados ou cobra |
| `/login` e `/cadastro` | Formulários visuais, validação de campos, alternância entre as telas e aviso ao enviar. | **Simulação:** não autentica nem cria conta |
| `/minha-conta` | Painel com perfil de exemplo e ações de conta. | **Demonstração:** sem usuário autenticado |
| `/meus-pedidos` | Pedido de exemplo, etapas de entrega e área de histórico vazia. | **Demonstração:** sem pedido registrado |
| `/admin` | Dashboard da diretoria com indicadores, gráfico de vendas e atividades recentes de exemplo; busca local nas atividades. | **Prévia visual:** acesso livre, sem dados reais ou autenticação |
| `/admin/noticias` | Mural administrativo com filtros, busca e tabela no desktop; no celular, filtros deslizáveis e notícias em cartões. Em telas de celular e iPad, o modal inteiro rola, com cabeçalho e ações no fluxo normal. | **Simulação no navegador:** não publica nem altera as notícias públicas |
| `/admin/produtos` | Tabela demonstrativa do Figma com busca, ajuste de estoque, cadastro, edição e exclusão de produtos; imagem opcional no formulário. | **Simulação no navegador:** não altera os produtos nem o estoque da loja pública |
| `/admin/eventos` | Cronograma com lista em cartões, calendário mensal, busca e formulário para criar/editar; exclusão com confirmação. | **Simulação no navegador:** não altera a agenda pública |
| `/admin/integrantes` | Cartões de integrantes, busca por nome, cadastro, edição, remoção e foto opcional. | **Simulação no navegador:** não altera o mural público |
| `/admin/resultados` | Tabela de partidas, busca, filtros de vitórias e derrotas, cadastro, edição e remoção; status calculado pelo placar. | **Simulação no navegador:** não altera os resultados públicos |
| `/admin/pedidos` | Tabela no desktop e cartões no celular, com busca, filtros, itens do pedido selecionado e alteração de status. | **Simulação no navegador:** não registra compras nem avisa clientes |

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
| `frontend/src/app/globals.css` | Cores e estilos globais. |
| `frontend/src/components/` | Componentes reutilizados, como cabeçalho, rodapé e cards. |
| `frontend/src/data/` | Conteúdo local de notícias, eventos, modalidades, mural e produtos. |
| `frontend/src/lib/cart.ts` | Regras do carrinho e armazenamento no navegador. |
| `frontend/src/components/auth-form.tsx` | Formulário compartilhado pelas telas de login e cadastro. |
| `frontend/src/data/account.ts` | Perfil e pedido fictícios usados nas prévias de conta. |
| `frontend/src/data/athletes.ts` | Perfil esportivo demonstrativo e resultados recentes do atleta no Figma. |
| `frontend/src/data/ranking.ts` | Indicadores, classificação e aproveitamento demonstrativos do quadro de ranking. |
| `frontend/src/data/event-details.ts` | Descrição, imagem e nomes demonstrativos do detalhe de evento. |
| `frontend/src/components/site-chrome.tsx` | Exibe cabeçalho e rodapé públicos nas rotas do site; omite ambos na área `/admin`, que usa estrutura própria. |
| `frontend/src/data/admin.ts` | Indicadores, vendas e atividades fictícios do dashboard administrativo. |
| `frontend/src/app/admin/layout.tsx` e `admin-shell.tsx` | Estrutura e barra superior compartilhadas entre as telas administrativas; em celular a busca contextual fica abaixo do título. |
| `frontend/src/data/admin-news.ts` | Notícias fictícias usadas apenas na prévia do mural administrativo. |
| `frontend/src/data/admin-products.ts` | Produtos e estoques fictícios usados apenas na prévia administrativa. |
| `frontend/src/data/admin-events.ts` | Eventos fictícios usados apenas na prévia administrativa. |
| `frontend/src/data/admin-members.ts` | Integrantes de exemplo do quadro administrativo do Figma. |
| `frontend/src/data/admin-results.ts` | Partidas de exemplo do quadro administrativo do Figma. |
| `frontend/src/data/admin-orders.ts` | Pedidos de exemplo do quadro administrativo do Figma. |
| `frontend/public/images/` | Imagens servidas pelo site; originais e referências ficam em `assets/`. |
| `frontend/README.md` | Guia rápido de execução e mapa resumido do front end. |

As páginas usam CSS Modules (`*.module.css`) para estilos próprios. A identidade visual segue o Figma: fonte Outfit, paleta da Octacore e imagens fornecidas em `assets/`. Os retângulos brancos de galeria, mural e integrantes são espaços reservados intencionais.

## 5. Onde alterar o conteúdo

| Conteúdo | Arquivo |
| --- | --- |
| Produtos, preços, categorias, tamanhos e imagem | `frontend/src/data/products.ts` |
| Notícias e categorias | `frontend/src/data/news.ts` |
| Modalidades, detalhes de futsal e basquete | `frontend/src/data/modalities.ts` |
| Agenda | `frontend/src/data/events.ts` |
| Detalhe do treino de Vôlei | `frontend/src/data/event-details.ts` |
| História, integrantes e conquistas | `frontend/src/data/mural.ts` |
| Perfil e pedido exibidos nas prévias | `frontend/src/data/account.ts` |
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

Exemplo: para atualizar o técnico do basquete, procure `basqueteDetails` em `frontend/src/data/modalities.ts`. Para cadastrar um produto no protótipo, acrescente um objeto ao array `products` com um `slug` único. O preço é guardado em **centavos**: `5990` aparece como `R$ 59,90`. A função `formatPrice` formata esse valor para exibição.

## 6. Fluxo atual da loja

1. A lista em `/loja` lê `products.ts`; cada card abre `/loja/<slug>`.
2. O detalhe lê o produto pelo `slug` e exige um tamanho se o produto tiver `sizes`.
3. Ao adicionar o produto, `cart.ts` grava identificador, tamanho e quantidade em `localStorage`, na chave `octacore-cart`.
4. `/carrinho` lê esses itens, consulta os preços atuais de `products.ts` e calcula o total.
5. `/checkout` solicita nome, telefone e retirada, mas a confirmação existe apenas na tela enquanto a página estiver aberta. O formulário não envia esses dados e não cria pedido.

O carrinho persiste no mesmo navegador; ele não acompanha o usuário em outros dispositivos. Se o armazenamento do navegador estiver bloqueado, há uma cópia temporária apenas na aba atual. Estoque, frete, desconto e pagamento ainda não estão implementados. A tela de pedidos exibe somente um exemplo fixo; ela não lê o carrinho nem o checkout.

### Acesso e cadastro

O botão de conta do cabeçalho abre `/login`. As telas `/login` e `/cadastro` reutilizam `auth-form.tsx` e fazem apenas validações no navegador, incluindo a conferência das duas senhas no cadastro. O login oferece um link para cadastro, e o cadastro tem um botão para voltar ao login. Ao enviar, aparece um aviso de indisponibilidade. Nenhum dado é enviado, salvo ou usado para criar uma sessão. A autenticação real dependerá do backend NestJS.

Após a tentativa de login, aparece um link para explorar a prévia de `/minha-conta`. O painel mostra um perfil fictício e quatro ações. “Visualizar Pedidos Ativos” abre `/meus-pedidos`; “Histórico de Compras” abre a seção de histórico dessa página, que está vazia. “Editar Perfil”, “Alterar Senha” e “Sair da Conta” apresentam avisos explicando que essas ações dependem da futura autenticação. O pedido #1032 e seus valores foram copiados como exemplo visual do Figma, em `account.ts`; não representam uma compra realizada nem usam os preços atuais da loja.

### Painel administrativo

`/admin` reproduz o dashboard do Figma com barra lateral, indicadores, gráfico de vendas e atividades recentes. Todos os números, nomes e registros vêm de `data/admin.ts` e são fictícios. A busca filtra apenas a lista local de atividades. A barra lateral é compartilhada pelo Dashboard, `/admin/noticias`, `/admin/produtos`, `/admin/eventos`, `/admin/integrantes`, `/admin/resultados` e `/admin/pedidos`; essas rotas navegam entre si. “Sair do Painel” exibe um aviso, sem encerrar uma sessão. “Voltar ao Site” retorna à página pública. As rotas são acessíveis por URL sem autenticação; **não devem exibir dados privados nem oferecer operações reais antes de existir proteção no backend**.

`/admin/noticias` segue o quadro `octacore-admin-noticias` do Figma. A busca atua sobre título, categoria e autor. Os filtros mostram somente categorias com linhas na tabela, inclusive categorias criadas temporariamente, e combinam com a busca; há contagem de resultados e ação para limpar os filtros. “Nova Notícia”, editar e excluir alteram uma cópia em memória apenas enquanto essa página está aberta; recarregar restaura os exemplos. O editor inclui título, resumo, texto, categoria, autor, status e imagem opcional com descrição. É preciso visualizar a prévia antes de salvar na tabela. Imagens JPG, PNG ou WebP de até 2 MB podem ser selecionadas localmente; há também um botão para usar a imagem da galeria como exemplo. O arquivo selecionado não é enviado a um servidor. Essas ações não afetam `data/news.ts`, o site público ou qualquer servidor. A publicação real precisará da API NestJS e de autorização administrativa.

`/admin/produtos` segue o quadro `octacore-admin-produtos` do Figma: cinco produtos de exemplo, miniaturas (ícone provisório quando não há foto), busca por nome ou categoria, preço e controles de estoque. O formulário permite nome, categoria, preço, estoque e imagem opcional JPG, PNG ou WebP de até 2 MB. Cadastro, edição, exclusão e estoque alteram apenas a cópia em memória; recarregar restaura os exemplos. Os dados do painel ficam em `data/admin-products.ts` e **não alimentam** `data/products.ts`, a Home, a loja, o carrinho ou qualquer servidor. A gestão real exigirá autenticação, autorização e API NestJS.

`/admin/eventos` segue o quadro `octacore-admin-eventos` do Figma: quatro eventos de exemplo em cartões, busca por título/categoria/local/descrição, alternância para calendário mensal, navegação entre meses, criação, edição e exclusão. O formulário aceita título, categoria, data e hora, local, descrição e imagem opcional JPG, PNG ou WebP de até 2 MB. As quatro fotos mostradas no Figma ainda não estão em `assets/`; os cartões exibem áreas provisórias e podem receber imagens pelo formulário. As mudanças ficam apenas em memória e são descartadas ao recarregar. `data/admin-events.ts` é independente de `data/events.ts`; o painel **não publica** na agenda, Home ou backend.

`/admin/integrantes` segue o quadro `octacore-admin-integrantes` do Figma: seis cartões de exemplo, busca por nome, criação, edição e confirmação de remoção. O formulário aceita nome, função/modalidade, curso, usuário do Instagram e foto opcional JPG, PNG ou WebP de até 2 MB. As fotos presentes no Figma não estão em `assets/`; até serem fornecidas, os cartões mostram iniciais em círculos. Os nomes e funções do quadro administrativo diferem dos exemplos em `data/mural.ts`, por isso ficam em `data/admin-members.ts`. As alterações são apenas em memória; recarregar restaura os exemplos e **não modifica** o mural público nem envia dados ao backend.

`/admin/resultados` segue o quadro `octacore-admin-resultados` do Figma: cinco partidas de exemplo, busca por modalidade, adversário ou campeonato, filtros “Só Vitórias” e “Só Derrotas”, cadastro, edição e exclusão com confirmação. O filtro de derrotas foi acrescentado após o protótipo. O formulário recebe modalidade, adversário, placares, campeonato e data. Vitória, empate ou derrota são calculados pelos placares, sem campo de status independente. As alterações ficam em memória e são descartadas ao recarregar; `data/admin-results.ts` é independente dos dados esportivos exibidos no site público. A tabela pode rolar horizontalmente em telas estreitas.

`/admin/pedidos` segue o quadro `octacore-admin-pedidos` do Figma: quatro pedidos de exemplo, busca por número ou cliente, filtros para todos os seis status e um painel para escolher e salvar o novo status. A pedido da equipe, foi acrescentado um quadro com produtos, variações, quantidades e valores do pedido selecionado, além dos filtros “Disponível para retirada” e “Cancelado”. O total da tabela é calculado a partir dos itens. Os valores dos itens são exemplos históricos para reproduzir os totais do Figma e não precisam corresponder aos preços atuais da loja. Em telas de até 650 px, cartões substituem a tabela: o botão “Gerenciar pedido” fica visível sem rolagem horizontal e leva aos detalhes e ao controle de status. As mudanças de status ocorrem apenas em memória e são descartadas ao recarregar. Esses pedidos são independentes do pedido fictício em `data/account.ts`, do checkout simulado e do dashboard; **nenhuma compra é registrada, nenhum cliente é avisado e não há integração com o backend**.

`/atletas/joao-silva` segue o quadro `octacore-perfil-atleta` do Figma: perfil de João Silva, Futsal Masculino, camisa 10, quatro estatísticas e três resultados recentes. O elenco da página de Futsal agora leva ao perfil; a posição exibida foi alinhada ao protótipo como “Ala”. A foto do quadro não está nos arquivos fornecidos, então as iniciais “JS” ocupam seu espaço provisoriamente. Os números são exemplos em `data/athletes.ts`, independentes dos resultados administrativos e do perfil de conta; **não há atualização automática nem integração com backend**. Esta é uma página pública de atleta, distinta de `/minha-conta`.

`/ranking` segue o quadro `octacore-ranking-estatisticas` do Figma: quatro indicadores da temporada, três posições no Campeonato Universitário e barras de aproveitamento para Futsal, Basquete, Voleibol e Handebol. O link “Ver ranking e estatísticas” em `/modalidades` leva à página. Os valores estão em `data/ranking.ts` e são exemplos independentes das partidas em `data/admin-results.ts` e do perfil do atleta; **não são calculados a partir de resultados nem sincronizados com o backend**.

`/agenda/treino-volei-octacore` segue o quadro `octacore-evento-presenca` do Figma. A imagem de capa foi exportada do próprio protótipo para `public/images/treino-volei-hero.png`. O treino foi acrescentado à Agenda e seu cartão abre o detalhe. Favoritar e confirmar presença mudam apenas a interface aberta: a confirmação mostra “Você (prévia)” e soma um ao contador demonstrativo, mas tudo é descartado ao sair ou recarregar. O quadro mostra 18 confirmados e só fornece cinco nomes; “Ver todos os confirmados” explica essa limitação, sem inventar as demais pessoas. A Agenda ordena os compromissos por data. **Não há autenticação, inscrição ou registro de presença no backend.**

A navegação administrativa fica recolhida atrás de um ícone simples de três linhas no canto superior esquerdo em PC e iPad; no celular, usa o botão “Menu”, que também mostra a seção atual. Os destinos abrem em um card flutuante sobre a página, liberando a coluna lateral fixa sem deslocar o conteúdo. O card usa três colunas em telas maiores e duas em celulares; fecha ao escolher uma rota, tocar fora ou pressionar Escape. A navbar reúne marca, busca da página, perfil e saída; os títulos ficam no início da área principal, sem seta de retorno. O ícone de saída apenas informa que a prévia não tem sessão para encerrar. No menu público, além da seleção de uma rota, tocar fora do card ou pressionar Escape também fecha a navegação móvel. Tabelas mais largas rolam dentro do próprio painel; em `/admin/pedidos`, os cartões substituem a tabela no celular.

## 7. Próximos passos

1. Revisar com a equipe as telas implementadas, textos, eventos, integrantes, produtos, tamanhos e formas de retirada; disponibilizar as fotos dos quatro eventos do painel, dos seis integrantes e de João Silva, e substituir os demais placeholders pelas imagens aprovadas.
2. Definir os contratos da API NestJS e integrar autenticação, conteúdo, presença em eventos e pedidos reais. Nessa integração, acrescentar estados de carregamento, erro e sucesso aos formulários de acesso.
3. Continuar a revisão de acessibilidade e responsividade em larguras intermediárias e celulares menores; incluir indicação visual de rolagem nas tabelas administrativas que ainda não a mostram. Conferir seleção de imagens em um navegador sem as restrições da extensão de automação.

Esta ordem pode mudar por decisão da equipe; registre a decisão abaixo quando acontecer.

## 8. Decisões e limites conhecidos

- A equipe escolheu **Next.js + TypeScript** para o front end e **NestJS** para o backend futuro.
- O protótipo do Figma orienta a interface; a fonte Outfit e os arquivos em `assets/` compõem a identidade visual atual.
- Fotos ainda indisponíveis permanecem como placeholders, conforme combinado para galeria, mural e integrantes.
- Conteúdo, preços e detalhes de produtos são dados de exemplo e precisam de confirmação da atlética.
- A Home mantém alguns destaques diretamente na página; ao integrar a API, vale reunir dados compartilhados para evitar divergências.
- O checkout é uma demonstração explícita. Nenhum pedido deve ser tratado como realizado a partir dessa tela.
- Login e cadastro também são demonstrações visuais; suas credenciais não são enviadas ou persistidas.
- “Minha Conta” e “Meus Pedidos” usam dados fixos para reproduzir o Figma. Não há sessão, atualização de perfil, troca de senha, saída de conta ou histórico real.
- O perfil público do atleta também usa dados fixos e não compartilha ainda estatísticas com as outras páginas.
- O ranking público usa números fixos do Figma e não é recalculado a partir das partidas do painel ou das estatísticas individuais.
- Favoritar evento e confirmar presença alteram somente o estado da tela atual. A contagem de 18 e os cinco nomes visíveis vêm do Figma; nenhuma presença real é criada.
- O painel administrativo é uma prévia pública com valores fictícios. Em Notícias, Produtos, Eventos, Integrantes, Resultados e Pedidos, as edições existem somente em memória no navegador e não publicam conteúdo nem atualizam a loja, a agenda, o mural ou os resultados do site público. A proteção de acesso e qualquer ação real de gestão dependerão de autenticação, autorização e API no backend.
- Os quadros de login e cadastro do Figma usam cartões centralizados sobre fundo roxo escuro; os formulários foram ajustados a essa estrutura. O rodapé mantém a alteração posterior solicitada para “Comunidade acadêmica”.

## 9. Histórico de desenvolvimento

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
