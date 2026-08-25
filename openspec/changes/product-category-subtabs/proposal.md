# Proposal: Product Category Subtabs

Add data-derived horizontal subtabs so shoppers can narrow catalog groups without losing existing behavior.

## Intent

Broad groups force shoppers to scan large mixed lists, especially Apparel.

## User Outcomes

- Shoppers can move from a group to a deck size, apparel family, accessory, or gear type.
- Subtabs show only returned categories and preserve server order.
- Group and subcategory survive sharing/reload; stale values fall back to the group.
- Narrow layouts provide one keyboard-accessible row with visible focus and reduced-motion-safe behavior.

## Business Rules

- Top-level order remains All, Decks, Apparel, Accessories, Gear.
- Decks: 7.75, 8.0, 8.125, 8.25, 8.4, 8.5, Long Board.
- Apparel: Shoes, Hoodies, Sweatshirts, T-Shirts, Jackets & Outerwear, Pants, Other Apparel; omit empty values.
- Accessories: Bags & Waist Packs, Grip Tape. Gear: Trucks, Wheels, Bearings, Hardware & Accessories.
- Use additive catalog-owned `categorySubcategory` data and combined frontend filtering.
- Preserve raw categories, group semantics, ordering, URLs, and fallback discovery.

## Scope

### In Scope
- Catalog classifier and additive API/gateway contract.
- Storefront URL state, derived subtabs, combined filtering, and accessible responsive control.
- Cross-service coverage.

### Out of Scope
- Changing top-level taxonomy, merchandising order, importer folders, or `/categories`.
- Persisted facets, search redesign, admin controls, or browser E2E infrastructure.

## Capabilities

### New Capabilities
- `catalog-category-subcategories`: Canonical subcategory classification/serialization.

### Modified Capabilities
- `catalog-category-groups`: Additive subcategory data; unchanged group precedence.
- `storefront-category-filtering`: Subtabs, URL semantics, and horizontal navigation.

## Approach

Compute canonical values from category paths and normalized names with explicit precedence and fallback.
Expose them through the existing products route, not `/categories`; derive subtabs and filter by group plus subcategory in the frontend.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `app/microservices/catalog/src/` | Modified | Classifier and serialization |
| `app/backend/gateway/tests/` | Modified | Pass-through contract |
| `app/frontend/src/lib/store-catalog.ts` | Modified | Mapping/filtering |
| `app/frontend/src/app/(store)/products/`, `components/store/` | Modified | URL state/subtabs |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Apparel names evade classification | High | Precedence, Other Apparel fallback, tests |
| URL or ordering regressions | Medium | Preserve group-only behavior/order; tests |
| Overflow harms accessibility | Medium | Single-line scroll, focus, reduced-motion tests |

## Rollout and Rollback

Roll out API and frontend changes together after service checks pass.
Rollback by reverting classifier/serialization and subtab changes; group-only filtering remains available.

## Success Criteria

- [ ] Required data-derived subtabs render only when populated and Decks use the specified order.
- [ ] Existing group URLs, ordering, fallback visibility, and top-level order remain unchanged.
- [ ] URL reload/share, combined filtering, keyboard access, and single-line scrolling are tested.
