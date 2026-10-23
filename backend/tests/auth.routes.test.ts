import Fastify from "fastify";
import cookie from "@fastify/cookie";
import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { loadEnv } from "../src/config/env.js";
import { authRoutes } from "../src/modules/auth/auth.routes.js";

const env = loadEnv({
  NODE_ENV: "test", DATABASE_URL: "postgresql://user:pass@localhost:5432/test", FRONTEND_ORIGIN: "http://localhost:3000", PUBLIC_API_URL: "http://localhost:3333",
  JWT_ACCESS_SECRET: "a".repeat(32), JWT_REFRESH_SECRET: "b".repeat(32), JWT_RESET_SECRET: "c".repeat(32), PASSWORD_RESET_URL: "http://localhost:3000/redefinir-senha",
});

describe("rotas de autenticação", () => {
  const app = Fastify({ logger: false });

  beforeAll(async () => {
    const user = { id: 1, nome: "Admin", email: "admin@example.com", curso: "Computação", senhaHash: await bcrypt.hash("SenhaForte1", 4), fotoUrl: null, perfil: "ADMIN", criadoEm: new Date(), atualizadoEm: new Date() };
    const prisma = { usuario: { findFirst: vi.fn().mockResolvedValue(user), findUnique: vi.fn().mockResolvedValue(user), create: vi.fn(), update: vi.fn() } } as unknown as PrismaClient;
    app.decorate("env", env);
    app.decorate("prisma", prisma);
    app.decorate("authenticate", async () => undefined);
    app.decorate("requireAdmin", async () => undefined);
    await app.register(cookie);
    await app.register(authRoutes, { prefix: "/auth" });
  });

  it("autentica e grava refresh token em cookie httpOnly", async () => {
    const response = await app.inject({ method: "POST", url: "/auth/login", payload: { email: "admin@example.com", password: "SenhaForte1" } });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ data: { user: { id: 1, perfil: "ADMIN" }, accessToken: expect.any(String) } });
    expect(response.headers["set-cookie"]).toContain("HttpOnly");
  });

  it("rejeita credencial inválida", async () => {
    const response = await app.inject({ method: "POST", url: "/auth/login", payload: { email: "admin@example.com", password: "incorreta" } });
    expect(response.statusCode).toBe(401);
  });
});
