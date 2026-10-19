# Contexto do projeto OctaWeb para assistentes de IA

**Atualizado em:** 16/10/2026  
**Repositório:** [ZrBarros/OctaWeb](https://github.com/ZrBarros/OctaWeb)  
**Protótipo:** [Projeto P3 — Octacore no Figma](https://www.figma.com/design/BcgJnC6UWsDG5W5B5mO7V6/Projeto-P3---Octacore?node-id=0-1)

Este arquivo serve como ponto de partida para outra IA que vá ajudar no OctaWeb. Ele resume o contexto e os cuidados importantes, mas **não substitui o código nem a documentação detalhada**. Leia também `DOCUMENTACAO.md`, `AGENTS.md` e `frontend/README.md` antes de fazer mudanças.

## Mensagem inicial para a próxima IA

Você está colaborando no OctaWeb, um projeto acadêmico da disciplina de Programação Web feito pelo usuário e mais dois colegas para a Associação Atlética Acadêmica de Computação da UFAL, a Octacore. O usuário é responsável pelo front end e quer aprender enquanto desenvolve. Trabalhe como colega: explique as decisões e o código em linguagem clara, avance com autonomia quando a tarefa estiver clara, preserve o que já existe e verifique as mudanças necessárias. Não faça commit, push, publicação ou alterações externas sem pedido explícito.

O objetivo imediato é continuar o front end e, numa etapa posterior, integrar a API NestJS. Antes de implementar, confira o estado atual do repositório; este contexto pode ficar desatualizado. Para entender o que foi realmente implementado em cada tela, leia `DOCUMENTACAO.md` e confira o código correspondente.

## Objetivo e escopo

O site reúne a apresentação da atlética, notícias, modalidades esportivas, agenda, mural da comunidade e loja. Há também telas demonstrativas de conta e um painel administrativo. A primeira etapa prioriza a interface, navegação e revisão responsiva. A equipe escolheu Next.js para o front end e NestJS para o backend futuro.

**O estado atual é majoritariamente front end.** Há dados locais, interações de demonstração e uso de `localStorage` no carrinho. Não existe integração real com NestJS, banco de dados, autenticação ou publicação administrativa.

## Como executar

O `package.json` fica dentro de `frontend/`, não na raiz. No terminal:

```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:3000`. Para que celulares/tablets na mesma rede acessem o servidor, a execução pode usar:

```bash
npm run dev -- --hostname 0.0.0.0
```

Depois de mudanças de código, os comandos usuais de verificação são `npm run lint` e `npm run build`, executados em `frontend/`. Não é preciso executar arquivos de rota individualmente; o Next.js mapeia as pastas `src/app`.

`localhost` só é acessível na máquina que roda o servidor. Para que outra IA veja o site por URL, ela precisa ter acesso ao mesmo ambiente, a uma URL publicada/acessível, ou ao repositório e aos arquivos. Uma URL local copiada para outra máquina não basta.

## Tecnologias e estrutura

- **Next.js 16 App Router**, React 19 e TypeScript.
- **NestJS** é a tecnologia escolhida para o backend futuro; ainda não há backend neste projeto.
- CSS Modules por página/componente, além de `frontend/src/app/globals.css`.
- Fonte principal: **Outfit**.
- Dados demonstrativos separados em `frontend/src/data/`.
- Carrinho no navegador implementado em `frontend/src/lib/cart.ts` (`localStorage`, chave `octacore-cart`).

Áreas principais do código:

- `frontend/src/app/`: páginas e rotas públicas e administrativas.
- `frontend/src/components/`: cabeçalho, rodapé, formulários e componentes partilhados.
- `frontend/src/data/`: notícias, eventos, modalidades, produtos, mural, ranking, contas e dados do admin.
- `frontend/src/lib/`: funções de apoio, atualmente incluindo as regras do carrinho.
- `frontend/public/images/`: imagens usadas pelo site.
- `assets/`: originais de marca, planejamento, imagens e visuais para apresentações.

O projeto não tem `README.md` na raiz. O guia de execução está em `frontend/README.md`; a documentação funcional detalhada está em `DOCUMENTACAO.md`.

## Telas existentes

As rotas principais já têm interfaces construídas. Confirme a descrição atual em `DOCUMENTACAO.md` e no código, pois detalhes podem mudar.

- **Site público:** `/`, `/noticias`, `/noticias/[slug]`, `/modalidades`, `/modalidades/[slug]`, `/agenda`, `/agenda/[slug]`, `/mural`, `/mural/historia`, `/mural/integrantes`, `/mural/integrantes/[slug]`, `/mural/conquistas`, `/loja`, `/loja/[slug]`, `/ranking`, `/atletas/[slug]`.
- **Compra:** `/carrinho` e `/checkout`.
- **Conta:** `/login`, `/cadastro`, `/minha-conta` e `/meus-pedidos`.
- **Admin:** `/admin`, `/admin/perfil`, `/admin/noticias`, `/admin/produtos`, `/admin/eventos`, `/admin/integrantes`, `/admin/resultados` e `/admin/pedidos`.
- **Peça promocional animada:** `/motion-octaweb.html` é uma página HTML/CSS estática servida pela pasta `public`; é uma animação no navegador, não um arquivo MP4.

O painel admin tem navegação própria, adaptada para desktop/tablet e celular. O site público tem cabeçalho e rodapé partilhados; o rodapé foi ajustado para deixar “Comunidade acadêmica” como único item em Patrocinadores & Parceiros e não exibir a antiga frase de crédito.

## Interface, demonstração e backend: distinção essencial

Não descreva uma simulação como funcionalidade integrada. No estado registrado em `DOCUMENTACAO.md`:

- As páginas, filtros, navegação, formulários, cards e vários estados de interação existem no navegador.
- O carrinho guarda estado localmente no mesmo navegador; isso não cria pedido no servidor.
- Login/cadastro não autenticam, não criam sessão e não persistem dados.
- `/minha-conta`, `/meus-pedidos`, perfil do atleta, ranking e painel admin usam dados demonstrativos.
- Criar/editar/excluir conteúdo administrativo altera apenas o estado temporário daquela página e não atualiza as telas públicas.
- Favoritar evento e confirmar presença são estados locais temporários.
- Checkout não cobra, não envia dados e não registra pedido.
- `/admin` não exige autenticação; não coloque dados privados ou credenciais reais nele.
- Não existe API NestJS, banco ou controle de permissão. As ações reais dependem de implementação futura no backend.

## Perfis de acesso planejados

1. **Visitante:** navega nas páginas públicas e pode montar carrinho local.
2. **Usuário autenticado:** deve acessar conta, pedidos e inscrições/favoritos associados à própria conta.
3. **Administrador:** deve acessar a administração protegida e gerir conteúdo e pedidos.

Essa é a regra de produto prevista, não uma autorização já implementada. Leia a seção 1.1 de `DOCUMENTACAO.md` antes de propor mudanças nesse fluxo. A proteção real deve acontecer no backend; esconder elementos no front end não basta.

O nome **Zeca Rocha**, o cargo **Diretor de TI** e o perfil em `/admin/perfil` são demonstrativos. Não correspondem a uma sessão autenticada.

## Identidade visual e referências

- O protótipo do Figma é a referência primária de tela e comportamento.
- Identidade atual: fundo roxo muito escuro, superfícies grafite, roxo vivo, laranja e texto branco; Outfit em pesos altos para títulos.
- Cores globais atuais em `frontend/src/app/globals.css`: fundo `#0d001a`, superfície `#1c1c1c`, roxo escuro `#3a0051`, roxo `#b500c3`, laranja `#ff7f3f`.
- Os arquivos originais estão em `assets/`: logos (`LogoOcta.png`, `LogoOcta full.jpg`), mascote (`PolvoRobo.png`), paleta, camisa, imagem de galeria e documentos de planejamento.
- Algumas áreas têm placeholders brancos porque as imagens ainda não foram fornecidas; essa decisão foi combinada com o usuário.

Para telas de login, loja, mural, admin ou outras, compare com o quadro correspondente do Figma quando disponível e depois valide o comportamento em desktop e celular. O usuário prefere fidelidade ao protótipo, mas aceita sugestões de design quando apresentadas com motivo claro.

## Arquivos visuais de apresentação

Há três artes de mosaico na pasta `assets/`:

- `apresentacao-octaweb-mosaico.png`: arte inicial, com imagens de esporte/comunidade criadas por IA.
- `apresentacao-octaweb-mosaico-minimalista.png`: variação de mosaico mais limpa.
- `apresentacao-octaweb-mosaico-sem-fotos-ia.png`: arte baseada no mosaico inicial, com imagens fotográficas geradas removidas de Notícias, Modalidades e Mural e substituídas por motivos de interface/ícones. Os elementos gráficos da composição continuam sendo uma ilustração conceitual, não capturas reais do site.

As artes são recursos de apresentação, não imagens da interface do produto. Não as use como prova de que o site possui dados ou funcionalidades que não aparecem no código.

## Instruções locais que devem ser preservadas

O `AGENTS.md` da raiz instrui que, ao concluir mudanças relevantes em telas, dados, fluxos ou arquitetura, a IA deve atualizar `DOCUMENTACAO.md` no mesmo trabalho. Deve manter estado atual, limitações e próximos passos, adicionar entrada datada no histórico com a verificação realizada e distinguir interface pronta, simulação no navegador e integração real com backend. Para mudanças pequenas sem impacto nesses pontos, não é necessário registrar entrada.

`frontend/AGENTS.md` avisa que esta versão do Next.js pode ter diferenças em relação às convenções conhecidas. Antes de editar código Next.js, leia a documentação local relevante em `frontend/node_modules/next/dist/docs/` e siga as convenções da versão instalada.

## Como colaborar com o usuário

- O usuário está aprendendo desenvolvimento web e quer trabalhar em conjunto; explique decisões e arquivos alterados em termos simples, sem transformar toda entrega numa aula extensa.
- Responda em português, salvo se o usuário pedir outra língua.
- Quando a tarefa estiver clara, avance em vez de pedir confirmação para escolhas rotineiras. O usuário costuma direcionar o progresso com “prossiga”.
- Em mudanças de código, informe quais partes foram alteradas, como verificou e quais limitações continuam.
- Não faça commit, push, merge, publicação ou ações em serviços externos sem autorização explícita.
- Não substitua nem apague assets do usuário sem necessidade; crie arquivo com nome novo para variações visuais.
- Antes de criar dados ou funcionalidades, confirme se já existe um arquivo de dados ou fluxo equivalente para evitar duplicidade.
- Use links/nomes de arquivos reais e mantenha o estado da documentação coerente com o código.

## Próximos passos registrados

Consulte `DOCUMENTACAO.md` para a lista vigente. Entre as frentes já apontadas estão:

1. Revisar com a equipe conteúdo, datas, pessoas, produtos, tamanhos, retirada e imagens pendentes.
2. Definir contratos da API NestJS e depois integrar autenticação/autorização, conteúdo, presença em eventos e pedidos.
3. Continuar a revisão de acessibilidade e responsividade em larguras intermediárias e celulares menores.

Não trate esta lista como ordem imutável; a prioridade atual deve vir do usuário.

## Instrução curta para iniciar o próximo trabalho

Depois de ler este arquivo, `DOCUMENTACAO.md`, `frontend/README.md` e as instruções `AGENTS.md`, confira a branch, `git status` e os arquivos diretamente relacionados ao pedido. Explique brevemente o que encontrou, implemente a tarefa autorizada, faça as verificações adequadas e atualize `DOCUMENTACAO.md` quando a mudança for relevante. Preserve o escopo front end enquanto o usuário não pedir integração com backend.
