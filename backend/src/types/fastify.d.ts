import type { PrismaClient } from "@prisma/client";
import type { AppEnv } from "../config/env.js";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
    env: AppEnv;
    authenticate: (request: FastifyRequest) => Promise<void>;
    requireAdmin: (request: FastifyRequest) => Promise<void>;
  }

  interface FastifyRequest {
    authUser?: { id: number; perfil: "USUARIO" | "ADMIN" };
  }
}
