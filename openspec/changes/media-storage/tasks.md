# Tasks: Media Storage

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 520-760 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (contracts + route tests) -> PR 2 (pricing readiness) -> PR 3 (variant pipeline) |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

Single PR path requires size:exception approval before sdd-apply.

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Lock public route and API contracts with RED tests first | PR 1 | `cd app/backend/gateway && php artisan test --filter=CatalogPublicRoutesTest` | `docker compose up gateway catalog` + unauthenticated GET `/v1/catalog/products` | `app/backend/gateway/routes/api.php`, gateway tests |
| 2 | Add pricing readiness model, schema, validation, and projection | PR 2 | `cd app/microservices/catalog && pytest -k "pricing_readiness or products_response"` | `docker compose up catalog db` + call `/products` with zero-price fixture | `app/microservices/catalog/src/{models.py,schemas.py,main.py}` |
| 3 | Add async variant queue contract, enqueue points, retry-safe state | PR 3 | `cd app/microservices/catalog && pytest -k "variant_job or media_complete"` | `docker compose up catalog minio worker` + presign/upload/complete flow | `app/microservices/catalog/src/{main.py,import_drive_catalog.py,models.py}` |

## Phase 1: Foundation and Contract Safety

- [x] 1.1 Add RED gateway contract tests for allowlisted public catalog reads and denied non-allowlisted routes in `app/backend/gateway/tests/Feature/`.
- [x] 1.2 Verify/adjust explicit catalog read allowlist entries in `app/backend/gateway/routes/api.php` to satisfy 1.1.
- [ ] 1.3 Add RED catalog tests for async variant boundary: original asset still served when variant processing fails in `app/microservices/catalog/tests/`.

## Phase 2: Pricing Readiness Core

- [ ] 2.1 Extend product/media persistence state in `app/microservices/catalog/src/models.py` for pricing readiness and variant processing flags.
- [ ] 2.2 Add readiness/variant contract types in `app/microservices/catalog/src/schemas.py` (`PublishReadiness`, payload/state models).
- [ ] 2.3 Implement pricing validation and readiness projection in `app/microservices/catalog/src/main.py` without breaking current `/products` shape.
- [ ] 2.4 Add importer enrichment hooks/backfill mapping for required pricing attributes in `app/microservices/catalog/src/import_drive_catalog.py`.

## Phase 3: Variant Pipeline Integration

- [ ] 3.1 Add variant job payload builder and enqueue on media complete/import in `app/microservices/catalog/src/main.py` and `import_drive_catalog.py`.
- [ ] 3.2 Implement retry-safe variant status transitions and atomic `media.variants` updates in `app/microservices/catalog/src/models.py` (or worker module).
- [ ] 3.3 Keep `/products` selecting canonical image URL with safe fallback to original object when variants are pending/failed in `app/microservices/catalog/src/main.py`.

## Phase 4: Verification and Rollback Readiness

- [ ] 4.1 Add/expand integration tests for `/products`, `/media/presign`, `/media/{id}/complete`, and MinIO persistence in `app/microservices/catalog/tests/`.
- [ ] 4.2 Add E2E storefront check for metadata-backed images plus frontend fallback behavior in `app/frontend` test harness.
- [ ] 4.3 Document feature flags and rollback switches for validator/worker paths in `docs/` runbook used by compose environments.

## Batch Progress Notes (2026-08-11)

- [x] Implemented same-origin storefront media proxy route at `app/frontend/src/app/api/media/[...path]/route.ts` to avoid direct browser requests to `localhost:9000`.
- [x] Updated storefront image mapping to route catalog `imageUrl` through proxy while keeping payload contract unchanged in `app/frontend/src/lib/store-catalog.ts`.
- [x] Added frontend image render fallback on load error in `app/frontend/src/components/store/product/ProductCard.tsx`.
- [x] Added proxy URL mapping unit test in `app/frontend/src/lib/media-proxy.test.ts`.
- [x] Added `pytest` to catalog requirements plus initial catalog test in `app/microservices/catalog/tests/test_storage_public_url.py`.
