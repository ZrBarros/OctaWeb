import type { FastifyInstance } from "fastify";
import { idParamsSchema, slugParamsSchema } from "../../lib/http.js";
import { StoreRepository } from "./store.repository.js";
import { createOrderSchema, orderQuerySchema, productInputSchema, productQuerySchema, updateOrderStatusSchema } from "./store.schemas.js";
import { StoreService } from "./store.service.js";

export async function publicStoreRoutes(app: FastifyInstance) {
  const service = new StoreService(new StoreRepository(app.prisma));
  app.get("/products", async (request) => service.listProducts(productQuerySchema.parse(request.query), true));
  app.get("/products/:slug", async (request) => ({ data: await service.productBySlug(slugParamsSchema.parse(request.params).slug) }));
  app.post("/orders", { preHandler: app.authenticate }, async (request, reply) => reply.code(201).send({ data: await service.createOrder(request.authUser!.id, createOrderSchema.parse(request.body)) }));
  app.get("/orders", { preHandler: app.authenticate }, async (request) => service.listOrders(orderQuerySchema.parse(request.query), request.authUser!.id));
  app.get("/orders/:id", { preHandler: app.authenticate }, async (request) => ({ data: await service.orderById(idParamsSchema.parse(request.params).id, request.authUser!) }));
}

export async function adminStoreRoutes(app: FastifyInstance) {
  const service = new StoreService(new StoreRepository(app.prisma));
  app.addHook("preHandler", app.requireAdmin);
  app.get("/products", async (request) => service.listProducts(productQuerySchema.parse(request.query), false));
  app.get("/products/:slug", async (request) => ({ data: await service.productBySlug(slugParamsSchema.parse(request.params).slug, true) }));
  app.post("/products", async (request, reply) => reply.code(201).send({ data: await service.createProduct(productInputSchema.parse(request.body)) }));
  app.put("/products/:id", async (request) => ({ data: await service.updateProduct(idParamsSchema.parse(request.params).id, productInputSchema.parse(request.body)) }));
  app.delete("/products/:id", async (request, reply) => { await service.deactivateProduct(idParamsSchema.parse(request.params).id); return reply.code(204).send(); });
  app.get("/orders", async (request) => service.listOrders(orderQuerySchema.parse(request.query)));
  app.get("/orders/:id", async (request) => ({ data: await service.orderById(idParamsSchema.parse(request.params).id, request.authUser!) }));
  app.patch("/orders/:id/status", async (request) => ({ data: await service.updateOrderStatus(idParamsSchema.parse(request.params).id, updateOrderStatusSchema.parse(request.body).status) }));
}
