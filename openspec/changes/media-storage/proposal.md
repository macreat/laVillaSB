# Proposal: Media Storage

## Intent

Align the media storage change with the as-built implementation already deployed.
Document what is complete, what behavior is currently live, and what gaps remain before production-grade media commerce support.

## Scope

### In Scope
- Capture as-built behavior across catalog, gateway, frontend, importer, and infrastructure.
- Define remaining work for pricing metadata, media lifecycle hardening, and production storage/CDN readiness.
- Establish capability contract for upcoming specs and design phases.

### Out of Scope
- Re-implementing already shipped endpoints or importer logic.
- Replacing current seeded catalog source in this phase.
- Full media optimization pipeline (variants generation) in this proposal phase.

## Capabilities

### New Capabilities
- `catalog-media-metadata`: Catalog exposes product list with metadata-backed `imageUrl`, plus media presign and complete endpoints.
- `public-catalog-read-proxy`: Gateway allows unauthenticated reads for selected catalog routes.
- `drive-catalog-bootstrap-import`: Deterministic importer seeds product, category, and media records from the extracted Drive catalog.

### Modified Capabilities
- None.

## Approach

Treat current commits as source of truth for baseline behavior.
Use delta specs to lock current contracts, then add incremental requirements for missing commercial fields and media governance.
Prioritize robust metadata quality over adding new transport paths.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/microservices/catalog/src/main.py` | Modified | Live `/products`, `/media/presign`, `/media/{id}/complete` behavior to baseline in specs. |
| `app/microservices/catalog/src/import_drive_catalog.py` | Modified | Imported 1500 catalog media/product records. |
| `app/backend/gateway/routes/api.php` | Modified | Public proxy allowlist for catalog reads. |
| `app/frontend/src/lib/store-catalog.ts` | Modified | Storefront reads catalog API with fallback mapping. |
| `docker-compose.yml` | Modified | MinIO wired as local object storage origin. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Products imported with `price=0` and incomplete pricing metadata | High | Add pricing attributes, validation rules, and backfill task in next change slice. |
| Media variants are not generated, only original objects are served | Medium | Add async variant pipeline and variant schema contract before scale-up. |
| Public catalog exposure may expand unintentionally | Medium | Keep explicit route allowlist and contract tests for public paths only. |

## Rollback Plan

If regression appears, disable public catalog routes in gateway allowlist and switch frontend product source to current fallback dataset.
Preserve imported records and object keys to avoid destructive data rollback.

## Dependencies

- Existing commits: `58772e0`, `6c6a8bd`, `8659336`, `39a7fc9`, `cbc9a5b`, `18ad043`.
- Seed source: extracted Drive catalog with 1500 files.
- MinIO availability in compose for local object storage.

## Success Criteria

- [ ] Proposal reflects as-built behavior: gateway public catalog reads, importer-seeded 1500 products/media.
- [ ] Remaining gaps are explicit: pricing metadata completion, variant generation, production CDN/R2 policy hardening.
- [ ] Capability list is ready for sdd-spec delta authoring without ambiguity.
