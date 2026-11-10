import re
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Literal

import bcrypt
import jwt

from app.config import Settings
from app.errors import unauthorized

TokenKind = Literal["access", "refresh", "reset"]


@dataclass(frozen=True)
class TokenPayload:
    sub: str
    perfil: str
    typ: str
    email: str | None = None


def _ttl_delta(value: str) -> timedelta:
    match = re.fullmatch(r"(\d+)(s|m|h|d)", value)
    if not match:
        raise ValueError(f"TTL inválido: {value}")
    amount = int(match.group(1))
    return {"s": timedelta(seconds=amount), "m": timedelta(minutes=amount), "h": timedelta(hours=amount), "d": timedelta(days=amount)}[match.group(2)]


def _secret(settings: Settings, kind: TokenKind) -> str:
    return {"access": settings.jwt_access_secret, "refresh": settings.jwt_refresh_secret, "reset": settings.jwt_reset_secret}[kind]


def create_token(settings: Settings, kind: TokenKind, user_id: int, role: str, email: str | None = None) -> str:
    ttl = {"access": settings.access_token_ttl, "refresh": settings.refresh_token_ttl, "reset": settings.reset_token_ttl}[kind]
    now = datetime.now(UTC)
    payload = {"sub": str(user_id), "perfil": "ADMIN" if role == "ADMIN" else "USUARIO", "typ": kind, "iat": now, "exp": now + _ttl_delta(ttl)}
    if email is not None:
        payload["email"] = email
    return jwt.encode(payload, _secret(settings, kind), algorithm="HS256")


def decode_token(settings: Settings, kind: TokenKind, token: str) -> TokenPayload:
    try:
        payload = jwt.decode(token, _secret(settings, kind), algorithms=["HS256"])
        if payload.get("typ") != kind or payload.get("perfil") not in {"USUARIO", "ADMIN"} or not str(payload.get("sub", "")).isdigit():
            raise ValueError("payload")
        return TokenPayload(sub=str(payload["sub"]), perfil=str(payload["perfil"]), typ=str(payload["typ"]), email=payload.get("email"))
    except (jwt.PyJWTError, ValueError, TypeError):
        raise unauthorized("Token inválido ou expirado.") from None


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False

