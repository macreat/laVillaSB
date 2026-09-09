from datetime import datetime
from decimal import Decimal

import pytest
from pydantic import ValidationError

from src.main import to_product_out
from src.models import Category, Product
from src.schemas import ProductOut

NOW = datetime(2026, 8, 11, 12, 0, 0)


def make_product(category: Category | None = None) -> Product:
    product = Product(
        id=1,
        name="Deck 8.25",
        description=None,
        sku="LV-ABC123",
        price=Decimal("120.00"),
        active=True,
        created_at=NOW,
        updated_at=NOW,
    )
    product.category = category
    return product


def make_category(name: str, category_group: str | None) -> Category:
    category = Category(id=1, slug="cat", name=name, category_group=category_group)
    return category


def test_product_out_requires_category_group_field():
    with pytest.raises(ValidationError):
        ProductOut(
            id=1,
            name="Deck 8.25",
            description=None,
            sku="LV-ABC123",
            price=Decimal("120.00"),
            active=True,
            created_at=NOW,
            updated_at=NOW,
        )


def test_to_product_out_serializes_stored_category_group():
    product = make_product(category=make_category("Skate / Maderos / 8.25", "decks"))

    out = to_product_out(product)

    assert out.categoryGroup == "decks"
    assert out.categorySubcategory == "8.25"


def test_to_product_out_falls_back_to_category_name_when_stored_group_is_null():
    product = make_product(category=make_category("Ropa / Talla L", None))

    out = to_product_out(product)

    assert out.categoryGroup == "apparel"
    assert out.categorySubcategory == "Other Apparel"


def test_to_product_out_serializes_uncategorized_when_no_category():
    product = make_product(category=None)

    out = to_product_out(product)

    assert out.categoryGroup == "uncategorized"
    assert out.categorySubcategory is None


def test_to_product_out_serializes_null_subcategory_for_unknown_non_apparel_category():
    product = make_product(category=make_category("Unmapped category", None))

    out = to_product_out(product)

    assert out.categoryGroup == "uncategorized"
    assert out.categorySubcategory is None


def test_to_product_out_falls_back_to_category_name_for_unrecognized_stored_group():
    product = make_product(category=make_category("Ropa / Talla L", "not-a-group"))

    out = to_product_out(product)

    assert out.categoryGroup == "apparel"
    assert out.categorySubcategory == "Other Apparel"


def test_to_product_out_preserves_existing_fields():
    product = make_product(category=make_category("Skate / Maderos / 8.25", "decks"))

    out = to_product_out(product)

    assert out.category == "Skate / Maderos / 8.25"
    assert out.name == "Deck 8.25"
    assert out.price == Decimal("120.00")


def test_to_product_out_serializes_the_three_level_storefront_taxonomy():
    product = make_product(category=make_category("Skate / Maderos / 8.25", "decks"))

    out = to_product_out(product)

    assert out.categorySection == "skate"
    assert out.categoryKey == "tablas"
    assert out.categorySize == '8.25"'
