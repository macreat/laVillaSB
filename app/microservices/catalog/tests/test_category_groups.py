import pytest

from src.category_groups import GROUPS, KEYWORDS, map_category_name, resolve_group


@pytest.mark.parametrize(
    ("name", "expected"),
    [
        # Spec scenario: Hardware y Accesorios maps to gear by precedence
        ("Skate / Hardware y Accesorios", "gear"),
        # Spec scenario: Maderos deck widths map to decks
        ("Skate / Maderos / 8.25", "decks"),
        ("Skate / Maderos / 8.0", "decks"),
        # Spec scenario: Tenis fits map to apparel
        ("Tenis / Talla 8Us -39Col / Todo", "apparel"),
        ("Tenis / Talla 11Us -43Col / Originales", "apparel"),
        # Ropa maps to apparel
        ("Ropa / Talla L", "apparel"),
        ("Ropa / Pantalones", "apparel"),
        # Long board maps to decks
        ("Long Board", "decks"),
        # Gear keywords
        ("Skate / Rodamientos", "gear"),
        ("Skate / Ruedas", "gear"),
        ("Skate / Trucks", "gear"),
        # Accessories keywords
        ("Maletines - Canguros", "accessories"),
        ("Skate / Lijas", "accessories"),
    ],
)
def test_map_category_name_known_keywords(name: str, expected: str):
    assert map_category_name(name) == expected


def test_map_category_name_unmatched_falls_back_to_uncategorized():
    assert map_category_name("Desconocido / Sin Clasificar") == "uncategorized"


def test_map_category_name_is_case_insensitive():
    assert map_category_name("SKATE / MADEROS / 8.25") == "decks"
    assert map_category_name("tenis / talla 6us - 36col / todo") == "apparel"


def test_map_category_name_is_whitespace_insensitive():
    assert map_category_name("  Skate / Maderos / 8.5  ") == "decks"


def test_keyword_precedence_puts_gear_before_accessories():
    assert list(KEYWORDS) == ["decks", "apparel", "gear", "accessories"]
    assert "gear" in KEYWORDS


def test_groups_include_uncategorized_last():
    assert GROUPS == ("decks", "apparel", "gear", "accessories", "uncategorized")


@pytest.mark.parametrize(
    ("stored", "expected"),
    [
        (None, "uncategorized"),
        ("", "uncategorized"),
        ("gear", "gear"),
        ("DeckS", "decks"),
        ("not-a-group", "uncategorized"),
    ],
)
def test_resolve_group_maps_null_to_uncategorized(stored, expected):
    assert resolve_group(stored) == expected
