import re
import unicodedata
from typing import Any


def make_slug(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii").lower()
    return re.sub(r"^-+|-+$", "", re.sub(r"[^a-z0-9]+", "-", normalized))


def pagination(page: int, page_size: int) -> tuple[int, int]:
    return (page - 1) * page_size, page_size


def page_result(items: list[Any], total: int, page: int, page_size: int) -> dict[str, Any]:
    return {"data": items, "meta": {"page": page, "pageSize": page_size, "total": total, "totalPages": (total + page_size - 1) // page_size}}

