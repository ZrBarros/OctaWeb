import type { Prisma, PrismaClient } from "@prisma/client";

export class ContentRepository {
  constructor(readonly prisma: PrismaClient) {}

  listNews(where: Prisma.NoticiaWhereInput, orderBy: Prisma.NoticiaOrderByWithRelationInput, skip: number, take: number) {
    return Promise.all([
      this.prisma.noticia.findMany({ where, include: { autor: { select: { id: true, nome: true } } }, orderBy, skip, take }),
      this.prisma.noticia.count({ where }),
    ]);
  }
  newsBySlug(slug: string) { return this.prisma.noticia.findUnique({ where: { slug }, include: { autor: { select: { id: true, nome: true } } } }); }
  newsById(id: number) { return this.prisma.noticia.findUnique({ where: { id }, include: { autor: { select: { id: true, nome: true } } } }); }
  createNews(data: Prisma.NoticiaUncheckedCreateInput) { return this.prisma.noticia.create({ data, include: { autor: { select: { id: true, nome: true } } } }); }
  updateNews(id: number, data: Prisma.NoticiaUncheckedUpdateInput) { return this.prisma.noticia.update({ where: { id }, data, include: { autor: { select: { id: true, nome: true } } } }); }
  deleteNews(id: number) { return this.prisma.noticia.delete({ where: { id } }); }

  listModalities(where: Prisma.ModalidadeWhereInput = {}) { return this.prisma.modalidade.findMany({ where, include: { horarios: { orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }] }, _count: { select: { integrantes: true, eventos: true, resultados: true } } }, orderBy: { nome: "asc" } }); }
  modalityBySlug(slug: string) { return this.prisma.modalidade.findUnique({ where: { slug }, include: { horarios: { orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }] }, integrantes: { include: { integrante: true } }, resultados: { orderBy: { data: "desc" }, take: 10 }, eventos: { where: { dataHora: { gte: new Date() } }, orderBy: { dataHora: "asc" }, take: 10 } } }); }
  modalityById(id: number) { return this.prisma.modalidade.findUnique({ where: { id } }); }
  createModality(data: Prisma.ModalidadeCreateInput) { return this.prisma.modalidade.create({ data, include: { horarios: true } }); }
  updateModality(id: number, data: Prisma.ModalidadeUpdateInput) { return this.prisma.modalidade.update({ where: { id }, data, include: { horarios: true } }); }
  deleteModality(id: number) { return this.prisma.modalidade.delete({ where: { id } }); }

  listMembers(where: Prisma.IntegranteWhereInput, orderBy: Prisma.IntegranteOrderByWithRelationInput, skip: number, take: number) { return Promise.all([this.prisma.integrante.findMany({ where, include: { modalidades: { include: { modalidade: true } } }, orderBy, skip, take }), this.prisma.integrante.count({ where })]); }
  memberBySlug(slug: string) { return this.prisma.integrante.findUnique({ where: { slug }, include: { modalidades: { include: { modalidade: true } } } }); }
  memberById(id: number) { return this.prisma.integrante.findUnique({ where: { id } }); }
  createMember(data: Prisma.IntegranteCreateInput) { return this.prisma.integrante.create({ data, include: { modalidades: { include: { modalidade: true } } } }); }
  updateMember(id: number, data: Prisma.IntegranteUpdateInput) { return this.prisma.integrante.update({ where: { id }, data, include: { modalidades: { include: { modalidade: true } } } }); }
  deleteMember(id: number) { return this.prisma.integrante.delete({ where: { id } }); }

  listEvents(where: Prisma.EventoWhereInput, orderBy: Prisma.EventoOrderByWithRelationInput, skip: number, take: number) { return Promise.all([this.prisma.evento.findMany({ where, include: { modalidade: true, resultado: true }, orderBy, skip, take }), this.prisma.evento.count({ where })]); }
  eventBySlug(slug: string) { return this.prisma.evento.findUnique({ where: { slug }, include: { modalidade: true, resultado: true } }); }
  eventById(id: number) { return this.prisma.evento.findUnique({ where: { id } }); }
  createEvent(data: Prisma.EventoUncheckedCreateInput) { return this.prisma.evento.create({ data, include: { modalidade: true, resultado: true } }); }
  updateEvent(id: number, data: Prisma.EventoUncheckedUpdateInput) { return this.prisma.evento.update({ where: { id }, data, include: { modalidade: true, resultado: true } }); }
  deleteEvent(id: number) { return this.prisma.evento.delete({ where: { id } }); }

  listResults(where: Prisma.ResultadoWhereInput, orderBy: Prisma.ResultadoOrderByWithRelationInput, skip: number, take: number) { return Promise.all([this.prisma.resultado.findMany({ where, include: { modalidade: true, evento: true }, orderBy, skip, take }), this.prisma.resultado.count({ where })]); }
  resultById(id: number) { return this.prisma.resultado.findUnique({ where: { id } }); }
  createResult(data: Prisma.ResultadoUncheckedCreateInput) { return this.prisma.resultado.create({ data, include: { modalidade: true, evento: true } }); }
  updateResult(id: number, data: Prisma.ResultadoUncheckedUpdateInput) { return this.prisma.resultado.update({ where: { id }, data, include: { modalidade: true, evento: true } }); }
  deleteResult(id: number) { return this.prisma.resultado.delete({ where: { id } }); }

  listAchievements(where: Prisma.ConquistaWhereInput = {}) { return this.prisma.conquista.findMany({ where, include: { modalidade: true }, orderBy: [{ ano: "desc" }, { id: "desc" }] }); }
  achievementById(id: number) { return this.prisma.conquista.findUnique({ where: { id } }); }
  createAchievement(data: Prisma.ConquistaUncheckedCreateInput) { return this.prisma.conquista.create({ data, include: { modalidade: true } }); }
  updateAchievement(id: number, data: Prisma.ConquistaUncheckedUpdateInput) { return this.prisma.conquista.update({ where: { id }, data, include: { modalidade: true } }); }
  deleteAchievement(id: number) { return this.prisma.conquista.delete({ where: { id } }); }

  listMilestones() { return this.prisma.marcoHistorico.findMany({ orderBy: [{ ordem: "asc" }, { ano: "asc" }] }); }
  milestoneById(id: number) { return this.prisma.marcoHistorico.findUnique({ where: { id } }); }
  createMilestone(data: Prisma.MarcoHistoricoCreateInput) { return this.prisma.marcoHistorico.create({ data }); }
  updateMilestone(id: number, data: Prisma.MarcoHistoricoUpdateInput) { return this.prisma.marcoHistorico.update({ where: { id }, data }); }
  deleteMilestone(id: number) { return this.prisma.marcoHistorico.delete({ where: { id } }); }
}
