from contextlib import asynccontextmanager
from typing import Optional

import boto3
from botocore.config import Config
from fastapi import Depends, FastAPI, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .category_groups import resolve_group
from .config import settings
from .database import get_session, init_db
from .merchandising import order_products
from .models import Category, Media, Product, Subscriber
from .schemas import (
    MediaCompleteRequest,
    MediaCompleteResponse,
    MediaPresignRequest,
    MediaPresignResponse,
    NLSearchRequest,
    NLSearchResponse,
    ProductCreate,
    ProductOut,
    SubscriberCreate,
    SubscriberOut,
)
from .nl_search import SearchFilters, _stem_es, parse_query
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

    # If still uncategorized, try keyword mapping on the category NAME itself
    # (handles cases where category_group column was not populated correctly)
    if category_group == "uncategorized" and category_name:
        from .category_groups import map_category_name
        category_group = map_category_name(category_name)

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
async def list_products(
    search: Optional[str] = Query(None, description="Search by name, SKU, or numeric product ID"),
    id: Optional[int] = Query(None, description="Exact product ID filter"),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Product)
        .options(selectinload(Product.category), selectinload(Product.media))
        .order_by(Product.id.asc())
    )
    products = result.scalars().all()

    if id is not None:
        products = [p for p in products if p.id == id]

    if search:
        needle = search.strip().lower()
        if needle:
            if needle.isdigit():
                products = [p for p in products if str(p.id) == needle]
            else:
                products = [
                    p
                    for p in products
                    if needle in p.name.lower()
                    or (p.sku and needle in p.sku.lower())
                ]

    ordered_products = order_products(products)

    return [to_product_out(product) for product in ordered_products]


def _apply_filters(products: list[Product], filters: SearchFilters) -> list[Product]:
    """Apply structured search filters to a list of products.

    Uses OR logic for keywords (broader recall) and ranks by relevance.
    Category/brand/price filters are hard gates.
    """
    result = products

    # Filter by category group (hard gate)
    if filters.category_group:
        group = filters.category_group.strip().lower()
        result = [
            p for p in result
            if p.category
            and p.category.category_group
            and p.category.category_group.strip().lower() == group
        ]

    # Filter by subcategory (hard gate)
    if filters.subcategory:
        sub = filters.subcategory.strip()
        result = [
            p for p in result
            if classify_subcategory(
                p.category.name if p.category else None,
                p.name,
                p.category.category_group if p.category else None,
            ) == sub
        ]

    # Filter by price range (hard gate)
    if filters.min_price is not None:
        result = [p for p in result if float(p.price) >= filters.min_price]
    if filters.max_price is not None:
        result = [p for p in result if float(p.price) <= filters.max_price]

    # Filter by brand keywords (hard gate - must match at least one)
    if filters.brand_keywords:
        brand_matched = []
        for p in result:
            name_lower = p.name.lower()
            if any(brand.lower() in name_lower for brand in filters.brand_keywords):
                brand_matched.append(p)
        result = brand_matched

    # Keyword scoring (soft gate - OR match with stemming, rank by relevance)
    if filters.keywords:
        stemmed_keywords = [_stem_es(kw) for kw in filters.keywords]
        scored = []
        for p in result:
            name_lower = p.name.lower()
            cat_lower = (p.category.name.lower() if p.category else "")
            sku_lower = (p.sku.lower() if p.sku else "")
            desc_lower = (p.description.lower() if p.description else "")
            search_text = f"{name_lower} {cat_lower} {sku_lower} {desc_lower}"

            # Score using both original and stemmed keywords
            score = 0
            for kw, stemmed in zip(filters.keywords, stemmed_keywords):
                if kw.lower() in search_text or stemmed in search_text:
                    score += 1
            if score > 0:
                scored.append((p, score))

        # Sort by relevance score descending, then by name
        scored.sort(key=lambda x: (-x[1], x[0].name))
        result = [p for p, _ in scored]

    return result


@app.post("/search", response_model=NLSearchResponse)
async def nl_search(
    payload: NLSearchRequest,
    session: AsyncSession = Depends(get_session),
):
    """Natural language product search.

    Accepts a free-text query (Spanish or English), uses an LLM to parse
    it into structured filters, then applies those filters to the catalog.
    """
    filters = await parse_query(payload.query)

    result = await session.execute(
        select(Product)
        .options(selectinload(Product.category), selectinload(Product.media))
        .order_by(Product.id.asc())
    )
    products = list(result.scalars().all())

    matched = _apply_filters(products, filters)
    ordered = order_products(matched)

    return NLSearchResponse(
        filters={
            "keywords": filters.keywords,
            "category_group": filters.category_group,
            "subcategory": filters.subcategory,
            "min_price": filters.min_price,
            "max_price": filters.max_price,
            "brand_keywords": filters.brand_keywords,
        },
        products=[to_product_out(p) for p in ordered],
    )


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


@app.post("/products", response_model=ProductOut)
async def create_product(
    payload: ProductCreate,
    session: AsyncSession = Depends(get_session),
):
    product = Product(
        name=payload.name,
        description=payload.description,
        sku=payload.sku,
        price=payload.price,
        category_id=payload.category_id,
        media_id=payload.media_id,
        active=payload.active,
    )
    session.add(product)
    await session.commit()
    await session.refresh(product, ["category", "media"])
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


@app.post("/subscribers", response_model=SubscriberOut)
async def create_subscriber(payload: SubscriberCreate, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Subscriber).where(Subscriber.email == payload.email))
    existing = result.scalars().first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already subscribed")
    sub = Subscriber(email=payload.email, tag=payload.tag)
    session.add(sub)
    await session.commit()
    await session.refresh(sub)
    return sub


@app.get("/subscribers", response_model=list[SubscriberOut])
async def list_subscribers(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Subscriber).order_by(Subscriber.id.desc()))
    return result.scalars().all()


@app.get("/subscribers/count")
async def count_subscribers(session: AsyncSession = Depends(get_session)):
    from sqlalchemy import func
    count = (await session.execute(select(func.count(Subscriber.id)))).scalar_one()
    return {"count": count}
