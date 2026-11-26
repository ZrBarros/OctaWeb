import pytest
from pydantic import ValidationError

from app.schemas import CreateOrderInput, GalleryPhotoInput, MemberInput, ProductInput, RegisterInput


def test_register_normalizes_email() -> None:
    data = RegisterInput(name="Maria Souza", email="MARIA@EXAMPLE.COM", course="Computação", password="SenhaForte1")
    assert str(data.email) == "maria@example.com"


def test_register_rejects_weak_password() -> None:
    with pytest.raises(ValidationError, match="letra maiúscula"):
        RegisterInput(name="Maria Souza", email="maria@example.com", course="Computação", password="abcdefgh1")


def test_product_requires_variation() -> None:
    with pytest.raises(ValidationError):
        ProductInput(name="Camisa", priceCents=5990, category="CAMISAS", variations=[])


def test_member_requires_course_but_accepts_missing_social_and_role() -> None:
    data = MemberInput(name="Maria Souza", course="Computação")
    assert data.instagram is None
    assert data.role is None
    with pytest.raises(ValidationError):
        MemberInput(name="Maria Souza")


def test_gallery_photo_requires_image_and_description() -> None:
    data = GalleryPhotoInput(imageUrl="https://example.com/uploads/photo.jpg", description="Equipe reunida")
    assert data.caption is None
    with pytest.raises(ValidationError):
        GalleryPhotoInput(imageUrl="https://example.com/uploads/photo.jpg", description="")


def test_order_normalizes_phone() -> None:
    data = CreateOrderInput(contactName="Maria Souza", contactPhone="(82) 99999-9999", pickupMethod="CAMPUS", items=[{"variationId": 1, "quantity": 2}])
    assert data.contactPhone == "82999999999"

