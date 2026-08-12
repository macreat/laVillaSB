# Design: Catalog Category Mapping

## Technical Approach

The catalog service owns the `category_group` taxonomy via a shared keyword module (`category_groups.py`) reused by backfill, importer, and API serialization.
Add a nullable `category_group` column to `categories`, backfill the 48 rows idempotently, expose an additive `ProductOut.categoryGroup`, and have storefront and admin consume it.
This satisfies `catalog-category-groups` and `storefront-category-filtering`.

## Architecture Decisions

### Decision: Group column lives on categories, not products

| Option | Tradeoff | Decision |
|---|---|---|
| Column on `categories` (48 rows) | One value per category; products inherit via FK; backfill touches 48 rows | **Chosen** |
| Column on `products` (1500 rows) | Per-product denormalization; backfill touches 1500 rows; group is not a product attribute | Rejected |

The group is a category property, so it belongs on `Category`.
`products.category_id` already carries the inheritance edge; no product-column change is needed.
Schema: `Mapped[str | None]`, `String(32)`, nullable, no index (nothing queries by group server-side yet).

### Decision: Serialization reads the stored group, falling back to `uncategorized` on NULL

| Option | Tradeoff | Decision |
|---|---|---|
| Pure computation (`map_category_name(name)`) at request time | Smallest code change; no ALTER dependency | Rejected - violates spec scenario |
| Stored group, NULL -> `uncategorized` | Reads taxonomy as data; one-line change since the column exists anyway | **Chosen** |

The `catalog-category-groups` scenario "Category without stored group resolves to uncategorized" mandates that a NULL stored group serializes as `uncategorized`.
Pure computation would serialize a matchable-but-untagged category (e.g. `Skate / Maderos / 8.25`) as `decks`, breaking that contract and the storefront's graceful-fallback requirement.
The column is required by spec requirement 1 regardless, so deriving from it costs nothing extra.
The module remains the single shared implementation for backfill and import, which guarantees the stored value always equals the computed value.

### Decision: Backfill is a Python script reusing the module, not raw SQL keyword rules

| Option | Tradeoff | Decision |
|---|---|---|
| `UPDATE ... SET category_group = 'decks' WHERE name LIKE ...` | No code reuse; 48 hand-written rules that drift from the module | Rejected |
| Python script: rows with `category_group IS NULL` get `map_category_name(name)` | Single definition of rules; re-runs are no-ops on assigned rows (idempotent) | **Chosen** |

### Decision: Importer tags on create, preserves on re-import

The importer only writes `category_group` when it creates a new `Category` (slug not found).
Existing categories are never updated, so re-runs preserve stored groups without duplication.

## Data Flow

```
Drive folders --> import_drive_catalog.py --> Category(category_group=map_category_name(label))
Categories (48, backfilled) <-- backfill_category_groups.py (idempotent, module-driven)
Storefront/admin --> Gateway /v1/catalog/products --> GET /products --> ProductOut
   categoryGroup = category.category_group or "uncategorized"
Frontend products page filters on categoryGroup; nav keeps /products?category=<group> URLs.
```

## File Changes

| File | Action | Description |
|---|---|---|
| `app/microservices/catalog/src/category_groups.py` | Create | `GROUPS`, ordered `KEYWORDS`, `map_category_name()`, `resolve_group()` |
| `app/microservices/catalog/src/backfill_category_groups.py` | Create | Idempotent `ADD COLUMN IF NOT EXISTS` + backfill; prints per-group counts |
| `app/microservices/catalog/tests/test_category_groups.py` | Create | Precedence, fallback, case-insensitivity |
| `app/microservices/catalog/src/models.py` | Modify | `Category.category_group: String(32), nullable` |
| `app/microservices/catalog/src/schemas.py` | Modify | `ProductOut.categoryGroup: str` (additive) |
| `app/microservices/catalog/src/main.py` | Modify | `categoryGroup=resolve_group(product.category.category_group ...)` |
| `app/microservices/catalog/src/import_drive_catalog.py` | Modify | Tag category at creation |
| `app/backend/gateway/tests/Feature/CatalogPublicRoutesTest.php` | Modify | Assert additive `categoryGroup` in fake payload |
| `app/frontend/src/lib/store-catalog.ts` | Modify | Map `categoryGroup` (lowercased); update fallbacks |
| `app/frontend/src/app/(store)/products/page.tsx` | Modify | Filter on `categoryGroup` |
| `app/frontend/src/components/store/product/ProductCard.tsx` | Modify | Drop unused `category` from prop type |
| `app/frontend/src/lib/admin-types.ts` | Modify | `Product.categoryGroup?: string` |
| `app/frontend/src/app/(dashboard)/admin/products/page.tsx` | Modify | Normalize + display Group column |
| `app/frontend/src/app/(store)/page.tsx`, `components/store/StoreHeader.tsx`, `StoreFooter.tsx` | Verify only | Nav URLs already point to `/products?category=<group>`; they resolve once filtering works |

## Interfaces / Contracts

```python
# category_groups.py
GROUPS: tuple[str, ...] = ("decks", "apparel", "gear", "accessories", "uncategorized")
KEYWORDS: dict[str, tuple[str, ...]] = {
    "decks": ("long board", "maderos"),
    "apparel": ("ropa", "tenis", "pantalones"),
    "gear": ("rodamientos", "ruedas", "trucks", "hardware"),
    "accessories": ("maletines", "canguros", "lijas"),
}

def map_category_name(name: str) -> str:
    # case-insensitive keyword containment; precedence decks -> apparel -> gear
    # -> accessories -> "uncategorized"; gear before accessories so
    # "Skate / Hardware y Accesorios" resolves to gear.

def resolve_group(stored: str | None) -> str:
    # stored.lower() if stored else "uncategorized"
```

`ProductOut` gains `categoryGroup: str`.
`StoreProduct` replaces `category: string` with `categoryGroup: string`.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | `map_category_name`, `resolve_group` | pytest parametrized: `Hardware y Accesorios` -> gear, `Skate / Maderos / 8.25` -> decks, `Tenis / Talla 8Us -39Col / Todo` -> apparel, no-match fallback, case/whitespace insensitivity |
| Integration | Additive API shape | Update gateway feature test; assert `categoryGroup` passes through proxied `/products` |
| Frontend | Mapping + filter + fallback behavior | vitest (`media-proxy.test.ts` pattern) plus `npm run typecheck` and `npm run lint` |
| E2E | docker-compose stack | Each of all/decks/apparel/accessories/gear returns non-empty lists; counts 104/1294/23/79; nav links resolve; admin table shows group; product missing `categoryGroup` hidden from group filters but visible under `all` |

## Threat Matrix

N/A - no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary changes.
The gateway allowlist is untouched.

## Failure Modes

| Failure | Impact | Mitigation |
|---|---|---|
| ALTER skipped on an existing environment | `/products` returns 500 (column missing) | Idempotent `ADD COLUMN IF NOT EXISTS` runs in the deploy step before service restart |
| Backfill never ran | Groups stay NULL; all products serialize `uncategorized`; group filters empty | Backfill is re-runnable; verify per-group counts 104/1294/23/79 |
| Keyword rules change later | Stored groups drift from rules | Re-run backfill (idempotent, module-driven, only touches NULL rows) |
| Old API payload lacks `categoryGroup` | Product excluded from group filters | `resolve_group`/`?? 'uncategorized'` fallback; product stays visible under `all` |

## Migration / Rollout

1. DB step: `ALTER TABLE categories ADD COLUMN IF NOT EXISTS category_group VARCHAR(32);` then run `python -m src.backfill_category_groups`.
   Fresh environments get the column from `create_all` automatically and the importer tags new categories.
2. Deploy catalog and frontend together; the API field is additive and old frontends ignore unknown fields.
3. Rollback: revert the single PR; optionally `ALTER TABLE categories DROP COLUMN IF NOT EXISTS category_group`; the backfill is re-runnable.

## Open Questions

- [ ] Product-owner sign-off on keyword rules and the `Hardware y Accesorios` -> gear precedence (proposal human task).
- [ ] Confirm the spec scenario "NULL stored group resolves to uncategorized" is the intended serialization contract; the design follows it over on-the-fly computation.