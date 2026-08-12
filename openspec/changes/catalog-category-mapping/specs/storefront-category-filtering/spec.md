# storefront-category-filtering Specification

## Purpose

Define storefront and admin dashboard behavior for filtering and displaying products by category group, driven by the catalog API's `categoryGroup` field, with graceful fallback when the group is absent.

## Requirements

### Requirement: Storefront SHALL filter products by categoryGroup

The storefront products page SHALL filter products by `categoryGroup` for the `decks`, `apparel`, `accessories`, and `gear` filters, and SHALL return the full list for `all`.
The `all` and group names SHALL remain UI strings and SHALL NOT be treated as raw category names.

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

#### Scenario: Nav link opens a non-empty group view

- GIVEN the storefront navigation offers the four group links
- WHEN the user clicks the `accessories` link
- THEN the products page opens filtered to `accessories` and shows the mapped accessories products

### Requirement: Admin dashboard SHALL display categoryGroup

The admin products page SHALL display the `categoryGroup` for each product.

#### Scenario: Admin table shows group per product

- GIVEN the admin opens the products list
- WHEN the table renders
- THEN each row displays its product's `categoryGroup`

### Requirement: Storefront SHALL fall back gracefully when group is missing

Products whose payload lacks `categoryGroup` SHALL be excluded from group filters but SHALL remain visible under `all`.
Page rendering SHALL NOT fail when `categoryGroup` is missing.

#### Scenario: Missing group hides product from filters but not from all

- GIVEN a product whose payload lacks `categoryGroup`
- WHEN the user selects a group filter
- THEN that product is not shown
- AND it remains visible under `all` and the page renders without errors