import type { Prisma } from "@prisma/client";
import slugify from "slugify";
import { z } from "zod";

export const idParamsSchema = z.object({ id: z.coerce.number().int().positive() });
export const slugParamsSchema = z.object({ slug: z.string().min(1).max(200) });
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  sort: z.enum(["asc", "desc"]).default("desc"),
});

export type Pagination = z.infer<typeof paginationSchema>;

export function paginationArgs(input: Pick<Pagination, "page" | "pageSize">) {
  return { skip: (input.page - 1) * input.pageSize, take: input.pageSize };
}

export function pageResult<T>(items: T[], total: number, input: Pick<Pagination, "page" | "pageSize">) {
  return {
    data: items,
    meta: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.ceil(total / input.pageSize),
    },
  };
}

export function makeSlug(value: string) {
  return slugify(value, { lower: true, strict: true, locale: "pt" });
}

export function moneyToCents(value: Prisma.Decimal | number | string) {
  return Math.round(Number(value) * 100);
}

export function cleanUser<T extends { senhaHash: string }>(user: T) {
  const safe: Partial<T> = { ...user };
  delete safe.senhaHash;
  return safe as Omit<T, "senhaHash">;
}

export const isoDate = (value: Date) => value.toISOString().slice(0, 10);
