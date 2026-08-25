import pytest

from src.subcategory import classify_subcategory


@pytest.mark.parametrize(
    ("category", "name", "group", "expected"),
    [
        ("Skate / Maderos / 8.25", "Deck 8.25", "decks", "8.25"),
        ("Skate / Maderos / 7.75", "Deck 7.75", "decks", "7.75"),
        ("Long Board", "Long Board", "decks", "Long Board"),
        ("Tenis / Talla 8Us -39Col / Todo", "Hoddie shoe", "apparel", "Shoes"),
        ("Ropa / Talla L", "La Villa Hoddie", "apparel", "Hoodies"),
        ("Ropa / Talla M", "Classic Buzo", "apparel", "Sweatshirts"),
        ("Ropa / Talla S", "Camiseta Logo", "apparel", "T-Shirts"),
        ("Ropa / Talla XL", "Chaqueta Rompevientos", "apparel", "Jackets & Outerwear"),
        ("Ropa / Pantalones", "Work pants", "apparel", "Pants"),
        ("Ropa / Talla S", "Uncatalogued item", "apparel", "Other Apparel"),
        ("Maletines - Canguros", "Waist pack", "accessories", "Bags & Waist Packs"),
        ("Skate / Lijas", "Grip tape", "accessories", "Grip Tape"),
        ("Skate / Trucks", "Trucks", "gear", "Trucks"),
        ("Skate / Ruedas", "Wheels", "gear", "Wheels"),
        ("Skate / Rodamientos", "Bearings", "gear", "Bearings"),
        (
            "Skate / Hardware y Accesorios",
            "Hardware",
            "gear",
            "Hardware & Accessories",
        ),
    ],
)
def test_classify_subcategory_uses_canonical_values(
    category: str, name: str, group: str, expected: str
):
    assert classify_subcategory(category, name, group) == expected


def test_classify_subcategory_returns_null_for_missing_or_unknown_non_apparel_data():
    assert classify_subcategory(None, None, None) is None
    assert classify_subcategory("Unmapped category", "Mystery product", "uncategorized") is None
    assert classify_subcategory("Skate / Unknown", "Mystery product", "decks") is None


def test_classify_subcategory_uses_category_group_mapper_when_stored_group_is_missing():
    assert (
        classify_subcategory("Skate / Hardware y Accesorios", "Hardware", None)
        == "Hardware & Accessories"
    )
