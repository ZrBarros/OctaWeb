// Números demonstrativos do quadro de ranking no Figma. Ainda não vêm de partidas reais.
export const seasonSummary = [
  { label: "Jogos Disputados", value: 20, tone: "purple" },
  { label: "Vitórias", value: 14, tone: "green" },
  { label: "Empates", value: 2, tone: "yellow" },
  { label: "Derrotas", value: 4, tone: "red" },
] as const;

export const leagueRanking = [
  { position: 1, name: "OCTACORE (UFAL)", points: 44, isOctacore: true },
  { position: 2, name: "Atlética Adversária X", points: 38, isOctacore: false },
  { position: 3, name: "Atlética Adversária Y", points: 35, isOctacore: false },
] as const;

export const modalityPerformance = [
  { name: "Futsal", percentage: 85, tone: "purple" },
  { name: "Basquete", percentage: 70, tone: "orange" },
  { name: "Voleibol", percentage: 90, tone: "green" },
  { name: "Handebol", percentage: 60, tone: "yellow" },
] as const;
