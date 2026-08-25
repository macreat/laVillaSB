# Apply Progress: Product Category Subtabs

## Status

- Change: `product-category-subtabs`
- Mode: Strict TDD
- Artifact store: OpenSpec
- Delivery strategy: feature-branch-chain
- Workload: 600-800 forecast lines, high 400-line budget risk
- Progress: 15/15 tasks complete

## Completed Tasks

### Phase 1: Catalog Foundation and API

- [x] 1.1 RED: Added classifier coverage for deck sizes, Long Board, Shoes precedence, hoodie spelling variants, apparel fallback, accessories, gear, and null inputs.
- [x] 1.2 GREEN: Added `src/subcategory.py` with shared group mapping, explicit precedence, canonical labels, and nullable results.
- [x] 1.3 RED then GREEN: Added additive ProductOut and products API coverage, then wired `categorySubcategory` into serialization.
- [x] 1.4 REFACTOR: Updated shared mapper documentation and preserved group precedence, raw category values, response fields, server ordering, and no `/categories` dependency.

### Phase 2: Gateway Contract

- [x] 2.1 RED: Extended `CatalogPublicRoutesTest.php` with raw category, group, subcategory, and sequence assertions.
- [x] 2.2 GREEN/REFACTOR: Confirmed the generic gateway proxy passes additive fields unchanged without filtering, recomputing, or reordering.

### Phase 3: Frontend Domain State

- [x] 3.1 RED: Added mapper, tab derivation, numeric deck ordering, omission, All retention, combined filter, URL encoding, and stale fallback tests.
- [x] 3.2 GREEN: Added catalog subcategory mapping, known-tab derivation, combined filtering, category normalization, stale fallback, and URL helpers.
- [x] 3.3 REFACTOR: Preserved group-only filtering, input order, raw categories, fallback products, and unknown or uncategorized products under All.

### Phase 4: Accessible Storefront UI

- [x] 4.1 RED/manual: Recorded the required focus, active-state, no-wrap, overflow, and reduced-motion checks for the available manual fallback because no browser DOM harness is installed.
- [x] 4.2 GREEN: Added `CategorySubtabs`, URLSearchParams-backed page state, known-tab rendering, stale fallback, combined filtering, and `aria-current="page"`.
- [x] 4.3 REFACTOR: Added a one-line horizontal overflow treatment, lime active underline, visible focus ring, and reduced-motion-safe transitions.

### Phase 5: Verification and Evidence

- [x] 5.1 Focused service tests, frontend tests, typecheck, lint, and production build completed with the results below.
- [x] 5.2 Docker rebuild completed and the rebuilt catalog, gateway, and frontend passed runtime smoke checks.
- [x] 5.3 URL smoke coverage and static accessibility evidence completed.

## Gatekeeper Remediation Evidence

The previous evidence gap was that HTTP 200 checks did not prove the subtab accessibility contract or the rendered page code path.

### Accessibility contract coverage

- Added `app/frontend/src/components/store/CategorySubtabs.contract.test.ts`.
- The repository has no DOM harness: Vitest uses `environment: "node"`, and no Testing Library, jsdom, Playwright, or Chromium executable is available.
- The source-level contract test proves each subtab is an anchor with an `href`, has an accessible `aria-label`, exposes `aria-current="page"` for the active tab, and uses the production URL builder.
- The source-level CSS contract proves `overflow-x: auto`, flex layout, `flex-wrap: nowrap`, `white-space: nowrap`, visible `:focus-visible`, and `prefers-reduced-motion: reduce` with `transition: none`.
- Command: `(cd app/frontend && npx vitest run src/components/store/CategorySubtabs.contract.test.ts)`.
- Exact result: 4 tests passed.

### Runtime and rendered-code-path evidence

- Added `app/frontend/scripts/category-subtabs-smoke.mjs` and the `smoke:category-subtabs` npm script.
- The check fetches the live gateway payload and a live storefront URL.
- It asserts HTTP 200, a non-empty 1,500-product payload, every expected categorySubcategory value with a non-zero count, Gear precedence for Hardware y Accesorios, a Next.js app shell, and built page assets.
- It reads the exact production page, component, catalog mapper, and stylesheet source files used by the built page.
- It asserts that the page wires `CategorySubtabs`, `deriveSubcategoryTabs`, `resolveSubcategorySelection`, and `searchParams.get('subcategory')`.
- It asserts that the code path contains all 20 expected labels and the accessibility, overflow, focus, and reduced-motion contracts.
- Command: `(cd app/frontend && npm run smoke:category-subtabs)`.
- Exact result: catalog HTTP 200, storefront HTTP 200, 1,500 products, and all expected values were non-empty with counts `3,34,12,37,6,7,5`, `1061,45,47,78,52,8,3`, `15,8`, and `38,30,6,5` respectively.
- The script explicitly reports `browserDom: false` and does not claim browser-rendered DOM proof.
- Strongest local runtime command: start the locally built Next app on port 3001 and run the smoke script against it.
- Exact result: the same API and code-path assertions passed against the locally built storefront.

### Evidence mapping to rejected scenarios

| Rejected scenario | New evidence | Result |
|---|---|---|
| Keyboard-focusable controls | `CategorySubtabs.contract.test.ts` checks anchors with production hrefs and accessible labels | Passed; browser interaction remains unavailable by explicit environment limitation |
| Active state announcement | Contract test checks the active `aria-current` expression | Passed |
| One-line horizontal scrolling | Contract test checks overflow, flex no-wrap, and link white-space rules | Passed |
| Reduced-motion safety | Contract test checks the reduced-motion media query and disabled transitions | Passed |
| HTTP 200 did not prove rendered subtabs | `category-subtabs-smoke.mjs` checks live payload counts plus exact page/component/mapper/style code path and Next assets | Passed with `browserDom: false` |

### Remediation TDD Cycle Evidence

| Remediation | Test file or command | Safety net | RED | GREEN | Triangulate | REFACTOR |
|---|---|---|---|---|---|---|
| R1 accessibility contract | `src/components/store/CategorySubtabs.contract.test.ts` | 24 frontend tests passed | 1 failing assertion for the missing accessible link label | 4 tests passed after adding the label | Link semantics, active state, CSS overflow, focus, and reduced-motion paths | Clean |
| R2 runtime evidence | `scripts/category-subtabs-smoke.mjs` and contract test | 4 contract tests passed | Smoke-script source contract failed before the script existed | 4 contract tests passed and live smoke passed | All groups, all 20 labels, Gear precedence, Next shell, and built source paths | Clean |

## TDD Cycle Evidence

| Task | Test file | Layer | Safety net | RED | GREEN | Triangulate | Refactor |
|---|---|---|---|---|---|---|---|
| 1.1 | `app/microservices/catalog/tests/test_subcategory.py` | Unit | N/A (new) | Written, collection failed before implementation | 18 passed | 18 cases across all group paths | Clean |
| 1.2 | `app/microservices/catalog/tests/test_subcategory.py` | Unit | N/A (new) | Written | 18 passed | Deck, apparel, accessories, gear, and null paths | Clean |
| 1.3 | `app/microservices/catalog/tests/test_product_out.py`, `test_products_api.py`, `test_products_api_ordering.py` | Integration | 5 passed before new assertions | 5 failures before implementation | 28 passed with classifier tests | Detail, list, null, and ordering cases | Clean |
| 1.4 | Existing catalog regression suite | Unit/integration | 28 passed before refactor | New preservation assertions present | 54 passed | Group precedence and ordering regression cases | Clean |
| 2.1 | `app/backend/gateway/tests/Feature/CatalogPublicRoutesTest.php` | Feature | 5 tests, 15 assertions | New pass-through assertions written | 5 tests, 19 assertions passed | Two ordered products with additive fields | No gateway code required |
| 2.2 | `CatalogPublicRoutesTest.php` | Feature | 5 tests, 19 assertions | Contract assertions present | 5 tests, 19 assertions passed | List ordering and detail allowlist preserved | No gateway code required |
| 3.1 | `app/frontend/src/lib/store-catalog.test.ts` | Unit | 10 passed | 6 failures before implementation | 17 passed | Known, numeric deck order, unknown, null, stale, group, and encoded URL cases | Clean |
| 3.2 | `store-catalog.test.ts` | Unit | 10 passed | Written | 17 passed | Multiple group and subcategory paths | Clean |
| 3.3 | `store-catalog.test.ts` | Unit | 17 passed | Preservation assertions present | 17 passed | Fallback and server-order cases | Clean |
| 4.1 | Manual fallback checklist in this artifact | Manual/static | No DOM harness available | Required checks recorded before UI implementation | Static implementation evidence and runtime URLs passed | Focus, active state, overflow, and reduced motion reviewed in source | Clean |
| 4.2 | `store-catalog.test.ts` plus production build | Unit/build | 17 passed | URL/filter assertions written | 17 passed and build passed | Valid and stale URL scenarios | Clean |
| 4.3 | Production build and source-level accessibility review | Build/manual | Build passed | CSS acceptance checks recorded | Build passed | Reduced-motion media query and focus selectors reviewed | Clean |

## Work Unit Evidence

### PR 1: Catalog classifier and API

- Focused test command: `(cd app/microservices/catalog && pytest tests/test_category_groups.py tests/test_subcategory.py tests/test_product_out.py tests/test_products_api.py tests/test_products_api_ordering.py tests/test_list_products_ordering.py tests/test_merchandising.py)`.
- Exact result: 54 passed in 5.36s.
- Runtime harness: `curl -fsS http://localhost:9002/products`.
- Exact result: HTTP 200, 1,500 products, first subcategory `7.75`.
- Rollback boundary: `app/microservices/catalog/src/subcategory.py`, `src/category_groups.py` documentation, `src/schemas.py`, `src/main.py`, and the catalog tests.

### PR 2: Gateway pass-through

- Focused test command: `php artisan test --filter=CatalogPublicRoutesTest`.
- Exact result: 5 tests passed with 19 assertions.
- Note: The documented Composer script forwards `--filter` to its config-clear step, so direct Artisan execution was used for the focused result.
- Runtime harness: `curl -fsS http://localhost:8010/api/v1/catalog/products`.
- Exact result: HTTP 200, 1,500 products, additive category fields present, and `Hardware & Accessories` present.
- Rollback boundary: `app/backend/gateway/tests/Feature/CatalogPublicRoutesTest.php`; no gateway production code changed.

### PR 3: Frontend domain state

- Focused test command: `(cd app/frontend && npx vitest run src/lib/store-catalog.test.ts)`.
- Exact result: 1 test file passed with 17 tests.
- Runtime harness: `curl -fsS 'http://localhost:3000/products?category=apparel&subcategory=Hoodies'` and the stale URL variant.
- Exact result: both URLs returned HTTP 200.
- Rollback boundary: `app/frontend/src/lib/store-catalog.ts` and `src/lib/store-catalog.test.ts`.

### PR 4: Accessible UI and deployment evidence

- Focused test command: `(cd app/frontend && npx vitest run src/components/store/CategorySubtabs.contract.test.ts src/lib/store-catalog.test.ts)`.
- Exact result: 2 test files passed with 21 tests.
- Additional command: `(cd app/frontend && npm run typecheck && npm run lint && npm run build)`.
- Exact result: typecheck passed, lint passed with two pre-existing warnings, and production build passed.
- Full frontend Vitest result: 4 test files passed with 28 tests.
- Runtime evidence command: `(cd app/frontend && npm run smoke:category-subtabs)`.
- Exact result: live API and locally inspected production code path passed with all expected subcategory counts.
- Runtime harness: `docker compose up -d --build catalog gateway frontend`, followed by HTTP checks for `/products`, every top-level group URL, valid Hoodies state, and stale subcategory state.
- Previous exact result: all listed storefront URLs returned HTTP 200, and Docker rebuilt and started all three changed services.
- Correction rebuild result: repeated Docker rebuild attempts were blocked by transient Docker Hub TLS handshake timeouts for `composer:2.8` and `node:20-alpine`; the local production build and local Next runtime smoke both passed.
- Rollback boundary: `app/frontend/src/components/store/CategorySubtabs.tsx`, `src/app/(store)/products/page.tsx`, `src/app/globals.css`, and the related frontend tests.

## Verification-Blocked Remediation Evidence

The remediation addressed only the two verification findings and did not add tasks or change scope.

### Empty known subcategory omission

- Added `app/frontend/src/lib/store-catalog.test.ts::omits an empty known accessory label while keeping All discoverable`.
- The test supplies only a populated `Bags & Waist Packs` Accessories product and proves the derived tabs are exactly `All`, `Bags & Waist Packs`; empty `Grip Tape` is omitted.
- Safety net: the existing frontend domain test passed with 17 tests before the test was added.
- TDD result: the requested behavior already existed, so the new focused test passed immediately rather than producing a production-code RED failure.
- Focused command: `(cd app/frontend && npx vitest run src/components/store/CategorySubtabs.contract.test.ts src/lib/store-catalog.test.ts)`.
- Exact result: 2 test files passed with 22 tests.

### NULL and unrecognized category-group serialization

- Updated `resolve_group()` to canonicalize NULL, blank, and unrecognized stored groups to `uncategorized`.
- Updated `to_product_out()` to emit a null `categorySubcategory` whenever the serialized group is `uncategorized`, preventing a derived known family from being paired with that group.
- Added focused serialization assertions for NULL and unrecognized stored groups in `test_product_out.py` and canonicalization coverage in `test_category_groups.py`.
- TDD result: the new assertions first failed with the previous `Other Apparel` and unrecognized-group outputs, then passed after the minimal catalog change.
- Focused command: `(cd app/microservices/catalog && pytest tests/test_category_groups.py tests/test_subcategory.py tests/test_product_out.py tests/test_products_api.py tests/test_products_api_ordering.py tests/test_list_products_ordering.py tests/test_merchandising.py)`.
- Exact result: 56 tests passed.
- E2E-like serialization diagnostic: a product with category `Ropa / Talla L` and NULL stored group serialized as `categoryGroup=uncategorized` and `categorySubcategory=None`.

### Remediation TDD Cycle Evidence

| Remediation | Test file or command | Safety net | RED | GREEN | Triangulate | Refactor |
|---|---|---|---|---|---|---|
| R3 empty known subcategory omission | `app/frontend/src/lib/store-catalog.test.ts` | 17 frontend tests passed | Test written; existing implementation already passed the requested behavior | 18 domain tests passed | Accessories omission plus existing deck omission and All-retention cases | Clean |
| R4 NULL/unrecognized serialization contract | `app/microservices/catalog/tests/test_product_out.py`, `test_category_groups.py` | 54 catalog tests passed | 2 new serialization assertions failed before implementation | 56 focused catalog tests passed | NULL and unrecognized stored-group paths both serialize as uncategorized plus null | Clean |

### Remediation Work Unit Evidence

- Focused frontend test command: `(cd app/frontend && npx vitest run src/components/store/CategorySubtabs.contract.test.ts src/lib/store-catalog.test.ts)`.
- Exact result: 22 tests passed.
- Focused catalog test command: `(cd app/microservices/catalog && pytest tests/test_category_groups.py tests/test_subcategory.py tests/test_product_out.py tests/test_products_api.py tests/test_products_api_ordering.py tests/test_list_products_ordering.py tests/test_merchandising.py)`.
- Exact result: 56 tests passed.
- Typecheck/build command: `(cd app/frontend && npm run typecheck && npm run build)`.
- Exact result: typecheck passed and production build passed with the two pre-existing lint warnings.
- Runtime harness: direct `to_product_out()` serialization diagnostic for a NULL stored group; exact result was `{'categoryGroup': 'uncategorized', 'categorySubcategory': None}`.
- Rollback boundary: revert only `app/frontend/src/lib/store-catalog.test.ts`, `app/microservices/catalog/src/category_groups.py`, `app/microservices/catalog/src/main.py`, `app/microservices/catalog/tests/test_category_groups.py`, and `app/microservices/catalog/tests/test_product_out.py` to remove this remediation without touching the rest of the change.

## Runtime Evidence

- Catalog group counts after rebuild: 104 decks, 1,294 apparel, 79 gear, and 23 accessories.
- Catalog subcategory values after rebuild matched the supported live taxonomy: seven deck values, seven apparel values, two accessory values, and four gear values.
- `/products`, `?category=decks`, `?category=apparel`, `?category=accessories`, and `?category=gear` returned HTTP 200.
- Valid `?category=apparel&subcategory=Hoodies` returned HTTP 200.
- Stale `?category=apparel&subcategory=Stale` returned HTTP 200.
- `docker compose ps` showed catalog, gateway, and frontend running after rebuild.
- The correction smoke output explicitly reported `browserDom: false`.
- No browser E2E tooling or Chromium executable was available, so keyboard activation and pixel-level viewport checks are represented by the component contract test and CSS source evidence rather than an automated browser receipt.

## Issues and Deviations

- Docker metadata resolution timed out twice before succeeding on the third rebuild attempt.
- Correction Docker rebuild attempts also encountered transient Docker Hub TLS handshake timeouts.
- The full local catalog Pytest command remains blocked during collection by the pre-existing missing `pytesseract` dependency in `tests/test_ocr_pricing.py`.
- Frontend lint remains green with two pre-existing warnings in `src/app/(dashboard)/admin/settings/page.tsx` and `src/app/layout.tsx`.
- No implementation deviation from the design was required.

## Chain Boundary

- PR 1 targets the feature tracker and contains only catalog classifier/API behavior.
- PR 2 depends on PR 1 and contains only gateway contract coverage because the generic proxy already forwards fields unchanged.
- PR 3 depends on PR 2 and contains only frontend mapping, filtering, and URL state.
- PR 4 depends on PR 3 and contains only the accessible UI, CSS, rebuild, and runtime evidence.
- The implementation was completed in one automatic run without creating or merging Git branches or commits.
