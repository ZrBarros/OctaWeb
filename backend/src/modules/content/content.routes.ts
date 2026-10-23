import type { FastifyInstance, FastifyReply } from "fastify";
import { idParamsSchema, slugParamsSchema } from "../../lib/http.js";
import { ContentRepository } from "./content.repository.js";
import { achievementInputSchema, contentQuerySchema, eventInputSchema, memberInputSchema, milestoneInputSchema, modalityInputSchema, newsInputSchema, resultInputSchema } from "./content.schemas.js";
import { ContentService } from "./content.service.js";

const noContent = (reply: FastifyReply) => reply.code(204).send();

export async function publicContentRoutes(app: FastifyInstance) {
  const service = new ContentService(new ContentRepository(app.prisma));

  app.get("/news", async (request) => service.listNews(contentQuerySchema.parse(request.query)));
  app.get("/news/:slug", async (request) => ({ data: await service.newsBySlug(slugParamsSchema.parse(request.params).slug) }));
  app.get("/modalities", async (request) => ({ data: await service.listModalities(contentQuerySchema.pick({ search: true }).parse(request.query).search) }));
  app.get("/modalities/:slug", async (request) => ({ data: await service.modalityBySlug(slugParamsSchema.parse(request.params).slug) }));
  app.get("/members", async (request) => service.listMembers(contentQuerySchema.parse(request.query)));
  app.get("/members/:slug", async (request) => ({ data: await service.memberBySlug(slugParamsSchema.parse(request.params).slug) }));
  app.get("/events", async (request) => service.listEvents(contentQuerySchema.parse(request.query)));
  app.get("/events/:slug", async (request) => ({ data: await service.eventBySlug(slugParamsSchema.parse(request.params).slug) }));
  app.get("/results", async (request) => service.listResults(contentQuerySchema.parse(request.query)));
  app.get("/achievements", async (request) => ({ data: await service.listAchievements(contentQuerySchema.pick({ modalityId: true }).parse(request.query).modalityId) }));
  app.get("/history", async () => ({ data: await service.listMilestones() }));
}

export async function adminContentRoutes(app: FastifyInstance) {
  const service = new ContentService(new ContentRepository(app.prisma));
  app.addHook("preHandler", app.requireAdmin);

  app.get("/news", async (request) => service.listNews(contentQuerySchema.parse(request.query)));
  app.post("/news", async (request, reply) => reply.code(201).send({ data: await service.createNews(newsInputSchema.parse(request.body), request.authUser!.id) }));
  app.put("/news/:id", async (request) => ({ data: await service.updateNews(idParamsSchema.parse(request.params).id, newsInputSchema.parse(request.body), request.authUser!.id) }));
  app.delete("/news/:id", async (request, reply) => { await service.deleteNews(idParamsSchema.parse(request.params).id); return noContent(reply); });

  app.get("/modalities", async (request) => ({ data: await service.listModalities(contentQuerySchema.pick({ search: true }).parse(request.query).search) }));
  app.post("/modalities", async (request, reply) => reply.code(201).send({ data: await service.createModality(modalityInputSchema.parse(request.body)) }));
  app.put("/modalities/:id", async (request) => ({ data: await service.updateModality(idParamsSchema.parse(request.params).id, modalityInputSchema.parse(request.body)) }));
  app.delete("/modalities/:id", async (request, reply) => { await service.deleteModality(idParamsSchema.parse(request.params).id); return noContent(reply); });

  app.get("/members", async (request) => service.listMembers(contentQuerySchema.parse(request.query)));
  app.post("/members", async (request, reply) => reply.code(201).send({ data: await service.createMember(memberInputSchema.parse(request.body)) }));
  app.put("/members/:id", async (request) => ({ data: await service.updateMember(idParamsSchema.parse(request.params).id, memberInputSchema.parse(request.body)) }));
  app.delete("/members/:id", async (request, reply) => { await service.deleteMember(idParamsSchema.parse(request.params).id); return noContent(reply); });

  app.get("/events", async (request) => service.listEvents(contentQuerySchema.parse(request.query)));
  app.post("/events", async (request, reply) => reply.code(201).send({ data: await service.createEvent(eventInputSchema.parse(request.body)) }));
  app.put("/events/:id", async (request) => ({ data: await service.updateEvent(idParamsSchema.parse(request.params).id, eventInputSchema.parse(request.body)) }));
  app.delete("/events/:id", async (request, reply) => { await service.deleteEvent(idParamsSchema.parse(request.params).id); return noContent(reply); });

  app.get("/results", async (request) => service.listResults(contentQuerySchema.parse(request.query)));
  app.post("/results", async (request, reply) => reply.code(201).send({ data: await service.createResult(resultInputSchema.parse(request.body)) }));
  app.put("/results/:id", async (request) => ({ data: await service.updateResult(idParamsSchema.parse(request.params).id, resultInputSchema.parse(request.body)) }));
  app.delete("/results/:id", async (request, reply) => { await service.deleteResult(idParamsSchema.parse(request.params).id); return noContent(reply); });

  app.get("/achievements", async (request) => ({ data: await service.listAchievements(contentQuerySchema.pick({ modalityId: true }).parse(request.query).modalityId) }));
  app.post("/achievements", async (request, reply) => reply.code(201).send({ data: await service.createAchievement(achievementInputSchema.parse(request.body)) }));
  app.put("/achievements/:id", async (request) => ({ data: await service.updateAchievement(idParamsSchema.parse(request.params).id, achievementInputSchema.parse(request.body)) }));
  app.delete("/achievements/:id", async (request, reply) => { await service.deleteAchievement(idParamsSchema.parse(request.params).id); return noContent(reply); });

  app.get("/history", async () => ({ data: await service.listMilestones() }));
  app.post("/history", async (request, reply) => reply.code(201).send({ data: await service.createMilestone(milestoneInputSchema.parse(request.body)) }));
  app.put("/history/:id", async (request) => ({ data: await service.updateMilestone(idParamsSchema.parse(request.params).id, milestoneInputSchema.parse(request.body)) }));
  app.delete("/history/:id", async (request, reply) => { await service.deleteMilestone(idParamsSchema.parse(request.params).id); return noContent(reply); });
}
