export type Modality = {
  slug: string;
  name: string;
  code: string;
  description: string;
  introduction?: string;
};

// Dados de apresentação das cinco modalidades no protótipo do Figma.
export const modalities: Modality[] = [
  {
    slug: "futsal",
    name: "Futsal",
    code: "M01",
    description: "Treinos focados na dinâmica de passes rápidos e finalização cirúrgica.",
    introduction: "A equipe de futsal é uma das forças mais tradicionais da nossa atlética, trazendo títulos e mantendo um cronograma rigoroso de treinamentos e desenvolvimento tático.",
  },
  {
    slug: "basquete",
    name: "Basquete",
    code: "M02",
    description: "Tradição de arremessos de alta precisão e forte defesa na área do garrafão.",
  },
  {
    slug: "volei",
    name: "Vôlei",
    code: "M03",
    description: "Muralhas na rede e levantamentos perfeitos preparando os ataques.",
  },
  {
    slug: "handebol",
    name: "Handebol",
    code: "M04",
    description: "Explosividade nas infiltrações e excelente preparo tático defensivo.",
  },
  {
    slug: "e-sports",
    name: "E-sports",
    code: "M05",
    description: "Treinos dedicados à estratégia de mapa, comunicação fluida e campeonatos digitais.",
  },
];

export const futsalDetails = {
  trainingTime: "Terças e Quintas às 18h",
  coach: "João Silva (Diretoria de Esportes)",
  trainingPlace: "Ginásio de Esportes da UFAL",
  roster: [
    "Marcos Lima (Goleiro)",
    "João Silva (Fixo)",
    "Felipe Rocha (Ala)",
    "Lucas Mendes (Ala)",
    "Guilherme Souza (Pivô)",
  ],
  lastResult: "Octa 5 x 2 Adversário",
  lastResultContext: "Campeonato Interatléticas · Maceió",
  nextMatch: "Octacore vs Computação adversária",
  nextMatchDate: "25 de Setembro às 20h",
};

export const basqueteDetails = {
  trainingTime: "Sábado às 14h",
  coach: "João Lima",
  trainingPlace: "Pavilhão do basquete",
  roster: [
    "Zeca Rocha",
    "João Lima",
    "Jose Milton",
    "Diego Mateus",
    "Davi Muritiba",
    "Renato",
    "Arthur Vinicius",
    "Arthur Lucas",
    "Teodozio",
  ],
};
