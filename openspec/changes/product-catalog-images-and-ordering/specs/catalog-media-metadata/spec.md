# Delta for catalog-media-metadata

## MODIFIED Requirements

### Requirement: Product catalog SHALL expose metadata-backed image URLs

The system SHALL return product list and detail entries from imported catalog records, where each entry resolves `imageUrl` from usable media metadata when present. A missing, non-ready, malformed, or unavailable media record MUST NOT remove the product from the response.

(Previously: Only product list entries were required to resolve image URLs from present media metadata.)

#### Scenario: Catalog reads return metadata-backed images

- GIVEN a product has usable media metadata
- WHEN a client requests the product list or detail
- THEN the response includes the metadata-derived `imageUrl`

#### Scenario: Missing media preserves the product

- GIVEN a product has absent or unusable media metadata
- WHEN a client requests the product list or detail
- THEN the product is returned with an absent or unusable image value for consumer fallback handling

#### Scenario: Imported baseline volume is present

- GIVEN bootstrap import has completed
- WHEN product records are queried
- THEN the imported product records remain available
