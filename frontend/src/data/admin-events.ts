// Exemplos exclusivos do painel: as alterações não modificam a agenda pública.
export type AdminEvent = {
  id: number;
  title: string;
  category: string;
  dateTime: string;
  description: string;
  place: string;
  image?: string;
  modalityId?: number | null;
};

export const adminEventCategories = ["Jogo", "Campeonato", "Seletiva", "Treino", "Festa", "Reunião", "Outro"] as const;

export const adminEvents: AdminEvent[] = [
  { id: 1, title: "Cerimônia de Abertura InterUFAL 2026", category: "Esportivo", dateTime: "2026-09-22T18:00", description: "Abertura oficial do maior campeonato entre cursos da universidade.", place: "Ginásio Central da UFAL" },
  { id: 2, title: "Grande Seletiva de Vôlei Masculino e Feminino", category: "Seletiva", dateTime: "2026-09-24T17:00", description: "Quer fazer parte do time do polvo? Traga o esforço que nós ensinamos a forma.", place: "Quadra de Areia B" },
  { id: 3, title: "Treino Preparatório Especial - Futsal", category: "Treino", dateTime: "2026-09-27T20:00", description: "Último treino tático oficial antes do clássico de sábado.", place: "Quadra Poliesportiva C" },
  { id: 4, title: "Integração de Outono: Festa do Polvo", category: "Festa", dateTime: "2026-10-03T22:00", description: "Festa oficial de recepção dos novos calouros da Computação.", place: "Espaço Multicultural Maceió" },
];
