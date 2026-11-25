// Referências visuais legadas; a História pública consulta os marcos pela API.
export const historyMilestones = [
  {
    year: "2018",
    label: "Fundação",
    title: "A Fundação da Octacore",
    description: "A Atlética Octacore foi fundada em 2018.",
  },
  {
    year: "2026",
    label: "Aniversário",
    title: "Oito anos de Octacore",
    description: "A atlética completou oito anos em 2026.",
  },
  {
    year: "2026",
    label: "Conquista",
    title: "Primeiro título do INTERENG",
    description: "A Octacore foi campeã do INTERENG pela primeira vez em 2026.",
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
