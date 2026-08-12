# Tasks: Catalog Category Mapping

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~220-280 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr-default |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

Forecast is Low; single PR fits the budget; no size exception needed.

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Mapping module | PR 1 | `pytest catalog/tests/test_category_groups.py` | N/A | Additive module |
| 2 | ALTER + backfill | PR 1 | backfill twice; counts 104/1294/23/79 | compose DB, 48 categories | `DROP COLUMN`; re-runnable |
| 3 | API field + importer + contract | PR 1 | `pytest catalog` + `php artisan test --filter=CatalogPublicRoutesTest` | compose stack | Revert field |
| 4 | Storefront + admin | PR 1 | `npm run vitest && npm run typecheck` | N/A (static checks) | Revert to raw filter |
| 5 | E2E verification | PR 1 | E2E filter/count assertions | Full compose stack | N/A |

## Phase 1: Foundation - Mapping Module

- [x] 1.1 Create `catalog/src/category_groups.py`: `GROUPS`, ordered `KEYWORDS`, `map_category_name()`, `resolve_group()` (gear before accessories).
- [x] 1.2 Create `catalog/tests/test_category_groups.py`: `Hardware y Accesorios` -> gear, `Skate / Maderos / 8.25` -> decks, `Tenis / Talla 8Us -39Col / Todo` -> apparel, no-match -> uncategorized, case/whitespace insensitive.
- [x] 1.3 `pytest` passes all module cases.

## Phase 2: Deploy Step - Schema + Backfill (before catalog restart)

- [x] 2.1 Add `category_group: Mapped[str | None]` (`String(32)`, nullable, no index) to `Category` in `catalog/src/models.py`.
- [x] 2.2 Create `catalog/src/backfill_category_groups.py`: idempotent `ADD COLUMN IF NOT EXISTS` + backfill NULL rows via `map_category_name()`; prints counts.
- [x] 2.3 Run backfill twice on compose DB; assignments unchanged; counts 104/1294/23/79.

## Phase 3: Core - API + Importer

- [x] 3.1 Add additive `categoryGroup: str` to `ProductOut` in `catalog/src/schemas.py`.
- [x] 3.2 Serialize `categoryGroup=resolve_group(product.category.category_group)` in `catalog/src/main.py` (NULL -> `uncategorized`).
- [x] 3.3 Tag new categories via `map_category_name(label)` in `catalog/src/import_drive_catalog.py`; never update existing.
- [x] 3.4 Update `gateway/tests/Feature/CatalogPublicRoutesTest.php` to assert additive `categoryGroup`.

## Phase 4: Integration - Frontend

- [x] 4.1 In `frontend/src/lib/store-catalog.ts`, replace `category` with lowercased `categoryGroup`; update fallbacks.
- [x] 4.2 In `frontend/src/app/(store)/products/page.tsx`, filter on `p.categoryGroup`; `all` full list; labels stay UI strings.
- [x] 4.3 Add `categoryGroup?: string` to `Product` in `frontend/src/lib/admin-types.ts`.
- [x] 4.4 Normalize + display Group column in `frontend/src/app/(dashboard)/admin/products/page.tsx`.
- [x] 4.5 Drop unused `category` prop in `frontend/src/components/store/product/ProductCard.tsx`.
- [x] 4.6 Add vitest coverage: missing `categoryGroup` hidden from filters, visible under `all`.

## Phase 5: Verification

- [x] 5.1 Run catalog pytest, gateway feature test, `npm run vitest`, `typecheck`, `lint`.
- [x] 5.2 E2E on compose stack: 4 group filters non-empty; counts 104/1294/23/79; nav resolves; admin shows group.
- [x] 5.3 Re-import preserves stored groups (idempotent).