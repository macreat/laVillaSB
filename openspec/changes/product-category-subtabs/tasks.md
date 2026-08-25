# Tasks: Product Category Subtabs

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 600-800 lines |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 catalog -> PR 2 gateway -> PR 3 frontend -> PR 4 UI/evidence |
| Delivery strategy | ask-on-risk |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal / base | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|
| PR 1 | Catalog classifier/API; base = tracker | `(cd app/microservices/catalog && pytest tests/test_category_groups.py tests/test_subcategory.py tests/test_product_out.py tests/test_products_api.py tests/test_products_api_ordering.py tests/test_list_products_ordering.py tests/test_merchandising.py)` | `curl -fsS http://localhost:9002/products` | classifier, schema, serializer, tests |
| PR 2 | Gateway pass-through; base = PR 1 | `(cd app/backend/gateway && composer test -- --filter=CatalogPublicRoutesTest)` | `curl -fsS http://localhost:8010/api/v1/catalog/products` | gateway contract |
| PR 3 | Frontend mapping/filter/URL; base = PR 2 | `(cd app/frontend && npx vitest run src/lib/store-catalog.test.ts)` | `curl -fsS 'http://localhost:3000/products?category=apparel&subcategory=Hoodies'` | `store-catalog.ts` and tests |
| PR 4 | UI, rebuild, smoke/evidence; base = PR 3 | `(cd app/frontend && npm run typecheck && npm run lint && npm run build)` | manual browser at `http://localhost:3000` | component, page, CSS, evidence |

## Phase 1: Catalog Foundation and API (PR 1)

- [x] 1.1 RED: add `tests/test_subcategory.py` for sizes/Long Board, Shoes precedence, hoodie variants, apparel fallback, accessories, gear, and nulls.
- [x] 1.2 GREEN: create `src/subcategory.py` with shared resolution, precedence, and nullable canonical labels.
- [x] 1.3 RED then GREEN: extend `tests/test_product_out.py`/`tests/test_products_api.py` for the additive field, null safety, fields, and order; update `src/schemas.py` and `src/main.py`.
- [x] 1.4 REFACTOR: preserve group precedence and serialization without migration or `/categories`.

## Phase 2: Gateway Contract (PR 2)

- [x] 2.1 RED: extend `CatalogPublicRoutesTest.php` with category, group, subcategory, and order assertions for proxies.
- [x] 2.2 GREEN/REFACTOR: verify forwarding does not reorder/recompute; change gateway code only if tests expose filtering.

## Phase 3: Frontend Domain State (PR 3)

- [x] 3.1 RED: extend `app/frontend/src/lib/store-catalog.test.ts` for mapping, tab order/omission, All retention, combined filtering, URL encoding, and stale fallback.
- [x] 3.2 GREEN: update `app/frontend/src/lib/store-catalog.ts` with fields, tabs, combined filtering, and URL helpers; preserve order/fallbacks.
- [x] 3.3 REFACTOR: preserve group-only behavior and All's unsupported/uncategorized products.

## Phase 4: Accessible Storefront UI (PR 4)

- [x] 4.1 RED/manual: record failing checks for focus, `aria-current`, no-wrap, overflow, and reduced motion because no DOM harness exists.
- [x] 4.2 GREEN: create `app/frontend/src/components/store/CategorySubtabs.tsx` and update `app/frontend/src/app/(store)/products/page.tsx` for URLSearchParams, stale fallback, filtering, names, and `aria-current="page"`.
- [x] 4.3 REFACTOR: update `app/frontend/src/app/globals.css` for one-line overflow, visible focus, active underline, and reduced-motion-safe styles.

## Phase 5: Verification and Evidence

- [x] 5.1 Run focused service tests, typecheck, lint, and build; record results.
- [x] 5.2 Rebuild with `docker compose up -d --build catalog gateway frontend`; verify JSON and HTTP 200 for `/products` and group URLs.
- [x] 5.3 Smoke-test keyboard/focus/aria-current/no-wrap/scroll, URL state, and reduced motion; attach evidence.
