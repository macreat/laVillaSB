# Design: Product Catalog Images and Ordering

## Technical Approach

The FastAPI catalog remains the source of truth for product detail projection and merchandising order.
It will expose `GET /products/{id}` and return the existing additive `ProductOut` shape, including `categoryGroup` and `imageUrl`.
The Laravel gateway adds only that read path to its explicit public allowlist.
Next.js uses one catalog mapper and one same-origin `ProductImage` presentation component for list, detail, and cart; the existing proxy remains the browser media boundary.

## Architecture Decisions

| Decision | Tradeoff | Choice and rationale |
|---|---|---|
| Ordering owner | Frontend sorting duplicates business rules | **Catalog service** derives order before serialization, so every consumer receives identical deterministic results. |
| Measurement source | New product schema versus existing category labels | **Existing category name**; extract a validated decimal from deck category text, avoiding migration and preserving imported data. |
| Apparel classification | Per-screen keyword rules versus shared resolver | **Catalog merchandising module** with ordered buckets `Pantalones`, `Busos`, `Camisetas`, `Zapatos`; outerwear defaults to Busos. |
| Media fallback | Direct object URLs versus browser proxy | **Same-origin proxy** with configured, localhost, then Docker upstream candidates; it avoids browser CORS and handles internal/external topology. |
| Legacy consumers | Replace response shape versus additive evolution | **Additive detail endpoint and unchanged list fields**; old clients ignore new fields and continue using `/products`. |

## Data Flow

```
PostgreSQL Product + Category + ready Media
        -> Catalog ordering/projection -> GET /products and GET /products/{id}
        -> Laravel explicit public proxy -> Next.js catalog mapper
        -> /api/media/... -> MinIO/CDN candidates -> image or branded fallback
```

`order_products()` groups by `categoryGroup`: decks sort by parsed numeric size, then non-sized Long Boards, then ID; apparel sorts by bucket then ID.
Gear and Accessories retain the current ID-ascending relative sequence.
Unknown or incomplete records remain in a stable ID-ordered fallback group.

## File Changes

| File | Action | Description |
|---|---|---|
| `app/microservices/catalog/src/merchandising.py` | Create | Pure decimal extraction, apparel bucket resolver, group ordering, stable fallbacks. |
| `app/microservices/catalog/src/schemas.py` | Modify | Reuse `ProductOut` for detail; preserve additive fields. |
| `app/microservices/catalog/src/main.py` | Modify | Add `GET /products/{product_id}`, 404 contract, eager loads, and ordered list query/projection. |
| `app/backend/gateway/routes/api.php` | Modify | Extend regex allowlist to `products/{id}` without exposing writes. |
| `app/backend/gateway/tests/Feature/CatalogPublicRoutesTest.php` | Modify | Public detail and protected non-read regressions. |
| `app/frontend/src/lib/store-catalog.ts` | Modify | Detail fetch/mapping and preserve server order; no client re-sort. |
| `app/frontend/src/lib/media-proxy.ts` | Modify | Normalize only safe media paths and retain same-origin behavior. |
| `app/frontend/src/components/store/product/ProductImage.tsx` | Create | Shared image/error/fallback rendering. |
| `app/frontend/src/components/store/product/ProductCard.tsx` | Modify | Use `ProductImage`. |
| `app/frontend/src/app/(store)/products/[id]/page.tsx` | Modify | Replace static map with live detail fetch and shared image. |
| `app/frontend/src/app/(store)/cart/page.tsx`, `app/frontend/src/lib/cart.tsx` | Modify | Persist and render the normalized image path with fallback. |
| `app/frontend/src/app/api/media/[...path]/route.ts` | Modify | Preserve status/content headers, bounded upstream fallback, and structured warning logs. |

## Interfaces / Contracts

```python
GET /products/{product_id} -> ProductOut
# 200: existing ProductOut; 404: {"detail":"Product not found"}
```

`ProductOut.imageUrl` is nullable and only populated for `media.status == "ready"`.
Frontend `StoreProduct` keeps `image?: string`; `fetchStoreProduct(id)` returns the same mapped shape or a not-found error.
The gateway public pattern is `health|products|categories` plus `/products/{numeric-id}` only.

## Testing Strategy (strict TDD)

Write RED tests first: catalog unit tests for decimal sizes, Long Boards, every apparel keyword/precedence, ID ties, missing data, and unchanged Gear/Accessories; catalog integration tests for ordered `/products`, detail 200/404, and media projection.
Gateway PHPUnit tests assert unauthenticated detail proxying and denial of media/write routes.
Vitest tests cover mapper/detail fetch, shared fallback on missing and failed images, proxy URL normalization, and cart image persistence.
Run configured Vitest, PHPUnit, Pytest, frontend typecheck/lint, and build; browser E2E remains unavailable.

## Threat Matrix

| Boundary | Status | Safe/failure behavior and RED test |
|---|---|---|
| Documentation-like paths | N/A | No executable classification. |
| Git/repository, commit, push, PR commands | N/A | No VCS automation. |
| Routing/public surface | Applicable | Explicit numeric detail allowlist; writes remain protected. RED: unauthenticated detail succeeds, media/write fails. |
| Shell/subprocess/process integration | N/A | No shell or worker boundary introduced. |

## Migration / Rollout

No database migration is required: ordering uses existing `category_group` and category names, and media uses existing status/metadata.
Deploy catalog and gateway first, then frontend; the endpoint and fields are additive.
Monitor 404, media upstream failure, fallback-render, and ordering-fallback counters/logs.
Rollback by reverting route/detail/frontend changes; retain data and existing `/products` and proxy behavior.

## Open Questions

- [ ] Confirm the exact approved branded fallback asset/design token before implementation.
- [ ] Confirm whether production CDN URLs should be the first proxy candidate or remain configured-only.
