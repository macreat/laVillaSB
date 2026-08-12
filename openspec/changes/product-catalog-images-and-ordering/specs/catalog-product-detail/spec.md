# catalog-product-detail Specification

## Purpose

Define the public, catalog-backed product detail contract and resilient image behavior used by storefront detail pages.

## Requirements

### Requirement: Product detail SHALL use live catalog data

The system SHALL expose a read-only product detail response using the same product metadata and `imageUrl` contract as catalog list entries. The storefront detail page MUST load this response rather than static mock data.

#### Scenario: Imported product opens from the list

- GIVEN an imported product ID exists in the catalog
- WHEN a client requests its detail and the storefront renders it
- THEN live name, price, category, description, and catalog-backed image data are shown

#### Scenario: Unknown product returns a clear not-found result

- GIVEN a product ID does not exist
- WHEN its public detail path is requested
- THEN the API returns not-found and the storefront renders its established not-found state

### Requirement: Product imagery SHALL fail safely with a branded fallback

When image data is absent, not ready, malformed, or unreachable, the product MUST remain visible and the list, detail, and cart surfaces MUST render the approved branded fallback without a broken-image state.

#### Scenario: Missing or unusable media remains visible

- GIVEN a product has no usable media URL or its image request fails
- WHEN the product is rendered in list, detail, or cart
- THEN the product remains visible and the branded fallback is displayed

#### Scenario: Usable media is shared across consumers

- GIVEN a product has a usable catalog image URL
- WHEN list, detail, and cart render that product
- THEN each surface uses the same normalized browser media path
