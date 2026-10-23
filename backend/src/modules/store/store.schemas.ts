import { z } from "zod";

export const productCategories = ["CAMISAS", "TIRANTES", "COPOS", "BONES", "ACESSORIOS", "KITS"] as const;
export const orderStatuses = ["PENDENTE", "CONFIRMADO", "EM_SEPARACAO", "DISPONIVEL_RETIRADA", "ENTREGUE", "CANCELADO"] as const;

export const productInputSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(140).optional(),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(50_000).nullable().optional(),
  priceCents: z.number().int().min(0).max(999_999_999),
  category: z.enum(productCategories),
  imageUrl: z.union([z.string().url().max(255), z.string().regex(/^\/images\/[a-zA-Z0-9._/-]+$/).max(255)]).nullable().optional(),
  active: z.boolean().default(true),
  variations: z.array(z.object({ id: z.number().int().positive().optional(), size: z.string().trim().min(1).max(10).transform((value) => value.toLocaleUpperCase("pt-BR")), stock: z.number().int().min(0) })).min(1).max(30),
});

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  category: z.enum(productCategories).optional(),
  active: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
  sortBy: z.enum(["name", "price", "stock"]).default("name"),
  sort: z.enum(["asc", "desc"]).default("asc"),
});

export const createOrderSchema = z.object({
  contactName: z.string().trim().min(2).max(120),
  contactPhone: z.string().transform((value) => value.replace(/\D/g, "")).pipe(z.string().regex(/^\d{10,11}$/)),
  pickupMethod: z.enum(["CAMPUS", "COMBINAR"]),
  notes: z.string().trim().max(500).nullable().optional(),
  items: z.array(z.object({ variationId: z.number().int().positive(), quantity: z.number().int().min(1).max(99) })).min(1).max(50),
});

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  status: z.enum(orderStatuses).optional(),
  sort: z.enum(["asc", "desc"]).default("desc"),
});

export const updateOrderStatusSchema = z.object({ status: z.enum(orderStatuses) });
