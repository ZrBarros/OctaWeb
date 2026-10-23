// Dados da prévia administrativa. Não representam estoque real nem alimentam a loja pública.
export type AdminProduct = {
  id: number;
  name: string;
  category: string;
  priceCents: number;
  stock: number;
  image?: string;
  description?: string;
  active?: boolean;
  variations?: { id?: number; size: string; stock: number }[];
};

export const adminProductCategories = ["Camisas", "Tirantes", "Copos", "Bonés", "Acessórios", "Kits"] as const;

export const adminProducts: AdminProduct[] = [
  { id: 1, name: "Camisa Oficial Octacore 2026", category: "Uniformes", priceCents: 5990, stock: 45, image: "/images/camisa-edicao-especial.jpg" },
  { id: 2, name: "Tirante Oficial Sublimado", category: "Acessórios", priceCents: 1500, stock: 120 },
  { id: 3, name: "Copo Térmico Polvo Gigante", category: "Utilitários", priceCents: 4500, stock: 14 },
  { id: 4, name: "Boné Snapback Octa Premium", category: "Uniformes", priceCents: 3990, stock: 8 },
  { id: 5, name: "Caneca Acrílica Degradê", category: "Acessórios", priceCents: 2000, stock: 0 },
];
