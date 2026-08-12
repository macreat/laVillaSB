# drive-catalog-bootstrap-import Specification

## Purpose

Define deterministic catalog bootstrap import from extracted Drive assets, including current as-built volume, import-time category tagging, and remaining media lifecycle requirements.

> **Archive provenance (2026-08-11)**: Intentional partial archive of change `media-storage`.
> As-built requirement REQ-04 (deterministic bootstrap import) is archived as live baseline behavior.
> REQ-05 (media variants pipeline) is declared NOT IMPLEMENTED and remains an open gap for the follow-up slice.
>
> **Spec update (2026-08-11)**: Change `catalog-category-mapping` adds import-time category tagging.
> The bootstrap importer now assigns `category_group` to every category it creates via the shared mapping module (`catalog/src/category_groups.py`), and re-imports never update existing categories, preserving stored groups.
> Re-import idempotency is now verified live (48 categories, 0 updated on re-run).
> REQ-04's marker below is updated to reflect this verified importer tagging behavior; REQ-05 remains DECLARED NOT IMPLEMENTED (media variants pipeline, untouched by this change).

## Requirements

### Requirement: Bootstrap importer SHALL seed deterministic Drive-derived catalog records

The system SHALL import products, categories, and media records from the extracted Drive catalog source in a repeatable way.
The system SHALL preserve current as-built baseline where 1500 source files are imported into catalog bootstrap records.

**Status**: ARCHIVED (as-built, verified live - 1500 products / 48 categories / 1500 media; deterministic slugify/sha1-based mapping).
**Updated (2026-08-11, change `catalog-category-mapping`)**: the bootstrap importer additionally tags every category it creates with `category_group` using the shared mapping module; existing categories are fetched by slug and never updated, so re-imports preserve stored groups. Re-run idempotency verified live - 48 categories, 0 updated, counts unchanged (evidence: `test_importer_tags.py`, `test_backfill_category_groups.py`, and the live re-import run in the `catalog-category-mapping` verify report). The earlier media-storage note "Runtime re-run idempotency test not executed yet (task 4.1 pending)" is resolved by this evidence.

#### Scenario: Initial bootstrap import seeds baseline data

- GIVEN the extracted Drive catalog source is available
- WHEN the bootstrap importer is executed in a new environment
- THEN products, categories, and media records are seeded using deterministic mapping rules
- AND the as-built 1500-source baseline is represented in import results

#### Scenario: Re-run keeps deterministic identity mapping

- GIVEN a prior bootstrap import has already seeded records
- WHEN the bootstrap importer is run again with the same source
- THEN record identity mapping remains deterministic and does not create uncontrolled duplicates

### Requirement: Media variants pipeline SHALL be defined for production scale

The system SHALL define an asynchronous media variants pipeline that produces required derivative assets from original uploaded objects.
The current as-built state DOES NOT satisfy this requirement because only original media objects are served.

**Status**: DECLARED NOT IMPLEMENTED (open gap, deferred to follow-up slice - change `media-storage` tasks 1.3, 3.1-3.3).
`Media.variants` JSON column exists but nothing generates variant artifacts.

#### Scenario: Variant generation requirement is unmet in current baseline

- GIVEN a media object imported or uploaded into storage
- WHEN downstream delivery requires variant sizes or formats
- THEN the baseline system has no variant artifacts and this is tracked as a required follow-up capability