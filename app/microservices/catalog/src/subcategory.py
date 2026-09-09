"""Canonical product subcategory classification for catalog responses."""

import re

from .category_groups import map_category_name, resolve_group


DECK_SIZE_PATTERN = re.compile(r"(?<!\d)(\d+\.\d+)(?!\d)")

# Product-name keywords for gear classification (primary signal)
# These override category-name classification when products are mis-categorized
_TRUCK_KEYWORDS = (
    "element", "independent", "krux", "thunder", "venture",
    "maister", "mule", "royal", "skaterror", "sornero",
    "truck", "139", "149",
)
_WHEEL_KEYWORDS = (
    "amateur", "bones", "cabra", "coyote", "crudas", "glow",
    "ricta", "spitfire", "skate sky", "skatesky", "spit",
    "wheel", "mm", "54mm", "56mm", "58mm", "99a",
)
_BEARING_KEYWORDS = (
    "precision", "dodo", "reds", "rodamiento", "rush", "bomber",
    "bearing", "abec",
)
_HARDWARE_KEYWORDS = (
    "herramienta", "rectificador", "kit", "proteccion", "casco",
    "tool", "tightener",
)


def _normalized(value: str | None) -> str:
    return (value or "").strip().casefold()


def _resolve_classification_group(category: str | None, stored_group: str | None) -> str:
    if stored_group:
        return resolve_group(stored_group)
    return map_category_name(category or "")


def _classify_decks(category: str) -> str | None:
    if "long board" in category:
        return "Long Board"
    if "maderos" not in category:
        return None
    match = DECK_SIZE_PATTERN.search(category)
    return match.group(1) if match else None


def _classify_apparel(category: str, name: str) -> str:
    if "tenis" in category or "tenis" in name:
        return "Shoes"
    if "hoodie" in name or "hoddie" in name:
        return "Hoodies"
    if "buzo" in name or "camibuzo" in name or "sudadera" in name:
        return "Sweatshirts"
    if "camis" in name:
        return "T-Shirts"
    if any(keyword in name for keyword in ("chaquet", "rompevientos", "chaleco")):
        return "Jackets & Outerwear"
    if "pantalones" in category or "pantalon" in name:
        return "Pants"
    # Apparel always resolves to a bucket so a garment the keyword list does not
    # recognize stays reachable in the storefront instead of dropping out.
    return "Other Apparel"


def _classify_gear_by_name(name: str) -> str | None:
    """Classify gear products by product name keywords (primary signal).

    Bearings are matched first: their keywords are brand- and spec-specific
    ("rodamiento", "abec", "reds"), while truck and wheel brand names are broad
    enough to swallow a bearing that happens to share a brand.
    """
    if any(kw in name for kw in _BEARING_KEYWORDS):
        return "Bearings"
    if any(kw in name for kw in _TRUCK_KEYWORDS):
        return "Trucks"
    if any(kw in name for kw in _WHEEL_KEYWORDS):
        return "Wheels"
    if any(kw in name for kw in _HARDWARE_KEYWORDS):
        return "Hardware & Accessories"
    return None


def classify_subcategory(
    category: str | None,
    product_name: str | None,
    stored_group: str | None,
) -> str | None:
    """Classify a product without changing its existing category group.

    The shared category mapper supplies the group when a stored group is not
    available. This keeps the classifier aligned with the authoritative gear
    precedence while allowing the API to preserve an uncategorized stored
    group unchanged.
    """
    if not category and not product_name:
        return None

    normalized_category = _normalized(category)
    normalized_name = _normalized(product_name)
    group = _resolve_classification_group(category, stored_group)

    if group == "decks":
        return _classify_decks(normalized_category)
    if group == "apparel":
        return _classify_apparel(normalized_category, normalized_name)
    if group == "accessories":
        if "maletines" in normalized_category or "canguros" in normalized_category:
            return "Bags & Waist Packs"
        if "lijas" in normalized_category:
            return "Grip Tape"
        return None
    if group == "gear":
        # First try product-name-based classification (handles mis-categorized products)
        by_name = _classify_gear_by_name(normalized_name)
        if by_name:
            return by_name
        # Fallback to category-name classification
        if "trucks" in normalized_category:
            return "Trucks"
        if "ruedas" in normalized_category:
            return "Wheels"
        if "rodamientos" in normalized_category:
            return "Bearings"
        if "hardware" in normalized_category:
            return "Hardware & Accessories"

    return None
