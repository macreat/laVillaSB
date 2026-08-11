from urllib.parse import quote
from uuid import uuid4

from .config import settings


def build_storage_key(filename: str) -> str:
    safe_name = filename.strip().replace(" ", "-")
    return f"uploads/{uuid4().hex}/{safe_name}"


def build_public_url(storage_key: str) -> str:
    key = quote(storage_key)
    if settings.cdn_base_url:
        return f"{settings.cdn_base_url.rstrip('/')}/{key}"
    return f"{settings.s3_endpoint_url.rstrip('/')}/{settings.s3_bucket}/{key}"


def build_put_url(storage_key: str) -> str:
    return f"{settings.s3_endpoint_url.rstrip('/')}/{settings.s3_bucket}/{quote(storage_key)}"
