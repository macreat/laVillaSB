# Delta for storefront-category-filtering

## MODIFIED Requirements

### Requirement: Storefront SHALL filter products by categoryGroup

Top-level filters SHALL remain ordered `All`, `Decks`, `Apparel`, `Accessories`, `Gear`.
It SHALL filter by `categoryGroup` and return the full list for `all`.
Subcategory results SHALL match both `categoryGroup` and `categorySubcategory`, preserving server order.
The `all` and group names SHALL remain UI strings and SHALL NOT be treated as raw category names.
(Previously: the page filtered only by `categoryGroup`.)

#### Scenario: Group filter returns matching products only

- GIVEN products across all groups
- WHEN the user selects the `decks` filter
- THEN the page shows only products whose `categoryGroup` is `decks`

#### Scenario: Gear filter includes Hardware y Accesorios products

- GIVEN a product whose category is `Skate / Hardware y Accesorios` with `categoryGroup = gear`
- WHEN the user selects the `gear` filter
- THEN that product appears

#### Scenario: All filter returns the full catalog

- GIVEN products across all groups
- WHEN the user selects `All`
- THEN every product is shown
- AND the server-provided order is preserved

#### Scenario: Combined filtering

- GIVEN products in multiple groups and subcategories
- WHEN the user selects `Apparel` and `Hoodies`
- THEN only products matching both values appear, in their original order

## ADDED Requirements

### Requirement: Storefront SHALL derive available subtabs from returned products

The storefront SHALL derive and render `All` plus non-empty known subtabs for each group.
Labels and order SHALL exactly match exploration: Decks numeric sizes ascending then `Long Board`; Apparel `Shoes`, `Hoodies`, `Sweatshirts`, `T-Shirts`, `Jackets & Outerwear`, `Pants`, `Other Apparel`; Accessories `Bags & Waist Packs`, `Grip Tape`; Gear `Trucks`, `Wheels`, `Bearings`, `Hardware & Accessories`.
Unknown values MUST be safe; group `All` MUST retain products and raw `category`.

#### Scenario: Empty subcategories are omitted

- GIVEN returned products contain no `Grip Tape` products
- WHEN the Accessories subtabs are derived
- THEN `Grip Tape` is not rendered

#### Scenario: Group All

- GIVEN Apparel products across several subtabs
- WHEN the user selects Apparel and then `All`
- THEN every Apparel product is shown in server-provided order

### Requirement: URL state SHALL be reloadable and safely shareable

The page SHALL encode selections in `category` and optional `subcategory`.
Shared URLs SHALL restore valid state.
Missing, stale, or unknown subcategory values SHALL fall back to the selected group with `All` active.

#### Scenario: Shared subtab URL restores the filter

- GIVEN `/products?category=apparel&subcategory=Hoodies`
- WHEN the page loads
- THEN Apparel and Hoodies are active and the combined filter is applied

#### Scenario: Stale state falls back safely

- GIVEN a valid group and an unknown `subcategory`
- WHEN the page loads
- THEN the group list shows with `All` active and no error

### Requirement: Subtab navigation SHALL be accessible and responsive

The subtab row SHALL remain one non-wrapping horizontal line with overflow available on narrow viewports.
Every control SHALL be keyboard focusable, have an accessible name, expose active state with `aria-current="page"`, and retain a visible focus indicator.
Motion used for sliding or focus changes MUST be disabled or reduced when `prefers-reduced-motion: reduce` is active.

#### Scenario: Keyboard navigation

- GIVEN a narrow viewport and a rendered subtab row
- WHEN a keyboard user moves focus and activates a subtab
- THEN the control is reachable without a pointer, its active state is announced, and the row does not wrap

### Requirement: Regression and deployment checks SHALL cover the complete change

Tests SHALL cover classifier precedence, serialization, gateway pass-through, mapping/filtering, URL edges, and the subtab component when available.
After `docker compose up -d --build catalog gateway frontend`, listed URLs on `http://localhost:3000` SHALL return HTTP 200 with subtabs.

#### Scenario: Existing group URLs work

- GIVEN the rebuilt local compose stack
- WHEN `/products` and each top-level group URL are requested on `http://localhost:3000`
- THEN every response is HTTP 200, preserves existing result sets and order, and renders applicable subtabs
