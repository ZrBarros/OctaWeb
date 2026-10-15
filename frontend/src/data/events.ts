export const eventCategories = [
  "Todos",
  "Treino",
  "Jogo",
  "Campeonato",
  "Seletiva",
  "Festa",
  "Reunião",
  "Evento",
] as const;

export type EventCategory = Exclude<(typeof eventCategories)[number], "Todos">;

export type AgendaEvent = {
  id: string;
  title: string;
  category: EventCategory;
  detailSlug?: string;
  dateTime: string;
  day: string;
  month: string;
  time: string;
  place: string;
};

// Dados de exemplo do protótipo e dos compromissos mostrados na Home.
export const agendaEvents: AgendaEvent[] = [
  {
    id: "treino-basquete-22-set",
    title: "Treino Basquete",
    category: "Treino",
    dateTime: "2026-09-22T18:00:00",
    day: "22",
    month: "SET",
    time: "18:00",
    place: "Quadra Poliesportiva",
  },
  {
    id:"reuniao-alinhamento-20-out",
    title: "Reunião de alinhamento Intereng",
    category: "Reunião",
    detailSlug: "reuniao-alinhamento-intereng",
    dateTime:"2026-10-20T14:00:00",
    day: "20",
    month: "OUT",
    time: "14:00",
    place: "NEES"
  },
  {
    id: "treino-volei-24-set",
    title: "Treino de Vôlei - Octacore",
    category: "Treino",
    detailSlug: "treino-volei-octacore",
    dateTime: "2026-09-24T18:00:00",
    day: "24",
    month: "SET",
    time: "18:00",
    place: "Quadra Geral - UFAL",
  },
  {
    id: "seletiva-volei-24-set",
    title: "Seletiva Vôlei",
    category: "Seletiva",
    dateTime: "2026-09-24T17:00:00",
    day: "24",
    month: "SET",
    time: "17:00",
    place: "Ginásio Principal",
  },
  {
    id: "jogo-atletica-x-27-set",
    title: "Octa x Atlética X",
    category: "Jogo",
    dateTime: "2026-09-27T20:00:00",
    day: "27",
    month: "SET",
    time: "20:00",
    place: "Arena UFAL",
  },
  {
    id: "treino-futsal-30-set",
    title: "Treino Futsal",
    category: "Treino",
    dateTime: "2026-09-30T18:00:00",
    day: "30",
    month: "SET",
    time: "18:00",
    place: "Ginásio Principal",
  },
  {
    id: "festa-octacore-03-out",
    title: "Festa Octacore",
    category: "Festa",
    dateTime: "2026-10-03T22:00:00",
    day: "03",
    month: "OUT",
    time: "22:00",
    place: "Local a confirmar",
  },
  {
    id: "jogo-protendidos-20-nov",
    title: "Octa x Protendidos",
    category: "Jogo",
    detailSlug: "octa-x-protendidos",
    dateTime: "2026-11-20T15:00:00",
    day: "20",
    month: "NOV",
    time: "15:00",
    place: "Local a confirmar",
  },
];

export function getUpcomingAgendaEvents() {
  return agendaEvents
    .filter((event) => event.detailSlug && new Date(event.dateTime).getTime() >= Date.now())
    .sort((a, b) => a.dateTime.localeCompare(b.dateTime));
}
