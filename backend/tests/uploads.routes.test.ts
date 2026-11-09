import Fastify, { type FastifyInstance } from "fastify";
import helmet from "@fastify/helmet";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { loadEnv } from "../src/config/env.js";
import { publicUploadRoutes } from "../src/modules/uploads/upload.routes.js";

describe("imagens públicas enviadas pelo admin", () => {
  let app: FastifyInstance;
  let directory: string;
  let filename: string;

  beforeAll(async () => {
    directory = await mkdtemp(path.join(tmpdir(), "octaweb-uploads-"));
    filename = `${randomUUID()}.png`;
    await writeFile(path.join(directory, filename), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    app = Fastify({ logger: false });
    app.decorate("env", loadEnv({
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://user:pass@localhost:5432/test",
      FRONTEND_ORIGIN: "http://localhost:3000",
      PUBLIC_API_URL: "http://localhost:3333",
      JWT_ACCESS_SECRET: "a".repeat(32),
      JWT_REFRESH_SECRET: "b".repeat(32),
      JWT_RESET_SECRET: "c".repeat(32),
      PASSWORD_RESET_URL: "http://localhost:3000/redefinir-senha",
      UPLOAD_DIR: directory,
    }));
    await app.register(helmet);
    await app.register(publicUploadRoutes, { prefix: "/uploads" });
  });

  afterAll(async () => {
    await app?.close();
    if (directory) await rm(directory, { recursive: true, force: true });
  });

  it("permite exibir a imagem no frontend em outra porta", async () => {
    const response = await app.inject({ method: "GET", url: `/uploads/${filename}` });
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("image/png");
    expect(response.headers["cross-origin-resource-policy"]).toBe("cross-origin");
  });
});
