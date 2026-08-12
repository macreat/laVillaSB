"""Shared category-group taxonomy for the catalog service.

Single source of truth for mapping category names to display groups.
Reused by the backfill script, the Drive importer, and nowhere else at
serialization time (the API reads the stored group).
"""

GROUPS: tuple[str, ...] = ("decks", "apparel", "gear", "accessories", "uncategorized")

# Evaluation order matters: gear is checked before accessories so a name
# like "Skate / Hardware y Accesorios" resolves to gear, per spec.
KEYWORDS: dict[str, tuple[str, ...]] = {
    "decks": ("long board", "maderos"),
    "apparel": ("ropa", "tenis", "pantalones"),
    "gear": ("rodamientos", "ruedas", "trucks", "hardware"),
    "accessories": ("maletines", "canguros", "lijas"),
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
    """Resolve a stored group value to a canonical group string."""
    return stored.lower() if stored else "uncategorized"