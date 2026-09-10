"""Replace the importer's raw-path descriptions with useful ones.

    python -m src.backfill_descriptions --dry-run
    python -m src.backfill_descriptions

Only rewrites rows whose description is empty or still the legacy
"Imported from drive catalog path: ..." string, so a description edited by hand
in the admin panel is never clobbered. Re-running is safe.
"""

import argparse
import asyncio

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from .database import AsyncSessionLocal
from .descriptions import build_description
from .models import Product

LEGACY_PREFIX = "Imported from drive catalog path:"


def _is_replaceable(description: str | None) -> bool:
    if not description or not description.strip():
        return True
    return description.strip().startswith(LEGACY_PREFIX)


async def backfill(dry_run: bool = False) -> dict[str, int]:
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Product).options(selectinload(Product.category))
        )
        products = list(result.scalars().all())

        counts = {"total": len(products), "updated": 0, "kept": 0, "no_description": 0}

        for product in products:
            if not _is_replaceable(product.description):
                counts["kept"] += 1
                continue

            category = product.category
            described = build_description(
                category.name if category else None,
                product.name,
                category.category_group if category else None,
            )
            if not described:
                counts["no_description"] += 1
                continue

            if not dry_run:
                product.description = described
            counts["updated"] += 1

        if not dry_run:
            await session.commit()

        return counts


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="report what would change without writing",
    )
    args = parser.parse_args()

    counts = asyncio.run(backfill(dry_run=args.dry_run))
    label = "would update" if args.dry_run else "updated"
    print(
        f"{counts['total']} products: {label} {counts['updated']}, "
        f"kept {counts['kept']} hand-edited, "
        f"{counts['no_description']} had nothing describable"
    )


if __name__ == "__main__":
    main()
