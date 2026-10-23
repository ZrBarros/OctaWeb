import { describe, expect, it } from "vitest";
import { loadEnv } from "../src/config/env.js";
import { signToken, verifyToken } from "../src/lib/tokens.js";

const env = loadEnv({
  NODE_ENV: "test", DATABASE_URL: "postgresql://user:pass@localhost:5432/test", FRONTEND_ORIGIN: "http://localhost:3000", PUBLIC_API_URL: "http://localhost:3333",
  JWT_ACCESS_SECRET: "a".repeat(32), JWT_REFRESH_SECRET: "b".repeat(32), JWT_RESET_SECRET: "c".repeat(32), PASSWORD_RESET_URL: "http://localhost:3000/redefinir-senha",
});

describe("tokens", () => {
  it("assina e valida access token", async () => {
    const token = await signToken(env, "access", { sub: "42", perfil: "ADMIN" });
    await expect(verifyToken(env, "access", token)).resolves.toMatchObject({ sub: "42", perfil: "ADMIN", typ: "access" });
  });

  it("não aceita refresh token como access token", async () => {
    const token = await signToken(env, "refresh", { sub: "42", perfil: "ADMIN" });
    await expect(verifyToken(env, "access", token)).rejects.toMatchObject({ statusCode: 401 });
  });
});
