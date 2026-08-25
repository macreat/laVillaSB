from contextlib import asynccontextmanager

import boto3
from botocore.config import Config
from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .category_groups import resolve_group
from .config import settings
from .database import get_session, init_db
from .merchandising import order_products
from .models import Category, Media, Product
from .schemas import (
    MediaCompleteRequest,
    MediaCompleteResponse,
    MediaPresignRequest,
    MediaPresignResponse,
    ProductOut,
)
from .storage import build_public_url, build_put_url, build_storage_key, ensure_public_bucket
from .subcategory import classify_subcategory


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    ensure_public_bucket()
    yield
    # TODO: close connections


app = FastAPI(
    title="laVilla SB Catalog Service",
    description="Product and category management microservice.",
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "catalog"}


def to_product_out(product: Product) -> ProductOut:
    image_url = None
    if product.media and product.media.status == "ready":
        image_url = build_public_url(product.media.storage_key)

    category_name = product.category.name if product.category else None
    stored_category_group = product.category.category_group if product.category else None
    category_group = resolve_group(stored_category_group)

    return ProductOut(
        id=product.id,
        name=product.name,
        description=product.description,
        sku=product.sku,
        price=product.price,
        category=category_name,
        categoryGroup=category_group,
        categorySubcategory=(
            classify_subcategory(category_name, product.name, stored_category_group)
            if category_group != "uncategorized"
            else None
        ),
        active=product.active,
        created_at=product.created_at,
        updated_at=product.updated_at,
        imageUrl=image_url,
    )


@app.get("/products", response_model=list[ProductOut])
async def list_products(session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(Product)
        .options(selectinload(Product.category), selectinload(Product.media))
        .order_by(Product.id.asc())
    )
    products = result.scalars().all()
    ordered_products = order_products(products)

    return [to_product_out(product) for product in ordered_products]


@app.get("/products/{product_id}", response_model=ProductOut)
async def get_product(product_id: int, session: AsyncSession = Depends(get_session)):
    product = await session.get(
        Product,
        product_id,
        options=[selectinload(Product.category), selectinload(Product.media)],
    )

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return to_product_out(product)


@app.post("/media/presign", response_model=MediaPresignResponse)
async def presign_media_upload(
    payload: MediaPresignRequest,
    session: AsyncSession = Depends(get_session),
):
    storage_key = build_storage_key(payload.filename)

    media = Media(
        storage_key=storage_key,
        bucket=settings.s3_bucket,
        mime_type=payload.contentType,
        status="pending",
    )
    session.add(media)
    await session.commit()
    await session.refresh(media)

    s3 = boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint_url,
        aws_access_key_id=settings.s3_access_key_id,
        aws_secret_access_key=settings.s3_secret_access_key,
        region_name=settings.s3_region,
        config=Config(signature_version="s3v4"),
    )

    presigned_url = s3.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": settings.s3_bucket,
            "Key": storage_key,
            "ContentType": payload.contentType,
        },
        ExpiresIn=settings.media_presign_expires_seconds,
    )

    return MediaPresignResponse(
        mediaId=media.id,
        uploadUrl=presigned_url or build_put_url(storage_key),
        headers={"Content-Type": payload.contentType},
        expiresIn=settings.media_presign_expires_seconds,
        objectKey=storage_key,
    )


@app.post("/media/{media_id}/complete", response_model=MediaCompleteResponse)
async def complete_media_upload(
    media_id: int,
    payload: MediaCompleteRequest,
    session: AsyncSession = Depends(get_session),
):
    media = await session.get(Media, media_id)
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    media.status = "ready"
    media.variants = payload.variants
    await session.commit()
    await session.refresh(media)

    return MediaCompleteResponse(id=media.id, status=media.status, variants=media.variants)
