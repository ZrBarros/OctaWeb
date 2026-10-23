export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export const badRequest = (message: string, details?: unknown) => new AppError(400, "BAD_REQUEST", message, details);
export const unauthorized = (message = "Autenticação necessária.") => new AppError(401, "UNAUTHORIZED", message);
export const forbidden = (message = "Você não tem permissão para executar esta ação.") => new AppError(403, "FORBIDDEN", message);
export const notFound = (resource: string) => new AppError(404, "NOT_FOUND", `${resource} não encontrado.`);
export const conflict = (message: string) => new AppError(409, "CONFLICT", message);
export const unprocessable = (message: string, details?: unknown) => new AppError(422, "UNPROCESSABLE_ENTITY", message, details);
