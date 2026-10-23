export type Product = {
  id?: number;
  slug: string;
  name: string;
  priceCents: number;
  description: string;
  category: string;
  image?: string;
  alt?: string;
  sizes?: string[];
  variations?: { id: number; size: string; stock: number }[];
};

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export const products: Product[] = [
  {
    slug: "camisa-especial-octacore",
    name: "Camisa Especial Octacore",
    priceCents: 5990,
    description: "Camisa esportiva premium · 2026",
    category: "Camisas",
    image: "/images/camisa-edicao-especial.jpg",
    alt: "Camisa especial da Octacore, frente e verso",
    sizes: ["P", "M", "G", "GG"],
  },
  { slug: "camisa-passeio-2026", name: "Camisa Passeio 2026", priceCents: 6500, description: "Conforto e identidade para o dia a dia", category: "Camisas", image: "/images/camisa-passeio-2026.png", alt: "Camisa branca Octacore 2026, vista de frente e de costas", sizes: ["P", "M", "G", "GG"] },
  { slug: "caneca-octacore", name: "Caneca Octacore", priceCents: 4500, description: "Perfeita para curtir os eventos", category: "Copos", image: "/images/caneca-octacore-previa-fundo-branco.png", alt: "Duas vistas da caneca roxa Octacore: escudo da atlética e frase Hoje nem o Google me acha" },
  { slug: "tirante-octacore", name: "Tirante Octacore", priceCents: 3990, description: "Acessório oficial da atlética", category: "Tirantes", image: "/images/tirante-octacore-previa-fundo-branco.png", alt: "Frente laranja e verso roxo do tirante Octacore, com estampas da atlética" },
];
