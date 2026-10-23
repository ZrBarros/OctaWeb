import { Prisma, type PrismaClient } from "@prisma/client";

export class StoreRepository {
  constructor(readonly prisma: PrismaClient) {}

  listProducts(where: Prisma.ProdutoWhereInput, orderBy: Prisma.ProdutoOrderByWithRelationInput, skip: number, take: number) {
    return Promise.all([
      this.prisma.produto.findMany({ where, include: { variacoes: { orderBy: { id: "asc" } } }, orderBy, skip, take }),
      this.prisma.produto.count({ where }),
    ]);
  }
  allProducts(where: Prisma.ProdutoWhereInput) { return this.prisma.produto.findMany({ where, include: { variacoes: { orderBy: { id: "asc" } } } }); }
  productBySlug(slug: string, includeInactive = false) { return this.prisma.produto.findFirst({ where: { slug, ...(includeInactive ? {} : { ativo: true }) }, include: { variacoes: { orderBy: { id: "asc" } } } }); }
  productById(id: number) { return this.prisma.produto.findUnique({ where: { id }, include: { variacoes: true } }); }
  createProduct(data: Prisma.ProdutoCreateInput) { return this.prisma.produto.create({ data, include: { variacoes: true } }); }
  updateProduct(id: number, data: Prisma.ProdutoUpdateInput) { return this.prisma.produto.update({ where: { id }, data, include: { variacoes: { orderBy: { id: "asc" } } } }); }
  deactivateProduct(id: number) { return this.prisma.produto.update({ where: { id }, data: { ativo: false } }); }

  listOrders(where: Prisma.PedidoWhereInput, orderBy: Prisma.PedidoOrderByWithRelationInput, skip: number, take: number) {
    const include = { usuario: { select: { id: true, nome: true, email: true } }, itens: { include: { variacao: { include: { produto: true } } } } } satisfies Prisma.PedidoInclude;
    return Promise.all([this.prisma.pedido.findMany({ where, include, orderBy, skip, take }), this.prisma.pedido.count({ where })]);
  }
  orderById(id: number) { return this.prisma.pedido.findUnique({ where: { id }, include: { usuario: { select: { id: true, nome: true, email: true } }, itens: { include: { variacao: { include: { produto: true } } } } } }); }
  updateOrderStatus(id: number, status: string) { return this.prisma.pedido.update({ where: { id }, data: { status }, include: { usuario: { select: { id: true, nome: true, email: true } }, itens: { include: { variacao: { include: { produto: true } } } } } }); }
}
