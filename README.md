# OctaWeb

Site da **Associação Atlética Acadêmica de Computação da UFAL (Octacore)**, desenvolvido como projeto da disciplina de Programação Web. O objetivo é reunir notícias, modalidades, agenda, mural da atlética e loja em um só lugar.

O projeto está na fase de **MVP do front end**. As telas foram construídas com **Next.js, React e TypeScript**, seguindo o [protótipo no Figma](https://www.figma.com/design/BcgJnC6UWsDG5W5B5mO7V6/Projeto-P3---Octacore?node-id=0-1). Uma API em **NestJS** está planejada para uma etapa posterior; ela ainda não faz parte deste repositório.

## Como executar

É necessário ter Node.js e npm instalados. Na raiz do projeto:

```bash
cd frontend
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador. Para acessar a prévia por outro aparelho na mesma rede, inicie o servidor com `npm run dev -- --hostname 0.0.0.0` e abra `http://IP-DO-COMPUTADOR:3000` no aparelho.

Para conferir o código e gerar a versão de produção:

```bash
npm run lint
npm run build
```

## O que existe hoje

- **Site público:** home, notícias, modalidades, agenda, mural, ranking e perfis demonstrativos.
- **Loja:** catálogo, detalhes dos produtos, carrinho salvo no navegador e checkout simulado.
- **Conta:** telas de login, cadastro, perfil e pedidos demonstrativos.
- **Painel administrativo:** prévias de dashboard e gestão de notícias, produtos, eventos, integrantes, resultados e pedidos.

Os conteúdos ainda são, em grande parte, dados locais de exemplo. Login e cadastro **não criam uma sessão real**; ações do painel **não publicam alterações no site**; o checkout **não registra pedidos nem realiza pagamentos**. A autenticação, as permissões e a persistência dos dados dependem da futura integração com o backend.

## Estrutura e documentação

- [`frontend/`](frontend/) — aplicação Next.js. O [README do front end](frontend/README.md) explica onde estão as principais partes do código.
- [`assets/`](assets/) — materiais de identidade visual e documentos de referência do projeto.
- [`DOCUMENTACAO.md`](DOCUMENTACAO.md) — estado de cada tela, limites das simulações, decisões, próximos passos e histórico de desenvolvimento. Consulte este arquivo para saber o que já funciona e o que ainda está planejado.

Ao implementar uma mudança relevante, atualize também a documentação para manter o estado do projeto correto.
