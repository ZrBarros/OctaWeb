import { z } from "zod";

export const userQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  role: z.enum(["USUARIO", "ADMIN"]).optional(),
});

export const adminUserInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160).transform((value) => value.toLocaleLowerCase("pt-BR")),
  course: z.string().trim().min(2).max(100),
  photoUrl: z.string().url().max(255).nullable().optional(),
  role: z.enum(["USUARIO", "ADMIN"]),
});
