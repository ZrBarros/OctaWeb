import type { Product } from "@/data/products";
import type { NewsArticle, NewsCategory } from "@/data/news";
import type { AgendaEvent, EventCategory } from "@/data/events";
import type { ApiEvent, ApiNews, ApiProduct } from "./api-types";

const titleCase: Record<string, string> = {
  CAMPEONATOS: "Campeonatos", JOGOS: "Jogos", RESULTADOS: "Resultados", SELETIVAS: "Seletivas", TREINOS: "Treinos", FESTAS: "Festas", EVENTOS: "Eventos", COMUNICADOS: "Comunicados",
  TREINO: "Treino", JOGO: "Jogo", CAMPEONATO: "Campeonato", SELETIVA: "Seletiva", FESTA: "Festa", REUNIAO: "Reunião", EVENTO: "Evento",
  CAMISAS: "Camisas", TIRANTES: "Tirantes", COPOS: "Copos", BONES: "Bonés", ACESSORIOS: "Acessórios", KITS: "Kits",
};

export function mapProduct(item: ApiProduct): Product {
  const variations = item.variacoes.map((variation) => ({ id: variation.id, size: variation.tamanho, stock: variation.estoque }));
  const sizes = variations.some((variation) => variation.size !== "UNICO") ? variations.filter((variation) => variation.stock > 0).map((variation) => variation.size) : undefined;
  return { id: item.id, slug: item.slug, name: item.nome, priceCents: Math.round(Number(item.preco) * 100), description: item.descricao ?? "", category: titleCase[item.categoria] ?? item.categoria, image: item.imagemUrl ?? undefined, alt: `Imagem de ${item.nome}`, sizes, variations };
}

export function mapNews(item: ApiNews): NewsArticle {
  const date = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Maceio" }).format(new Date(item.criadoEm)).replace(" de ", " ").replace(" de ", " ").replace(".", "");
  return { slug: item.slug, category: (titleCase[item.categoria] ?? item.categoria) as NewsCategory, date, dateTime: item.criadoEm, title: item.titulo, summary: item.resumo ?? "", author: item.autor.nome, paragraphs: item.conteudo.split(/\n\s*\n/).filter(Boolean) };
}

export function mapEvent(item: ApiEvent): AgendaEvent {
  const date = new Date(item.dataHora);
  return { id: String(item.id), title: item.titulo, category: (titleCase[item.tipo] ?? item.tipo) as EventCategory, detailSlug: item.slug, dateTime: item.dataHora, day: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", timeZone: "America/Maceio" }).format(date), month: new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "America/Maceio" }).format(date).replace(".", "").toLocaleUpperCase("pt-BR"), time: new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Maceio" }).format(date), place: item.local };
}

export const apiCategory = (label: string) => Object.entries(titleCase).find(([, value]) => value === label)?.[0] ?? label.toLocaleUpperCase("pt-BR");
