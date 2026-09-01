"""Natural language search parser using OpenAI gpt-4o-mini.

Parses free-text queries like "tenis nike negros talla 9" into structured
filters that can be applied to the product catalog.
"""

import json
import logging
import os
from dataclasses import dataclass, field

import httpx

logger = logging.getLogger(__name__)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
OPENAI_MODEL = os.getenv("NL_SEARCH_MODEL", "gpt-4o-mini")

SYSTEM_PROMPT = """You are a product search parser for a Colombian skateboarding shop called La Villa Skateboarding.

Given a user query in natural language (Spanish or English), extract structured search filters.

Available category groups: decks, apparel, gear, accessories, uncategorized.

Available subcategories by group:
- decks: 7.75, 8.0, 8.125, 8.25, 8.4, 8.5, Long Board
- apparel: Shoes, Hoodies, Sweatshirts, T-Shirts, Jackets & Outerwear, Pants, Other Apparel
- accessories: Bags & Waist Packs, Grip Tape
- gear: Trucks, Wheels, Bearings, Hardware & Accessories

Product names often contain brand names like: Nike, Vans, Adidas, Jordan, Puma, Reebok, DC, Etnies, Lakai, Converse, New Balance, Soma, Destroy, Amateur, Skaterror, Spitfire, Bones, Thunder, Independent, Venture, Krux, Element, Mule, Sornero, Maister, etc.

Respond with ONLY a JSON object (no markdown, no explanation):
{
  "keywords": ["word1", "word2"],
  "category_group": "decks" | "apparel" | "gear" | "accessories" | null,
  "subcategory": "Shoes" | "Trucks" | etc. | null,
  "min_price": number | null,
  "max_price": number | null,
  "brand_keywords": ["brand1"]
}

Rules:
- keywords: important descriptive words from the query (exclude brand names and very common words like "de", "el", "la", "un", "una", "que", "para", "con", "los", "las")
- category_group: only set if the query clearly implies a category
- subcategory: only set if the query clearly implies a subcategory
- brand_keywords: extract brand names mentioned or implied
- price: only extract if explicitly mentioned (e.g., "menos de 50000" -> max_price: 50000)
- If the query is too vague, return mostly nulls with whatever keywords you can extract
- Respond in JSON only, no other text"""


@dataclass
class SearchFilters:
    keywords: list[str] = field(default_factory=list)
    category_group: str | None = None
    subcategory: str | None = None
    min_price: float | None = None
    max_price: float | None = None
    brand_keywords: list[str] = field(default_factory=list)


def _build_fallback_filters(query: str) -> SearchFilters:
    """Build basic keyword filters when LLM is unavailable.

    Uses OR matching with basic Spanish stemming for better recall.
    """
    stop_words = {
        "de", "el", "la", "un", "una", "que", "para", "con", "los", "las",
        "del", "al", "se", "y", "o", "en", "es", "lo", "por", "como",
        "pero", "mas", "muy", "ya", "no", "si", "te", "tu", "me", "mi",
        "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "will", "would", "could",
        "should", "may", "might", "can", "shall", "to", "of", "in", "for",
        "on", "with", "at", "by", "from", "it", "this", "that", "i", "you",
        "he", "she", "we", "they", "what", "which", "who", "whom",
        "quiero", "busco", "necesito", "dame", "algo", "mas",
    }
    words = query.lower().split()
    keywords = [w for w in words if w not in stop_words and len(w) > 1]
    return SearchFilters(keywords=keywords)


def _stem_es(word: str) -> str:
    """Minimal Spanish stemmer: strip common plural endings only.

    Only stems words >= 5 chars to avoid mangling short words like "tenis".
    """
    w = word.lower()
    if len(w) < 5:
        return w
    if w.endswith("ces"):
        return w[:-3] + "z"  # luces -> luz
    if w.endswith("es") and len(w) > 5:
        return w[:-2]  # zapatilles -> zapatille
    if w.endswith("s") and len(w) > 5:
        return w[:-1]  # negros -> negro, shorts -> short
    return w


async def parse_query(query: str) -> SearchFilters:
    """Parse a natural language query into structured search filters."""
    if not OPENAI_API_KEY:
        logger.warning("OPENAI_API_KEY not set, using fallback keyword search")
        return _build_fallback_filters(query)

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{OPENAI_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": OPENAI_MODEL,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": query},
                    ],
                    "temperature": 0.1,
                    "max_tokens": 300,
                },
            )
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"].strip()

            # Try to extract JSON from the response
            # Handle cases where LLM wraps in markdown code blocks
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
                content = content.strip()

            parsed = json.loads(content)
            return SearchFilters(
                keywords=parsed.get("keywords", []),
                category_group=parsed.get("category_group"),
                subcategory=parsed.get("subcategory"),
                min_price=parsed.get("min_price"),
                max_price=parsed.get("max_price"),
                brand_keywords=parsed.get("brand_keywords", []),
            )
    except Exception:
        logger.exception("LLM parse failed, falling back to keyword search")
        return _build_fallback_filters(query)
