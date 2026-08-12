# Tasks: catalog-pricing-enrichment

- [x] Add reproducible Tesseract, spa/eng packs, Pillow, and pytesseract dependencies.
- [x] Add conservative COP parser and upper-region/full-image OCR fallback.
- [x] Validate parser against OCR false positives and add unit coverage.
- [x] Add idempotent zero-price backfill with audit metadata and JSON report.
- [x] Mount the extracted Drive catalog read-only in compose.
- [x] Run representative dry-run and inspect match quality before mass update.
- [x] Run full backfill and verify non-zero price coverage.
- [x] Run tests, live API verification, and archive report.

## Review Workload Forecast

Estimated authored lines: 250-350. 400-line budget risk: low. Chained PRs: no. Decision before apply: no.
