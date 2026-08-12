"""Extract COP prices from catalog images and update zero-priced products."""

import argparse
import asyncio
import json
import re
from datetime import UTC, datetime
from decimal import Decimal
from pathlib import Path

import pytesseract
from PIL import Image, ImageOps
from sqlalchemy import select

from .database import AsyncSessionLocal, init_db
from .models import Media, Product

PRICE_RE = re.compile(
    r"(?:\$|cop)\s*([0-9]{1,3}(?:[.,][0-9]{3})+|[0-9]{4,7})(?![0-9])",
    re.IGNORECASE,
)
BARE_PRICE_RE = re.compile(r"\b([1-9][0-9]{1,2}(?:[.,][0-9]{3})+)\b")
MIN_COP = 1_000
MAX_COP = 800_000
OCR_TIMEOUT_SECONDS = 15
MIN_AUTO_CONFIDENCE = 0.90


def parse_cop_value(raw: str) -> int | None:
    digits = re.sub(r"[^0-9]", "", raw)
    if not digits:
        return None
    value = int(digits)
    return value if MIN_COP <= value <= MAX_COP else None


def extract_price(text: str) -> tuple[int | None, float, str]:
    """Return price, confidence, and matched source; never invent a price."""
    for match in PRICE_RE.finditer(text):
        value = parse_cop_value(match.group(1))
        if value is not None:
            return value, 0.95, match.group(0).strip()

    candidates = []
    for match in BARE_PRICE_RE.finditer(text):
        # Without a currency marker, require Colombian thousands punctuation.
        # This rejects OCR noise such as isolated SKUs or dimensions ("1255").
        if not re.search(r"[.,]\s*[0-9]{3}\b", match.group(1)):
            continue
        value = parse_cop_value(match.group(1))
        if value is not None and value not in {2024, 2025, 2026}:
            candidates.append((value, match.group(0)))
    if len(candidates) == 1:
        return candidates[0][0], 0.55, candidates[0][1]
    return None, 0.0, ""


def ocr_image(path: Path) -> tuple[str, int, float, str]:
    with Image.open(path) as image:
        image = ImageOps.exif_transpose(image).convert("L")
        image.thumbnail((1600, 1600))
        width, height = image.size
        upper = image.crop((0, 0, width, max(1, int(height * 0.5))))
        upper_text = pytesseract.image_to_string(
            upper, lang="spa+eng", config="--psm 11", timeout=OCR_TIMEOUT_SECONDS
        )
        price, confidence, matched = extract_price(upper_text)
        if price is not None:
            return upper_text, price, confidence, matched
        full_text = pytesseract.image_to_string(
            image, lang="spa+eng", config="--psm 11", timeout=OCR_TIMEOUT_SECONDS
        )
        price, confidence, matched = extract_price(full_text)
        return f"[upper]\n{upper_text}\n[full]\n{full_text}", price, confidence * 0.9, matched


async def backfill(source_root: Path, dry_run: bool = False, limit: int | None = None) -> dict:
    await init_db()
    updated = skipped = failed = 0
    audit: list[dict] = []
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Product, Media).join(Media, Product.media_id == Media.id).where(Product.price <= 0)
        )
        rows = result.all()[:limit] if limit else result.all()
        for product, media in rows:
            relative = (media.meta or {}).get("relativePath")
            path = source_root / relative if relative else None
            record = {"productId": product.id, "sku": product.sku, "source": relative}
            if not path or not path.is_file():
                skipped += 1
                record.update(status="missing-source", confidence=0.0)
                audit.append(record)
                continue
            try:
                text, price, confidence, matched = ocr_image(path)
                record.update(status="matched" if price else "unmatched", priceCop=price, confidence=confidence, matched=matched)
                if price is None or confidence < MIN_AUTO_CONFIDENCE:
                    skipped += 1
                else:
                    updated += 1
                    if not dry_run:
                        product.price = Decimal(price)
                        media.meta = {
                            **(media.meta or {}),
                            "pricing": {
                                "currency": "COP",
                                "amount": price,
                                "confidence": confidence,
                                "matchedText": matched,
                                "extractedAt": datetime.now(UTC).isoformat(),
                                "method": "tesseract-upper-then-full",
                            },
                        }
                record["ocrText"] = text[:1000]
            except Exception as exc:
                failed += 1
                record.update(status="error", error=str(exc))
            audit.append(record)
        if not dry_run:
            await session.commit()
    report = {"scanned": len(rows), "updated": updated, "unmatched": skipped, "failed": failed, "dryRun": dry_run, "audit": audit}
    print(json.dumps(report, ensure_ascii=False))
    return report


def main() -> None:
    parser = argparse.ArgumentParser(description="OCR COP prices from catalog images")
    parser.add_argument("--source", default="/data/catalog")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--limit", type=int)
    args = parser.parse_args()
    asyncio.run(backfill(Path(args.source).expanduser().resolve(), args.dry_run, args.limit))


if __name__ == "__main__":
    main()
