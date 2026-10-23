import bcrypt from "bcryptjs";
import type { AppEnv } from "../../config/env.js";
import { conflict, notFound, unauthorized } from "../../lib/errors.js";
import { cleanUser } from "../../lib/http.js";
import { signToken, verifyToken } from "../../lib/tokens.js";
import type { LoginInput, RegisterInput } from "./auth.schemas.js";
import { AuthRepository } from "./auth.repository.js";
import { MailService } from "./mail.service.js";

export class AuthService {
  constructor(private readonly repository: AuthRepository, private readonly mail: MailService, private readonly env: AppEnv) {}

  private async issueTokens(user: { id: number; perfil: string }) {
    const perfil = user.perfil === "ADMIN" ? "ADMIN" : "USUARIO";
    return {
      accessToken: await signToken(this.env, "access", { sub: String(user.id), perfil }),
      refreshToken: await signToken(this.env, "refresh", { sub: String(user.id), perfil }),
    };
  }

  async register(input: RegisterInput) {
    if (await this.repository.findByEmail(input.email)) throw conflict("Já existe uma conta com este e-mail.");
    const user = await this.repository.create(input, await bcrypt.hash(input.password, 12));
    return { user: cleanUser(user), ...(await this.issueTokens(user)) };
  }

  async login(input: LoginInput) {
    const user = await this.repository.findByEmail(input.email);
    if (!user || !(await bcrypt.compare(input.password, user.senhaHash))) throw unauthorized("E-mail ou senha inválidos.");
    return { user: cleanUser(user), ...(await this.issueTokens(user)) };
  }

  async refresh(token: string) {
    const payload = await verifyToken(this.env, "refresh", token);
    const user = await this.repository.findById(Number(payload.sub));
    if (!user) throw unauthorized("Conta não encontrada.");
    return this.issueTokens(user);
  }

  async me(id: number) {
    const user = await this.repository.findById(id);
    if (!user) throw notFound("Usuário");
    return cleanUser(user);
  }

  async forgotPassword(email: string) {
    const user = await this.repository.findByEmail(email);
    if (user) {
      const perfil = user.perfil === "ADMIN" ? "ADMIN" : "USUARIO";
      const token = await signToken(this.env, "reset", { sub: String(user.id), perfil, email: user.email });
      await this.mail.sendPasswordReset(user.email, token);
    }
  }

  async resetPassword(token: string, password: string) {
    const payload = await verifyToken(this.env, "reset", token);
    const user = await this.repository.findById(Number(payload.sub));
    if (!user || user.email.toLocaleLowerCase("pt-BR") !== payload.email?.toLocaleLowerCase("pt-BR")) throw unauthorized("Token de redefinição inválido.");
    await this.repository.updatePassword(user.id, await bcrypt.hash(password, 12));
  }

  async updateProfile(id: number, input: { name: string; course: string; photoUrl?: string | null }) {
    return cleanUser(await this.repository.updateProfile(id, input));
  }

  async changePassword(id: number, currentPassword: string, newPassword: string) {
    const user = await this.repository.findById(id);
    if (!user || !(await bcrypt.compare(currentPassword, user.senhaHash))) throw unauthorized("Senha atual incorreta.");
    await this.repository.updatePassword(id, await bcrypt.hash(newPassword, 12));
  }
}
