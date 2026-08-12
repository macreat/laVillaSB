from decimal import Decimal, InvalidOperation
import re

from .models import Product

APPAREL_BUCKET_ORDER: tuple[str, ...] = ("Pantalones", "Busos", "Camisetas", "Zapatos")
_APPAREL_BUCKET_INDEX = {bucket: index for index, bucket in enumerate(APPAREL_BUCKET_ORDER)}


def parse_deck_size(category_name: str | None) -> Decimal | None:
    if not category_name:
        return None

    match = re.search(r"(\d+(?:[\.,]\d+)?)", category_name)
    if not match:
        return None

    value = match.group(1).replace(",", ".")
    try:
        return Decimal(value)
    except InvalidOperation:
        return None


def resolve_apparel_bucket(category_name: str | None) -> str | None:
    normalized = (category_name or "").casefold()

    if "pantal" in normalized or "jean" in normalized:
        return "Pantalones"
    if "camiset" in normalized:
        return "Camisetas"
    if "zapato" in normalized or "tenis" in normalized:
        return "Zapatos"
    if any(
        keyword in normalized
        for keyword in ("hoodie", "chaqueta", "buso", "camibuzo", "rompeviento")
    ):
        return "Busos"

    return None


def order_products(products: list[Product]) -> list[Product]:
    def sort_key(product: Product) -> tuple:
        category = product.category
        group = (category.category_group if category else None) or "uncategorized"
        category_name = category.name if category else None

        if group == "decks":
            size = parse_deck_size(category_name)
            if size is not None:
                return (0, 0, size, product.id)

            is_long_board = "long board" in (category_name or "").casefold()
            if is_long_board:
                return (0, 1, Decimal("0"), product.id)

            return (0, 2, Decimal("0"), product.id)

        if group == "apparel":
            bucket = resolve_apparel_bucket(category_name)
            bucket_order = _APPAREL_BUCKET_INDEX.get(bucket, len(APPAREL_BUCKET_ORDER))
            return (1, bucket_order, Decimal("0"), product.id)

        if group == "gear":
            return (2, 0, Decimal("0"), product.id)

        if group == "accessories":
            return (3, 0, Decimal("0"), product.id)

        return (4, 0, Decimal("0"), product.id)

    return sorted(products, key=sort_key)
