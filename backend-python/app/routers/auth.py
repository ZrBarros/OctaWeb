from typing import Annotated

from fastapi import APIRouter, Cookie, Response, status

from app.config import Settings
from app.dependencies import AppSettings, CurrentUser, DbSession
from app.errors import unauthorized
from app.repositories.auth import AuthRepository
from app.schemas import ChangePasswordInput, ForgotPasswordInput, LoginInput, RegisterInput, ResetPasswordInput, UpdateProfileInput
from app.serializers import user as serialize_user
from app.services.auth import AuthService
from app.services.mail import MailService

router = APIRouter(prefix="/api/v1/auth", tags=["Autenticação"])
REFRESH_COOKIE = "octacore_refresh"


def service(db: DbSession, settings: AppSettings) -> AuthService:
    return AuthService(AuthRepository(db), MailService(settings), settings)


def set_refresh_cookie(response: Response, settings: Settings, token: str) -> None:
    response.set_cookie(key=REFRESH_COOKIE, value=token, httponly=True, secure=settings.cookie_secure, samesite="strict", path="/api/v1/auth", max_age=30 * 24 * 60 * 60)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: RegisterInput, response: Response, db: DbSession, settings: AppSettings) -> dict:
    account, tokens = service(db, settings).register(data)
    set_refresh_cookie(response, settings, tokens["refreshToken"])
    return {"data": {"user": serialize_user(account), "accessToken": tokens["accessToken"]}}


@router.post("/login")
def login(data: LoginInput, response: Response, db: DbSession, settings: AppSettings) -> dict:
    account, tokens = service(db, settings).login(str(data.email), data.password)
    set_refresh_cookie(response, settings, tokens["refreshToken"])
    return {"data": {"user": serialize_user(account), "accessToken": tokens["accessToken"]}}


@router.post("/refresh")
def refresh(response: Response, db: DbSession, settings: AppSettings, octacore_refresh: Annotated[str | None, Cookie()] = None) -> dict:
    if not octacore_refresh:
        raise unauthorized("Refresh token ausente.")
    tokens = service(db, settings).refresh(octacore_refresh)
    set_refresh_cookie(response, settings, tokens["refreshToken"])
    return {"data": {"accessToken": tokens["accessToken"]}}


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> None:
    response.delete_cookie(REFRESH_COOKIE, path="/api/v1/auth")


@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
def forgot_password(data: ForgotPasswordInput, db: DbSession, settings: AppSettings) -> dict:
    service(db, settings).forgot_password(str(data.email))
    return {"message": "Se o e-mail estiver cadastrado, enviaremos as instruções de redefinição."}


@router.post("/reset-password", status_code=status.HTTP_204_NO_CONTENT)
def reset_password(data: ResetPasswordInput, response: Response, db: DbSession, settings: AppSettings) -> None:
    service(db, settings).reset_password(data.token, data.password)
    response.delete_cookie(REFRESH_COOKIE, path="/api/v1/auth")


@router.get("/me")
def me(actor: CurrentUser, db: DbSession, settings: AppSettings) -> dict:
    return {"data": serialize_user(service(db, settings).me(actor.id))}


@router.patch("/me")
def update_me(data: UpdateProfileInput, actor: CurrentUser, db: DbSession, settings: AppSettings) -> dict:
    return {"data": serialize_user(service(db, settings).update_profile(actor.id, data))}


@router.patch("/me/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(data: ChangePasswordInput, response: Response, actor: CurrentUser, db: DbSession, settings: AppSettings) -> None:
    service(db, settings).change_password(actor.id, data.currentPassword, data.newPassword)
    response.delete_cookie(REFRESH_COOKIE, path="/api/v1/auth")

