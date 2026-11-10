from typing import Any


class AppError(Exception):
    def __init__(self, status_code: int, code: str, message: str, details: Any | None = None) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details


def bad_request(message: str, details: Any | None = None) -> AppError:
    return AppError(400, "BAD_REQUEST", message, details)


def unauthorized(message: str = "Autenticação necessária.") -> AppError:
    return AppError(401, "UNAUTHORIZED", message)


def forbidden(message: str = "Você não tem permissão para executar esta ação.") -> AppError:
    return AppError(403, "FORBIDDEN", message)


def not_found(resource: str) -> AppError:
    return AppError(404, "NOT_FOUND", f"{resource} não encontrado.")


def conflict(message: str) -> AppError:
    return AppError(409, "CONFLICT", message)


def unprocessable(message: str, details: Any | None = None) -> AppError:
    return AppError(422, "UNPROCESSABLE_ENTITY", message, details)

