export type ConfirmedAthlete = { name: string; position: string; initials: string };

export type EventDetail = {
  slug: string;
  title: string;
  modality: string;
  category: string;
  dateTime: string;
  displayDate: string;
  place: string;
  confirmedCount: number;
  description: string;
  heroImage?: string;
  confirmedAthletes: ConfirmedAthlete[];
};

// Conteúdo demonstrativo do quadro octacore-evento-presenca no Figma.
export const eventDetails: EventDetail[] = [
  {
    slug: "reuniao-alinhamento-intereng",
    title: "Reunião de alinhamento Intereng",
    modality: "Diretoria",
    category: "Reunião",
    dateTime: "2026-10-20T14:00:00",
    displayDate: "20/10 às 14:00h",
    place: "NEES",
    confirmedCount: 0,
    description: "Encontro para alinhar a participação da Octacore no Intereng, revisar responsabilidades e organizar os próximos passos.",
    confirmedAthletes: [],
  },
  {
    slug: "octa-x-protendidos",
    title: "Octa x Protendidos",
    modality: "Futsal",
    category: "Jogo",
    dateTime: "2026-11-20T15:00:00",
    displayDate: "20/11 às 15:00h",
    place: "Local a confirmar",
    confirmedCount: 0,
    description: "Partida da Octacore contra a equipe Protendidos. O local e as orientações para o encontro serão atualizados pela organização.",
    confirmedAthletes: [],
  },
  {
    slug: "treino-volei-octacore",
    title: "Treino de Vôlei - Octacore",
    modality: "Voleibol",
    category: "Treinos",
    dateTime: "2026-09-24T18:00:00",
    displayDate: "24/09 às 18:00h",
    place: "Quadra Geral - UFAL",
    confirmedCount: 18,
    description: "Treino focado na preparação técnica para as eliminatórias do Campeonato Universitário de Alagoas. Iremos focar em treinos de recepção, posicionamento de bloqueio duplo e transição rápida de contra-ataque pelas pontas. Presença obrigatória para atletas federados e inscritos no time oficial.",
    heroImage: "/images/treino-volei-hero.png",
    confirmedAthletes: [
      { name: "João Silva", position: "Ponta Dir.", initials: "JS" },
      { name: "Guilherme Lira", position: "Levantador", initials: "GL" },
      { name: "Beatriz Mota", position: "Líbero", initials: "BM" },
      { name: "Felipe Mendes", position: "Central", initials: "FM" },
      { name: "Mariana Alencar", position: "Oposta", initials: "MA" },
    ],
  },
];
