# catalog-category-groups Specification

## Purpose

Define the catalog-owned `category_group` taxonomy: a per-category group value, deterministic keyword mapping with fixed precedence, an additive `categoryGroup` field on the product API, and import-time tagging that reuses the same mapping module.

## Requirements

### Requirement: Catalog service SHALL own the category_group taxonomy

The catalog service SHALL store an optional `category_group` value on each category.
The system SHALL backfill existing categories so every imported product resolves to one of `decks`, `apparel`, `accessories`, `gear`, or `uncategorized`.
The backfill SHALL be idempotent: re-running it MUST NOT duplicate or alter assigned groups.

#### Scenario: Backfill assigns groups to all categories

- GIVEN a catalog with 48 imported categories
- WHEN the idempotent backfill runs
- THEN every category has a `category_group`
- AND product counts per group are 104 decks / 1294 apparel / 23 accessories / 79 gear

#### Scenario: Backfill re-run is idempotent

- GIVEN a completed backfill
- WHEN the backfill runs again
- THEN existing group assignments are unchanged and no rows are duplicated

### Requirement: Keyword mapping SHALL be deterministic with fixed precedence

The system SHALL map a category name to a group by case-insensitive keyword containment in fixed precedence order: decks, apparel, gear, accessories, then `uncategorized`.
Gear SHALL be evaluated before accessories so `Skate / Hardware y Accesorios` resolves to `gear`.
The mapping module SHALL be the single shared implementation used by backfill, import, and API serialization.

#### Scenario: Hardware y Accesorios maps to gear by precedence

- GIVEN the category name `Skate / Hardware y Accesorios` containing both gear and accessories keywords
- WHEN the mapping function is applied
- THEN the group is `gear`

#### Scenario: Unmatched category name falls back to uncategorized

- GIVEN a category name containing no known keyword
- WHEN the mapping function is applied
- THEN the group is `uncategorized`

### Requirement: ProductOut SHALL expose categoryGroup

The product API SHALL return a non-empty `categoryGroup` for each product derived from the product's category.
A product whose category has no stored group SHALL serialize as `uncategorized`.
The field SHALL be additive and SHALL NOT remove or rename existing payload fields.

#### Scenario: Product list returns categoryGroup

- GIVEN an imported catalog
- WHEN a client requests the products list endpoint
- THEN each product includes `categoryGroup` matching its category's group

#### Scenario: Category without stored group resolves to uncategorized

- GIVEN a product whose category has a NULL `category_group`
- WHEN the product is serialized
- THEN `categoryGroup` is `uncategorized`

### Requirement: Importer SHALL tag categories at import time

The bootstrap importer SHALL assign `category_group` to every category it creates using the shared mapping module.
Re-importing an existing category MUST NOT change its group.

#### Scenario: New Drive category is tagged on import

- GIVEN the importer creates a category from a Drive folder containing apparel keywords
- WHEN the import finishes
- THEN the category has `category_group = apparel`

#### Scenario: Re-import preserves existing group

- GIVEN a category already created with a stored group
- WHEN the importer encounters the same folder again
- THEN the stored group is preserved
