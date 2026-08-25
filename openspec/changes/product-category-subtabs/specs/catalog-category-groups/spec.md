# Delta for catalog-category-groups

## MODIFIED Requirements

### Requirement: Keyword mapping SHALL be deterministic with fixed precedence

The system SHALL map a category name to a group by case-insensitive keyword containment in fixed precedence order: decks, apparel, gear, accessories, then `uncategorized`.
Gear SHALL be evaluated before accessories so `Skate / Hardware y Accesorios` resolves to `gear`.
The mapping module SHALL remain the single shared implementation used by backfill, import, API serialization, and subcategory classification.
(Previously: the shared mapping was used by backfill, import, and API serialization only.)

#### Scenario: Hardware y Accesorios maps to gear by precedence

- GIVEN the category name `Skate / Hardware y Accesorios` containing both gear and accessories keywords
- WHEN the mapping function is applied
- THEN the group is `gear`

#### Scenario: Unmatched category name falls back to uncategorized

- GIVEN a category name containing no known keyword
- WHEN the mapping function is applied
- THEN the group is `uncategorized`

### Requirement: ProductOut SHALL expose categoryGroup

The product API SHALL return a non-empty `categoryGroup` for each product derived from its category.
A product whose category has no stored group SHALL serialize as `uncategorized`.
The fields SHALL be additive and SHALL NOT remove or rename existing payload fields.
(Previously: ProductOut exposed only the additive `categoryGroup` field.)

#### Scenario: Product list returns categoryGroup

- GIVEN an imported catalog product
- WHEN a client requests the products list endpoint
- THEN the product includes `categoryGroup` and `categorySubcategory`
- AND all existing fields and product order are preserved

#### Scenario: Category without stored group resolves to uncategorized

- GIVEN a product whose category has a NULL `category_group`
- WHEN the product is serialized
- THEN `categoryGroup` is `uncategorized`
- AND `categorySubcategory` is null or a safely derived value

## ADDED Requirements

### Requirement: Gateway SHALL pass through additive catalog fields unchanged

The public catalog gateway SHALL forward `category`, `categoryGroup`, and `categorySubcategory` without renaming, filtering, or recomputing them.
It SHALL preserve the existing top-level group vocabulary and upstream product ordering.
The feature MUST NOT depend on implementing the unrelated `/categories` route.

#### Scenario: Gateway preserves the product contract

- GIVEN the catalog returns products with the additive subcategory field
- WHEN the gateway proxies the products request
- THEN the response contains every prior field plus the unchanged `categorySubcategory`

#### Scenario: Gateway does not reorder products or groups

- GIVEN an upstream response with an established product sequence and group values
- WHEN the gateway forwards it
- THEN the sequence and group values are identical downstream
