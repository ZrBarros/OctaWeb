import { z } from "zod";

const password = z.string().min(8).max(128).regex(/[a-z]/, "Inclua uma letra minúscula.").regex(/[A-Z]/, "Inclua uma letra maiúscula.").regex(/\d/, "Inclua um número.");

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160).transform((value) => value.toLocaleLowerCase("pt-BR")),
  course: z.string().trim().min(2).max(100),
  password,
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(160).transform((value) => value.toLocaleLowerCase("pt-BR")),
  password: z.string().min(1).max(128),
});

export const forgotPasswordSchema = z.object({ email: z.string().trim().email().max(160).transform((value) => value.toLocaleLowerCase("pt-BR")) });
export const resetPasswordSchema = z.object({ token: z.string().min(20), password });
export const updateProfileSchema = z.object({ name: z.string().trim().min(2).max(120), course: z.string().trim().min(2).max(100), photoUrl: z.string().url().max(255).nullable().optional() });
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1).max(128), newPassword: password });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
