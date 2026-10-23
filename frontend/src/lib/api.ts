"use client";

import { ApiError } from "./api-types";

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api/v1";
let accessToken: string | null = null;
let refreshPromise: Promise<boolean> | null = null;

function firstValidationMessage(details: unknown) {
  if (!details || typeof details !== "object") return undefined;
  const fieldErrors = (details as { fieldErrors?: Record<string, unknown> }).fieldErrors;
  if (!fieldErrors) return undefined;
  for (const value of Object.values(fieldErrors)) {
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  }
  return undefined;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => null) as { error?: { code?: string; message?: string; details?: unknown }; message?: string } | null;
  if (!response.ok) {
    const details = body?.error?.details;
    const message = firstValidationMessage(details) ?? body?.error?.message ?? body?.message ?? "Não foi possível concluir a solicitação.";
    throw new ApiError(response.status, body?.error?.code ?? "REQUEST_FAILED", message, details);
  }
  return body as T;
}

async function refreshAccessToken() {
  if (!refreshPromise) refreshPromise = fetch(`${baseUrl}/auth/refresh`, { method: "POST", credentials: "include" })
    .then(async (response) => {
      if (!response.ok) { accessToken = null; return false; }
      const body = await response.json() as { data: { accessToken: string } };
      accessToken = body.data.accessToken;
      return true;
    })
    .catch(() => false)
    .finally(() => { refreshPromise = null; });
  return refreshPromise;
}

export async function apiClient<T>(path: string, init: RequestInit & { auth?: boolean } = {}): Promise<T> {
  const { auth = false, headers, ...requestInit } = init;
  if (auth && !accessToken) await refreshAccessToken();
  const response = await fetch(`${baseUrl}${path}`, {
    ...requestInit,
    credentials: "include",
    headers: { ...(requestInit.body !== undefined && !(requestInit.body instanceof FormData) ? { "Content-Type": "application/json" } : {}), ...headers, ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
  });
  if (auth && response.status === 401 && await refreshAccessToken()) {
    return apiClient<T>(path, { ...init, auth: false, headers: { ...headers, Authorization: `Bearer ${accessToken}` } });
  }
  if (auth && response.status === 401 && typeof window !== "undefined") window.dispatchEvent(new Event("octacore:auth-expired"));
  return parseResponse<T>(response);
}

export function setAccessToken(token: string | null) { accessToken = token; }

export async function uploadImage(file: File) {
  const body = new FormData(); body.set("file", file);
  const response = await apiClient<{ data: { url: string } }>("/admin/uploads/images", { method: "POST", body, auth: true });
  return response.data.url;
}
