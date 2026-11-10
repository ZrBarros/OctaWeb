from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.database import get_db
from app.errors import forbidden, unauthorized
from app.security import decode_token


@dataclass(frozen=True)
class AuthUser:
    id: int
    perfil: str


DbSession = Annotated[Session, Depends(get_db)]
AppSettings = Annotated[Settings, Depends(get_settings)]


def current_user(settings: AppSettings, authorization: Annotated[str | None, Header()] = None) -> AuthUser:
    if not authorization or not authorization.startswith("Bearer "):
        raise unauthorized()
    payload = decode_token(settings, "access", authorization[7:])
    return AuthUser(id=int(payload.sub), perfil=payload.perfil)


def admin_user(user: Annotated[AuthUser, Depends(current_user)]) -> AuthUser:
    if user.perfil != "ADMIN":
        raise forbidden()
    return user


CurrentUser = Annotated[AuthUser, Depends(current_user)]
AdminUser = Annotated[AuthUser, Depends(admin_user)]

