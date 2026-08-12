# Delta for storefront-category-filtering

## ADDED Requirements

### Requirement: Storefront views SHALL consume catalog ordering

The storefront `all`, Decks, and Apparel views MUST render products in the catalog merchandising order. Accessories and Gear views MUST retain their current ordering, and filtering MUST NOT drop products solely because ordering metadata is missing.

#### Scenario: Filtered views use the shared order

- GIVEN a catalog response containing products from multiple groups
- WHEN the user opens `all`, `decks`, or `apparel`
- THEN the visible products follow the catalog ordering contract

#### Scenario: Accessories and Gear preserve order

- GIVEN an existing Accessories or Gear product sequence
- WHEN the corresponding storefront filter is selected
- THEN the products retain their existing relative order

#### Scenario: Missing ordering data does not hide products

- GIVEN a filtered product lacks size or recognized classification data
- WHEN its applicable storefront view renders
- THEN the product remains visible in a stable fallback position

### Requirement: Storefront SHALL provide regression coverage for catalog imagery and ordering

Automated frontend, gateway, and catalog tests MUST cover live detail mapping, branded image fallback, public detail access, Deck and Apparel ordering, unchanged Accessories and Gear order, and mixed or missing legacy data. Acceptance verification MUST use the configured non-browser test layers because browser E2E tooling is unavailable.

#### Scenario: Regression suite validates the change

- GIVEN the change test suites are executed
- WHEN frontend, gateway, and catalog tests complete
- THEN all image, detail, ordering, visibility, and public-route assertions pass
