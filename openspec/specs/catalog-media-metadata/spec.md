# catalog-media-metadata Specification

## Purpose

Define the catalog contract for product media metadata and media upload completion, including current as-built behavior and explicit remaining quality requirements.

> **Archive provenance (2026-08-11)**: Intentional partial archive of change `media-storage`.
> As-built requirements REQ-01 and REQ-02 are archived as live baseline behavior.
> REQ-03 (pricing metadata quality) is declared NOT IMPLEMENTED and remains an open gap for the follow-up slice.

## Requirements

### Requirement: Product catalog SHALL expose metadata-backed image URLs

The system SHALL return product list entries from imported catalog records, where each entry resolves `imageUrl` from media metadata when present.
The system SHALL preserve as-built bootstrap behavior where the initial imported dataset contains 1500 Drive-derived media and related product records.

**Status**: ARCHIVED (as-built, verified live - 1500/1500 products with imageUrl).

#### Scenario: Catalog read returns metadata-backed images

- GIVEN bootstrap import has completed with product and media metadata records
- WHEN a client requests the catalog product list endpoint
- THEN each returned product includes its metadata-derived `imageUrl` when media metadata exists

#### Scenario: Imported baseline volume is present

- GIVEN a fresh environment with bootstrap import executed once
- WHEN product records are queried
- THEN the imported baseline reflects the as-built 1500-file source dataset contract

### Requirement: Media upload endpoints SHALL persist completion metadata

The system SHALL provide media presign and media complete endpoints as part of the catalog capability contract.
The system SHALL mark media records as complete only after a valid completion request references an existing media upload session.

**Status**: ARCHIVED (as-built, verified live - presign/complete contract; automated integration coverage pending, task 4.1).

#### Scenario: Media complete succeeds for valid upload

- GIVEN a client has obtained a valid presign response for media upload
- WHEN the client calls media complete with the matching media identifier
- THEN the media record is persisted as complete and usable by product metadata references

### Requirement: Pricing metadata quality SHALL be enforced before production readiness

The system SHALL define validation rules that reject catalog records with missing or zero commercial pricing fields for production publish paths.
The current as-built state DOES NOT satisfy this requirement because imported products can exist with `price=0`.

**Status**: DECLARED NOT IMPLEMENTED (open gap, deferred to follow-up slice - change `media-storage` tasks 2.1-2.4).
Live confirmation: 1500/1500 imported products have `price=0`; no enrichment or validation path exists yet.

#### Scenario: Invalid pricing metadata is blocked

- GIVEN a product record has incomplete pricing metadata or `price=0`
- WHEN a publish-quality validation is executed for production readiness
- THEN the product is flagged or rejected until required pricing attributes are backfilled