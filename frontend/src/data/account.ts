// Conteúdo demonstrativo das telas de conta; não representa um usuário autenticado.
export const demoProfile = {
  initials: "CE",
  name: "Carlos Eduardo",
  role: "Atleta de Futsal & Torcedor",
  course: "Ciência da Computação (UFAL)",
  email: "carlos.eduardo@ic.ufal.br",
  memberSince: "Março, 2024",
};

export const demoOrder = {
  number: "1032",
  status: "Pendente de validação",
  date: "18 de Setembro, 2026",
  items: [
    { name: "Camisa Oficial Octacore", detail: "Tamanho M · Quantidade: 1", price: "R$ 59,90" },
    { name: "Tirante Octacore", detail: "Sublimado 40mm · Quantidade: 2", price: "R$ 30,00" },
  ],
  steps: ["Pendente", "Confirmado", "Em separação", "Disponível"],
  payment: "PIX Simulado",
  total: "R$ 89,90",
};
