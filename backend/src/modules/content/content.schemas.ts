import { z } from "zod";

const assetUrl = z.union([z.string().url().max(255), z.string().regex(/^\/images\/[a-zA-Z0-9._/-]+$/).max(255)]);
const optionalUrl = assetUrl.nullable().optional();
const optionalSlug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(200).optional();

export const newsCategories = ["CAMPEONATOS", "JOGOS", "RESULTADOS", "SELETIVAS", "TREINOS", "FESTAS", "EVENTOS", "COMUNICADOS"] as const;
export const eventTypes = ["TREINO", "JOGO", "CAMPEONATO", "SELETIVA", "FESTA", "REUNIAO", "EVENTO"] as const;

export const newsInputSchema = z.object({
  slug: optionalSlug,
  title: z.string().trim().min(3).max(200),
  summary: z.string().trim().max(300).nullable().optional(),
  content: z.string().trim().min(1).max(100_000),
  imageUrl: optionalUrl,
  category: z.enum(newsCategories),
  authorId: z.number().int().positive().optional(),
  status: z.literal("Publicado").optional(),
});

export const modalityInputSchema = z.object({
  slug: optionalSlug,
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(10_000).nullable().optional(),
  imageUrl: optionalUrl,
  responsible: z.string().trim().max(120).nullable().optional(),
  trainingPlace: z.string().trim().max(150).nullable().optional(),
  schedules: z.array(z.object({ dayOfWeek: z.number().int().min(0).max(6), startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().optional() })).max(30).optional(),
});

export const memberInputSchema = z.object({
  slug: optionalSlug,
  name: z.string().trim().min(2).max(120),
  course: z.string().trim().max(100).nullable().optional(),
  role: z.string().trim().max(80).nullable().optional(),
  boardMember: z.boolean().default(false),
  photoUrl: optionalUrl,
  instagram: z.string().trim().regex(/^@?[a-zA-Z0-9._]{1,30}$/).nullable().optional(),
  modalityIds: z.array(z.number().int().positive()).max(20).default([]),
});

export const eventInputSchema = z.object({
  slug: optionalSlug,
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(50_000).nullable().optional(),
  type: z.enum(eventTypes),
  dateTime: z.coerce.date(),
  place: z.string().trim().min(2).max(150),
  imageUrl: optionalUrl,
  modalityId: z.number().int().positive().nullable().optional(),
});

export const resultInputSchema = z.object({
  modalityId: z.number().int().positive(),
  eventId: z.number().int().positive().nullable().optional(),
  opponent: z.string().trim().min(1).max(120),
  ourScore: z.number().int().min(0),
  opponentScore: z.number().int().min(0),
  competition: z.string().trim().max(150).nullable().optional(),
  date: z.coerce.date(),
});

export const achievementInputSchema = z.object({
  title: z.string().trim().min(2).max(150),
  competition: z.string().trim().min(2).max(150),
  placement: z.string().trim().min(1).max(40),
  year: z.number().int().min(2000).max(2100),
  description: z.string().trim().max(50_000).nullable().optional(),
  modalityId: z.number().int().positive().nullable().optional(),
});

export const milestoneInputSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(50_000).nullable().optional(),
  order: z.number().int().default(0),
});

export const contentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  sort: z.enum(["asc", "desc"]).default("desc"),
  category: z.string().max(30).optional(),
  modalityId: z.coerce.number().int().positive().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
