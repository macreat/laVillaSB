"""Canonical product subcategory classification for catalog responses."""

import re

from .category_groups import map_category_name, resolve_group


DECK_SIZE_PATTERN = re.compile(r"(?<!\d)(\d+\.\d+)(?!\d)")


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
    if "tenis" in category:
        return "Shoes"
    if "hoodie" in name or "hoddie" in name:
        return "Hoodies"
    if "buzo" in name or "camibuzo" in name:
        return "Sweatshirts"
    if "camis" in name:
        return "T-Shirts"
    if any(keyword in name for keyword in ("chaquet", "rompevientos", "chaleco")):
        return "Jackets & Outerwear"
    if "pantalones" in category:
        return "Pants"
    return "Other Apparel"


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
        if "trucks" in normalized_category:
            return "Trucks"
        if "ruedas" in normalized_category:
            return "Wheels"
        if "rodamientos" in normalized_category:
            return "Bearings"
        if "hardware" in normalized_category:
            return "Hardware & Accessories"

    return None
