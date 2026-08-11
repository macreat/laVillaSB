import argparse
import asyncio
import hashlib
import mimetypes
import re
import unicodedata
from dataclasses import dataclass
from pathlib import Path

import boto3
from botocore.exceptions import ClientError
from sqlalchemy import select

from .config import settings
from .database import AsyncSessionLocal, init_db
from .models import Category, Media, Product

IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tif", ".tiff"}


@dataclass(frozen=True)
class ImportItem:
    source_file: Path
    relative_file: Path
    category_label: str
    product_name: str
    sku: str
    storage_key: str
    mime_type: str


def slugify(value: str, max_length: int = 110) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    base = re.sub(r"[^a-z0-9]+", "-", ascii_value.lower()).strip("-")
    if not base:
        base = "item"
    if len(base) <= max_length:
        return base
    digest = hashlib.sha1(base.encode("utf-8")).hexdigest()[:8]
    return f"{base[:max_length]}-{digest}"[:120]


def titleize_filename(stem: str) -> str:
    cleaned = re.sub(r"[_-]+", " ", stem)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned.title() if cleaned else "Unnamed Product"


def build_items(source_root: Path) -> list[ImportItem]:
    items: list[ImportItem] = []
    for file_path in sorted(source_root.rglob("*")):
        if not file_path.is_file() or file_path.suffix.lower() not in IMAGE_SUFFIXES:
            continue

        relative_file = file_path.relative_to(source_root)
        category_parts = list(relative_file.parts[:-1])
        if not category_parts:
            category_parts = ["Uncategorized"]

        category_label = " / ".join(category_parts)
        product_name = titleize_filename(file_path.stem)
        rel_posix = relative_file.as_posix()
        sku = f"LV-{hashlib.sha1(rel_posix.encode('utf-8')).hexdigest()[:12].upper()}"
        mime_type = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"

        items.append(
            ImportItem(
                source_file=file_path,
                relative_file=relative_file,
                category_label=category_label,
                product_name=product_name,
                sku=sku,
                storage_key=f"imports/{rel_posix}",
                mime_type=mime_type,
            )
        )

    return items


async def import_catalog(source_root: Path, dry_run: bool = False) -> dict[str, int]:
    await init_db()
    items = build_items(source_root)

    if dry_run:
        return {
            "files_scanned": len(items),
            "categories_created": 0,
            "media_created": 0,
            "products_created": 0,
            "products_updated": 0,
        }

    category_cache: dict[str, Category] = {}
    created_categories = 0
    created_media = 0
    created_products = 0
    updated_products = 0
    uploaded_media = 0

    s3 = boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint_url,
        aws_access_key_id=settings.s3_access_key_id,
        aws_secret_access_key=settings.s3_secret_access_key,
        region_name=settings.s3_region,
    )
    try:
        s3.head_bucket(Bucket=settings.s3_bucket)
    except ClientError:
        s3.create_bucket(Bucket=settings.s3_bucket)

    async with AsyncSessionLocal() as session:
        for item in items:
            category_slug = slugify(item.category_label)
            category = category_cache.get(category_slug)
            if category is None:
                category = (
                    await session.execute(select(Category).where(Category.slug == category_slug))
                ).scalar_one_or_none()
                if category is None:
                    category = Category(slug=category_slug, name=item.category_label)
                    session.add(category)
                    await session.flush()
                    created_categories += 1
                category_cache[category_slug] = category

            media = (
                await session.execute(select(Media).where(Media.storage_key == item.storage_key))
            ).scalar_one_or_none()

            s3.upload_file(
                Filename=str(item.source_file),
                Bucket=settings.s3_bucket,
                Key=item.storage_key,
                ExtraArgs={"ContentType": item.mime_type},
            )
            uploaded_media += 1

            if media is None:
                media = Media(
                    storage_key=item.storage_key,
                    bucket=settings.s3_bucket,
                    mime_type=item.mime_type,
                    status="ready",
                    meta={
                        "sourcePath": str(item.source_file),
                        "relativePath": item.relative_file.as_posix(),
                        "importedFrom": "drive-folder",
                    },
                )
                session.add(media)
                await session.flush()
                created_media += 1

            product = (
                await session.execute(select(Product).where(Product.sku == item.sku))
            ).scalar_one_or_none()
            if product is None:
                product = Product(
                    name=item.product_name,
                    description=f"Imported from drive catalog path: {item.relative_file.as_posix()}",
                    sku=item.sku,
                    price=0,
                    category_id=category.id,
                    media_id=media.id,
                    active=True,
                )
                session.add(product)
                created_products += 1
            else:
                product.name = item.product_name
                product.description = f"Imported from drive catalog path: {item.relative_file.as_posix()}"
                product.category_id = category.id
                product.media_id = media.id
                product.active = True
                updated_products += 1

        await session.commit()

    return {
        "files_scanned": len(items),
        "categories_created": created_categories,
        "media_created": created_media,
        "media_uploaded": uploaded_media,
        "products_created": created_products,
        "products_updated": updated_products,
    }


async def async_main() -> None:
    parser = argparse.ArgumentParser(description="Import Drive catalog folders into DB metadata")
    parser.add_argument("--source", required=True, help="Absolute path to drive catalog root")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    source_root = Path(args.source).expanduser().resolve()
    if not source_root.exists() or not source_root.is_dir():
        raise SystemExit(f"Source folder not found or not a directory: {source_root}")

    result = await import_catalog(source_root=source_root, dry_run=args.dry_run)
    print(result)


def main() -> None:
    asyncio.run(async_main())


if __name__ == "__main__":
    main()
