# Proposal: catalog-pricing-enrichment

## Intent

Populate zero-priced catalog products from prices printed in their source JPG/PNG images, storing the detected amount as Colombian pesos (COP).

## Scope

- Add reproducible Tesseract OCR with Spanish and English language data to the catalog image.
- OCR the upper half first, then the full image as a fallback.
- Parse explicit COP/currency matches conservatively and reject implausible values.
- Update only products whose current price is zero.
- Persist extraction confidence and matched text in media metadata.
- Produce an auditable JSON result for matched, unmatched, missing, and failed images.
- Keep category mapping, image proxy, and existing API price field unchanged.

## Non-goals

- Inventing prices or manually guessing unreadable values.
- Currency conversion when the image does not identify COP.
- Variants/WebP processing.

## Risks

- OCR may miss stylized or low-resolution price labels.
- Bare numeric matches are lower confidence than explicit `$`/`COP` matches.
- The source image mount must be available when the batch runs.

## Next phase

Specify the OCR contract, confidence policy, batch command, and verification thresholds before applying the change.
