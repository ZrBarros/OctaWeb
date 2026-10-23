import nodemailer from "nodemailer";
import type { AppEnv } from "../../config/env.js";

export class MailService {
  constructor(private readonly env: AppEnv) {}

  async sendPasswordReset(email: string, token: string) {
    const resetUrl = new URL(this.env.PASSWORD_RESET_URL);
    resetUrl.searchParams.set("token", token);
    if (!this.env.SMTP_HOST) return false;
    const transport = nodemailer.createTransport({
      host: this.env.SMTP_HOST,
      port: this.env.SMTP_PORT,
      secure: this.env.SMTP_SECURE,
      auth: this.env.SMTP_USER && this.env.SMTP_PASSWORD ? { user: this.env.SMTP_USER, pass: this.env.SMTP_PASSWORD } : undefined,
    });
    await transport.sendMail({
      from: this.env.SMTP_FROM,
      to: email,
      subject: "Redefinição de senha — Octacore",
      text: `Use este endereço para redefinir sua senha: ${resetUrl.toString()}\n\nSe você não solicitou a alteração, ignore esta mensagem.`,
    });
    return true;
  }
}
