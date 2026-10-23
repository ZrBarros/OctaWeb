export type ApiPage<T> = { data: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number } };
export type ApiItem<T> = { data: T };
export type ApiUser = { id: number; nome: string; email: string; curso: string; fotoUrl?: string | null; perfil: "USUARIO" | "ADMIN"; criadoEm: string; atualizadoEm: string };
export type ApiNews = { id: number; slug: string; titulo: string; resumo?: string | null; conteudo: string; imagemCapaUrl?: string | null; categoria: string; autorId: number; autor: { id: number; nome: string }; criadoEm: string; atualizadoEm: string };
export type ApiSchedule = { id: number; diaSemana: number; horaInicio: string; horaFim?: string | null };
export type ApiModality = { id: number; nome: string; slug: string; descricao?: string | null; imagemUrl?: string | null; responsavel?: string | null; localTreino?: string | null; horarios: ApiSchedule[]; integrantes?: { integrante: ApiMember }[]; resultados?: ApiResult[]; eventos?: ApiEvent[] };
export type ApiMember = { id: number; slug: string; nome: string; curso?: string | null; funcao?: string | null; diretoria: boolean; fotoUrl?: string | null; instagram?: string | null; modalidades: { modalidade: Pick<ApiModality, "id" | "nome" | "slug"> }[] };
export type ApiEvent = { id: number; slug: string; titulo: string; descricao?: string | null; tipo: string; dataHora: string; local: string; imagemUrl?: string | null; modalidadeId?: number | null; modalidade?: ApiModality | null; resultado?: ApiResult | null };
export type ApiResult = { id: number; modalidadeId: number; eventoId?: number | null; adversario: string; placarOcta: number; placarAdversario: number; campeonato?: string | null; data: string; modalidade: ApiModality; evento?: ApiEvent | null };
export type ApiAchievement = { id: number; titulo: string; campeonato: string; colocacao: string; ano: number; descricao?: string | null; modalidadeId?: number | null; modalidade?: ApiModality | null };
export type ApiMilestone = { id: number; ano: number; titulo: string; descricao?: string | null; ordem: number };
export type ApiVariation = { id: number; produtoId: number; tamanho: string; estoque: number };
export type ApiProduct = { id: number; slug: string; nome: string; descricao?: string | null; preco: string; categoria: string; imagemUrl?: string | null; ativo: boolean; variacoes: ApiVariation[] };
export type ApiOrderItem = { id: number; quantidade: number; precoUnitario: string; variacao: ApiVariation & { produto: ApiProduct } };
export type ApiOrder = { id: number; status: string; valorTotal: string; nomeContato: string; telefoneContato: string; formaRetirada: string; observacoes?: string | null; criadoEm: string; atualizadoEm: string; usuario: Pick<ApiUser, "id" | "nome" | "email">; itens: ApiOrderItem[] };

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) { super(message); }
}
