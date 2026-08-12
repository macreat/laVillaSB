# Design: catalog-pricing-enrichment

The catalog service owns the backfill command `python -m src.ocr_pricing --source /data/catalog`.

The Docker image installs Tesseract and language packs; the compose service mounts the local Drive extraction read-only. Pillow normalizes EXIF orientation, grayscale, and upscales the upper half before OCR. Explicit `$`/`COP` matches have high confidence; a single unmarked COP-sized number is accepted only at lower confidence; ambiguous values are never written.

The command joins products to media through existing metadata `relativePath`, updates only `price <= 0` and confidence `>= 0.90`, and stores the result under `media.metadata.pricing`. Lower-confidence candidates remain audited but do not change the product price. It is safe to rerun and prints JSON audit output. Existing non-zero prices are intentionally excluded.

Rollback is a database restore or a targeted reset of prices updated by audit timestamps. No API shape change is required because the existing decimal `price` field is already exposed.
