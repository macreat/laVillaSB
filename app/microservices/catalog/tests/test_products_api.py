from datetime import datetime
from decimal import Decimal

from fastapi.testclient import TestClient

from src.main import app
from src.main import get_session
from src.models import Category, Media, Product
from src.storage import build_public_url

NOW = datetime(2026, 8, 12, 11, 0, 0)


class FakeSession:
    def __init__(self, products: list[Product]):
        self._products = {product.id: product for product in products}

    async def get(self, _model, product_id: int, options=None):
        return self._products.get(product_id)


def make_product(product_id: int, media: Media | None = None) -> Product:
    product = Product(
        id=product_id,
        name=f"Product {product_id}",
        description="Live catalog description",
        sku=f"LV-{product_id}",
        price=Decimal("123.45"),
        active=True,
        created_at=NOW,
        updated_at=NOW,
    )
    product.category = Category(
        id=1,
        slug="decks",
        name="Skate / Maderos / 8.25",
        category_group="decks",
    )
    product.media = media
    return product


def test_get_product_detail_returns_live_product_with_ready_media_url() -> None:
    ready_media = Media(
        id=300,
        storage_key="uploads/deck-1.png",
        bucket="catalog-media",
        mime_type="image/png",
        status="ready",
    )
    product = make_product(10, media=ready_media)

    async def override_get_session():
        yield FakeSession([product])

    app.dependency_overrides[get_session] = override_get_session
    try:
        client = TestClient(app)
        response = client.get("/products/10")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    payload = response.json()
    assert payload["id"] == 10
    assert payload["name"] == "Product 10"
    assert payload["description"] == "Live catalog description"
    assert payload["imageUrl"] == build_public_url("uploads/deck-1.png")
    assert payload["category"] == "Skate / Maderos / 8.25"
    assert payload["categoryGroup"] == "decks"
    assert payload["categorySubcategory"] == "8.25"


def test_get_product_detail_returns_null_image_for_unusable_media() -> None:
    pending_media = Media(
        id=301,
        storage_key="uploads/deck-2.png",
        bucket="catalog-media",
        mime_type="image/png",
        status="pending",
    )
    product = make_product(11, media=pending_media)

    async def override_get_session():
        yield FakeSession([product])

    app.dependency_overrides[get_session] = override_get_session
    try:
        client = TestClient(app)
        response = client.get("/products/11")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["imageUrl"] is None


def test_get_product_detail_returns_404_for_unknown_product() -> None:
    async def override_get_session():
        yield FakeSession([])

    app.dependency_overrides[get_session] = override_get_session
    try:
        client = TestClient(app)
        response = client.get("/products/999")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 404
    assert response.json() == {"detail": "Product not found"}
