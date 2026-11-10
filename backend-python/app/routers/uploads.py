import re
from pathlib import Path
from typing import Annotated
from uuid import UUID, uuid4

from fastapi import APIRouter, File, UploadFile, status
from fastapi.responses import FileResponse

from app.dependencies import AdminUser, AppSettings
from app.errors import not_found, unprocessable

admin_router = APIRouter(prefix="/api/v1/admin/uploads", tags=["Uploads"])
public_router = APIRouter(prefix="/uploads", tags=["Uploads"])

IMAGE_TYPES: dict[str, tuple[str, bytes]] = {
    "image/jpeg": ("jpg", bytes([0xFF, 0xD8, 0xFF])),
    "image/png": ("png", bytes([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])),
    "image/webp": ("webp", b"RIFF"),
}


@admin_router.post("/images", status_code=status.HTTP_201_CREATED)
def upload_image(actor: AdminUser, settings: AppSettings, file: Annotated[UploadFile, File()]) -> dict:
    image_type = IMAGE_TYPES.get(file.content_type or "")
    if not image_type:
        raise unprocessable("Formato inválido. Use JPG, PNG ou WebP.")
    content = file.file.read(settings.max_upload_bytes + 1)
    if len(content) > settings.max_upload_bytes:
        raise unprocessable(f"A imagem deve ter no máximo {settings.max_upload_bytes} bytes.")
    extension, signature = image_type
    if not content.startswith(signature):
        raise unprocessable("O conteúdo do arquivo não corresponde ao formato informado.")
    if extension == "webp" and content[8:12] != b"WEBP":
        raise unprocessable("Arquivo WebP inválido.")
    directory = Path(settings.upload_dir).resolve()
    directory.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid4()}.{extension}"
    destination = directory / filename
    destination.write_bytes(content)
    return {"data": {"url": f"{settings.public_api_url}/uploads/{filename}", "mimeType": file.content_type, "size": len(content)}}


@public_router.get("/{filename}")
def get_image(filename: str, settings: AppSettings) -> FileResponse:
    match = re.fullmatch(r"([0-9a-fA-F-]{36})\.(jpg|png|webp)", filename)
    if not match:
        raise not_found("Imagem")
    try:
        UUID(match.group(1), version=4)
    except ValueError as error:
        raise not_found("Imagem") from error
    path = Path(settings.upload_dir).resolve() / filename
    if not path.is_file():
        raise not_found("Imagem")
    media_type = "image/jpeg" if match.group(2).lower() == "jpg" else f"image/{match.group(2).lower()}"
    return FileResponse(path, media_type=media_type, headers={"X-Content-Type-Options": "nosniff", "Cache-Control": "public, max-age=2592000, immutable"})

