# Proposal: Catalog Category Mapping

## Intent

Storefront category filters are broken: they compare raw Drive-path category names (e.g. `Skate / Maderos / 8.25`) against the dashboard groups `decks`/`apparel`/`accessories`/`gear`, so every non-`all` filter returns empty. The catalog service will own the taxonomy: add a `category_group` concept, backfill the 1500 imported products via deterministic keyword rules, expose `categoryGroup` on the product API, and let storefront + admin filter/display by group.

## Scope

### In Scope
- `category_group` concept in catalog service (nullable column on `categories`, backfilled).
- Shared deterministic keyword mapping module.
- `categoryGroup` on `ProductOut` (additive).
- Importer tags new categories at import time (reuses module).
- Storefront + admin dashboard filter/display by `categoryGroup`.

### Out of Scope
- Pricing enrichment, variants pipeline, static mock `products/[id]/page.tsx`.

## Capabilities

### New Capabilities
- `catalog-category-groups`: category_group taxonomy, mapping rules + precedence, backfill, `ProductOut.categoryGroup`.
- `storefront-category-filtering`: storefront + admin group filter/display.

### Modified Capabilities
- `drive-catalog-bootstrap-import`: importer SHALL assign `category_group` to created categories via the shared module.

## Approach

Option A from exploration. New module `app/microservices/catalog/src/category_groups.py` with `category_group_for(name)`: case-insensitive keyword containment, evaluated decks → apparel → gear → accessories → `uncategorized`. Gear is checked BEFORE accessories so `Skate / Hardware y Accesorios` resolves to gear (GHNF assumption).

| Group | Keywords |
|---|---|
| decks | `long board`, `maderos` |
| apparel | `ropa`, `tenis`, `pantalones` |
| accessories | `maletines`, `canguros`, `lijas` |
| gear | `rodamientos`, `ruedas`, `trucks`, `hardware` |

- Add nullable `category_group` to `categories` (explicit ALTER; no Alembic) + idempotent backfill over the 48 rows.
- `ProductOut.categoryGroup` populated from product's category.
- Frontend filters on `categoryGroup`; group labels stay as UI strings.

## Implementation Order

1. Mapping module + unit tests.
2. Column ALTER + backfill; verify counts 104/1294/23/79.
3. Importer reuse.
4. `ProductOut.categoryGroup` + contract tests.
5. Storefront + admin UI.
6. E2E verification.

## Affected Areas

Full paths under `app/microservices/catalog/` and `app/frontend/`.

| Area | Impact | Description |
|---|---|---|
| `catalog/src/category_groups.py` | New | Mapping module |
| `catalog/src/models.py` | Modified | `Category.category_group` |
| `catalog/src/schemas.py` | Modified | `ProductOut.categoryGroup` |
| `catalog/src/main.py` | Modified | Serialization |
| `catalog/src/import_drive_catalog.py` | Modified | Tag at import |
| `frontend/src/lib/store-catalog.ts` | Modified | Map `categoryGroup` |
| `frontend/src/app/(store)/products/page.tsx` | Modified | Filter by group |
| `frontend/src/app/(store)/page.tsx`, `components/store/StoreHeader.tsx`, `StoreFooter.tsx` | Modified | Nav links resolve |
| `frontend/src/app/(dashboard)/admin/products/page.tsx` | Modified | Display group |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Keyword collision `Hardware y Accesorios` | High | Explicit precedence; PO review |
| No migration infra, envs diverge | Med | ALTER/backfill script; align fresh-env create path |
| Future imports untagged | Med | Importer reuses module |
| API shape assertions break | Low | Additive field; update contract tests |

## Rollback Plan

Revert the single PR (git revert). Drop `category_group` via ALTER if needed; backfill is idempotent. Frontend reverts to prior filter behavior.

## Dependencies

- Product-owner sign-off on mapping (human tasks below). None external.

## Human Tasks

- PO reviews keyword rules + precedence vs. GHNF assumptions (Engram #103), especially `Hardware y Accesorios` → gear.
- PO confirms 4 group labels remain UI strings.

## Success Criteria

- [ ] 1500/1500 products return non-empty `categoryGroup`; counts 104/1294/23/79.
- [ ] All 4 storefront filters return correct non-empty lists; nav links resolve.
- [ ] Admin dashboard shows group per product.
- [ ] Re-import tags categories deterministically (idempotent).
- [ ] Contract tests pass with additive ProductOut shape.
