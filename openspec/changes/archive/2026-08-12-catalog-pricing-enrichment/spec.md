# Specification: catalog-pricing-enrichment

## Requirement: Conservative COP extraction

The batch SHALL inspect the upper image region before the full image and SHALL accept explicit currency matches only when the normalized amount is between 1,000 and 50,000,000 COP.

### Scenario: Explicit COP price

- **Given** an image OCR result containing `$ 150.000`
- **When** the parser processes the result
- **Then** it returns integer amount `150000` with high confidence.

### Scenario: Ambiguous numeric text

- **Given** OCR finds multiple bare numbers without a currency marker
- **When** the parser processes the result
- **Then** it leaves the product unmatched and does not change its price.

## Requirement: Idempotent catalog backfill

The batch SHALL update only products with zero price and SHALL preserve existing non-zero prices on repeated runs.

The batch SHALL automatically persist only detections with confidence at least `0.90`; lower-confidence candidates SHALL remain audited but unmatched for manual review.

### Scenario: Successful match

- **Given** a zero-priced product with a readable source image
- **When** the batch finds a valid COP amount
- **Then** it stores the amount and extraction audit metadata.

### Scenario: No match

- **Given** an unreadable or missing source image
- **When** the batch processes the product
- **Then** price remains unchanged and the result reports the reason.

## Requirement: Reproducible runtime

The catalog image SHALL contain Tesseract, spa/eng language data, Pillow, and a documented batch command.
