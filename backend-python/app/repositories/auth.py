from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Usuario


class AuthRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def find_by_email(self, email: str) -> Usuario | None:
        return self.db.scalar(select(Usuario).where(func.lower(Usuario.email) == email.lower()))

    def find_by_id(self, user_id: int) -> Usuario | None:
        return self.db.get(Usuario, user_id)

    def save(self, user: Usuario) -> Usuario:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

