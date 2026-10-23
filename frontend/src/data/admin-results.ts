// Placares demonstrativos do quadro administrativo do Figma. Não alimentam outras páginas.
export type AdminResult = {
  id: number;
  modality: string;
  opponent: string;
  ourScore: number;
  opponentScore: number;
  competition: string;
  date: string;
  modalityId?: number;
  eventId?: number | null;
};

export type ResultStatus = "Vitória" | "Empate" | "Derrota";

export function resultStatus(result: AdminResult): ResultStatus {
  if (result.ourScore > result.opponentScore) return "Vitória";
  if (result.ourScore < result.opponentScore) return "Derrota";
  return "Empate";
}

export const adminResults: AdminResult[] = [
  { id: 1, modality: "Futsal Masculino", opponent: "Carcará Engenharia", ourScore: 4, opponentScore: 1, competition: "Taça UFAL 2026", date: "2026-09-20" },
  { id: 2, modality: "Basquete Masculino", opponent: "Fênix Medicina", ourScore: 72, opponentScore: 64, competition: "Copa Interatléticas", date: "2026-09-14" },
  { id: 3, modality: "Vôlei Misto", opponent: "Búfalos Direito", ourScore: 1, opponentScore: 2, competition: "Liga das Estrelas", date: "2026-09-10" },
  { id: 4, modality: "Futsal Feminino", opponent: "Harpias Odonto", ourScore: 5, opponentScore: 2, competition: "Taça UFAL 2026", date: "2026-09-05" },
  { id: 5, modality: "E-Sports CS2", opponent: "Gárgulas Psicologia", ourScore: 16, opponentScore: 14, competition: "E-Games Alagoas", date: "2026-08-28" },
];
