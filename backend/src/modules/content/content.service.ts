import type { Prisma } from "@prisma/client";
import { notFound, unprocessable } from "../../lib/errors.js";
import { makeSlug, pageResult, paginationArgs } from "../../lib/http.js";
import type { z } from "zod";
import type { achievementInputSchema, contentQuerySchema, eventInputSchema, memberInputSchema, milestoneInputSchema, modalityInputSchema, newsInputSchema, resultInputSchema } from "./content.schemas.js";
import { ContentRepository } from "./content.repository.js";

type Query = z.infer<typeof contentQuerySchema>;
type NewsInput = z.infer<typeof newsInputSchema>;
type ModalityInput = z.infer<typeof modalityInputSchema>;
type MemberInput = z.infer<typeof memberInputSchema>;
type EventInput = z.infer<typeof eventInputSchema>;
type ResultInput = z.infer<typeof resultInputSchema>;
type AchievementInput = z.infer<typeof achievementInputSchema>;
type MilestoneInput = z.infer<typeof milestoneInputSchema>;

const timeDate = (time: string) => new Date(`1970-01-01T${time}:00.000Z`);

export class ContentService {
  constructor(private readonly repository: ContentRepository) {}

  async listNews(query: Query) {
    const where: Prisma.NoticiaWhereInput = {
      ...(query.category ? { categoria: query.category.toLocaleUpperCase("pt-BR") } : {}),
      ...(query.search ? { OR: [{ titulo: { contains: query.search, mode: "insensitive" } }, { resumo: { contains: query.search, mode: "insensitive" } }, { conteudo: { contains: query.search, mode: "insensitive" } }] } : {}),
    };
    const { skip, take } = paginationArgs(query);
    const [items, total] = await this.repository.listNews(where, { criadoEm: query.sort }, skip, take);
    return pageResult(items, total, query);
  }
  async newsBySlug(slug: string) { const item = await this.repository.newsBySlug(slug); if (!item) throw notFound("Notícia"); return item; }
  async createNews(input: NewsInput, currentUserId: number) { return this.repository.createNews({ slug: input.slug ?? makeSlug(input.title), titulo: input.title, resumo: input.summary, conteudo: input.content, imagemCapaUrl: input.imageUrl, categoria: input.category, autorId: input.authorId ?? currentUserId }); }
  async updateNews(id: number, input: NewsInput, currentUserId: number) { if (!(await this.repository.newsById(id))) throw notFound("Notícia"); return this.repository.updateNews(id, { slug: input.slug ?? makeSlug(input.title), titulo: input.title, resumo: input.summary, conteudo: input.content, imagemCapaUrl: input.imageUrl, categoria: input.category, autorId: input.authorId ?? currentUserId }); }
  async deleteNews(id: number) { if (!(await this.repository.newsById(id))) throw notFound("Notícia"); await this.repository.deleteNews(id); }

  listModalities(search?: string) { return this.repository.listModalities(search ? { OR: [{ nome: { contains: search, mode: "insensitive" } }, { descricao: { contains: search, mode: "insensitive" } }] } : {}); }
  async modalityBySlug(slug: string) { const item = await this.repository.modalityBySlug(slug); if (!item) throw notFound("Modalidade"); return item; }
  async createModality(input: ModalityInput) {
    this.validateSchedules(input.schedules);
    return this.repository.createModality({ nome: input.name, slug: input.slug ?? makeSlug(input.name), descricao: input.description, imagemUrl: input.imageUrl, responsavel: input.responsible, localTreino: input.trainingPlace, horarios: { create: input.schedules?.map((item) => ({ diaSemana: item.dayOfWeek, horaInicio: timeDate(item.startTime), horaFim: item.endTime ? timeDate(item.endTime) : null })) ?? [] } });
  }
  async updateModality(id: number, input: ModalityInput) {
    if (!(await this.repository.modalityById(id))) throw notFound("Modalidade");
    this.validateSchedules(input.schedules);
    return this.repository.updateModality(id, { nome: input.name, slug: input.slug ?? makeSlug(input.name), descricao: input.description, imagemUrl: input.imageUrl, responsavel: input.responsible, localTreino: input.trainingPlace, ...(input.schedules ? { horarios: { deleteMany: {}, create: input.schedules.map((item) => ({ diaSemana: item.dayOfWeek, horaInicio: timeDate(item.startTime), horaFim: item.endTime ? timeDate(item.endTime) : null })) } } : {}) });
  }
  private validateSchedules(schedules?: ModalityInput["schedules"]) { for (const item of schedules ?? []) if (item.endTime && item.endTime <= item.startTime) throw unprocessable("O horário final deve ser posterior ao inicial."); }
  async deleteModality(id: number) { if (!(await this.repository.modalityById(id))) throw notFound("Modalidade"); await this.repository.deleteModality(id); }

  async listMembers(query: Query) {
    const where: Prisma.IntegranteWhereInput = { ...(query.search ? { OR: [{ nome: { contains: query.search, mode: "insensitive" } }, { curso: { contains: query.search, mode: "insensitive" } }, { funcao: { contains: query.search, mode: "insensitive" } }] } : {}), ...(query.modalityId ? { modalidades: { some: { modalidadeId: query.modalityId } } } : {}), ...(query.category === "DIRETORIA" ? { diretoria: true } : {}) };
    const { skip, take } = paginationArgs(query); const [items, total] = await this.repository.listMembers(where, { nome: query.sort }, skip, take); return pageResult(items, total, query);
  }
  async memberBySlug(slug: string) { const item = await this.repository.memberBySlug(slug); if (!item) throw notFound("Integrante"); return item; }
  async createMember(input: MemberInput) { return this.repository.createMember({ slug: input.slug ?? makeSlug(input.name), nome: input.name, curso: input.course, funcao: input.role, diretoria: input.boardMember, fotoUrl: input.photoUrl, instagram: input.instagram?.replace(/^@/, ""), modalidades: { create: input.modalityIds.map((modalidadeId) => ({ modalidade: { connect: { id: modalidadeId } } })) } }); }
  async updateMember(id: number, input: MemberInput) { if (!(await this.repository.memberById(id))) throw notFound("Integrante"); return this.repository.updateMember(id, { slug: input.slug ?? makeSlug(input.name), nome: input.name, curso: input.course, funcao: input.role, diretoria: input.boardMember, fotoUrl: input.photoUrl, instagram: input.instagram?.replace(/^@/, ""), modalidades: { deleteMany: {}, create: input.modalityIds.map((modalidadeId) => ({ modalidade: { connect: { id: modalidadeId } } })) } }); }
  async deleteMember(id: number) { if (!(await this.repository.memberById(id))) throw notFound("Integrante"); await this.repository.deleteMember(id); }

  async listEvents(query: Query) { const where: Prisma.EventoWhereInput = { ...(query.category ? { tipo: query.category.toLocaleUpperCase("pt-BR") } : {}), ...(query.modalityId ? { modalidadeId: query.modalityId } : {}), ...(query.from || query.to ? { dataHora: { gte: query.from, lte: query.to } } : {}), ...(query.search ? { OR: [{ titulo: { contains: query.search, mode: "insensitive" } }, { local: { contains: query.search, mode: "insensitive" } }, { descricao: { contains: query.search, mode: "insensitive" } }] } : {}) }; const { skip, take } = paginationArgs(query); const [items, total] = await this.repository.listEvents(where, { dataHora: query.sort }, skip, take); return pageResult(items, total, query); }
  async eventBySlug(slug: string) { const item = await this.repository.eventBySlug(slug); if (!item) throw notFound("Evento"); return item; }
  async createEvent(input: EventInput) { return this.repository.createEvent({ slug: input.slug ?? makeSlug(input.title), titulo: input.title, descricao: input.description, tipo: input.type, dataHora: input.dateTime, local: input.place, imagemUrl: input.imageUrl, modalidadeId: input.modalityId }); }
  async updateEvent(id: number, input: EventInput) { if (!(await this.repository.eventById(id))) throw notFound("Evento"); return this.repository.updateEvent(id, { slug: input.slug ?? makeSlug(input.title), titulo: input.title, descricao: input.description, tipo: input.type, dataHora: input.dateTime, local: input.place, imagemUrl: input.imageUrl, modalidadeId: input.modalityId }); }
  async deleteEvent(id: number) { if (!(await this.repository.eventById(id))) throw notFound("Evento"); await this.repository.deleteEvent(id); }

  async listResults(query: Query) { const where: Prisma.ResultadoWhereInput = { ...(query.modalityId ? { modalidadeId: query.modalityId } : {}), ...(query.from || query.to ? { data: { gte: query.from, lte: query.to } } : {}), ...(query.search ? { OR: [{ adversario: { contains: query.search, mode: "insensitive" } }, { campeonato: { contains: query.search, mode: "insensitive" } }, { modalidade: { nome: { contains: query.search, mode: "insensitive" } } }] } : {}) }; const { skip, take } = paginationArgs(query); const [items, total] = await this.repository.listResults(where, { data: query.sort }, skip, take); return pageResult(items, total, query); }
  async createResult(input: ResultInput) { return this.repository.createResult({ modalidadeId: input.modalityId, eventoId: input.eventId, adversario: input.opponent, placarOcta: input.ourScore, placarAdversario: input.opponentScore, campeonato: input.competition, data: input.date }); }
  async updateResult(id: number, input: ResultInput) { if (!(await this.repository.resultById(id))) throw notFound("Resultado"); return this.repository.updateResult(id, { modalidadeId: input.modalityId, eventoId: input.eventId, adversario: input.opponent, placarOcta: input.ourScore, placarAdversario: input.opponentScore, campeonato: input.competition, data: input.date }); }
  async deleteResult(id: number) { if (!(await this.repository.resultById(id))) throw notFound("Resultado"); await this.repository.deleteResult(id); }

  listAchievements(modalityId?: number) { return this.repository.listAchievements(modalityId ? { modalidadeId: modalityId } : {}); }
  createAchievement(input: AchievementInput) { return this.repository.createAchievement({ titulo: input.title, campeonato: input.competition, colocacao: input.placement, ano: input.year, descricao: input.description, modalidadeId: input.modalityId }); }
  async updateAchievement(id: number, input: AchievementInput) { if (!(await this.repository.achievementById(id))) throw notFound("Conquista"); return this.repository.updateAchievement(id, { titulo: input.title, campeonato: input.competition, colocacao: input.placement, ano: input.year, descricao: input.description, modalidadeId: input.modalityId }); }
  async deleteAchievement(id: number) { if (!(await this.repository.achievementById(id))) throw notFound("Conquista"); await this.repository.deleteAchievement(id); }

  listMilestones() { return this.repository.listMilestones(); }
  createMilestone(input: MilestoneInput) { return this.repository.createMilestone({ ano: input.year, titulo: input.title, descricao: input.description, ordem: input.order }); }
  async updateMilestone(id: number, input: MilestoneInput) { if (!(await this.repository.milestoneById(id))) throw notFound("Marco histórico"); return this.repository.updateMilestone(id, { ano: input.year, titulo: input.title, descricao: input.description, ordem: input.order }); }
  async deleteMilestone(id: number) { if (!(await this.repository.milestoneById(id))) throw notFound("Marco histórico"); await this.repository.deleteMilestone(id); }
}
