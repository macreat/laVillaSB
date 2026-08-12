# Exploration: Product Catalog Images and Ordering (product-catalog-images-and-ordering)

## Current State

### Catalog and API

- The catalog service is FastAPI with SQLAlchemy/PostgreSQL and exposes `GET /products`.
- `Product` stores one optional `media_id`; `Media` stores `storage_key`, bucket, MIME type, status, and variants.
- `GET /products` orders products by `Product.id.asc()` and serializes a ready media record to `imageUrl` using `build_public_url`.
- The Laravel gateway exposes the catalog product list publicly at `/api/v1/catalog/products`.
- The live stack currently returns 1,500 products and 1,500 non-null `imageUrl` values. A sample catalog image is reachable through both MinIO and the same-origin Next.js proxy.

### Frontend image behavior and likely root cause

- The listing page fetches the catalog API, maps `imageUrl` through `toSameOriginMediaUrl`, and passes the result to `ProductCard`.
- The same-origin proxy at `app/frontend/src/app/api/media/[...path]/route.ts` handles encoded path segments and falls back among configured, `localhost:9000`, and `minio:9000` origins.
- `ProductCard` renders the mapped image and falls back to a placeholder after `onError`.
- The product detail route is the user-visible defect: `app/(store)/products/[id]/page.tsx` does not fetch the catalog at all. It uses a 12-item static mock `PRODUCTS` record, renders only a placeholder image, and returns “Product not found” for imported IDs such as 1500. Therefore opening a real catalog product cannot display its API-backed image, even though the list/proxy path works.
- The detail page also has stale mock names, prices, descriptions, and categories, creating a second source of truth and making list-to-detail navigation inconsistent.

### Existing category ordering

- The storefront filters by canonical groups: `all`, `decks`, `apparel`, `accessories`, and `gear`.
- Catalog group mapping is already authoritative and persisted on categories as `category_group`; its mapping precedence is decks, apparel, gear, accessories, uncategorized.
- Current API and frontend ordering is product ID ascending. Accessories and Gear therefore have a stable existing order that should be preserved.
- Live group counts are: 104 Decks, 1,294 Apparel, 23 Accessories, and 79 Gear.
- Deck source categories are `Long Board` plus `Skate / Maderos / 7.75`, `8.0`, `8.125`, `8.25`, `8.4`, and `8.5`. Numeric size ordering is available in the category path, while Long Board has no numeric width.
- Apparel source data is heterogeneous: 8 `Ropa / Pantalones` products, size-only `Ropa / Talla S/M/L/XL` categories containing mixed Buzos, Camisetas, Chaquetas, Hoodies, and other items, plus 1,061 shoe products under `Tenis / Talla ...` categories. The requested labels do not map one-to-one to persisted categories.

## Affected Areas

- `app/frontend/src/app/(store)/products/[id]/page.tsx` - replace static detail data with the catalog-backed product and render its media URL, with loading/not-found/error handling.
- `app/frontend/src/lib/store-catalog.ts` - extend the catalog response/store model for detail use and centralize deterministic ordering/classification helpers if ordering remains client-side.
- `app/frontend/src/components/store/product/ProductCard.tsx` - preserve the working list image behavior and ensure cart items use the resolved media URL.
- `app/frontend/src/lib/media-proxy.ts` and `app/frontend/src/app/api/media/[...path]/route.ts` - existing image URL normalization/proxy path; verify detail reuse, encoded names, missing objects, and origin configuration.
- `app/microservices/catalog/src/main.py` - current list query is ID-ordered and there is no product-detail endpoint; likely place for a deterministic API sort or a new detail read.
- `app/microservices/catalog/src/schemas.py` and `app/microservices/catalog/src/models.py` - product detail/list contract and any future persisted sort metadata.
- `app/backend/gateway/routes/api.php` - public allowlist currently covers `products` including subpaths via `(health|products|categories)(/.*)?`; no allowlist expansion appears necessary for `/products/{id}`.
- `app/frontend/src/lib/store-catalog.test.ts`, `app/frontend/src/lib/media-proxy.test.ts`, catalog tests, and gateway feature tests - existing unit/contract coverage to extend.
- Existing specs `openspec/specs/catalog-media-metadata/spec.md`, `public-catalog-read-proxy/spec.md`, `catalog-category-groups/spec.md`, and `storefront-category-filtering/spec.md` - image metadata, public reads, and group taxonomy are already baseline contracts and must remain compatible.

## Approaches

1. **Frontend detail read plus deterministic client-side group ordering** - add/use a catalog detail read, reuse the same-origin media mapper, and sort the fetched list in the storefront using parsed category/name rules.
   - Pros: fixes the actual detail-page defect without changing persisted data; Accessories and Gear can remain in their API order; straightforward UI tests.
   - Cons: ordering policy is not authoritative for other consumers; apparel classification is ambiguous because source categories mix item types and names contain typos/variants; sorting 1,500 records in the browser is acceptable but not ideal.
   - Effort: Medium

2. **Catalog-owned ordering contract** - define a stable sort key/order in the catalog response or persisted category/product metadata, expose a detail endpoint, and let the frontend render the API order.
   - Pros: one authoritative order for storefront and future consumers; avoids duplicating taxonomy rules in the frontend; easier to verify at the API boundary.
   - Cons: requires an explicit classification policy for mixed apparel records and un-sized Long Board products; may require schema/backfill work because there is no existing sort-order field or migration system beyond `create_all`/manual SQL.
   - Effort: Medium-High

3. **Static/mock detail expansion** - add imported IDs and image URLs to the existing detail-page mock.
   - Pros: small apparent frontend change.
   - Cons: cannot represent 1,500 API products, remains stale, duplicates catalog data, and does not solve the root cause.
   - Effort: Low, but not acceptable

## Recommendation

Use Approach 2 for the ordering policy and the catalog-backed detail read, while keeping the existing same-origin media proxy as the single browser image path.

The API already owns product metadata and group taxonomy, and live evidence shows the media records and URLs are present. The primary bug is the detail page bypassing that contract, not the proxy itself. Ordering should be expressed as a deterministic, testable catalog/storefront contract rather than inferred ad hoc in multiple components. Preserve `Product.id.asc()` as the tie-breaker so Accessories and Gear remain unchanged and products with missing/unrecognized sort metadata remain stable.

Before proposal/spec, settle the following product rules:

1. Should Decks be ordered by width ascending or descending? Where should the five `Long Board` products appear because they have no width: before sized decks, after sized decks, or in a separate/unspecified bucket?
2. Are Decks ordered by category width (`7.75` through `8.5`) or by a size parsed from the product name? Current data supports category width more reliably.
3. How should Apparel classify mixed `Ropa / Talla S/M/L/XL` records such as Chaquetas, Hoodies, Camibuzos, misspelled `Camiset`, and uninformative filenames? The requested order names only Pantalones, Busos, Camisetas, Zapatos, but the live dataset includes additional apparel types.
4. Does “Busos” include Hoodies, Camibuzos, Chaquetas, Rompevientos, and other outerwear, or should those be a separate/unspecified bucket? Should `Pantalones` be identified from the category path only, or also from product names?
5. Should “Zapatos” mean all `categoryGroup=apparel` products under `Tenis`, including Originales, Replicas, and Todo, with existing ID order within the bucket?
6. Is the desired order only the storefront’s `all` view, or also each category-filtered view and the admin catalog? The current API order affects all consumers.

## Risks

- The current detail route has no API read for a single product. If the implementation only changes image rendering without replacing the static data path, imported products will still fail or show incorrect metadata.
- The catalog has 1,500 products but no `GET /products/{id}` route in the current implementation, despite the service README claiming one. Adding it must preserve the gateway’s public-read policy and use the same response shape as list entries.
- Apparel grouping cannot be inferred perfectly from existing category data. A rule that silently places Chaquetas or ambiguous filenames into one of the four requested buckets may produce incorrect merchandising.
- Deck width parsing must handle decimal strings (`8.0`, `8.125`, `8.25`, `8.4`, `8.5`) and the non-sized Long Board category without accidental lexicographic sorting.
- Missing media, non-ready media, 404 proxy responses, encoded/unicode storage keys, and changed `MEDIA_ORIGIN_BASE_URL` configuration must continue to produce a graceful placeholder rather than a broken detail layout.
- Ordering changes can alter the implicit product sequence consumed by admin screens or other API clients. Keeping the order in the frontend limits blast radius; catalog-owned ordering is more consistent but needs explicit compatibility review.
- There is no browser E2E tooling configured. Existing verification is Vitest, PHPUnit, Pytest, live curl/source inspection, and frontend build/typecheck.
- The repository already contains untracked `.atl/` and `openspec/config.yaml`; this exploration adds only the named change artifact and must not overwrite existing OpenSpec work.

## Ready for Proposal

**Partial - clarification required.** The image root cause and affected boundaries are sufficiently clear for proposal work, and the existing media proxy should be retained. Ordering implementation should not be specified until the Decks direction/Long Board placement and the classification policy for mixed Apparel records are confirmed. The next phase should also decide whether to introduce a public catalog detail endpoint or fetch/filter the existing list response, with the detail endpoint preferred for correctness and scalability.
