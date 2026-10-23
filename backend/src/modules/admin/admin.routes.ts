import type { FastifyInstance } from "fastify";
import { Prisma } from "@prisma/client";
import { conflict, notFound } from "../../lib/errors.js";
import { cleanUser, idParamsSchema, pageResult, paginationArgs } from "../../lib/http.js";
import { adminUserInputSchema, userQuerySchema } from "./admin.schemas.js";

export async function adminRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.requireAdmin);

  app.get("/users", async (request) => {
    const query = userQuerySchema.parse(request.query);
    const where: Prisma.UsuarioWhereInput = { ...(query.role ? { perfil: query.role } : {}), ...(query.search ? { OR: [{ nome: { contains: query.search, mode: "insensitive" } }, { email: { contains: query.search, mode: "insensitive" } }, { curso: { contains: query.search, mode: "insensitive" } }] } : {}) };
    const { skip, take } = paginationArgs(query);
    const [users, total] = await Promise.all([app.prisma.usuario.findMany({ where, orderBy: { nome: "asc" }, skip, take }), app.prisma.usuario.count({ where })]);
    return pageResult(users.map(cleanUser), total, query);
  });

  app.get("/users/:id", async (request) => {
    const user = await app.prisma.usuario.findUnique({ where: { id: idParamsSchema.parse(request.params).id } });
    if (!user) throw notFound("Usuário");
    return { data: cleanUser(user) };
  });

  app.put("/users/:id", async (request) => {
    const id = idParamsSchema.parse(request.params).id;
    const input = adminUserInputSchema.parse(request.body);
    if (id === request.authUser!.id && input.role !== "ADMIN") throw conflict("Não é possível remover o próprio acesso administrativo.");
    const existing = await app.prisma.usuario.findUnique({ where: { id } });
    if (!existing) throw notFound("Usuário");
    const emailOwner = await app.prisma.usuario.findFirst({ where: { email: { equals: input.email, mode: "insensitive" }, NOT: { id } } });
    if (emailOwner) throw conflict("Já existe uma conta com este e-mail.");
    const user = await app.prisma.usuario.update({ where: { id }, data: { nome: input.name, email: input.email, curso: input.course, fotoUrl: input.photoUrl, perfil: input.role } });
    return { data: cleanUser(user) };
  });

  app.delete("/users/:id", async (request, reply) => {
    const id = idParamsSchema.parse(request.params).id;
    if (id === request.authUser!.id) throw conflict("Não é possível excluir a própria conta administrativa.");
    const user = await app.prisma.usuario.findUnique({ where: { id } });
    if (!user) throw notFound("Usuário");
    await app.prisma.usuario.delete({ where: { id } });
    return reply.code(204).send();
  });

  app.get("/dashboard", async () => {
    const now = new Date();
    const inFifteenDays = new Date(now.getTime() + 15 * 86400000);
    const [users, products, pendingOrders, upcomingEvents, news, sales] = await Promise.all([
      app.prisma.usuario.count(),
      app.prisma.produto.count({ where: { ativo: true } }),
      app.prisma.pedido.count({ where: { status: "PENDENTE" } }),
      app.prisma.evento.count({ where: { dataHora: { gte: now, lte: inFifteenDays } } }),
      app.prisma.noticia.count(),
      app.prisma.$queryRaw<Array<{ month: Date; amount: Prisma.Decimal }>>(Prisma.sql`
        SELECT date_trunc('month', criado_em) AS month, COALESCE(SUM(valor_total), 0) AS amount
        FROM octacore.pedido
        WHERE criado_em >= ${new Date(now.getFullYear(), now.getMonth() - 11, 1)} AND status <> 'CANCELADO'
        GROUP BY 1 ORDER BY 1
      `),
    ]);
    return { data: { metrics: { users, products, pendingOrders, upcomingEvents, news }, sales: sales.map((item) => ({ month: item.month, amountCents: Math.round(Number(item.amount) * 100) })), activities: [] } };
  });
}
