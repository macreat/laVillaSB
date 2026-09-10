"""Build a product description from the Drive catalog path.

The importer wrote the raw path as the description ("Imported from drive catalog
path: Skate/Maderos/7.75/Sornero Zorror.jpg"), which is a file location, not
something a shopper can use. The path does carry real information though: what
the product is, its size, and - for shoes - whether the shop is selling an
original or a replica. This module turns that into a sentence.

Authenticity is the part worth surfacing. The Drive spells it several ways
across folders ("Originales", "Replicas", "Replica", "Originales y Replicas"),
and the "Todo" folders carry no authenticity at all because they mirror the
classified ones.
"""

from .subcategory import classify_subcategory
from .taxonomy import resolve_category, resolve_size

# Trailing Drive folder -> what it says about authenticity. Ordered longest
# first so "Originales y Replicas" is not matched by the "Originales" prefix.
_AUTHENTICITY: tuple[tuple[str, str], ...] = (
    ("originales y replicas", "Disponible en version original y replica"),
    ("originales", "Producto original"),
    ("replicas", "Replica"),
    ("replica", "Replica"),
)

# What each browsable category is called in a sentence, and whether its size
# reads as a talla (clothing) or a medida (hardware).
_NOUNS: dict[str, tuple[str, str]] = {
    "tablas": ("Tabla de skate", "medida"),
    "long-board": ("Long board", "medida"),
    "trucks": ("Trucks para skate", "medida"),
    "rodamientos": ("Rodamientos", "medida"),
    "ruedas": ("Ruedas para skate", "medida"),
    "herramientas-accesorios": ("Herramienta o accesorio de skate", "medida"),
    "zapatos": ("Tenis", "talla"),
    "chaquetas": ("Chaqueta", "talla"),
    "busos": ("Buso", "talla"),
    "camisetas": ("Camiseta", "talla"),
    "pantalones": ("Pantalon", "talla"),
    "otros": ("Prenda", "talla"),
}


def _authenticity(category: str | None) -> str | None:
    """Read the trailing Drive folder as an authenticity claim, if it makes one."""
    if not category:
        return None
    tail = category.rsplit("/", 1)[-1].strip().casefold()
    for marker, phrase in _AUTHENTICITY:
        if tail == marker:
            return phrase
    return None


def build_description(
    category_name: str | None,
    product_name: str | None,
    stored_group: str | None = None,
) -> str | None:
    """Describe a product from its Drive path, or ``None`` when there is nothing
    to say beyond the file location."""
    subcategory = classify_subcategory(category_name, product_name, stored_group)
    category_key = resolve_category(subcategory, product_name)
    if not category_key:
        return None

    noun, size_word = _NOUNS.get(category_key, ("Producto", "medida"))
    sentences = [noun]

    size = resolve_size(category_name, product_name, subcategory)
    if size:
        sentences[0] = f"{noun}, {size_word} {size}"
    sentences[0] += "."

    claim = _authenticity(category_name)
    if claim:
        sentences.append(f"{claim}.")

    if category_name:
        sentences.append(f"Catalogo La Villa - Drive: {category_name}.")

    return " ".join(sentences)
