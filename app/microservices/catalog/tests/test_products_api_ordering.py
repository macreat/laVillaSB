from datetime import datetime
from decimal import Decimal

from fastapi.testclient import TestClient

from src.main import app
from src.main import get_session
from src.models import Category, Product

NOW = datetime(2026, 8, 12, 10, 30, 0)


class FakeScalarResult:
    def __init__(self, products: list[Product]):
        self._products = products

    def all(self) -> list[Product]:
        return self._products


class FakeExecuteResult:
    def __init__(self, products: list[Product]):
        self._products = products

    def scalars(self) -> FakeScalarResult:
        return FakeScalarResult(self._products)


class FakeSession:
    def __init__(self, products: list[Product]):
        self._products = products

    async def execute(self, _query):
        return FakeExecuteResult(self._products)


def make_product(product_id: int, category_name: str, category_group: str) -> Product:
    product = Product(
        id=product_id,
        name=f"Product {product_id}",
        price=Decimal("100.00"),
        active=True,
        created_at=NOW,
        updated_at=NOW,
    )
    product.category = Category(
        id=product_id,
        slug=f"cat-{product_id}",
        name=category_name,
        category_group=category_group,
    )
    return product


def test_get_products_returns_catalog_merchandising_order() -> None:
    products = [
        make_product(11, "Ropa / Camisetas", "apparel"),
        make_product(10, "Skate / Maderos / 8.25", "decks"),
        make_product(9, "Skate / Maderos / 7.75", "decks"),
    ]

    async def override_get_session():
        yield FakeSession(products)

    app.dependency_overrides[get_session] = override_get_session
    try:
        client = TestClient(app)
        response = client.get("/products")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    payload = response.json()
    assert [item["id"] for item in payload] == [9, 10, 11]
