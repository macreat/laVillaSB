# catalog-category-subcategories Specification

## Purpose

Define the catalog-owned, canonical subcategory classification exposed additively on every product.
The classification MUST be deterministic, preserve the existing group taxonomy, and retain raw source data.

## Requirements

### Requirement: Catalog SHALL classify product subcategories with explicit precedence

The catalog SHALL derive `categorySubcategory` from normalized category paths and product names without changing `categoryGroup`.
Known values SHALL use the exact English labels and source meanings defined by the change exploration.
Classification precedence SHALL be: Shoes before apparel-name rules; then named apparel families; then group-specific category rules; then the apparel fallback.

#### Scenario: Deck size is parsed from a Maderos category

- GIVEN a deck product whose category is `Skate / Maderos / 8.25`
- WHEN the catalog classifies the product
- THEN `categorySubcategory` is `8.25`
- AND the raw `category` remains unchanged

#### Scenario: Long Board is classified after numeric deck sizes

- GIVEN a deck product whose category identifies `Long Board`
- WHEN the catalog classifies the product
- THEN `categorySubcategory` is `Long Board`

#### Scenario: Shoes take precedence over clothing-name rules

- GIVEN an Apparel product under a `Tenis / ...` category whose name contains a clothing-family keyword
- WHEN the catalog classifies the product
- THEN `categorySubcategory` is `Shoes`

#### Scenario: Hoodie spelling variants map to Hoodies

- GIVEN an Apparel product name containing `Hoodie` or the source typo `Hoddie`
- WHEN the catalog classifies the product
- THEN `categorySubcategory` is `Hoodies`

#### Scenario: Unmatched apparel uses the fallback

- GIVEN an Apparel product that matches no named family and is not Shoes or Pants
- WHEN the catalog classifies the product
- THEN `categorySubcategory` is `Other Apparel`

#### Scenario: Hardware and Accessories remains Gear

- GIVEN category `Skate / Hardware y Accesorios`
- WHEN group and subcategory classification runs
- THEN `categoryGroup` is `gear`
- AND `categorySubcategory` is `Hardware & Accessories`

### Requirement: Product serialization SHALL add categorySubcategory without breaking the contract

The products API SHALL add `categorySubcategory` as a nullable additive field.
It MUST preserve `category`, `categoryGroup`, every existing field, and the server-provided product sequence.
Products without enough source data MAY serialize a null subcategory and MUST remain valid responses.

#### Scenario: Serialized product contains the additive classification

- GIVEN a classified product
- WHEN a client requests the products list
- THEN the response contains its canonical `categorySubcategory`
- AND existing category fields are byte-for-byte unchanged

#### Scenario: Missing source data is safe

- GIVEN a product with no usable category or name
- WHEN the product is serialized
- THEN `categorySubcategory` is null
- AND serialization succeeds without changing `categoryGroup`
