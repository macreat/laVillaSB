# Exploration: Catalog Category Mapping (catalog-category-mapping)

## Current State

### Database (catalog microservice, PostgreSQL)

- Table `categories` is FLAT: columns `id, slug, name, created_at, updated_at`. No `parent_id`, no `sort_order`, no group/type column.
- 48 categories, 1500 products, **0 products with NULL category_id**.
- Categories are created ad-hoc by the Drive importer: `category_label = " / ".join(folder_path_parts)` (`import_drive_catalog.py`), so the entire Drive path becomes a single flat category name (e.g. `Skate / Maderos / 8.25`, `Tenis / Talla 8Us -39Col / Todo`).
- Schema is auto-created with SQLAlchemy `Base.metadata.create_all` (no Alembic migrations). Adding a column requires an explicit ALTER or re-seed.

### Drive taxonomy mapped to DB rows

| Drive segment | DB categories | Products | Count |
|---|---|---|---|
| Long Board | `Long Board` | 5 | 5 |
| Maletines - Canguros | `Maletines - Canguros` | 15 | 15 |
| Ropa / Pantalones + Talla S/M/L/XL | `Ropa / Pantalones`, `Ropa / Talla S`, `M`, `L`, `XL` | 8+9+63+79+74 | 233 |
| Skate / Maderos (7.75-8.5) | 6 categories | 3+34+12+37+6+7 | 99 |
| Skate / Lijas | `Skate / Lijas` | 8 | 8 |
| Skate / Rodamientos | `Skate / Rodamientos` | 6 | 6 |
| Skate / Ruedas | `Skate / Ruedas` | 30 | 30 |
| Skate / Trucks | `Skate / Trucks` | 38 | 38 |
| Skate / Hardware y Accesorios | `Skate / Hardware y Accesorios` | 5 | 5 |
| Tenis / Talla X / Originales+Replicas+Todo | 30 categories | ~1061 | 1061 |
| **Total** | **48** | | **1500** |

### Group mapping (target dashboard groups)

Per the documented GHNF assumption (Engram #103):

| Dashboard group | Source categories | Products | Cats |
|---|---|---|---|
| decks | Long Board + Skate/Maderos | 104 | 7 |
| apparel | Ropa/* + Tenis/* | 1294 | 35 |
| accessories | Maletines + Skate/Lijas | 23 | 2 |
| gear | Skate/Rodamientos + Ruedas + Trucks + Hardware y Accesorios | 79 | 4 |
| **Total** | | **1500** | **48** |

Decision point: `Skate / Hardware y Accesorios` (5 products: Herramienta T/Y) is labeled gear in the assumption, but its name contains "Accesorios". T-tools and Y-wrenches read as gear; the mapping split on "Hardware" vs "Accesorios" keywords is a proposal-time decision.

### API shape (catalog :9002)

- `GET /products` returns `category` = raw DB category name (e.g. `"Skate / Maderos / 8.25"`). Confirmed live: 1500 items, 48 unique category strings.
- No `categoryGroup` / group field on `ProductOut`.
- No GET `/categories` endpoint exists in the catalog service (gateway allowlist includes it, but catalog has no route - gateway feature test fakes it).

### Frontend (Next.js storefront)

- `app/(store)/products/page.tsx`: hardcoded `CATEGORIES = ['all', 'decks', 'apparel', 'accessories', 'gear']`; filter is `p.category === activeCategory` where `p.category` = lowercased raw DB category name. Since no DB category equals `decks`/`apparel`/`gear`/`accessories`, **all non-'all' filters return empty** - this is the core defect.
- `app/(store)/page.tsx` (home) + `StoreHeader` + `StoreFooter`: links to `/products?category=decks|apparel|accessories|gear` - all broken today.
- `lib/store-catalog.ts`: `category: (item.category ?? 'uncategorized').toLowerCase()` - passes raw DB name; no mapping.
- Admin dashboard `app/(dashboard)/admin/products/page.tsx`: displays raw category name (glyph of the same problem on the admin side).

### Existing mapping logic

- **None anywhere.** Grep across `app/` for `decks|apparel|accessories|gear|category_group|group` in Python/TS found no mapping. The importer and API only pass through the raw path-derived label.

## Affected Areas

- `app/microservices/catalog/src/import_drive_catalog.py` - category creation from Drive paths; where a group could be assigned at import time.
- `app/microservices/catalog/src/models.py` - `Category` model would need a `category_group` column if persisting groups.
- `app/microservices/catalog/src/schemas.py` - `ProductOut` would need a `categoryGroup` field.
- `app/microservices/catalog/src/main.py` - `list_products` builds responses; where group mapping would be applied.
- `app/frontend/src/lib/store-catalog.ts` - frontend consumption point; currently lowercases raw names.
- `app/frontend/src/app/(store)/products/page.tsx` - filter logic (currently broken).
- `app/frontend/src/app/(store)/page.tsx`, `components/store/StoreHeader.tsx`, `StoreFooter.tsx` - category links.
- `app/frontend/src/app/(dashboard)/admin/products/page.tsx` - admin category display.

## Approaches

1. **A: Catalog-side mapping (recommended)** - catalog owns taxonomy; add a mapping layer in the catalog service (either a `category_group` column on `categories` backfilled by migration/ALTER, or a deterministic keyword-based mapping module) and expose `categoryGroup` on `ProductOut`. Frontend filters on `categoryGroup`.
   - Pros: single source of truth in the service that owns the data; API stays authoritative for both storefront and admin dashboard; robust to future Drive taxonomy changes if mapping is keyword/prefix-based; matches "catalog owns taxonomy, frontend consumes API" principle.
   - Cons: touches catalog service + API contract + frontend; needs a backfill strategy (DB column) or a mapping module (no schema change); slightly larger blast radius.
   - Effort: Medium

2. **B: Frontend-side normalization in store-catalog.ts** - a TS lookup that maps each raw category name to a dashboard group at fetch time.
   - Pros: smallest diff, no backend changes, immediate fix.
   - Cons: duplicated/weakest authority; rules hidden in UI code; admin dashboard still shows raw names unless separately fixed; breaks if API consumer changes; not data-authoritative; brittle against category-name edits.
   - Effort: Low

3. **C: Re-key/re-seed categories to the 4 canonical groups** - collapse the 48 Drive categories into 4 rows.
   - Pros: cleanest end state in DB; trivially correct filters.
   - Cons: destroys the useful Drive granularity (size variants, originales/replicas, material groups) that future product management may want; importer will recreate path-derived categories on next re-run (mapping lives in the importer, so it fights the re-seed); destructive, hardest to roll back; loses taxonomy fidelity with no real consumer benefit.
   - Effort: Medium-High

## Recommendation

**Option A, with a deterministic mapping module in the catalog service** applied at API serialization time, plus the mapping embedded at import time so new Drive folders get the right group:

- Add a `category_group` column to `categories` (nullable) and backfill the 48 rows via a one-off ALTER/UPDATE, OR keep the mapping purely in a Python module keyed on category name keywords (`Long Board`/`Maderos` -> decks, `Ropa`/`Tenis` -> apparel, `Maletines`/`Lijas` -> accessories, `Rodamientos`/`Ruedas`/`Trucks`/`Hardware` -> gear). Either way, expose `categoryGroup` on `ProductOut`.
- Frontend: filter on `categoryGroup` instead of raw `category` in `store-catalog.ts` + `products/page.tsx`; keep the 4-group nav labels as UI strings. Admin dashboard can reuse `categoryGroup` for its table.
- This is the simplest approach that keeps data authority in the catalog service and fixes both storefront and dashboard from one change.

## Risks

- Keyword mapping collisions: `Hardware y Accesorios` contains both "Hardware" (gear) and "Accesorios" (accessories). Must be resolved explicitly in the mapping order/rules.
- No migration infra (create_all only): a DB-column variant needs an explicit ALTER/backfill step, otherwise new environments diverge from prod.
- Importer idempotency: re-runs create-path categories again; mapping must live where the importer creates categories, or future imports will be untagged.
- API contract change: adding `categoryGroup` to `ProductOut` is additive and safe, but any consumer doing exact-shape assertions on the products payload needs a test update.
- Frontend `products/[id]/page.tsx` still uses static mock PRODUCTS with `category` values - out of scope, but note it so the mapping doesn't accidentally depend on it.

## Ready for Proposal

Yes. The explore phase produced a full current-state map with verified data (48 categories / 1500 products / 0 orphans) and a clear recommendation (Option A). The orchestrator should tell the user: current storefront category filters are broken (they compare raw Drive-derived category names against the 4 dashboard groups); the fix is a catalog-side mapping exposed via the API, with the frontend consuming a `categoryGroup` field.