export const newsCategories = [
  "Todos",
  "Campeonatos",
  "Jogos",
  "Resultados",
  "Seletivas",
  "Treinos",
  "Festas",
  "Eventos",
  "Comunicados",
] as const;

export type NewsCategory = Exclude<(typeof newsCategories)[number], "Todos">;

export type NewsArticle = {
  slug: string;
  category: NewsCategory;
  date: string;
  dateTime: string;
  title: string;
  summary: string;
  author: string;
  paragraphs: string[];
};

// Conteúdo inicial do protótipo. Depois, esta lista poderá vir da API NestJS.
export const news: NewsArticle[] = [
  {
    slug: "octa-conquista-titulo-no-interatleticas",
    category: "Campeonatos",
    date: "18 Set 2026",
    dateTime: "2026-09-18",
    title: "Octa conquista título no Interatléticas",
    summary: "A equipe de Futsal deu um show tático e garantiu a taça de campeã estadual em Maceió.",
    author: "Diretoria Octacore",
    paragraphs: [
      "A Octacore conquistou o título do Interatléticas em uma campanha marcada por união, dedicação e grandes jogos. A equipe de Futsal representou a atlética dentro de quadra e contou com o apoio da torcida durante toda a competição.",
      "A conquista é resultado do trabalho de atletas, comissão e estudantes que fazem parte da nossa história. Seguimos juntos, levando o nome da Octa cada vez mais longe.",
    ],
  },
  {
    slug: "inscricoes-abertas-para-seletiva-de-volei",
    category: "Seletivas",
    date: "15 Set 2026",
    dateTime: "2026-09-15",
    title: "Inscrições abertas para a Seletiva de Vôlei",
    summary: "Quer defender o polvo nas quadras? Venha participar das seletivas masculinas e femininas neste sábado.",
    author: "Diretoria Octacore",
    paragraphs: [
      "As seletivas de Vôlei estão abertas para quem quer fazer parte da Octacore. A atividade reúne estudantes interessados nas equipes masculina e feminina da atlética.",
      "Acompanhe os canais oficiais da Octa para conferir local, horário e orientações de participação.",
    ],
  },
  {
    slug: "treinos-semanais-de-basquete-retornam",
    category: "Treinos",
    date: "12 Set 2026",
    dateTime: "2026-09-12",
    title: "Treinos semanais de Basquete retornam com força total",
    summary: "Veja o calendário completo e quadras reservadas para a preparação física do semestre.",
    author: "Diretoria Octacore",
    paragraphs: [
      "Os treinos semanais de Basquete estão de volta. A equipe se prepara para o semestre com atividades voltadas ao desenvolvimento técnico e à integração dos atletas.",
      "O calendário e os locais serão divulgados nos canais oficiais da atlética. Fique de olho nas próximas atualizações.",
    ],
  },
  {
    slug: "primeiro-lote-da-festa-do-polvo",
    category: "Festas",
    date: "10 Set 2026",
    dateTime: "2026-09-10",
    title: "Venda do primeiro lote da Festa do Polvo liberada",
    summary: "Prepare seu copo e tirante! O maior evento de integração da computação já tem data marcada.",
    author: "Diretoria Octacore",
    paragraphs: [
      "A Festa do Polvo está chegando para reunir a comunidade da computação em mais um momento de integração. O primeiro lote foi anunciado no protótipo da Octacore.",
      "As informações de data, local e ingressos serão confirmadas nos canais oficiais da atlética.",
    ],
  },
];
