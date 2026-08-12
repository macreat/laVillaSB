# storefront-category-filtering Specification

## Purpose

Define storefront and admin dashboard behavior for filtering and displaying products by category group, driven by the catalog API's `categoryGroup` field, with graceful fallback when the group is absent.

> **Archive provenance (2026-08-11)**: Full archive of change `catalog-category-mapping`.
> All 4 requirements are archived as live baseline behavior, verified against the compose stack (frontend :3000) - all group filter URLs return HTTP 200 with non-empty views; admin shows the Group column.

## Requirements

### Requirement: Storefront SHALL filter products by categoryGroup

The storefront products page SHALL filter products by `categoryGroup` for the `decks`, `apparel`, `accessories`, and `gear` filters, and SHALL return the full list for `all`.
The `all` and group names SHALL remain UI strings and SHALL NOT be treated as raw category names.

**Status**: ARCHIVED (as-built, verified live - `filterByCategoryGroup` in `frontend/src/lib/store-catalog.ts`; all 4 group URL filters + `all` return 200; `store-catalog.test.ts` 7 cases).

#### Scenario: Group filter returns matching products only

- GIVEN products across all groups
- WHEN the user selects the `decks` filter
- THEN the page shows only products whose `categoryGroup` is `decks`

#### Scenario: Gear filter includes Hardware y Accesorios products

- GIVEN a product whose category is `Skate / Hardware y Accesorios` with `categoryGroup = gear`
- WHEN the user selects the `gear` filter
- THEN that product appears in the results

#### Scenario: All filter returns the full catalog

- GIVEN products across all groups
- WHEN the user selects `all`
- THEN every product is shown

### Requirement: Category navigation links SHALL resolve to non-empty group views

Home, header, and footer category links SHALL point to the products page with a group filter that returns the mapped products for that group.

**Status**: ARCHIVED (as-built, verified live - `StoreHeader.tsx`, `StoreFooter.tsx`, and home `page.tsx` link targets all resolve to non-empty group views; all four group URLs return 200).

#### Scenario: Nav link opens a non-empty group view

- GIVEN the storefront navigation offers the four group links
- WHEN the user clicks the `accessories` link
- THEN the products page opens filtered to `accessories` and shows the mapped accessories products

### Requirement: Admin dashboard SHALL display categoryGroup

The admin products page SHALL display the `categoryGroup` for each product.

**Status**: ARCHIVED (as-built, verified live - Group column in `admin/products/page.tsx` via `displayCategoryGroup`; compiled admin chunk contains the header and refs; page returns 200).

#### Scenario: Admin table shows group per product

- GIVEN the admin opens the products list
- WHEN the table renders
- THEN each row displays its product's `categoryGroup`

### Requirement: Storefront SHALL fall back gracefully when group is missing

Products whose payload lacks `categoryGroup` SHALL be excluded from group filters but SHALL remain visible under `all`.
Page rendering SHALL NOT fail when `categoryGroup` is missing.

**Status**: ARCHIVED (as-built, verified live - `mapCatalogProduct` defaults to `uncategorized`; tests cover hidden-from-filter and visible-under-all cases; page renders without error).

#### Scenario: Missing group hides product from filters but not from all

- GIVEN a product whose payload lacks `categoryGroup`
- WHEN the user selects a group filter
- THEN that product is not shown
- AND it remains visible under `all` and the page renders without errors