# Documentação de desenvolvimento — Octacore

**Última atualização:** 12/10/2026  
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
| `/` | Página inicial com apresentação, destaques, loja e atalhos para outras áreas. | Interface pronta com conteúdo de exemplo |
| `/noticias` e `/noticias/[slug]` | Lista com filtro por categoria e página individual de cada notícia. | Interface pronta; notícias locais |
| `/modalidades` e `/modalidades/[slug]` | Lista e páginas de modalidades. Futsal e basquete têm dados de detalhes próprios. | Interface pronta; conteúdo local |
| `/agenda` | Eventos listados com filtro por categoria. | Interface pronta; eventos locais |
| `/mural`, `/mural/historia`, `/mural/integrantes`, `/mural/conquistas` | Apresentação da atlética, história, integrantes e conquistas; filtro na lista de integrantes. | Interface pronta; parte das imagens é placeholder |
| `/loja` | Catálogo com busca por nome e filtro por categoria. | Interface pronta; produtos locais |
| `/loja/[slug]` | Detalhe de produto, escolha de tamanho quando necessário e adição ao carrinho. | Interação local funcionando |
| `/carrinho` | Alteração de quantidade, remoção de itens e cálculo do total. | Funciona no navegador; sem servidor |
| `/checkout` | Formulário, validação básica e confirmação visual. | **Simulação:** não cria pedido, envia dados ou cobra |
| `/login` e `/cadastro` | Formulários visuais, validação de campos, alternância entre as telas e aviso ao enviar. | **Simulação:** não autentica nem cria conta |
| `/minha-conta` | Painel com perfil de exemplo e ações de conta. | **Demonstração:** sem usuário autenticado |
| `/meus-pedidos` | Pedido de exemplo, etapas de entrega e área de histórico vazia. | **Demonstração:** sem pedido registrado |
| Administração | Ainda sem telas implementadas. | Pendente |

“Interface pronta” indica que a página foi construída no front end, não que seu conteúdo esteja aprovado para publicação ou conectado à API.

## 3. Como executar e conferir

No terminal, a partir da pasta `frontend`:

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. Para verificar o front end depois de alterações de código:

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
| História, integrantes e conquistas | `frontend/src/data/mural.ts` |
| Perfil e pedido exibidos nas prévias | `frontend/src/data/account.ts` |
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

## 7. Próximos passos

1. Construir as telas de administração para conteúdo e loja, ainda com dados de exemplo.
2. Revisar com a equipe os textos, eventos, produtos, tamanhos e formas de retirada; substituir placeholders pelas imagens aprovadas.
3. Definir os contratos da API NestJS e integrar autenticação, conteúdo e pedidos reais. Nessa integração, acrescentar estados de carregamento, erro e sucesso aos formulários de acesso.
4. Conferir acessibilidade, responsividade e fluxos completos antes da entrega.

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
- Os quadros de login e cadastro do Figma usam cartões centralizados sobre fundo roxo escuro; os formulários foram ajustados a essa estrutura. O rodapé mantém a alteração posterior solicitada para “Comunidade acadêmica”.

## 9. Histórico de desenvolvimento

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
