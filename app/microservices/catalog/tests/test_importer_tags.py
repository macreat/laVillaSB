from src.import_drive_catalog import build_category


def test_new_category_is_tagged_with_group():
    category = build_category("tenis-talla-8us", "Tenis / Talla 8Us -39Col / Todo")

    assert category.category_group == "apparel"


def test_new_category_keeps_slug_and_name():
    category = build_category("skate-maderos-8-25", "Skate / Maderos / 8.25")

    assert category.slug == "skate-maderos-8-25"
    assert category.name == "Skate / Maderos / 8.25"
    assert category.category_group == "decks"


def test_unmatched_label_tags_uncategorized():
    category = build_category("sin-clasificar", "Sin Clasificar")

    assert category.category_group == "uncategorized"