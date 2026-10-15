// Conteúdo apenas demonstrativo da tabela administrativa do Figma.
// Alterações nesta lista feitas no navegador não modificam as notícias públicas.
export type AdminNewsCategory = "Campeonatos" | "Seletivas" | "Jogos" | "Comunicados" | "Treinos" | "Festas" | "Loja";
export type AdminNewsStatus = "Publicado" | "Rascunho";
export type AdminNewsItem = {
  id: number;
  title: string;
  summary: string;
  body: string;
  category: AdminNewsCategory;
  author: string;
  date: string;
  status: AdminNewsStatus;
  imageSrc?: string;
  imageAlt: string;
};

export const adminNewsCategories: AdminNewsCategory[] = ["Campeonatos", "Seletivas", "Jogos", "Comunicados", "Treinos", "Festas", "Loja"];

export const adminNews: AdminNewsItem[] = [
  { id: 1, title: "Octacore conquista título inédito de Futsal no Interatléticas 2026", summary: "A equipe de Futsal celebrou uma conquista marcante no Interatléticas.", body: "A Octacore conquistou o título de Futsal no Interatléticas 2026. Atletas e torcida fizeram parte dessa campanha dentro e fora de quadra.\n\nEste texto é um exemplo para a prévia administrativa e poderá ser substituído pela notícia oficial.", category: "Campeonatos", author: "Ana Clara", date: "18 Set 2026", status: "Publicado", imageAlt: "" },
  { id: 2, title: "Inscrições abertas para a aguardada Seletiva de Vôlei", summary: "Estudantes interessados podem acompanhar as orientações da seletiva de Vôlei.", body: "A Octacore abriu a chamada para a seletiva de Vôlei. Quem deseja integrar a equipe deve acompanhar os canais oficiais da atlética.\n\nEste texto é demonstrativo; local e horário precisam ser confirmados pela diretoria.", category: "Seletivas", author: "Mateus Pontes", date: "15 Set 2026", status: "Publicado", imageAlt: "" },
  { id: 3, title: "Volta dos treinos oficiais de Basquete no ginásio municipal", summary: "Os treinos de Basquete retornam para a preparação do semestre.", body: "A equipe de Basquete retoma seus treinos regulares. A atividade reúne atletas e novos interessados na modalidade.\n\nA programação definitiva será divulgada nos canais oficiais da Octacore.", category: "Treinos", author: "Rodrigo Lima", date: "12 Set 2026", status: "Publicado", imageAlt: "" },
  { id: 4, title: "Primeiro lote liberado da grande Festa de Integração da Computação", summary: "A festa de integração da computação está em preparação.", body: "A Octacore prepara uma nova edição da Festa de Integração da Computação.\n\nEste rascunho é apenas um exemplo da interface administrativa. Informações sobre ingressos, data e local precisam de confirmação.", category: "Festas", author: "Juliana Melo", date: "10 Set 2026", status: "Rascunho", imageAlt: "" },
  { id: 5, title: "Novas armaduras prontas: Loja oficial inicia pré-venda com desconto", summary: "A loja da Octacore apresenta novidades para a comunidade acadêmica.", body: "A nova coleção da loja Octacore está em preparação. A equipe apresentará modelos, tamanhos e condições de compra nos canais oficiais.\n\nEste conteúdo é demonstrativo e não anuncia uma pré-venda real.", category: "Loja", author: "Pedro Araújo", date: "08 Set 2026", status: "Publicado", imageAlt: "" },
];
