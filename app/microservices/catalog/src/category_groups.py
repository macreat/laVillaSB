"""Shared category-group taxonomy for the catalog service.

Single source of truth for mapping category names to display groups.
 Reused by the backfill script, the Drive importer, API serialization, and
 subcategory classification.
"""

GROUPS: tuple[str, ...] = ("decks", "apparel", "gear", "accessories", "uncategorized")

# Evaluation order matters: gear is checked before accessories so a name
# like "Skate / Hardware y Accesorios" resolves to gear, per spec.
KEYWORDS: dict[str, tuple[str, ...]] = {
    "decks": ("long board", "maderos", "tabla", "deck"),
    "apparel": ("ropa", "tenis", "pantalones", "camiseta", "camisetas", "buzo", "hoodie", "sudadera", "chaqueta"),
    "gear": ("rodamientos", "ruedas", "trucks", "hardware", "eje", "wheels", "bearings", "equipo"),
    "accessories": ("maletines", "canguros", "lijas", "accesorios"),
}


def map_category_name(name: str) -> str:
    """Map a category name to a group by case-insensitive keyword containment.

    Precedence: decks -> apparel -> gear -> accessories -> uncategorized.
    """
    normalized = (name or "").strip().casefold()
    for group, keywords in KEYWORDS.items():
        if any(keyword in normalized for keyword in keywords):
            return group
    return "uncategorized"


def resolve_group(stored: str | None) -> str:
    """Resolve a stored group value to a canonical group string.

    First checks if the stored value is already a canonical group.
    Falls back to keyword-based category name mapping when the stored
    value is a raw category name (e.g. from Drive import) that doesn't
    match a canonical group directly.
    """
    normalized = (stored or "").strip().lower()
    if normalized in GROUPS:
        return normalized
    # Fallback: try keyword-based mapping on the raw stored value
    return map_category_name(stored or "")
