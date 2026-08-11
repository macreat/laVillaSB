# Design: Media Storage

## Technical Approach

This design locks the deployed behavior as the baseline contract and adds a forward path for the two remaining gaps: pricing enrichment and media variants generation.
The baseline flow already spans catalog service, gateway public proxy, frontend catalog mapping, importer bootstrap, and MinIO-backed object storage.
The remaining work extends that flow with validation-driven pricing readiness and an asynchronous variant pipeline without breaking current `/products` and upload contracts.

## Architecture Decisions

| Decision | Option | Tradeoff | Decision |
|---|---|---|---|
| Pricing readiness gate | Keep `price=0` allowed forever | Fast ingest but not commerce-safe | Introduce explicit publish-readiness validation while preserving raw import persistence |
| Variant processing model | Inline variant generation in `/media/{id}/complete` | Simpler API surface but high latency and timeout risk | Use async worker pipeline and store variant manifest in `media.variants` |
| Public catalog exposure | Wildcard unauthenticated proxy | Easy routing but high accidental exposure risk | Keep explicit gateway allowlist for read routes only |

## Component Responsibilities

- Gateway (`app/backend/gateway/routes/api.php`): enforce explicit unauthenticated allowlist for catalog reads and keep all other service routes behind `auth:sanctum`.
- Catalog API (`app/microservices/catalog/src/main.py`): serve products, issue media presigns, and accept upload completion metadata.
- Catalog importer (`app/microservices/catalog/src/import_drive_catalog.py`): deterministic bootstrap from Drive-derived files into category, media, and product records.
- Catalog data model (`app/microservices/catalog/src/models.py`): persist `price`, `status`, `variants`, and metadata required for readiness checks.
- Frontend mapping (`app/frontend/src/lib/store-catalog.ts`): consume catalog response, map to storefront product shape, and fallback to static seed list on failure.
- Storage utility (`app/microservices/catalog/src/storage.py`): build object keys and public object URLs from S3-compatible storage.

## Data Flow

### Baseline deployed flow

Importer -> DB + MinIO upload.
Frontend -> Gateway public route -> Catalog `/products` -> DB + media URL composition.
Admin/media client -> Catalog `/media/presign` -> MinIO PUT -> Catalog `/media/{id}/complete`.

```
Drive assets -> import_drive_catalog.py -> Postgres (products/media/categories)
                                   -> MinIO (original object)

Storefront -> Gateway /v1/catalog/products -> Catalog /products
         -> ProductOut.imageUrl from media.storage_key via build_public_url
```

### Planned extension flow

1. Pricing enrichment pass populates commercial fields for imported products.
2. Readiness validator marks records publishable only when pricing constraints pass.
3. On media completion or import, variant job is queued.
4. Worker generates derivative assets and updates `media.variants` atomically.
5. `/products` continues reading canonical media record and can later select preferred variant URL.

## File Changes

| File | Action | Description |
|---|---|---|
| `openspec/changes/media-storage/design.md` | Create | Technical design for as-built baseline and remaining implementation plan. |
| `app/microservices/catalog/src/main.py` | Modify (planned) | Add pricing-readiness projection and variant-status-safe response shaping. |
| `app/microservices/catalog/src/import_drive_catalog.py` | Modify (planned) | Add enrichment hooks and variant job enqueue during bootstrap. |
| `app/microservices/catalog/src/models.py` | Modify (planned) | Extend product pricing metadata and variant processing state fields. |
| `app/microservices/catalog/src/schemas.py` | Modify (planned) | Add explicit pricing readiness and variant state contract types. |
| `app/backend/gateway/routes/api.php` | Verify only | Keep read-only allowlist explicit and covered by contract tests. |

## Interfaces / Contracts

```python
class PublishReadiness(BaseModel):
    product_id: int
    ready: bool
    reasons: list[str]

class VariantJobPayload(TypedDict):
    media_id: int
    storage_key: str
    mime_type: str
```

`PublishReadiness` is a service-internal contract for enrichment validation.
`VariantJobPayload` is the queue contract between catalog API/importer and media worker.

## Failure Modes

- Missing pricing fields or `price=0` after enrichment -> record stays non-publishable and is listed for remediation.
- Presign succeeds but upload never completes -> media remains `pending` and is excluded from ready image URL assignment.
- Variant worker fails per media item -> original asset remains available, job retries with capped backoff, and failure state is visible in metadata.
- Gateway allowlist drift -> unauthorized route exposure prevented by deny-by-default and route contract tests.

## Rollback Strategy

Rollback prioritizes user-visible stability over data deletion.
If enrichment or variant rollout regresses, disable new validator/worker paths via config flag while preserving baseline `/products` and original-object delivery.
Keep imported records and storage keys intact.
If needed, route storefront to existing frontend fallback dataset while gateway allowlist remains constrained.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Slug/idempotent import mapping, pricing validators, variant payload builder | Python unit tests around pure functions and model validators |
| Integration | `/products`, `/media/presign`, `/media/{id}/complete`, DB persistence, MinIO interaction | Service tests with test DB and MinIO container |
| Integration | Gateway allowlist behavior for public vs protected routes | Laravel route/HTTP tests for allowlisted and non-allowlisted paths |
| E2E | Storefront product grid with metadata images and fallback behavior | Browser flow against docker-compose stack |
| E2E | Variant pipeline degraded mode | Upload media, force worker failure, verify original image still served |

## Threat Matrix

Applicable because this change includes routing and process integration.
Shell, subprocess, VCS/PR automation, and executable-file classification boundaries are N/A for this change.

| Boundary | Applicable | Notes |
|---|---|---|
| Routing/public surface | Yes | Gateway allowlist must stay explicit and deny by default. |
| Process integration (async worker) | Yes | Variant job enqueue, retry, and idempotency are required. |
| Shell command execution | N/A | No shell invocation in planned design. |
| Subprocess management | N/A | Worker uses service runtime, not child process spawning from API. |
| VCS/PR automation | N/A | No repository automation in runtime behavior. |
| Executable-file classification | N/A | Media type handling is metadata-based, not executable classification. |

## Migration / Rollout

No destructive migration is required.
Roll out in phases: pricing schema extension, enrichment backfill, readiness enforcement in publish paths, then async variant worker activation.
Use feature flags to gate enforcement and worker consumption independently.

## Open Questions

- [ ] Which pricing attributes are mandatory beyond `price` for publish-readiness in this domain.
- [ ] Which variant set is required initially (sizes, formats, and quality targets) and where those URLs are exposed.
