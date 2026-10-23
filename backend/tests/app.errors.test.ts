import Fastify, { type FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { installErrorHandlers } from "../src/app.js";
import { loadEnv } from "../src/config/env.js";
import { authRoutes } from "../src/modules/auth/auth.routes.js";

const env = loadEnv({
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://user:pass@localhost:5432/test",
  FRONTEND_ORIGIN: "http://localhost:3000",
  PUBLIC_API_URL: "http://localhost:3333",
  JWT_ACCESS_SECRET: "a".repeat(32),
  JWT_REFRESH_SECRET: "b".repeat(32),
  JWT_RESET_SECRET: "c".repeat(32),
  PASSWORD_RESET_URL: "http://localhost:3000/redefinir-senha",
});

describe("tratamento global de erros", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    app.decorate("env", env);
    app.decorate("prisma", {} as PrismaClient);
    app.decorate("authenticate", async () => undefined);
    app.decorate("requireAdmin", async () => undefined);
    await app.register(cookie);
    installErrorHandlers(app);
    await app.register(authRoutes, { prefix: "/api/v1/auth" });
  });
  afterAll(async () => { await app.close(); });

  it("transforma validação de rota registrada em resposta 422", async () => {
    const response = await app.inject({ method: "POST", url: "/api/v1/auth/register", payload: { name: "Henry Calmon", email: "hnc@ic.ufal.br", course: "Ciências da Computação", password: "semapenasnumero1" } });
    expect(response.statusCode).toBe(422);
    expect(response.json()).toMatchObject({ error: { code: "VALIDATION_ERROR", details: { fieldErrors: { password: ["Inclua uma letra maiúscula."] } } } });
  });
});
