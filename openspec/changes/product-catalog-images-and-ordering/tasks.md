# Tasks: Product Catalog Images and Ordering

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 650-900 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1 Catalog merchandising + detail API, PR2 Gateway public detail allowlist, PR3 Frontend mapper + shared image + media proxy + cart/detail wiring |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Catalog ordering and detail contract | PR 1 | `cd app/microservices/catalog && pytest` | `GET /products + GET /products/{id}` in local stack | `app/microservices/catalog/src/{merchandising.py,main.py,schemas.py}` and catalog tests |
| 2 | Gateway public read policy for detail only | PR 2 | `cd app/backend/gateway && composer test -- CatalogPublicRoutesTest` | Unauthenticated `GET /api/catalog/products/{id}` should pass; write/media routes blocked | `app/backend/gateway/routes/api.php` and `tests/Feature/CatalogPublicRoutesTest.php` |
| 3 | Frontend shared image path and live detail/cart/list usage | PR 3 | `cd app/frontend && npx vitest run` | Browse list -> detail -> cart with good and broken media IDs | `app/frontend/src/lib/{store-catalog.ts,media-proxy.ts,cart.tsx}` + product/detail/cart/media route files |

## Phase 1: Foundation TDD - Catalog Merchandising and Detail

- [x] 1.1 RED: Add catalog unit tests in `app/microservices/catalog/tests/test_merchandising.py` for decimal deck ordering, Long Board placement, apparel bucket precedence, ID tie-breakers, and missing-data visibility.
- [x] 1.2 GREEN: Create `app/microservices/catalog/src/merchandising.py` with pure helpers for size parsing, apparel bucket resolution, deterministic group ordering, and stable fallbacks.
- [x] 1.3 REFACTOR: Integrate ordering into list projection in `app/microservices/catalog/src/main.py` without changing `ProductOut` compatibility in `app/microservices/catalog/src/schemas.py`.
- [x] 1.4 RED: Add integration tests in `app/microservices/catalog/tests/test_products_api.py` for `GET /products/{id}` 200/404 and `imageUrl` behavior for ready vs unusable media.
- [x] 1.5 GREEN: Implement `GET /products/{product_id}` in `app/microservices/catalog/src/main.py` with eager loading, additive response fields, and `{"detail":"Product not found"}`.
- [x] 1.6 Checkpoint: Run `cd app/microservices/catalog && pytest` and record pass/fail before cross-service work.

## Phase 2: Security Boundary TDD - Gateway Public Read Proxy

- [x] 2.1 RED (threat-matrix routing/public surface): Extend `app/backend/gateway/tests/Feature/CatalogPublicRoutesTest.php` for unauthenticated detail success and non-allowlisted media/write denial.
- [x] 2.2 GREEN: Update allowlist regex in `app/backend/gateway/routes/api.php` to include numeric `products/{id}` reads only.
- [x] 2.3 REFACTOR: Tighten route pattern naming/comments in `routes/api.php` to make read-only intent explicit.
- [x] 2.4 Checkpoint: Run `cd app/backend/gateway && composer test -- CatalogPublicRoutesTest`.

## Phase 3: Storefront TDD - Shared Image and Live Detail Wiring

- [x] 3.1 RED: Add Vitest cases in `app/frontend/src/lib/store-catalog.test.ts` for detail fetch mapping, server-order preservation, and not-found propagation.
- [x] 3.2 GREEN: Update `app/frontend/src/lib/store-catalog.ts` to fetch detail via gateway and keep catalog ordering untouched client-side.
- [x] 3.3 RED: Add Vitest cases for media normalization and fallback rendering in `app/frontend/src/lib/media-proxy.test.ts` and new `app/frontend/src/components/store/product/ProductImage.test.tsx`.
- [x] 3.4 GREEN: Create `app/frontend/src/components/store/product/ProductImage.tsx` and adopt it in `ProductCard.tsx`, `app/(store)/products/[id]/page.tsx`, and `app/(store)/cart/page.tsx`.
- [x] 3.5 GREEN: Update `app/frontend/src/lib/cart.tsx` and `app/frontend/src/app/api/media/[...path]/route.ts` for normalized path persistence, bounded upstream fallback, and header/status pass-through.
- [x] 3.6 REFACTOR: Remove detail-page static mock logic from `app/frontend/src/app/(store)/products/[id]/page.tsx` and align error handling.

## Phase 4: Full Verification and Release Readiness

- [x] 4.1 Run full verification: `cd app/frontend && npx vitest run && npm run typecheck && npm run lint && npm run build`.
- [x] 4.2 Run backend verification: `cd app/backend/gateway && composer test`.
- [x] 4.3 Run catalog verification: `cd app/microservices/catalog && pytest`.
- [x] 4.4 Manual runtime checkpoint: validate list -> detail -> cart image behavior with usable and broken media, plus stable Deck/Apparel ordering and unchanged Accessories/Gear ordering.
- [x] 4.5 Document unresolved implementation prerequisites: approved branded fallback asset and proxy upstream priority in change notes before apply.
