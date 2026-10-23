import "server-only";
import { ApiError } from "./api-types";

const baseUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api/v1";

export async function apiServer<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, { ...init, cache: init?.cache ?? "no-store" });
  const body = await response.json().catch(() => null) as { error?: { code?: string; message?: string; details?: unknown } } | null;
  if (!response.ok) throw new ApiError(response.status, body?.error?.code ?? "REQUEST_FAILED", body?.error?.message ?? "Não foi possível carregar os dados.", body?.error?.details);
  return body as T;
}
