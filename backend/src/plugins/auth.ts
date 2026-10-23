import fp from "fastify-plugin";
import { forbidden, unauthorized } from "../lib/errors.js";
import { verifyToken } from "../lib/tokens.js";

export default fp(async (app) => {
  app.decorate("authenticate", async (request) => {
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) throw unauthorized();
    const payload = await verifyToken(app.env, "access", authorization.slice(7));
    const id = Number(payload.sub);
    if (!Number.isSafeInteger(id) || id < 1) throw unauthorized();
    request.authUser = { id, perfil: payload.perfil };
  });

  app.decorate("requireAdmin", async (request) => {
    await app.authenticate(request);
    if (request.authUser?.perfil !== "ADMIN") throw forbidden();
  });
});
