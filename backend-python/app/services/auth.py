from datetime import UTC, datetime

from app.config import Settings
from app.errors import conflict, not_found, unauthorized
from app.models import Usuario
from app.repositories.auth import AuthRepository
from app.schemas import RegisterInput, UpdateProfileInput
from app.security import create_token, decode_token, hash_password, verify_password
from app.services.mail import MailService


class AuthService:
    def __init__(self, repository: AuthRepository, mail: MailService, settings: Settings) -> None:
        self.repository = repository
        self.mail = mail
        self.settings = settings

    def issue_tokens(self, user: Usuario) -> dict[str, str]:
        return {
            "accessToken": create_token(self.settings, "access", user.id, user.perfil),
            "refreshToken": create_token(self.settings, "refresh", user.id, user.perfil),
        }

    def register(self, data: RegisterInput) -> tuple[Usuario, dict[str, str]]:
        if self.repository.find_by_email(str(data.email)):
            raise conflict("Já existe uma conta com este e-mail.")
        now = datetime.now(UTC)
        user = Usuario(nome=data.name, email=str(data.email), curso=data.course, senha_hash=hash_password(data.password), perfil="USUARIO", criado_em=now, atualizado_em=now)
        user = self.repository.save(user)
        return user, self.issue_tokens(user)

    def login(self, email: str, password: str) -> tuple[Usuario, dict[str, str]]:
        user = self.repository.find_by_email(email)
        if not user or not verify_password(password, user.senha_hash):
            raise unauthorized("E-mail ou senha inválidos.")
        return user, self.issue_tokens(user)

    def refresh(self, token: str) -> dict[str, str]:
        payload = decode_token(self.settings, "refresh", token)
        user = self.repository.find_by_id(int(payload.sub))
        if not user:
            raise unauthorized("Conta não encontrada.")
        return self.issue_tokens(user)

    def me(self, user_id: int) -> Usuario:
        user = self.repository.find_by_id(user_id)
        if not user:
            raise not_found("Usuário")
        return user

    def forgot_password(self, email: str) -> None:
        user = self.repository.find_by_email(email)
        if user:
            token = create_token(self.settings, "reset", user.id, user.perfil, user.email)
            self.mail.send_password_reset(user.email, token)

    def reset_password(self, token: str, password: str) -> None:
        payload = decode_token(self.settings, "reset", token)
        user = self.repository.find_by_id(int(payload.sub))
        if not user or user.email.lower() != (payload.email or "").lower():
            raise unauthorized("Token de redefinição inválido.")
        user.senha_hash = hash_password(password)
        self.repository.save(user)

    def update_profile(self, user_id: int, data: UpdateProfileInput) -> Usuario:
        user = self.me(user_id)
        user.nome = data.name
        user.curso = data.course
        if "photoUrl" in data.model_fields_set:
            user.foto_url = data.photoUrl
        return self.repository.save(user)

    def change_password(self, user_id: int, current_password: str, new_password: str) -> None:
        user = self.me(user_id)
        if not verify_password(current_password, user.senha_hash):
            raise unauthorized("Senha atual incorreta.")
        user.senha_hash = hash_password(new_password)
        self.repository.save(user)

