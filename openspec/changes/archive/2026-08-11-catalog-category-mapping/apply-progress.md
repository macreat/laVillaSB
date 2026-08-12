# Apply Progress: Catalog Category Mapping

Mode: Strict TDD (RED -> GREEN -> REFACTOR). Delivery: single PR (forecast Low).

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1.1/1.2 | `catalog/tests/test_category_groups.py` | Unit | N/A (new module) | ✅ Written (ModuleNotFoundError) | ✅ 22 passed | ✅ 13 keyword cases + case/whitespace + precedence | ✅ None needed |
| 2.1 | `catalog/tests/test_category_model.py` | Unit | N/A (new) | ✅ Written (column missing) | ✅ Passed | ✅ one schema case | ✅ None needed |
| 2.2 | `catalog/tests/test_backfill_category_groups.py` | Unit | N/A (new) | ✅ Written (ModuleNotFoundError) | ✅ Passed | ✅ 3 cases (assign/preserve/noop) | ✅ None needed |
| 3.1/3.2 | `catalog/tests/test_product_out.py` | Unit | ✅ pytest 27 passed | ✅ Written (import error) | ✅ Passed | ✅ 4 cases (stored/null/no-cat/preserve) | ✅ Extracted `to_product_out` |
| 3.3 | `catalog/tests/test_importer_tags.py` | Unit | ✅ 35 passed | ✅ Written (import error) | ✅ Passed | ✅ 3 cases | ✅ Extracted `build_category` |
| 3.4 | `gateway/tests/Feature/CatalogPublicRoutesTest.php` | Integration | ✅ 3 tests / 10 assertions | ✅ Added `categoryGroup` assertion | ✅ 3 tests / 11 assertions | ➖ Single | ✅ None needed |
| 4.1/4.6 | `frontend/src/lib/store-catalog.test.ts` | Unit | ✅ vitest 3 passed | ✅ Written (7 failed) | ✅ Passed | ✅ 7 cases | ✅ Added vitest.config alias |
| 4.2-4.5 | typecheck + lint + vitest | Unit | ✅ vitest 10 passed | ✅ StoreProduct type error found | ✅ typecheck clean | ✅ n/a (wiring) | ✅ Dropped `category` prop |

## Work Unit Evidence

| Unit | Focused test command + result | Runtime harness + result | Rollback boundary |
|------|-------------------------------|--------------------------|-------------------|
| Mapping module | `pytest tests/test_category_groups.py` -> 22 passed | N/A (pure function, no runtime boundary) | Additive module `src/category_groups.py` |
| Schema + backfill | `pytest tests/test_category_model.py tests/test_backfill_category_groups.py` -> 4 passed | Backfill x2 on compose DB: run1 updated 48, run2 updated 0; product counts 104/1294/23/79 | `ALTER TABLE categories DROP COLUMN IF NOT EXISTS category_group`; script re-runnable |
| API + importer | `pytest tests/` -> 35 passed; `phpunit --filter=CatalogPublicRoutesTest` -> 3 tests/11 assertions | `GET /api/v1/catalog/products` via gateway -> 1500 products with categoryGroup; counts match spec | Revert `categoryGroup` field + `to_product_out` |
| Storefront + admin | `npx vitest run` -> 10 passed; `npm run typecheck` clean; `npm run lint` 2 pre-existing warnings | All 6 storefront URLs return 200; admin page 200 | Revert to raw `category` filter |
| E2E verification | Full suites above | Gateway API counts 104/1294/23/79/0; re-import: 0 categories created, group preserved (`Long Board -> decks`) | N/A (verification only) |

## Completed Tasks

All 16 tasks complete (1.1-1.3, 2.1-2.3, 3.1-3.4, 4.1-4.6, 5.1-5.3).

## Test Summary

- Catalog pytest: 35 passed (was 1 baseline)
- Gateway phpunit: 5 tests, 13 assertions OK (was 3/10)
- Frontend vitest: 10 passed (was 3)
- typecheck: clean; lint: 2 pre-existing warnings (unrelated files)

## Files Changed

| File | Action | What Was Done |
|------|--------|---------------|
| `app/microservices/catalog/src/category_groups.py` | Created | GROUPS, KEYWORDS, map_category_name(), resolve_group() |
| `app/microservices/catalog/tests/test_category_groups.py` | Created | 22 unit cases |
| `app/microservices/catalog/src/models.py` | Modified | Category.category_group String(32) nullable |
| `app/microservices/catalog/src/backfill_category_groups.py` | Created | Idempotent ADD COLUMN IF NOT EXISTS + backfill |
| `app/microservices/catalog/tests/test_category_model.py` | Created | Schema assertion |
| `app/microservices/catalog/tests/test_backfill_category_groups.py` | Created | Assign/preserve/noop cases |
| `app/microservices/catalog/src/schemas.py` | Modified | ProductOut.categoryGroup: str |
| `app/microservices/catalog/src/main.py` | Modified | to_product_out() with resolve_group |
| `app/microservices/catalog/src/import_drive_catalog.py` | Modified | build_category() tags on create |
| `app/microservices/catalog/tests/test_product_out.py` | Created | Serialization cases |
| `app/microservices/catalog/tests/test_importer_tags.py` | Created | Tagging cases |
| `app/backend/gateway/tests/Feature/CatalogPublicRoutesTest.php` | Modified | Assert additive categoryGroup |
| `app/frontend/src/lib/store-catalog.ts` | Modified | categoryGroup mapping + pure helpers |
| `app/frontend/src/lib/store-catalog.test.ts` | Created | 7 cases |
| `app/frontend/src/lib/admin-types.ts` | Modified | categoryGroup?: string |
| `app/frontend/src/app/(store)/products/page.tsx` | Modified | filterByCategoryGroup wiring |
| `app/frontend/src/app/(dashboard)/admin/products/page.tsx` | Modified | Group column |
| `app/frontend/src/components/store/product/ProductCard.tsx` | Modified | Dropped category prop |
| `app/frontend/vitest.config.ts` | Created | @ alias for vitest |

## Deviations from Design

None - implementation matches design.

## Issues Found

- `Column.index` on a non-indexed SQLAlchemy column is `None`, not `False`; test asserts `not column.index` instead.
- Catalog `.venv` lacks `greenlet`, so backfill ran with host miniconda python (DATABASE_URL pointed at localhost:5432).
- Vitest could not resolve the `@/` alias without a config file; added `vitest.config.ts` mirroring tsconfig paths.
- `ProductOut.categoryGroup` made required (no default) so serialization failures fail fast; main.py always supplies it.

## Status

16/16 tasks complete. Ready for verify.