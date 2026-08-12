# Apply Progress: catalog-pricing-enrichment

## Completed

- Added Tesseract 5.5.0 with Spanish and English language packs to the catalog image.
- Added Pillow and pytesseract dependencies.
- Added upper-half OCR with resized full-image fallback and a conservative COP parser.
- Added confidence threshold `>= 0.90` for automatic writes.
- Added idempotent backfill using existing media `relativePath` metadata.
- Added pricing audit metadata under `media.metadata.pricing`.
- Mounted the extracted Drive catalog read-only at `/data/catalog`.

## Evidence

- Representative dry-run: 20 images, 19 candidates, 1 unmatched, 0 failures after parser hardening.
- Catalog tests: 39 passed.
- Full backfill: 1500 scanned, 1298 products priced, 202 left at zero.
- Final database: 1298 priced, 202 zero, maximum price 310000 COP.
- API: 1500 products remain available and expose decimal `price` values.

## Safety decisions

- No low-confidence candidate was written.
- Outliers caused by OCR joining a price with a following size were reset and reprocessed.
- Unmatched and timeout records remain zero-priced and are auditable for manual review.
