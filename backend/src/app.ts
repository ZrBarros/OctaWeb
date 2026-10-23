import Fastify, { type FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import type { AppEnv } from "./config/env.js";
import { AppError } from "./lib/errors.js";
import { adminRoutes } from "./modules/admin/admin.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { adminContentRoutes, publicContentRoutes } from "./modules/content/content.routes.js";
import { adminStoreRoutes, publicStoreRoutes } from "./modules/store/store.routes.js";
import { publicUploadRoutes, uploadRoutes } from "./modules/uploads/upload.routes.js";
import authPlugin from "./plugins/auth.js";
import prismaPlugin from "./plugins/prisma.js";

export function installErrorHandlers(app: FastifyInstance) {
  app.setNotFoundHandler((_request, reply) => reply.code(404).send({ error: { code: "ROUTE_NOT_FOUND", message: "Rota não encontrada." } }));
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) return reply.code(422).send({ error: { code: "VALIDATION_ERROR", message: "Dados inválidos.", details: error.flatten() } });
    if (error instanceof AppError) return reply.code(error.statusCode).send({ error: { code: error.code, message: error.message, ...(error.details !== undefined ? { details: error.details } : {}) } });
    if (typeof error === "object" && error !== null) {
      const clientError = error as { statusCode?: number; code?: string; message?: string };
      if (clientError.statusCode && clientError.statusCode >= 400 && clientError.statusCode < 500) return reply.code(clientError.statusCode).send({ error: { code: clientError.code ?? "BAD_REQUEST", message: clientError.message ?? "Requisição inválida." } });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") return reply.code(409).send({ error: { code: "CONFLICT", message: "Já existe um registro com estes dados únicos." } });
      if (error.code === "P2034") return reply.code(409).send({ error: { code: "TRANSACTION_CONFLICT", message: "Conflito de concorrência. Tente novamente." } });
      if (error.code === "P2003" || error.code === "P2014") return reply.code(409).send({ error: { code: "RELATION_CONFLICT", message: "A operação viola um relacionamento existente." } });
      if (error.code === "P2025") return reply.code(404).send({ error: { code: "NOT_FOUND", message: "Registro não encontrado." } });
    }
    request.log.error({ err: error }, "Erro não tratado");
    return reply.code(500).send({ error: { code: "INTERNAL_ERROR", message: "Ocorreu um erro interno." } });
  });
}

export async function buildApp(env: AppEnv) {
  const app = Fastify({
    logger: { level: env.NODE_ENV === "test" ? "silent" : "info", redact: ["req.headers.authorization", "req.headers.cookie", "res.headers.set-cookie", "password", "senha", "token"] },
    bodyLimit: 1_000_000,
    trustProxy: env.NODE_ENV === "production",
  });
  app.decorate("env", env);
  await app.register(cors, { origin: env.FRONTEND_ORIGIN, credentials: true, methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] });
  await app.register(helmet, { contentSecurityPolicy: env.NODE_ENV === "production" });
  await app.register(cookie);
  await app.register(rateLimit, { max: 120, timeWindow: "1 minute" });
  await app.register(multipart, { limits: { files: 1, fileSize: env.MAX_UPLOAD_BYTES } });
  await app.register(swagger, { openapi: { info: { title: "Octacore API", version: "1.0.0", description: "API REST da plataforma Octacore" }, servers: [{ url: env.PUBLIC_API_URL }] } });
  await app.register(prismaPlugin);
  await app.register(authPlugin);

  installErrorHandlers(app);

  app.get("/health", { logLevel: "silent" }, async () => {
    await app.prisma.$queryRaw`SELECT 1`;
    return { status: "ok", database: "connected", timestamp: new Date().toISOString() };
  });
  app.get("/docs/openapi.json", { logLevel: "silent" }, async () => app.swagger());
  await app.register(authRoutes, { prefix: "/api/v1/auth" });
  await app.register(publicContentRoutes, { prefix: "/api/v1" });
  await app.register(publicStoreRoutes, { prefix: "/api/v1" });
  await app.register(adminContentRoutes, { prefix: "/api/v1/admin" });
  await app.register(adminStoreRoutes, { prefix: "/api/v1/admin" });
  await app.register(adminRoutes, { prefix: "/api/v1/admin" });
  await app.register(uploadRoutes, { prefix: "/api/v1/admin/uploads" });
  await app.register(publicUploadRoutes, { prefix: "/uploads" });
  return app;
}
