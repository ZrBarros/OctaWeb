import type { FastifyInstance, FastifyReply } from "fastify";
import { unauthorized } from "../../lib/errors.js";
import { AuthRepository } from "./auth.repository.js";
import { changePasswordSchema, forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema, updateProfileSchema } from "./auth.schemas.js";
import { AuthService } from "./auth.service.js";
import { MailService } from "./mail.service.js";

const refreshCookie = "octacore_refresh";

function setRefreshCookie(app: FastifyInstance, reply: FastifyReply, token: string) {
  reply.setCookie(refreshCookie, token, {
    httpOnly: true,
    secure: app.env.COOKIE_SECURE,
    sameSite: "strict",
    path: "/api/v1/auth",
    maxAge: 30 * 24 * 60 * 60,
  });
}

export async function authRoutes(app: FastifyInstance) {
  const service = new AuthService(new AuthRepository(app.prisma), new MailService(app.env), app.env);

  app.post("/register", { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } }, async (request, reply) => {
    const result = await service.register(registerSchema.parse(request.body));
    setRefreshCookie(app, reply, result.refreshToken);
    return reply.code(201).send({ data: { user: result.user, accessToken: result.accessToken } });
  });

  app.post("/login", { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } }, async (request, reply) => {
    const result = await service.login(loginSchema.parse(request.body));
    setRefreshCookie(app, reply, result.refreshToken);
    return { data: { user: result.user, accessToken: result.accessToken } };
  });

  app.post("/refresh", async (request, reply) => {
    const token = request.cookies[refreshCookie];
    if (!token) throw unauthorized("Refresh token ausente.");
    const result = await service.refresh(token);
    setRefreshCookie(app, reply, result.refreshToken);
    return { data: { accessToken: result.accessToken } };
  });

  app.post("/logout", async (_request, reply) => {
    reply.clearCookie(refreshCookie, { path: "/api/v1/auth" });
    return reply.code(204).send();
  });

  app.post("/forgot-password", { config: { rateLimit: { max: 5, timeWindow: "15 minutes" } } }, async (request, reply) => {
    const { email } = forgotPasswordSchema.parse(request.body);
    await service.forgotPassword(email);
    return reply.code(202).send({ message: "Se o e-mail estiver cadastrado, enviaremos as instruções de redefinição." });
  });

  app.post("/reset-password", async (request, reply) => {
    const input = resetPasswordSchema.parse(request.body);
    await service.resetPassword(input.token, input.password);
    reply.clearCookie(refreshCookie, { path: "/api/v1/auth" });
    return reply.code(204).send();
  });

  app.get("/me", { preHandler: app.authenticate }, async (request) => ({ data: await service.me(request.authUser!.id) }));

  app.patch("/me", { preHandler: app.authenticate }, async (request) => ({ data: await service.updateProfile(request.authUser!.id, updateProfileSchema.parse(request.body)) }));

  app.patch("/me/password", { preHandler: app.authenticate }, async (request, reply) => {
    const input = changePasswordSchema.parse(request.body);
    await service.changePassword(request.authUser!.id, input.currentPassword, input.newPassword);
    reply.clearCookie(refreshCookie, { path: "/api/v1/auth" });
    return reply.code(204).send();
  });
}
