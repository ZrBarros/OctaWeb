import logging
import time
from collections import defaultdict, deque
from collections.abc import Awaitable, Callable

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError, IntegrityError
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.config import get_settings
from app.database import engine
from app.errors import AppError
from app.routers import admin, auth, content, store, uploads

settings = get_settings()
logger = logging.getLogger("octacore")


class SecurityAndLimitMiddleware(BaseHTTPMiddleware):
    requests: dict[str, deque[float]] = defaultdict(deque)

    @classmethod
    def exceeded(cls, key: str, maximum: int, window: int, now: float) -> bool:
        bucket = cls.requests[key]
        while bucket and bucket[0] < now - window:
            bucket.popleft()
        if len(bucket) >= maximum:
            return True
        bucket.append(now)
        return False

    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        client = request.client.host if request.client else "unknown"
        now = time.monotonic()
        if self.exceeded(f"global:{client}", 120, 60, now):
            return JSONResponse(status_code=429, content={"error": {"code": "RATE_LIMIT", "message": "Muitas requisições. Tente novamente em instantes."}})
        route_limit = {"/api/v1/auth/register": (10, 60), "/api/v1/auth/login": (10, 60), "/api/v1/auth/forgot-password": (5, 900)}.get(request.url.path)
        if route_limit and self.exceeded(f"route:{client}:{request.url.path}", route_limit[0], route_limit[1], now):
            return JSONResponse(status_code=429, content={"error": {"code": "RATE_LIMIT", "message": "Muitas requisições. Tente novamente em instantes."}})
        content_length = request.headers.get("content-length")
        if content_length and request.url.path != "/api/v1/admin/uploads/images":
            try:
                if int(content_length) > 1_000_000:
                    return JSONResponse(status_code=413, content={"error": {"code": "PAYLOAD_TOO_LARGE", "message": "Corpo da requisição muito grande."}})
            except ValueError:
                return JSONResponse(status_code=400, content={"error": {"code": "BAD_REQUEST", "message": "Cabeçalho Content-Length inválido."}})
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "same-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        if settings.environment == "production":
            response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
        return response


app = FastAPI(
    title="Octacore API",
    description="API REST da plataforma Octacore em Python/FastAPI",
    version="2.0.0",
    docs_url="/docs",
    openapi_url="/docs/openapi.json",
    servers=[{"url": settings.public_api_url}],
)
app.add_middleware(SecurityAndLimitMiddleware)
app.add_middleware(CORSMiddleware, allow_origins=[settings.frontend_origin], allow_credentials=True, allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], allow_headers=["*"])


@app.exception_handler(AppError)
async def app_error_handler(_request: Request, error: AppError) -> JSONResponse:
    payload = {"code": error.code, "message": error.message}
    if error.details is not None:
        payload["details"] = error.details
    return JSONResponse(status_code=error.status_code, content={"error": payload})


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_request: Request, error: RequestValidationError) -> JSONResponse:
    fields: dict[str, list[str]] = defaultdict(list)
    form_errors: list[str] = []
    for issue in error.errors():
        message = str(issue.get("msg", "Valor inválido.")).removeprefix("Value error, ")
        location = [str(value) for value in issue.get("loc", []) if value not in {"body", "query", "path", "header", "cookie"}]
        if location:
            fields[location[-1]].append(message)
        else:
            form_errors.append(message)
    return JSONResponse(status_code=422, content={"error": {"code": "VALIDATION_ERROR", "message": "Dados inválidos.", "details": {"fieldErrors": dict(fields), "formErrors": form_errors}}})


@app.exception_handler(IntegrityError)
async def integrity_error_handler(_request: Request, error: IntegrityError) -> JSONResponse:
    code = getattr(error.orig, "sqlstate", None)
    if code == "23505":
        payload = {"code": "CONFLICT", "message": "Já existe um registro com estes dados únicos."}
        status_code = 409
    elif code in {"23503", "23514"}:
        payload = {"code": "RELATION_CONFLICT", "message": "A operação viola um relacionamento existente."}
        status_code = 409
    else:
        logger.exception("Erro de integridade", exc_info=error)
        payload = {"code": "INTERNAL_ERROR", "message": "Ocorreu um erro interno."}
        status_code = 500
    return JSONResponse(status_code=status_code, content={"error": payload})


@app.exception_handler(DBAPIError)
async def database_error_handler(_request: Request, error: DBAPIError) -> JSONResponse:
    if getattr(error.orig, "sqlstate", None) == "40001":
        return JSONResponse(status_code=409, content={"error": {"code": "TRANSACTION_CONFLICT", "message": "Conflito de concorrência. Tente novamente."}})
    logger.exception("Erro de banco", exc_info=error)
    return JSONResponse(status_code=500, content={"error": {"code": "INTERNAL_ERROR", "message": "Ocorreu um erro interno."}})


@app.exception_handler(404)
async def route_not_found(_request: Request, _error: Exception) -> JSONResponse:
    return JSONResponse(status_code=404, content={"error": {"code": "ROUTE_NOT_FOUND", "message": "Rota não encontrada."}})


@app.exception_handler(Exception)
async def unexpected_error_handler(_request: Request, error: Exception) -> JSONResponse:
    logger.exception("Erro não tratado", exc_info=error)
    return JSONResponse(status_code=500, content={"error": {"code": "INTERNAL_ERROR", "message": "Ocorreu um erro interno."}})


@app.get("/health", tags=["Infraestrutura"])
def health() -> dict:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    from datetime import UTC, datetime

    return {"status": "ok", "database": "connected", "timestamp": datetime.now(UTC).isoformat().replace("+00:00", "Z")}


app.include_router(auth.router)
app.include_router(content.public_router)
app.include_router(store.public_router)
app.include_router(content.admin_router)
app.include_router(store.admin_router)
app.include_router(admin.router)
app.include_router(uploads.admin_router)
app.include_router(uploads.public_router)

