"""Idempotent backfill of category_group on existing categories.

Runs before the catalog service restarts with the new schema. Adds the
column if missing, then assigns `category_group` to every row where it is
still NULL using the shared keyword mapping module. Re-running is a no-op
on already-assigned rows.
"""

import asyncio

from sqlalchemy import text
from sqlalchemy import select

from .category_groups import map_category_name
from .database import AsyncSessionLocal, engine
from .models import Category


def build_group_assignments(rows, map_fn=map_category_name) -> dict[int, str]:
    """Map NULL-group rows to their group; leave assigned rows untouched.

    rows: iterable of (category_id, stored_group, name).
    Returns {category_id: group} only for rows whose stored group is NULL,
    which makes re-runs idempotent.
    """
    return {row_id: map_fn(name) for row_id, stored, name in rows if stored is None}


def count_groups(categories) -> dict[str, int]:
    """Group counts across the final state, uncategorized included."""
    counts: dict[str, int] = {}
    for category in categories:
        group = category.category_group or "uncategorized"
        counts[group] = counts.get(group, 0) + 1
    return counts


async def run_backfill() -> dict:
    async with engine.begin() as conn:
        await conn.execute(
            text("ALTER TABLE categories ADD COLUMN IF NOT EXISTS category_group VARCHAR(32)")
        )

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Category).order_by(Category.id))
        categories = result.scalars().all()

        rows = [(c.id, c.category_group, c.name) for c in categories]
        assignments = build_group_assignments(rows)

        for category in categories:
            if category.id in assignments:
                category.category_group = assignments[category.id]
        await session.commit()

    return {
        "categories_total": len(categories),
        "categories_updated": len(assignments),
        "counts_by_group": count_groups(categories),
    }


async def async_main() -> None:
    result = await run_backfill()
    print(result)


def main() -> None:
    asyncio.run(async_main())


if __name__ == "__main__":
    main()