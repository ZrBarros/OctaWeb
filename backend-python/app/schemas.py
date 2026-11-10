import re
from datetime import date, datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, StringConstraints, field_validator, model_validator

Password = Annotated[str, StringConstraints(min_length=8, max_length=128)]
Slug = Annotated[str, StringConstraints(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=200)]
AssetUrl = Annotated[str, StringConstraints(max_length=255)]

NEWS_CATEGORIES = Literal["CAMPEONATOS", "JOGOS", "RESULTADOS", "SELETIVAS", "TREINOS", "FESTAS", "EVENTOS", "COMUNICADOS"]
EVENT_TYPES = Literal["TREINO", "JOGO", "CAMPEONATO", "SELETIVA", "FESTA", "REUNIAO", "EVENTO"]
PRODUCT_CATEGORIES = Literal["CAMISAS", "TIRANTES", "COPOS", "BONES", "ACESSORIOS", "KITS"]
ORDER_STATUSES = Literal["PENDENTE", "CONFIRMADO", "EM_SEPARACAO", "DISPONIVEL_RETIRADA", "ENTREGUE", "CANCELADO"]


def validate_password(value: str) -> str:
    if not re.search(r"[a-z]", value):
        raise ValueError("Inclua uma letra minúscula.")
    if not re.search(r"[A-Z]", value):
        raise ValueError("Inclua uma letra maiúscula.")
    if not re.search(r"\d", value):
        raise ValueError("Inclua um número.")
    return value


def validate_asset_url(value: str | None) -> str | None:
    if value is None:
        return None
    if re.match(r"^https?://", value) or re.match(r"^/images/[a-zA-Z0-9._/-]+$", value):
        return value
    raise ValueError("Informe uma URL HTTP(S) ou um caminho válido em /images/.")


class ApiModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class RegisterInput(ApiModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    course: str = Field(min_length=2, max_length=100)
    password: Password

    _password = field_validator("password")(validate_password)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).lower()


class LoginInput(ApiModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).lower()


class ForgotPasswordInput(ApiModel):
    email: EmailStr

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).lower()


class ResetPasswordInput(ApiModel):
    token: str = Field(min_length=20)
    password: Password
    _password = field_validator("password")(validate_password)


class UpdateProfileInput(ApiModel):
    name: str = Field(min_length=2, max_length=120)
    course: str = Field(min_length=2, max_length=100)
    photoUrl: str | None = Field(default=None, max_length=255)

    _photo = field_validator("photoUrl")(validate_asset_url)


class ChangePasswordInput(ApiModel):
    currentPassword: str = Field(min_length=1, max_length=128)
    newPassword: Password
    _password = field_validator("newPassword")(validate_password)


class NewsInput(ApiModel):
    slug: Slug | None = None
    title: str = Field(min_length=3, max_length=200)
    summary: str | None = Field(default=None, max_length=300)
    content: str = Field(min_length=1, max_length=100_000)
    imageUrl: str | None = Field(default=None, max_length=255)
    category: NEWS_CATEGORIES
    authorId: int | None = Field(default=None, gt=0)
    status: Literal["Publicado"] | None = None
    _image = field_validator("imageUrl")(validate_asset_url)


class ScheduleInput(ApiModel):
    dayOfWeek: int = Field(ge=0, le=6)
    startTime: str = Field(pattern=r"^([01]\d|2[0-3]):[0-5]\d$")
    endTime: str | None = Field(default=None, pattern=r"^([01]\d|2[0-3]):[0-5]\d$")

    @model_validator(mode="after")
    def validate_interval(self) -> "ScheduleInput":
        if self.endTime and self.endTime <= self.startTime:
            raise ValueError("O horário final deve ser posterior ao inicial.")
        return self


class ModalityInput(ApiModel):
    slug: Slug | None = None
    name: str = Field(min_length=2, max_length=80)
    description: str | None = Field(default=None, max_length=10_000)
    imageUrl: str | None = Field(default=None, max_length=255)
    responsible: str | None = Field(default=None, max_length=120)
    trainingPlace: str | None = Field(default=None, max_length=150)
    schedules: list[ScheduleInput] | None = Field(default=None, max_length=30)
    _image = field_validator("imageUrl")(validate_asset_url)


class MemberInput(ApiModel):
    slug: Slug | None = None
    name: str = Field(min_length=2, max_length=120)
    course: str | None = Field(default=None, max_length=100)
    role: str | None = Field(default=None, max_length=80)
    boardMember: bool = False
    photoUrl: str | None = Field(default=None, max_length=255)
    instagram: str | None = Field(default=None, pattern=r"^@?[a-zA-Z0-9._]{1,30}$")
    modalityIds: list[int] = Field(default_factory=list, max_length=20)
    _photo = field_validator("photoUrl")(validate_asset_url)


class EventInput(ApiModel):
    slug: Slug | None = None
    title: str = Field(min_length=2, max_length=150)
    description: str | None = Field(default=None, max_length=50_000)
    type: EVENT_TYPES
    dateTime: datetime
    place: str = Field(min_length=2, max_length=150)
    imageUrl: str | None = Field(default=None, max_length=255)
    modalityId: int | None = Field(default=None, gt=0)
    _image = field_validator("imageUrl")(validate_asset_url)


class ResultInput(ApiModel):
    modalityId: int = Field(gt=0)
    eventId: int | None = Field(default=None, gt=0)
    opponent: str = Field(min_length=1, max_length=120)
    ourScore: int = Field(ge=0)
    opponentScore: int = Field(ge=0)
    competition: str | None = Field(default=None, max_length=150)
    date: date


class AchievementInput(ApiModel):
    title: str = Field(min_length=2, max_length=150)
    competition: str = Field(min_length=2, max_length=150)
    placement: str = Field(min_length=1, max_length=40)
    year: int = Field(ge=2000, le=2100)
    description: str | None = Field(default=None, max_length=50_000)
    modalityId: int | None = Field(default=None, gt=0)


class MilestoneInput(ApiModel):
    year: int = Field(ge=2000, le=2100)
    title: str = Field(min_length=2, max_length=150)
    description: str | None = Field(default=None, max_length=50_000)
    order: int = 0


class VariationInput(ApiModel):
    id: int | None = Field(default=None, gt=0)
    size: str = Field(min_length=1, max_length=10)
    stock: int = Field(ge=0)

    @field_validator("size")
    @classmethod
    def normalize_size(cls, value: str) -> str:
        return value.upper()


class ProductInput(ApiModel):
    slug: Slug | None = None
    name: str = Field(min_length=2, max_length=120)
    description: str | None = Field(default=None, max_length=50_000)
    priceCents: int = Field(ge=0, le=999_999_999)
    category: PRODUCT_CATEGORIES
    imageUrl: str | None = Field(default=None, max_length=255)
    active: bool = True
    variations: list[VariationInput] = Field(min_length=1, max_length=30)
    _image = field_validator("imageUrl")(validate_asset_url)


class OrderItemInput(ApiModel):
    variationId: int = Field(gt=0)
    quantity: int = Field(ge=1, le=99)


class CreateOrderInput(ApiModel):
    contactName: str = Field(min_length=2, max_length=120)
    contactPhone: str
    pickupMethod: Literal["CAMPUS", "COMBINAR"]
    notes: str | None = Field(default=None, max_length=500)
    items: list[OrderItemInput] = Field(min_length=1, max_length=50)

    @field_validator("contactPhone")
    @classmethod
    def normalize_phone(cls, value: str) -> str:
        digits = re.sub(r"\D", "", value)
        if not re.fullmatch(r"\d{10,11}", digits):
            raise ValueError("Informe um telefone com 10 ou 11 dígitos.")
        return digits


class UpdateOrderStatusInput(ApiModel):
    status: ORDER_STATUSES


class AdminUserInput(ApiModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    course: str = Field(min_length=2, max_length=100)
    photoUrl: str | None = Field(default=None, max_length=255)
    role: Literal["USUARIO", "ADMIN"]

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).lower()

    _photo = field_validator("photoUrl")(validate_asset_url)

