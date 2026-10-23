import type { PrismaClient } from "@prisma/client";
import type { RegisterInput } from "./auth.schemas.js";

export class AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findByEmail(email: string) {
    return this.prisma.usuario.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  }

  findById(id: number) {
    return this.prisma.usuario.findUnique({ where: { id } });
  }

  create(input: RegisterInput, senhaHash: string) {
    return this.prisma.usuario.create({ data: { nome: input.name, email: input.email, curso: input.course, senhaHash } });
  }

  updateProfile(id: number, input: { name: string; course: string; photoUrl?: string | null }) {
    return this.prisma.usuario.update({ where: { id }, data: { nome: input.name, curso: input.course, ...(input.photoUrl !== undefined ? { fotoUrl: input.photoUrl } : {}) } });
  }

  updatePassword(id: number, senhaHash: string) {
    return this.prisma.usuario.update({ where: { id }, data: { senhaHash } });
  }
}
