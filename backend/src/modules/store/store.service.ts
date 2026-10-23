import { Prisma } from "@prisma/client";
import { conflict, forbidden, notFound, unprocessable } from "../../lib/errors.js";
import { makeSlug, pageResult, paginationArgs } from "../../lib/http.js";
import type { z } from "zod";
import type { createOrderSchema, orderQuerySchema, productInputSchema, productQuerySchema } from "./store.schemas.js";
import { StoreRepository } from "./store.repository.js";

type ProductInput = z.infer<typeof productInputSchema>;
type ProductQuery = z.infer<typeof productQuerySchema>;
type CreateOrderInput = z.infer<typeof createOrderSchema>;
type OrderQuery = z.infer<typeof orderQuerySchema>;

const allowedTransitions: Record<string, string[]> = {
  PENDENTE: ["CONFIRMADO", "CANCELADO"],
  CONFIRMADO: ["EM_SEPARACAO", "CANCELADO"],
  EM_SEPARACAO: ["DISPONIVEL_RETIRADA", "CANCELADO"],
  DISPONIVEL_RETIRADA: ["ENTREGUE", "CANCELADO"],
  ENTREGUE: [],
  CANCELADO: [],
};

export class StoreService {
  constructor(private readonly repository: StoreRepository) {}

  async listProducts(query: ProductQuery, publicOnly: boolean) {
    const where: Prisma.ProdutoWhereInput = { ...(publicOnly ? { ativo: true } : query.active !== undefined ? { ativo: query.active } : {}), ...(query.category ? { categoria: query.category } : {}), ...(query.search ? { OR: [{ nome: { contains: query.search, mode: "insensitive" } }, { descricao: { contains: query.search, mode: "insensitive" } }] } : {}) };
    const { skip, take } = paginationArgs(query);
    if (query.sortBy === "stock") {
      const all = await this.repository.allProducts(where);
      all.sort((first, second) => {
        const difference = first.variacoes.reduce((total, item) => total + item.estoque, 0) - second.variacoes.reduce((total, item) => total + item.estoque, 0);
        return query.sort === "asc" ? difference : -difference;
      });
      return pageResult(all.slice(skip, skip + take), all.length, query);
    }
    const orderBy: Prisma.ProdutoOrderByWithRelationInput = query.sortBy === "price" ? { preco: query.sort } : { nome: query.sort };
    const [items, total] = await this.repository.listProducts(where, orderBy, skip, take); return pageResult(items, total, query);
  }
  async productBySlug(slug: string, includeInactive = false) { const product = await this.repository.productBySlug(slug, includeInactive); if (!product) throw notFound("Produto"); return product; }
  createProduct(input: ProductInput) { return this.repository.createProduct({ slug: input.slug ?? makeSlug(input.name), nome: input.name, descricao: input.description, preco: new Prisma.Decimal(input.priceCents).div(100), categoria: input.category, imagemUrl: input.imageUrl, ativo: input.active, variacoes: { create: input.variations.map((variation) => ({ tamanho: variation.size, estoque: variation.stock })) } }); }
  async updateProduct(id: number, input: ProductInput) {
    const current = await this.repository.productById(id); if (!current) throw notFound("Produto");
    const requestedIds = input.variations.flatMap((item) => item.id ? [item.id] : []);
    if (requestedIds.some((variationId) => !current.variacoes.some((item) => item.id === variationId))) throw unprocessable("Uma variação não pertence ao produto informado.");
    return this.repository.updateProduct(id, { slug: input.slug ?? makeSlug(input.name), nome: input.name, descricao: input.description, preco: new Prisma.Decimal(input.priceCents).div(100), categoria: input.category, imagemUrl: input.imageUrl, ativo: input.active, variacoes: { deleteMany: { id: { notIn: requestedIds.length ? requestedIds : [-1] } }, upsert: input.variations.filter((item) => item.id).map((item) => ({ where: { id: item.id! }, update: { tamanho: item.size, estoque: item.stock }, create: { tamanho: item.size, estoque: item.stock } })), create: input.variations.filter((item) => !item.id).map((item) => ({ tamanho: item.size, estoque: item.stock })) } });
  }
  async deactivateProduct(id: number) { if (!(await this.repository.productById(id))) throw notFound("Produto"); await this.repository.deactivateProduct(id); }

  async createOrder(userId: number, input: CreateOrderInput) {
    const combined = new Map<number, number>();
    for (const item of input.items) combined.set(item.variationId, (combined.get(item.variationId) ?? 0) + item.quantity);
    if ([...combined.values()].some((quantity) => quantity > 99)) throw unprocessable("A quantidade máxima por variação é 99.");
    const orderId = await this.repository.prisma.$transaction(async (tx) => {
      const order = await tx.pedido.create({ data: { usuarioId: userId, nomeContato: input.contactName, telefoneContato: input.contactPhone, formaRetirada: input.pickupMethod, observacoes: input.notes } });
      for (const [variationId, quantity] of combined) {
        const variation = await tx.produtoVariacao.findUnique({ where: { id: variationId }, include: { produto: true } });
        if (!variation?.produto.ativo) throw unprocessable(`Variação ${variationId} indisponível.`);
        const changed = await tx.produtoVariacao.updateMany({ where: { id: variationId, estoque: { gte: quantity } }, data: { estoque: { decrement: quantity } } });
        if (changed.count !== 1) throw conflict(`Estoque insuficiente para ${variation.produto.nome}, tamanho ${variation.tamanho}.`);
        await tx.itemPedido.create({ data: { pedidoId: order.id, variacaoId: variation.id, quantidade: quantity, precoUnitario: variation.produto.preco } });
      }
      return order.id;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return this.repository.orderById(orderId);
  }

  async listOrders(query: OrderQuery, userId?: number) {
    const where: Prisma.PedidoWhereInput = { ...(userId ? { usuarioId: userId } : {}), ...(query.status ? { status: query.status } : {}), ...(query.search ? { OR: [{ nomeContato: { contains: query.search, mode: "insensitive" } }, { usuario: { OR: [{ nome: { contains: query.search, mode: "insensitive" } }, { email: { contains: query.search, mode: "insensitive" } }] } }, ...(Number.isSafeInteger(Number(query.search)) ? [{ id: Number(query.search) }] : [])] } : {}) };
    const { skip, take } = paginationArgs(query); const [items, total] = await this.repository.listOrders(where, { criadoEm: query.sort }, skip, take); return pageResult(items, total, query);
  }
  async orderById(id: number, actor: { id: number; perfil: string }) { const order = await this.repository.orderById(id); if (!order) throw notFound("Pedido"); if (actor.perfil !== "ADMIN" && order.usuarioId !== actor.id) throw forbidden(); return order; }
  async updateOrderStatus(id: number, status: string) {
    return this.repository.prisma.$transaction(async (tx) => {
      await tx.$queryRaw(Prisma.sql`SELECT id FROM octacore.pedido WHERE id = ${id} FOR UPDATE`);
      const order = await tx.pedido.findUnique({ where: { id }, include: { usuario: { select: { id: true, nome: true, email: true } }, itens: { include: { variacao: { include: { produto: true } } } } } });
      if (!order) throw notFound("Pedido");
      if (!allowedTransitions[order.status]?.includes(status)) throw unprocessable(`Transição de ${order.status} para ${status} não permitida.`);
      if (status === "CANCELADO") for (const item of order.itens) await tx.produtoVariacao.update({ where: { id: item.variacaoId }, data: { estoque: { increment: item.quantidade } } });
      return tx.pedido.update({ where: { id }, data: { status }, include: { usuario: { select: { id: true, nome: true, email: true } }, itens: { include: { variacao: { include: { produto: true } } } } } });
    });
  }
}
