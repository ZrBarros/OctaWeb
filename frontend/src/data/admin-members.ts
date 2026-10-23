// Pessoas de exemplo do quadro administrativo do Figma. Não alimentam o mural público.
export type AdminMember = {
  id: number;
  name: string;
  role: string;
  course: string;
  instagram: string;
  image?: string;
  modalityIds?: number[];
  boardMember?: boolean;
};

export const adminMembers: AdminMember[] = [
  { id: 1, name: 'Lucas "Polvo" Andrade', role: "Presidente · Basquete", course: "Ciência da Computação", instagram: "lucas_andrade" },
  { id: 2, name: "Gabriela Vasconcelos", role: "Atleta · Vôlei Feminino", course: "Engenharia de Computação", instagram: "gabi_vascon" },
  { id: 3, name: "Carlos Eduardo", role: "Atleta · Futsal", course: "Ciência da Computação", instagram: "cadu_futsal" },
  { id: 4, name: "Beatriz Martins", role: "Comunicação · Coordenação", course: "Ciência da Computação", instagram: "bia_martins" },
  { id: 5, name: "Mateus Cavalcante", role: "Atleta · Handebol", course: "Engenharia da Computação", instagram: "mateus_caval" },
  { id: 6, name: 'Filipe "Hexa" Rocha', role: "Capitão · E-Sports", course: "Ciência da Computação", instagram: "filipe_hexa" },
];
