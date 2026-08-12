# Proposal: Product Catalog Images and Ordering

Replace stale detail mocks with live data and deterministic order without changing Accessories or Gear.

## Intent

Details must show real metadata and images. Incomplete media must not hide products, and ordering must be consistent.

## Scope

### In Scope
- Public catalog-backed `GET /products/{id}` using the response shape.
- Shared media handling for list, detail, and cart imagery.
- Catalog-owned Deck and Apparel ordering/classification rules.
- Branded fallback for missing or failed images.
- Catalog, gateway, and frontend tests.

### Out of Scope
- Media storage/upload redesign, taxonomy changes, or filter renaming.
- Reordering Accessories or Gear.
- Browser E2E infrastructure or admin merchandising controls.

## User-Visible Outcomes

- List-to-detail navigation resolves imported IDs with live metadata.
- Detail, list, and cart use one image path and degrade gracefully.
- Decks sort by measurable size, smallest to largest; non-sized Long Boards follow sized decks.
- Apparel uses Pantalones, Busos, Camisetas, and Zapatos. Hoodies and Chaquetas map to Busos unless a more precise rule applies.

## Business Rules

- Deck sizes use reliable numeric category measurements, not lexicographic ordering.
- Accessories and Gear keep current order; product ID is the stable tie-breaker.
- Unclassifiable products remain visible with stable ordering.

## Capabilities

### New Capabilities
- `catalog-product-detail`: Public read-only product detail retrieval.
- `catalog-merchandising-order`: Ordering and apparel classification.

### Modified Capabilities
- `catalog-media-metadata`: Metadata-backed images support detail responses.
- `public-catalog-read-proxy`: Product detail paths are explicitly public reads.
- `storefront-category-filtering`: Views consume catalog ordering.

## Approach

Implement ordering in the catalog contract, expose detail through the gateway allowlist, and update Next.js to consume it. Retain the media proxy as the browser path.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/microservices/catalog` | Modified | Detail read and ordering |
| `app/backend/gateway/routes/api.php` | Modified | Detail allowlist |
| `app/frontend/src/app/(store)/products/[id]` | Modified | Live detail data |
| `app/frontend/src/lib/store-catalog.ts` | Modified | Shared mapping/order |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Mixed apparel classification | High | Central rules, exceptions, representative tests |
| Order changes affect consumers | Med | Explicit contract, unchanged groups, ID tie-breaker |
| Media regressions | Med | Reuse proxy; test missing and failed media |

## Rollback Plan

Revert catalog/detail and frontend changes, restore the prior gateway rule, and retain existing media behavior.

## Dependencies

- Existing category groups, media, and proxy contracts.

## Success Criteria

- [ ] Imported detail IDs return live metadata or clear not-found responses.
- [ ] Deck/Apparel rules pass, while Accessories/Gear remain unchanged.
- [ ] Image failures preserve visibility with branded fallback.
- [ ] Frontend, gateway, and catalog tests pass.
