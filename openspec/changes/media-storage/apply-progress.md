# Apply Progress: media-storage

## Batch Summary

- Date: 2026-08-11
- Mode: Strict TDD
- Delivery: single-pr with size:exception approved
- Scope applied in this batch: Phase 1 work unit for gateway public-route contract safety

## Completed Tasks

- [x] 1.1 Add RED gateway contract tests for allowlisted public catalog reads and denied non-allowlisted routes in `app/backend/gateway/tests/Feature/`.
- [x] 1.2 Verify/adjust explicit catalog read allowlist entries in `app/backend/gateway/routes/api.php` to satisfy 1.1.

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1.1 | `app/backend/gateway/tests/Feature/CatalogPublicRoutesTest.php` | Integration | N/A (new test file) | ✅ Written and executed - initial run failed with 2 failing assertions | ✅ Passed - 3 passed, 10 assertions | ✅ 3 scenarios covered: public allowlisted success, non-allowlisted protected, explicit-only scope | ➖ None needed |
| 1.2 | `app/backend/gateway/tests/Feature/CatalogPublicRoutesTest.php` | Integration | ✅ Existing route behavior validated via RED/ GREEN cycle above | ✅ Existing route regex verified by failing categories assertion before test fix | ✅ Passed with unchanged allowlist regex in `routes/api.php` | ✅ Confirmed `health`, `products`, `categories` pass and `/media` stays protected | ➖ None needed |

## Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test command and exact result | `cd app/backend/gateway && php artisan test --filter=CatalogPublicRoutesTest` -> PASS, 3 tests passed, 10 assertions, duration 0.17s |
| Runtime harness command/scenario and exact result | `docker compose up gateway catalog` + unauthenticated GET `/v1/catalog/products` -> N/A in this batch. Runtime harness not executed because strict TDD integration contract was validated in Laravel HTTP feature tests with proxied HTTP fake at gateway boundary. |
| Rollback boundary | Revert `app/backend/gateway/tests/Feature/CatalogPublicRoutesTest.php` and revert task checkboxes in `openspec/changes/media-storage/tasks.md` to remove this work unit without affecting catalog service implementation. |

## Targeted Verification Output

```text
$ cd app/backend/gateway && php artisan test --filter=CatalogPublicRoutesTest

PASS  Tests\Feature\CatalogPublicRoutesTest
✓ public products route is proxied without authentication
✓ non allowlisted catalog route remains protected
✓ only explicit read routes are public

Tests:    3 passed (10 assertions)
Duration: 0.17s
```

## Remaining Tasks

- [ ] 1.3 Add RED catalog tests for async variant boundary: original asset still served when variant processing fails in `app/microservices/catalog/tests/`.
- [ ] 2.1 Extend product/media persistence state in `app/microservices/catalog/src/models.py` for pricing readiness and variant processing flags.
- [ ] 2.2 Add readiness/variant contract types in `app/microservices/catalog/src/schemas.py` (`PublishReadiness`, payload/state models).
- [ ] 2.3 Implement pricing validation and readiness projection in `app/microservices/catalog/src/main.py` without breaking current `/products` shape.
- [ ] 2.4 Add importer enrichment hooks/backfill mapping for required pricing attributes in `app/microservices/catalog/src/import_drive_catalog.py`.
- [ ] 3.1 Add variant job payload builder and enqueue on media complete/import in `app/microservices/catalog/src/main.py` and `import_drive_catalog.py`.
- [ ] 3.2 Implement retry-safe variant status transitions and atomic `media.variants` updates in `app/microservices/catalog/src/models.py` (or worker module).
- [ ] 3.3 Keep `/products` selecting canonical image URL with safe fallback to original object when variants are pending/failed in `app/microservices/catalog/src/main.py`.
- [ ] 4.1 Add/expand integration tests for `/products`, `/media/presign`, `/media/{id}/complete`, and MinIO persistence in `app/microservices/catalog/tests/`.
- [ ] 4.2 Add E2E storefront check for metadata-backed images plus frontend fallback behavior in `app/frontend` test harness.
- [ ] 4.3 Document feature flags and rollback switches for validator/worker paths in `docs/` runbook used by compose environments.

## Notes

- `app/backend/gateway/routes/api.php` already matched the required explicit read allowlist (`health|products|categories`), so no route file change was needed for task 1.2.
- Catalog microservice test runner support (`pytest`) is currently unavailable in this shell environment (`No module named pytest`), so subsequent catalog Strict TDD tasks need environment readiness before execution.

## Batch Update - Same Origin Media Proxy (2026-08-11)

### Scope Applied

- Implemented a Next.js App Router media proxy route so storefront image requests stay on `:3000` origin.
- Kept catalog API payload unchanged and translated incoming `imageUrl` values at frontend mapping time.
- Added ProductCard image error fallback behavior to ensure placeholder rendering when image fetch fails.
- Added minimal frontend unit coverage for URL mapping and added initial catalog pytest coverage.

### Commands and Output

```text
$ cd app/frontend && npm run typecheck
> lavillasb-frontend@0.1.0 typecheck
> tsc --noEmit

$ cd app/backend/gateway && php artisan test --filter=CatalogPublicRoutesTest
PASS  Tests\Feature\CatalogPublicRoutesTest
✓ public products route is proxied without authentication
✓ non allowlisted catalog route remains protected
✓ only explicit read routes are public
Tests: 3 passed (10 assertions)

$ cd app/microservices/catalog && pytest -q
.                                                                        [100%]
1 passed in 0.54s

$ curl -sS -o /tmp/lavilla_products.json -w "%{http_code}" "http://localhost:8010/api/v1/catalog/products"
200

$ python3 -c "import json;data=json.load(open('/tmp/lavilla_products.json'));print(next((item.get('imageUrl') for item in data if item.get('imageUrl')), ''))"
http://localhost:9000/catalog-media/imports/Long%20Board/Black_Red-Casco.jpg

$ curl -sS -D - -o /tmp/lavilla_proxy_image.bin "http://localhost:3000/api/media/catalog-media/imports/Long%20Board/Black_Red-Casco.jpg"
HTTP/1.1 200 OK
cache-control: public, max-age=300, s-maxage=3600, stale-while-revalidate=86400
content-type: image/jpeg

$ curl -sS -o /tmp/lavilla_products_page.html -w "%{http_code}" "http://localhost:3000/products"
200
```

### Boundaries and Rollback

- Boundary includes only frontend media proxy route, frontend image URL mapping/fallback, and minimal tests for URL mapping plus catalog URL encoding.
- Rollback can be done by reverting `app/frontend/src/app/api/media/[...path]/route.ts`, `app/frontend/src/lib/media-proxy.ts`, `app/frontend/src/lib/store-catalog.ts`, `app/frontend/src/components/store/product/ProductCard.tsx`, and added tests in frontend/catalog.
- No gateway catalog payload contract changes were introduced in this batch.
