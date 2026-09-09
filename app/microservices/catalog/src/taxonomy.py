"""Three-level storefront taxonomy: section -> category -> size.

The catalog groups (``decks``, ``apparel``, ``gear``, ``accessories``) and the
canonical subcategories stay the authoritative classification. This module is a
presentation layer on top of them: it folds those groups into the two sections
the storefront navigates by (``skate`` and ``ropa``), names the browsable
category inside each section, and derives the size/measure a shopper picks from.

Sizes are not stored on the product. They live in the Drive folder path that
became the category name (``Skate / Maderos / 8.25``, ``Ropa / Talla L``,
``Tenis / Talla 8Us -39Col / Todo``) or in the product name itself for gear
(``Amateur 56Mm Flores``, ``Dodo Bearings Avec 9``). Each source gets its own
parser so a missing size degrades to ``None`` instead of a wrong one.
"""

import re

SECTIONS: tuple[str, ...] = ("skate", "ropa")

# Ordered browsable categories per section. Order is the storefront tab order.
SECTION_CATEGORIES: dict[str, tuple[str, ...]] = {
    "skate": (
        "tablas",
        "long-board",
        "trucks",
        "rodamientos",
        "ruedas",
        "herramientas-accesorios",
    ),
    "ropa": ("zapatos", "chaquetas", "busos", "camisetas", "pantalones", "otros"),
}

# Canonical subcategory -> (section, category). Subcategories that share a
# destination collapse here rather than in the storefront.
_SUBCATEGORY_ROUTES: dict[str, tuple[str, str]] = {
    "Long Board": ("skate", "long-board"),
    "Trucks": ("skate", "trucks"),
    "Bearings": ("skate", "rodamientos"),
    "Wheels": ("skate", "ruedas"),
    "Hardware & Accessories": ("skate", "herramientas-accesorios"),
    "Grip Tape": ("skate", "herramientas-accesorios"),
    "Bags & Waist Packs": ("skate", "herramientas-accesorios"),
    "Shoes": ("ropa", "zapatos"),
    "Jackets & Outerwear": ("ropa", "chaquetas"),
    "Hoodies": ("ropa", "busos"),
    "Sweatshirts": ("ropa", "busos"),
    "T-Shirts": ("ropa", "camisetas"),
    "Pants": ("ropa", "pantalones"),
    "Other Apparel": ("ropa", "otros"),
}

# Protective gear ships inside the Drive "Long Board" folder but belongs with
# the tools and accessories a rider browses, per the catalog owner's taxonomy.
_PROTECTION_KEYWORDS = ("casco", "proteccion", "protección", "rodillera", "codera")

_DECK_SIZE_PATTERN = re.compile(r"(?<!\d)(\d+\.\d+)(?!\d)")
_APPAREL_SIZE_PATTERN = re.compile(r"talla\s+(xs|s|m|l|xl|xxl)\b", re.IGNORECASE)
# Drive spells the Colombian size both "39Col" and "38Co", so the "l" is optional.
_SHOE_SIZE_PATTERN = re.compile(
    r"talla\s+([\d.,\s]+?)\s*us\s*-?\s*(\d+)\s*col?\b", re.IGNORECASE
)
_WHEEL_SIZE_PATTERN = re.compile(r"(?<!\d)(\d{2})\s*mm\b", re.IGNORECASE)
_BEARING_SIZE_PATTERN = re.compile(r"a[bv]ec\s*(\d+)", re.IGNORECASE)
_TRUCK_SIZE_PATTERN = re.compile(r"(?<!\d)(1[0-9]{2})(?!\d)")

_APPAREL_SIZE_ORDER = ("XS", "S", "M", "L", "XL", "XXL")


def _normalized(value: str | None) -> str:
    return (value or "").strip().casefold()


def resolve_section(subcategory: str | None, product_name: str | None) -> str | None:
    """Return the storefront section a product belongs to, or ``None``."""
    route = _route(subcategory, product_name)
    return route[0] if route else None


def resolve_category(subcategory: str | None, product_name: str | None) -> str | None:
    """Return the browsable category key inside the section, or ``None``."""
    route = _route(subcategory, product_name)
    return route[1] if route else None


def _route(subcategory: str | None, product_name: str | None) -> tuple[str, str] | None:
    if not subcategory:
        return None

    # "Long Board" is the one Drive folder that mixes protective gear in with
    # boards, so the name override is scoped to it rather than applied globally.
    if subcategory == "Long Board":
        name = _normalized(product_name)
        if any(keyword in name for keyword in _PROTECTION_KEYWORDS):
            return ("skate", "herramientas-accesorios")

    route = _SUBCATEGORY_ROUTES.get(subcategory)
    if route:
        return route

    # Deck subcategories are the widths themselves ("8.25"), so anything that
    # parses as a width is a board.
    if _DECK_SIZE_PATTERN.fullmatch(subcategory.strip()):
        return ("skate", "tablas")
    return None


def _normalize_shoe_size(us_part: str, col_part: str) -> str:
    """Render ``10, 10.5`` + ``42`` as ``10-10.5 US / 42 COL``."""
    values = [chunk.strip() for chunk in us_part.split(",") if chunk.strip()]
    us = "-".join(values) if values else us_part.strip()
    return f"{us} US / {col_part} COL"


def resolve_size(
    category: str | None,
    product_name: str | None,
    subcategory: str | None,
) -> str | None:
    """Derive the size/measure shoppers filter by, or ``None`` when unsized."""
    route = _route(subcategory, product_name)
    if not route:
        return None

    _, category_key = route
    haystack_category = category or ""
    haystack_name = product_name or ""

    if category_key == "tablas":
        # The subcategory already is the width for decks; fall back to the
        # Drive path for products classified some other way.
        candidate = (subcategory or "").strip()
        if _DECK_SIZE_PATTERN.fullmatch(candidate):
            return f'{candidate}"'
        match = _DECK_SIZE_PATTERN.search(haystack_category)
        return f'{match.group(1)}"' if match else None

    if category_key == "zapatos":
        match = _SHOE_SIZE_PATTERN.search(haystack_category)
        return _normalize_shoe_size(match.group(1), match.group(2)) if match else None

    if category_key in ("chaquetas", "busos", "camisetas", "pantalones", "otros"):
        match = _APPAREL_SIZE_PATTERN.search(haystack_category)
        return match.group(1).upper() if match else None

    if category_key == "ruedas":
        match = _WHEEL_SIZE_PATTERN.search(haystack_name)
        return f"{match.group(1)}mm" if match else None

    if category_key == "rodamientos":
        match = _BEARING_SIZE_PATTERN.search(haystack_name)
        return f"ABEC {match.group(1)}" if match else None

    if category_key == "trucks":
        match = _TRUCK_SIZE_PATTERN.search(haystack_name)
        return match.group(1) if match else None

    return None


def size_sort_key(size: str) -> tuple[int, float, str]:
    """Order sizes numerically where they are numbers, by apparel scale where
    they are letters, and alphabetically otherwise."""
    normalized = size.strip().upper()

    if normalized in _APPAREL_SIZE_ORDER:
        return (0, _APPAREL_SIZE_ORDER.index(normalized), normalized)

    first_number = re.search(r"(\d+(?:\.\d+)?)", normalized)
    if first_number:
        return (1, float(first_number.group(1)), normalized)

    return (2, 0.0, normalized)
