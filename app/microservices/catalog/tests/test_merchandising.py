from decimal import Decimal

from src.merchandising import order_products
from src.models import Category, Product


def make_product(
    product_id: int,
    category_name: str | None,
    category_group: str | None,
    name: str = "Product",
) -> Product:
    product = Product(id=product_id, name=name, price=Decimal("10.00"), active=True)
    if category_name is not None or category_group is not None:
        product.category = Category(
            id=product_id,
            slug=f"cat-{product_id}",
            name=category_name or "",
            category_group=category_group,
        )
    return product


def test_orders_decks_by_decimal_size_then_long_boards_then_id_ties() -> None:
    products = [
        make_product(12, "Skate / Maderos / 8.25", "decks"),
        make_product(10, "Skate / Maderos / 7.75", "decks"),
        make_product(11, "Skate / Maderos / 8.0", "decks"),
        make_product(14, "Skate / Long Board", "decks"),
        make_product(13, "Skate / Maderos / 8.25", "decks"),
    ]

    ordered = order_products(products)

    assert [product.id for product in ordered] == [10, 11, 12, 13, 14]


def test_orders_apparel_with_bucket_precedence_and_outerwear_to_busos() -> None:
    products = [
        make_product(22, "Ropa / Camisetas", "apparel"),
        make_product(24, "Ropa / Zapatos", "apparel"),
        make_product(23, "Ropa / Chaquetas", "apparel"),
        make_product(21, "Ropa / Pantalones", "apparel"),
        make_product(20, "Ropa / Hoodies", "apparel"),
    ]

    ordered = order_products(products)

    assert [product.id for product in ordered] == [21, 20, 23, 22, 24]


def test_keeps_accessories_and_gear_stable_and_keeps_missing_data_visible() -> None:
    products = [
        make_product(32, "Accesorios / Canguros", "accessories"),
        make_product(31, "Accesorios / Lijas", "accessories"),
        make_product(42, "Skate / Rodamientos", "gear"),
        make_product(41, "Skate / Trucks", "gear"),
        make_product(50, "Skate / Maderos", "decks"),
        make_product(61, None, None),
        make_product(60, "Legacy / Unknown", "apparel"),
    ]

    ordered = order_products(products)

    assert [product.id for product in ordered] == [50, 60, 41, 42, 31, 32, 61]
