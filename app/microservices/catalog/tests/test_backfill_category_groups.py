from src.backfill_category_groups import build_group_assignments


def test_null_rows_get_mapped_assignments():
    rows = [
        (1, None, "Skate / Maderos / 8.25"),
        (2, None, "Tenis / Talla 8Us -39Col / Todo"),
        (3, None, "Skate / Hardware y Accesorios"),
    ]

    assignments = build_group_assignments(rows)

    assert assignments == {1: "decks", 2: "apparel", 3: "gear"}


def test_existing_groups_are_preserved_and_not_reassigned():
    rows = [
        (1, "decks", "Skate / Maderos / 8.25"),
        (2, None, "Skate / Lijas"),
        (3, "apparel", "Ropa / Talla L"),
    ]

    assignments = build_group_assignments(rows)

    assert assignments == {2: "accessories"}


def test_rerun_after_backfill_is_a_noop():
    backfilled_rows = [
        (1, "decks", "Skate / Maderos / 8.25"),
        (2, "apparel", "Tenis / Talla 8Us -39Col / Todo"),
        (3, "gear", "Skate / Hardware y Accesorios"),
    ]

    assignments = build_group_assignments(backfilled_rows)

    assert assignments == {}
