# Design: Product Category Subtabs

## Technical Approach

Catalog owns taxonomy, Laravel transports it, and Next.js owns URL state, known-tab derivation, filtering, and presentation.
FastAPI derives the additive value from existing data without migration, importer change, `/categories` dependency, or ordering change.

## Architecture Decisions

| Decision | Alternatives rejected | Choice and rationale |
|---|---|---|
| Group ownership | Classifier-local keywords | `category_groups.py` and `map_category_name()` remain the shared mapper for import, backfill, API, and classification; gear-first preserves Hardware y Accesorios under Gear. |
| Subcategory ownership | Frontend heuristics or persisted facets | `src/subcategory.py` calls `resolve_group()` from the shared module; no migration or new endpoint. |
| Classification precedence | Independent checks or importer tags | Resolve Shoes, named apparel families, group rules, then fallback, so Shoes outrank clothing names. |
| Unknown values | Arbitrary tabs | Render only non-empty known labels; unknown values remain discoverable under group `All`, never as tabs. |
| Visual control | Wrapped buttons | `CategorySubtabs` uses one-line overflow, lime active underline, visible focus, and motion-safe transitions. |

## Data Flow

```text
Product + Category -> shared group mapping -> classify_subcategory() -> ProductOut
    -> Laravel catalog proxy -> CatalogProduct mapper
    -> URL state -> known subtabs + combined filter -> ProductCard grid
```

Labels: `7.75`, `8.0`, `8.125`, `8.25`, `8.4`, `8.5`, `Long Board`; `Shoes`, `Hoodies`, `Sweatshirts`, `T-Shirts`, `Jackets & Outerwear`, `Pants`, `Other Apparel`; `Bags & Waist Packs`, `Grip Tape`; `Trucks`, `Wheels`, `Bearings`, `Hardware & Accessories`.

## File Changes

| File | Action | Description |
|---|---|---|
| `app/microservices/catalog/src/subcategory.py` | Create | Classifier using the shared mapper. |
| `app/microservices/catalog/src/schemas.py` | Modify | Add nullable `categorySubcategory` to `ProductOut`. |
| `app/microservices/catalog/src/main.py` | Modify | Add classification while preserving fields/order. |
| `app/microservices/catalog/tests/test_subcategory.py`, `test_product_out.py`, `test_products_api.py` | Create/modify | Classification, NULL group, serialization, and order tests. |
| `app/backend/gateway/tests/Feature/CatalogPublicRoutesTest.php` | Modify | Pass-through regression. |
| `app/frontend/src/lib/store-catalog.ts`, `store-catalog.test.ts` | Modify | Mapping, known tabs, and filtering. |
| `app/frontend/src/components/store/CategorySubtabs.tsx` | Create | Accessible URL links and overflow. |
| `app/frontend/src/app/(store)/products/page.tsx`, `src/app/globals.css` | Modify | URL state, rendering, and motion styles. |

## Interfaces / Contracts

```json
{
  "category": "Skate / Maderos / 8.25",
  "categoryGroup": "decks",
  "categorySubcategory": "8.25"
}
```

`categorySubcategory` is additive and nullable; all existing fields and sequence remain unchanged.
NULL `category_group` serializes as `categoryGroup: "uncategorized"` and `categorySubcategory: null`.
`deriveSubcategoryTabs(products, group)` returns `All` plus non-empty known labels in order and ignores unsupported values.
`filterByCategoryAndSubcategory` applies group, then the known subcategory, preserving input order; `All` includes null or unsupported values.
URLs use `category=<group>` and optional `subcategory=<canonical label>` through `URLSearchParams`; stale or unknown subcategories resolve to group `All`.

## Testing Strategy

| Layer | RED coverage and verification |
|---|---|
| Catalog unit/integration | Cover precedence, sizes, Long Board, `Hoddie`, Shoes, fallback, shared Hardware mapping, NULL group, null subcategory, serialization, and order. |
| Gateway feature | Preserve category fields and order; writes remain protected. |
| Storefront unit | Test mapping/raw category, known tab order/omission, unknowns with `All`, combined filters, URL encoding, and stale fallback. |
| Manual accessibility fallback | Without a component harness, verify Tab, Enter, `aria-current`, visible focus, no wrapping, horizontal scroll, and reduced motion at narrow and wide widths. |

Use this focused passing catalog suite:
`(cd app/microservices/catalog && pytest tests/test_category_groups.py tests/test_subcategory.py tests/test_product_out.py tests/test_products_api.py tests/test_products_api_ordering.py tests/test_list_products_ordering.py tests/test_merchandising.py)`.
The full `(cd app/microservices/catalog && pytest)` run is optional until `pytesseract` is available in the catalog environment;
otherwise collection fails in the unrelated `test_ocr_pricing.py` module before the focused tests run.

## Threat Matrix

N/A for all matrix rows: query parameters do not add server routes, shell/subprocess execution, VCS automation, PR automation, or executable-file classification boundaries.

## Migration / Rollout

From the repository root, run:

```bash
(cd app/frontend && npx vitest run) && \
(cd app/backend/gateway && composer test) && \
(cd app/microservices/catalog && pytest tests/test_category_groups.py tests/test_subcategory.py tests/test_product_out.py tests/test_products_api.py tests/test_products_api_ordering.py tests/test_list_products_ordering.py tests/test_merchandising.py)
(cd app/frontend && npm run typecheck && npm run lint && npm run build)
docker compose up -d --build catalog gateway frontend
```

Smoke-test `/products`, each top-level group URL at `http://localhost:3000`, and the gateway products JSON.
No migration is required.
Rollback by reverting the classifier, `app/microservices/catalog/src/schemas.py`, and the additive serialization in `app/microservices/catalog/src/main.py`, then reverting the gateway contract tests and storefront mapper, page, component, and styles.
This restores the pre-change catalog API contract by removing `categorySubcategory` from `ProductOut` and from product responses; group-only filtering, existing URLs, and raw categories remain available.

## Proposal Risks and Mitigations

- Apparel names can evade classification: enforce precedence, retain `Other Apparel`, and test malformed names.
- URL or ordering regressions can break existing links: preserve group-only filtering and server order with regression tests.
- Overflow can harm accessibility: use single-line overflow, visible focus, `aria-current`, and the manual reduced-motion checks above.
- `/categories` is currently unavailable: use only the existing products route.

## Open Questions

None.
