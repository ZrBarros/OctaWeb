// Dados demonstrativos do perfil de atleta no Figma. Ainda não vêm do elenco ou da API.
export type AthleteResult = {
  opponent: string;
  contribution: string;
  date: string;
  score: string;
  outcome: "Vitória" | "Empate" | "Derrota";
};

export type AthleteProfile = {
  slug: string;
  name: string;
  initials: string;
  modality: string;
  shirtNumber: number;
  biography: string;
  statistics: { label: string; value: number }[];
  recentResults: AthleteResult[];
};

export const athleteProfiles: AthleteProfile[] = [
  {
    slug: "joao-silva",
    name: "João Silva",
    initials: "JS",
    modality: "Futsal Masculino",
    shirtNumber: 10,
    biography: "Estudante de Ciência da Computação (UFAL), atleta oficial da Octacore desde 2024. Atua como ala ofensivo com velocidade e drible rápido.",
    statistics: [
      { label: "Jogos Disputados", value: 12 },
      { label: "Gols Marcados", value: 8 },
      { label: "Assistências", value: 5 },
      { label: "Cartões Amarelos", value: 2 },
    ],
    recentResults: [
      { opponent: "Atlética Direito", contribution: "1 Gol, Ala Titular", date: "2026-09-18", score: "4 × 1", outcome: "Vitória" },
      { opponent: "Computação Estácio", contribution: "Ala Titular", date: "2026-09-12", score: "2 × 2", outcome: "Empate" },
      { opponent: "Medicina UFAL", contribution: "2 Gols, Destaque da Partida", date: "2026-09-05", score: "3 × 1", outcome: "Vitória" },
    ],
  },
];

export function athleteProfileHref(name: string): string | undefined {
  const athlete = athleteProfiles.find((profile) => profile.name === name);
  return athlete ? `/atletas/${athlete.slug}` : undefined;
}
