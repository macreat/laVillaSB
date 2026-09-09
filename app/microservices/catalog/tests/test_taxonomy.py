import pytest

from src.taxonomy import (
    SECTION_CATEGORIES,
    SECTIONS,
    resolve_category,
    resolve_section,
    resolve_size,
    size_sort_key,
)


@pytest.mark.parametrize(
    ("subcategory", "name", "section", "category"),
    [
        ("8.25", "Prowler Deck", "skate", "tablas"),
        ("7.75", "Mini Deck", "skate", "tablas"),
        ("Long Board", "Ruedas Amateur Long Azul", "skate", "long-board"),
        ("Trucks", "Mule Golden", "skate", "trucks"),
        ("Bearings", "Dodo Bearings Avec 9", "skate", "rodamientos"),
        ("Wheels", "Amateur 56Mm Flores", "skate", "ruedas"),
        ("Hardware & Accessories", "Herramienta T Negra", "skate", "herramientas-accesorios"),
        ("Grip Tape", "Grizzly Naranjas", "skate", "herramientas-accesorios"),
        ("Bags & Waist Packs", "Maletin Nike", "skate", "herramientas-accesorios"),
        ("Shoes", "Nike SB", "ropa", "zapatos"),
        ("Jackets & Outerwear", "Chaqueta Rompevientos", "ropa", "chaquetas"),
        ("Hoodies", "La Villa Hoodie", "ropa", "busos"),
        ("Sweatshirts", "Classic Buzo", "ropa", "busos"),
        ("T-Shirts", "Camiseta Logo", "ropa", "camisetas"),
        ("Pants", "Work Pants", "ropa", "pantalones"),
        ("Other Apparel", "Mystery garment", "ropa", "otros"),
    ],
)
def test_routes_every_canonical_subcategory_into_a_section_and_category(
    subcategory: str, name: str, section: str, category: str
):
    assert resolve_section(subcategory, name) == section
    assert resolve_category(subcategory, name) == category
    assert section in SECTIONS
    assert category in SECTION_CATEGORIES[section]


def test_protective_gear_in_the_long_board_folder_routes_to_tools_and_accessories():
    assert resolve_category("Long Board", "Black Red Casco") == "herramientas-accesorios"
    assert resolve_category("Long Board", "Kit Proteccion (2)") == "herramientas-accesorios"


def test_protection_keywords_do_not_override_other_subcategories():
    assert resolve_category("T-Shirts", "Camiseta Casco Print") == "camisetas"


def test_unclassified_products_have_no_section():
    assert resolve_section(None, "Mystery product") is None
    assert resolve_category(None, "Mystery product") is None
    assert resolve_size(None, "Mystery product", None) is None


@pytest.mark.parametrize(
    ("category", "name", "subcategory", "expected"),
    [
        ("Skate / Maderos / 8.25", "Prowler Deck", "8.25", '8.25"'),
        ("Skate / Maderos / 7.75", "Mini Deck", "7.75", '7.75"'),
        ("Ropa / Talla L", "La Villa Hoodie", "Hoodies", "L"),
        ("Ropa / Talla XL", "Chaqueta Rompevientos", "Jackets & Outerwear", "XL"),
        ("Ropa / Pantalones", "Work Pants", "Pants", None),
        ("Tenis / Talla 8Us -39Col / Todo", "Nike SB", "Shoes", "8 US / 39 COL"),
        (
            "Tenis / Talla 10, 10.5Us - 42Col / Originales",
            "Vans Old Skool",
            "Shoes",
            "10-10.5 US / 42 COL",
        ),
        ("Tenis / Talla 7.5Us - 38Co / Replica", "Adidas", "Shoes", "7.5 US / 38 COL"),
        ("Skate / Ruedas", "Amateur 56Mm Flores", "Wheels", "56mm"),
        ("Skate / Ruedas", "Cabra", "Wheels", None),
        ("Skate / Rodamientos", "Dodo Bearings Avec 9", "Bearings", "ABEC 9"),
        ("Skate / Rodamientos", "Rush Caja", "Bearings", None),
        ("Skate / Trucks", "Independent 139", "Trucks", "139"),
        ("Skate / Trucks", "Mule Golden", "Trucks", None),
        ("Skate / Lijas", "Grizzly Naranjas", "Grip Tape", None),
    ],
)
def test_resolves_the_size_from_the_drive_path_or_the_product_name(
    category: str, name: str, subcategory: str, expected: str | None
):
    assert resolve_size(category, name, subcategory) == expected


def test_sizes_sort_by_apparel_scale_then_numerically():
    apparel = sorted(["XL", "S", "L", "M"], key=size_sort_key)
    assert apparel == ["S", "M", "L", "XL"]

    decks = sorted(['8.25"', '7.75"', '8.0"', '8.125"'], key=size_sort_key)
    assert decks == ['7.75"', '8.0"', '8.125"', '8.25"']

    bearings = sorted(["ABEC 9", "ABEC 7"], key=size_sort_key)
    assert bearings == ["ABEC 7", "ABEC 9"]
