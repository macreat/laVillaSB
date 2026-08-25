## Exploration: product-category-subtabs

## Current State

### Storefront behavior

- `app/frontend/src/app/(store)/products/page.tsx` has one `category` query parameter and a fixed `CATEGORIES` list ordered as `all`, `decks`, `apparel`, `accessories`, `gear`.
- The page filters only by `categoryGroup` through `filterByCategoryGroup` and renders the current filter as a wrapped, centered button row.
- No subcategory query parameter, subtab component, horizontal overflow behavior, or subcategory-aware product filter exists.
- `StoreHeader.tsx`, the home page, and `StoreFooter.tsx` link to the same four top-level group filters.
- The existing product grid and server-provided product order are already preserved by the client.

### Catalog and API contract

- The catalog service is FastAPI with SQLAlchemy/PostgreSQL and exposes `GET /products` through the Laravel gateway.
- `ProductOut` currently includes `category` and `categoryGroup`, but the frontend `CatalogProduct` interface and `mapCatalogProduct` discard `category`.
- `Category` is a flat table with `slug`, `name`, and `category_group`; it has no parent, subcategory, or display-order field.
- The importer creates category names from the source folder path, such as `Skate / Maderos / 8.25`, `Tenis / Talla 8Us -39Col / Todo`, and `Ropa / Talla L`.
- The gateway has a public allowlist for `categories`, but the current catalog application does not implement `GET /categories`; the live gateway route returns HTTP 404.
- The existing group taxonomy and precedence must remain unchanged, including `Skate / Hardware y Accesorios` mapping to `gear`.

### Live catalog evidence

The running compose stack was queried through `http://localhost:8010/api/v1/catalog/products` on 2026-08-12.

- The response contains 1,500 products.
- Group counts are 104 decks, 1,294 apparel, 23 accessories, and 79 gear.
- Deck categories contain seven real values: 7.75, 8.0, 8.125, 8.25, 8.4, 8.5, and Long Board.
- Accessories contain two real category values: `Maletines - Canguros` and `Skate / Lijas`.
- Gear contains four real category values: `Skate / Trucks`, `Skate / Ruedas`, `Skate / Rodamientos`, and `Skate / Hardware y Accesorios`.
- Apparel categories are mostly size or commercial-type folders, not product families: 1,061 shoes are under `Tenis / ...`, while clothing is under `Ropa / Talla S|M|L|XL` or `Ropa / Pantalones`.
- Apparel product names provide the remaining meaningful families: 45 hoodies, 47 sweatshirts or `Buzo`/`Camibuzo` products, 78 T-shirts, 52 jackets or outerwear products, 8 pants, and 3 residual apparel products.
- The apparel counts sum to all 1,294 apparel products when the fallback family is retained.

### Existing ordering and responsive constraints

- `app/microservices/catalog/src/merchandising.py` owns server ordering, including numeric deck-size ordering and the existing apparel buckets.
- `order_products` must not be changed for this feature.
- The backend `GROUPS` tuple places `gear` before `accessories`, but the storefront deliberately places `accessories` before `gear`; the existing storefront order is the behavior to preserve.
- The current filter row uses `flex-wrap`, so long labels can create multiple rows on narrow screens. A sliding subtab row should use a single horizontal overflow region with keyboard-focusable controls, visible focus, and reduced-motion-safe styling.
- The configured test stack has Vitest, PHPUnit, and Pytest, but no browser E2E tooling is detected.

## Affected Areas

- `app/frontend/src/app/(store)/products/page.tsx` - Owns top-level and future subtab URL state, tab rendering, active labels, and composition of group plus subcategory filtering.
- `app/frontend/src/lib/store-catalog.ts` - Must retain the API `category` field or consume a new additive subcategory field, expose pure subcategory filtering, and preserve existing fallback behavior.
- `app/frontend/src/lib/store-catalog.test.ts` - Existing pure filtering contract should gain coverage for tab derivation, combined filters, invalid subcategories, and uncategorized products.
- `app/frontend/src/components/store/` - A focused subtab component is the natural home for the horizontal/sliding responsive control if the page should remain presentation-light.
- `app/microservices/catalog/src/schemas.py` - A catalog-owned additive subcategory field would be added to `ProductOut` without removing existing fields.
- `app/microservices/catalog/src/main.py` - Product serialization would expose the canonical subcategory computed from the catalog source data.
- `app/microservices/catalog/src/` - A shared classifier module would define deck-size, apparel-family, accessory, and gear subcategories with an explicit fallback.
- `app/microservices/catalog/tests/` - Classifier and API serialization tests must prove the real taxonomy, typo handling such as `Hoddie`, and preservation of the existing product contract.
- `app/backend/gateway/tests/Feature/CatalogPublicRoutesTest.php` - The proxy contract should assert that the additive subcategory field passes through unchanged.
- `openspec/specs/catalog-category-groups/spec.md` and `openspec/specs/storefront-category-filtering/spec.md` - Later phases should add deltas without changing the archived top-level group semantics or ordering.

## Data-Derived Subtab Set

The following labels are supported by the live catalog and should only be rendered when their product count is non-zero.

| Top-level group | Subtab label | Source evidence | Count |
|---|---|---|---:|
| Decks | 7.75 | `Skate / Maderos / 7.75` | 3 |
| Decks | 8.0 | `Skate / Maderos / 8.0` | 34 |
| Decks | 8.125 | `Skate / Maderos / 8.125` | 12 |
| Decks | 8.25 | `Skate / Maderos / 8.25` | 37 |
| Decks | 8.4 | `Skate / Maderos / 8.4` | 6 |
| Decks | 8.5 | `Skate / Maderos / 8.5` | 7 |
| Decks | Long Board | `Long Board` | 5 |
| Apparel | Shoes | `Tenis / ...` category family | 1,061 |
| Apparel | Hoodies | product name contains `Hoodie` or `Hoddie` | 45 |
| Apparel | Sweatshirts | product name contains `Buzo` or `Camibuzo` | 47 |
| Apparel | T-Shirts | product name contains `Camis...` | 78 |
| Apparel | Jackets & Outerwear | product name contains `Chaquet...`, `Rompevientos`, or `Chaleco` | 52 |
| Apparel | Pants | `Ropa / Pantalones` | 8 |
| Apparel | Other Apparel | three apparel products not matching a named family | 3 |
| Accessories | Bags & Waist Packs | `Maletines - Canguros` | 15 |
| Accessories | Grip Tape | `Skate / Lijas` | 8 |
| Gear | Trucks | `Skate / Trucks` | 38 |
| Gear | Wheels | `Skate / Ruedas` | 30 |
| Gear | Bearings | `Skate / Rodamientos` | 6 |
| Gear | Hardware & Accessories | `Skate / Hardware y Accesorios` | 5 |

Deck tabs should be ordered numerically, followed by Long Board.
The other groups should use a stable catalog-derived order and must not affect the existing top-level order.
The display labels above normalize Spanish source names for the English storefront, while the raw `category` value remains available for traceability.

## Approaches

1. **Frontend-only derivation from the existing product payload** - Preserve the current API and derive subcategories from `category` plus product `name` in `store-catalog.ts`.
   - Pros: Lowest service surface area, no migration, tabs automatically reflect products returned by the live catalog, and the current product ordering remains untouched.
   - Cons: Apparel classification becomes storefront-owned presentation logic, the frontend must maintain filename heuristics, and other clients could implement conflicting taxonomies.
   - Effort: Medium.

2. **Catalog-owned additive subcategory field** - Add a deterministic catalog classifier and expose a `categorySubcategory` value on each `ProductOut`; the frontend derives available tabs from returned values and applies the combined group/subcategory filter.
   - Pros: Keeps taxonomy ownership with the catalog, preserves the current list endpoint and ordering, avoids a database migration when derived at serialization time, supports real availability without a hard-coded product list, and gives all clients one contract.
   - Cons: Requires coordinated FastAPI, gateway-contract, and frontend test changes; apparel still needs a documented filename fallback because the imported folder taxonomy is size-based.
   - Effort: Medium.

3. **Dedicated catalog facets endpoint with persisted taxonomy** - Add structured product subcategory data or a facets endpoint returning labels and counts, then query filtered products from the API.
   - Pros: Best long-term scalability for large catalogs, explicit counts, and a clean taxonomy contract independent of the full product list.
   - Cons: Requires new endpoint and query semantics, likely a migration or importer change, more cache and synchronization behavior, and is disproportionate while the storefront already downloads the complete 1,500-product list.
   - Effort: High.

## Recommendation

Choose Approach 2.
The catalog should expose an additive canonical subcategory field computed from the existing category path and product name, while the frontend should derive the visible subtab list from the products actually returned by the API.
This keeps the taxonomy in the domain service, avoids inventing tabs for absent data, and does not require changing the current `categoryGroup` taxonomy, product ordering, or public list route.

The UI should keep the existing top-level links and order, add an `All` subtab for each selected group, preserve the group-only view when no subtab is selected, and encode the selected subcategory in the URL for reload/share behavior.
An unknown or stale subcategory should fall back to the selected group rather than produce an unexplained empty catalog.
The fallback `Other Apparel` must remain visible when needed so the feature never hides valid products.

The first implementation task should define the classifier's precedence and canonical values before building the UI.
In particular, shoe detection must precede clothing-name detection, `Hoddie` must be treated as a hoodie, deck sizes must be parsed from the actual `Maderos` categories, and `Hardware y Accesorios` must remain under Gear because the existing group precedence is authoritative.

## Acceptance Checks

- Every live product retains its existing `category`, `categoryGroup`, and ordering behavior, with an additive canonical subcategory value where applicable.
- The top-level control order remains `All`, `Decks`, `Apparel`, `Accessories`, `Gear`, and each existing group URL still returns its current non-empty product set.
- Decks render exactly the seven currently available subtab values, with numeric sizes in ascending order and Long Board last.
- Apparel renders Shoes, Hoodies, Sweatshirts, T-Shirts, Jackets & Outerwear, Pants, and Other Apparel only when the corresponding live data exists.
- Accessories render Bags & Waist Packs and Grip Tape, and Gear renders Trucks, Wheels, Bearings, and Hardware & Accessories from the current catalog.
- Selecting a subtab shows only products in both the selected `categoryGroup` and selected subcategory; selecting `All` restores the complete group list.
- Missing or unknown subcategory data never crashes the page, and the fallback apparel family keeps residual products discoverable.
- Subtab state is reloadable and shareable through canonical URL parameters, with stale values falling back to the group view.
- On narrow viewports the subtab row remains one horizontally scrollable line with keyboard focus, active-state semantics, and no forced wrapping.
- After `docker compose up -d --build catalog gateway frontend`, `http://localhost:3000/products` and all top-level category URLs return HTTP 200 and the rendered storefront visibly contains the applicable subtabs.
- Strict TDD coverage includes the catalog classifier, additive API serialization and gateway pass-through, pure frontend mapping/filtering, URL edge cases, and the responsive subtab component where a component test harness is available.

## Risks

- The current apparel folder structure does not encode product family, so the classifier depends on imported filenames and needs an explicit fallback for new or malformed names.
- Future catalog imports can introduce a new family or deck size; the UI must render unknown canonical values safely rather than silently dropping products.
- Query parameters must be canonicalized and URL-encoded so labels such as `Long Board` and ampersand-containing labels do not break navigation.
- Horizontal scrolling must remain keyboard accessible, expose active state, avoid hidden focus rings, and respect reduced-motion preferences.
- The current gateway allowlist advertises `/categories` but the catalog endpoint returns 404; the implementation should not depend on that endpoint unless it is intentionally completed and tested.
- The 1,500-product payload is approximately 745 KB before browser processing; a future catalog growth path may justify Approach 3, but it is not required for this change.
- Existing fallback products contain only group data and no category subcategory; they must continue rendering under the group `All` tab and not cause a runtime error.
- The baseline full catalog Pytest run currently fails during collection because the local environment lacks `pytesseract`; category, ordering, API, and ProductOut tests pass when the OCR test is excluded.

## Ready for Proposal

Yes.
The behavior, data-derived labels, service boundaries, API implications, responsive constraints, and acceptance checks are sufficiently defined for proposal and specification work without clarification.
The next phase should formalize the additive subcategory contract, classifier precedence, URL semantics, and strict TDD scenarios before implementation.
