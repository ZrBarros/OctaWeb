import { SignJWT, jwtVerify } from "jose";
import type { AppEnv } from "../config/env.js";
import { unauthorized } from "./errors.js";

type TokenKind = "access" | "refresh" | "reset";
type AuthPayload = { sub: string; perfil: "USUARIO" | "ADMIN"; typ: TokenKind; email?: string };

const durationPattern = /^(\d+)(s|m|h|d)$/;
function expiration(ttl: string) {
  const match = durationPattern.exec(ttl);
  if (!match) throw new Error(`TTL inválido: ${ttl}`);
  return `${match[1]}${match[2]}`;
}

function secretFor(env: AppEnv, kind: TokenKind) {
  const value = kind === "access" ? env.JWT_ACCESS_SECRET : kind === "refresh" ? env.JWT_REFRESH_SECRET : env.JWT_RESET_SECRET;
  return new TextEncoder().encode(value);
}

export async function signToken(env: AppEnv, kind: TokenKind, payload: Omit<AuthPayload, "typ">) {
  const ttl = kind === "access" ? env.ACCESS_TOKEN_TTL : kind === "refresh" ? env.REFRESH_TOKEN_TTL : env.RESET_TOKEN_TTL;
  return new SignJWT({ ...payload, typ: kind })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiration(ttl))
    .sign(secretFor(env, kind));
}

export async function verifyToken(env: AppEnv, kind: TokenKind, token: string): Promise<AuthPayload> {
  try {
    const { payload } = await jwtVerify(token, secretFor(env, kind));
    if (payload.typ !== kind || typeof payload.sub !== "string" || (payload.perfil !== "USUARIO" && payload.perfil !== "ADMIN")) throw new Error("payload");
    return payload as AuthPayload;
  } catch {
    throw unauthorized("Token inválido ou expirado.");
  }
}
