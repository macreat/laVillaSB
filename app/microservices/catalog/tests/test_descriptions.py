import pytest

from src.descriptions import build_description


@pytest.mark.parametrize(
    ("category", "name", "group", "expected"),
    [
        (
            "Tenis / Talla 8Us -39Col / Originales",
            "Nike SB Dunk",
            "apparel",
            "Tenis, talla 8 US / 39 COL. Producto original. "
            "Catalogo La Villa - Drive: Tenis / Talla 8Us -39Col / Originales.",
        ),
        (
            "Tenis / Talla 7.5Us - 38Co / Replica",
            "Adidas Campus",
            "apparel",
            "Tenis, talla 7.5 US / 38 COL. Replica. "
            "Catalogo La Villa - Drive: Tenis / Talla 7.5Us - 38Co / Replica.",
        ),
        (
            "Tenis / Talla 11Us - 43Col / Originales y Replicas",
            "Vans Old Skool",
            "apparel",
            "Tenis, talla 11 US / 43 COL. Disponible en version original y replica. "
            "Catalogo La Villa - Drive: Tenis / Talla 11Us - 43Col / Originales y Replicas.",
        ),
        (
            "Skate / Maderos / 8.25",
            "Prowler Deck",
            "decks",
            'Tabla de skate, medida 8.25". '
            "Catalogo La Villa - Drive: Skate / Maderos / 8.25.",
        ),
        (
            "Ropa / Talla L",
            "La Villa Hoodie",
            "apparel",
            "Buso, talla L. Catalogo La Villa - Drive: Ropa / Talla L.",
        ),
        (
            "Skate / Trucks",
            "Mule Golden",
            "gear",
            "Trucks para skate. Catalogo La Villa - Drive: Skate / Trucks.",
        ),
    ],
)
def test_describes_the_product_from_its_drive_path(category, name, group, expected):
    assert build_description(category, name, group) == expected


def test_todo_folders_make_no_authenticity_claim():
    # The "Todo" folders mirror the classified ones and say nothing about
    # authenticity, so the description must not invent one.
    described = build_description(
        "Tenis / Talla 8Us -39Col / Todo", "Nike SB Dunk", "apparel"
    )
    assert "original" not in described.lower()
    assert "replica" not in described.lower()
    assert described.startswith("Tenis, talla 8 US / 39 COL.")


def test_returns_none_when_the_path_says_nothing_useful():
    assert build_description(None, None, None) is None
    assert build_description("Unmapped", "Mystery", "uncategorized") is None
