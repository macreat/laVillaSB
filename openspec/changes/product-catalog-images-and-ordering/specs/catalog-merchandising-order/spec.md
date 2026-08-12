# catalog-merchandising-order Specification

## Purpose

Define one deterministic catalog ordering and apparel classification contract for all catalog consumers.

## Requirements

### Requirement: Decks SHALL sort by measurable size, then Long Boards

Deck products MUST sort by reliable numeric category size in ascending order, not lexicographic order. Non-sized `Long Board` products MUST follow all sized decks. Equal or unavailable measurements MUST use product ID ascending as the stable tie-breaker.

#### Scenario: Decimal deck sizes sort numerically

- GIVEN decks with sizes 7.75, 8.0, 8.125, 8.25, 8.4, and 8.5
- WHEN the catalog order is produced
- THEN products appear from 7.75 through 8.5 numerically

#### Scenario: Long Boards follow sized decks

- GIVEN sized decks and non-sized Long Board products
- WHEN the deck order is produced
- THEN every sized deck precedes every Long Board
- AND Long Boards use ID ascending within their group

### Requirement: Apparel SHALL use the confirmed merchandising buckets

Apparel MUST order buckets as `Pantalones`, `Busos`, `Camisetas`, then `Zapatos`. Hoodies, Chaquetas, Camibuzos, Rompevientos, and equivalent outerwear MUST map to `Busos` when no more precise applicable classification exists. Products within a bucket MUST use ID ascending.

#### Scenario: Mixed apparel uses the requested order

- GIVEN products classified as Pantalones, Busos, Camisetas, and Zapatos
- WHEN apparel order is produced
- THEN all products appear in that bucket sequence

#### Scenario: Hoodies and Chaquetas map to Busos

- GIVEN an apparel item identified as a Hoodie or Chaqueta without a more precise rule
- WHEN its merchandising bucket is resolved
- THEN its bucket is `Busos`

### Requirement: Other groups and incomplete data SHALL remain stable

Accessories and Gear MUST preserve their current relative order, with product ID ascending as the deterministic tie-breaker. Missing sizes, mixed legacy records, and unclassifiable products MUST remain visible and MUST NOT cause ordering failure; they use stable ID ordering within their applicable fallback group.

#### Scenario: Accessories and Gear are unchanged

- GIVEN an existing Accessories or Gear sequence
- WHEN the new catalog ordering is applied
- THEN the relative sequence is preserved

#### Scenario: Missing or legacy data remains visible

- GIVEN products with missing size, mixed legacy fields, or no recognized apparel class
- WHEN any catalog consumer requests ordered products
- THEN all products remain present and repeated requests return the same order
