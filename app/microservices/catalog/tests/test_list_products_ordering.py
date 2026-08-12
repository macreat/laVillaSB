from datetime import datetime
from decimal import Decimal

import pytest

from src.main import list_products
from src.models import Category, Product

NOW = datetime(2026, 8, 12, 10, 0, 0)


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"


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


@pytest.mark.anyio
async def test_list_products_applies_merchandising_order_instead_of_id_order() -> None:
    products = [
        make_product(10, "Skate / Maderos / 8.25", "decks"),
        make_product(8, "Ropa / Hoodies", "apparel"),
        make_product(9, "Skate / Maderos / 7.75", "decks"),
    ]
    session = FakeSession(products)

    response = await list_products(session=session)

    assert [item.id for item in response] == [9, 10, 8]
