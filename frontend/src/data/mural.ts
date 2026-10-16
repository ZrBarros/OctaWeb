// Textos iniciais baseados no protótipo. A diretoria pode revisar os dados antes da publicação.
export const historyMilestones = [
  {
    year: "2022",
    label: "Fundação",
    title: "A Fundação da Octacore",
    description: "Estudantes da Ciência da Computação da UFAL se reuniram para criar a atlética e fortalecer a integração dentro e fora das quadras.",
  },
  {
    year: "2023",
    label: "Primeiro desafio",
    title: "O Primeiro Campeonato",
    description: "A Octacore começou a participar de competições universitárias e a formar suas primeiras equipes esportivas.",
  },
  {
    year: "2024",
    label: "Glória do polvo",
    title: "Primeiro Grande Título",
    description: "Uma conquista marcante deu ainda mais força à nossa comunidade e abriu caminho para novos desafios.",
  },
  {
    year: "2025",
    label: "Expansão",
    title: "Multiplicação de Modalidades",
    description: "Novas modalidades e atividades ampliaram o espaço da Octacore para estudantes com diferentes interesses.",
  },
];

export const memberFilters = ["Todos", "Diretoria", "Futsal", "Basquete", "Vôlei", "Handebol"] as const;

export type MemberGroup = Exclude<(typeof memberFilters)[number], "Todos">;

export type MuralMember = {
  slug: string;
  name: string;
  role: string;
  course: string;
  modality: Exclude<MemberGroup, "Diretoria">;
  groups: MemberGroup[];
};

export const muralMembers: MuralMember[] = [
  { slug: "zeca-rocha", name: "Zeca Rocha", role: "Presidente · Diretoria", course: "Ciência da Computação", modality: "Basquete", groups: ["Diretoria", "Basquete"] },
  { slug: "maria-clara", name: "Maria Clara", role: "Vice-presidente · Diretoria", course: "Ciência da Computação", modality: "Vôlei", groups: ["Diretoria", "Vôlei"] },
  { slug: "henry-puton", name: "Henry Puton", role: "Diretor de Esportes · Futsal", course: "Ciência da Computação", modality: "Futsal", groups: ["Diretoria", "Futsal"] },
  { slug: "carlos-eduardo", name: "Carlos Eduardo", role: "Diretor de Tecnologia", course: "Ciência da Computação", modality: "Futsal", groups: ["Diretoria", "Futsal"] },
];

export const achievements = [
  {
    year: "2026",
    result: "Campeão",
    title: "Campeão Intereng — Basquete",
    description: "Uma conquista marcante para o time de Basquete e para toda a comunidade Octacore.",
  },
  {
    year: "2026",
    result: "Vice-campeão",
    title: "Vice-campeão Intereng — Futsal",
    description: "A equipe de Futsal representou a atlética nas quadras e chegou à decisão do torneio.",
  },
];
