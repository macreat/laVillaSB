# Archive Report: catalog-category-mapping

**Verdict**: FULL ARCHIVE - COMPLETE
**Date**: 2026-08-11
**Mode**: openspec
**Change folder**: `openspec/changes/catalog-category-mapping/` archived to `openspec/changes/archive/2026-08-11-catalog-category-mapping/`

## Verification Gate

- `verify-report.md` verdict: **PASS** (0 blockers, 0 critical findings).
- Requirements verified compliant: 8/8 across both delta specs (`catalog-category-groups` 4/4, `storefront-category-filtering` 4/4).
- Scenarios verified compliant: 14/14.
- Live-stack evidence: catalog :9002, gateway :8010, frontend :3000, postgres :5432.
  - 1500/1500 products with non-empty `categoryGroup`; counts 104 decks / 1294 apparel / 23 accessories / 79 gear; 0 NULL categories.
  - Backfill re-run idempotent (0 updated); importer tags on create, preserves on re-import.
  - All 4 storefront group filters + `all` return HTTP 200 with non-empty views; admin Group column present.
- Test suites: catalog pytest 35 passed, gateway phpunit 5 passed / 13 assertions, frontend vitest 10 passed, typecheck clean.

## Task Completion Gate

- `tasks.md`: **16/16 tasks complete** (`[x]`), no unchecked implementation tasks.
- `apply-progress.md`: confirms all 16 tasks complete, no deviations from design.
- No stale-checkbox reconciliation needed - every task is genuinely complete and verified.

## Gate Basis Note (review artifacts)

No separate review transaction/ledger/receipt artifacts exist in this repository's openspec tree (no `reviews/` directory; the same applied to the prior `media-storage` archive, which used `verify-report.md` as gate evidence).
Gate basis for this archive: `verify-report.md` verdict PASS (0 blockers) + 16/16 completed tasks + live-stack and test evidence recorded in the verify report.
No `openspec/config.yaml` exists, so no `rules.archive` constraints applied.

## Specs Synced to `openspec/specs/` Baseline

| Domain | Action | Details |
|--------|--------|---------|
| catalog-category-groups | **Created** (new capability, no prior main spec) | 4 requirements, 8 scenarios, all ARCHIVED with live verification markers |
| storefront-category-filtering | **Created** (new capability, no prior main spec) | 4 requirements, 6 scenarios, all ARCHIVED with live verification markers |
| drive-catalog-bootstrap-import | **Updated** (existing baseline from media-storage archive) | REQ-04 marker modified to reflect importer tagging reuse; provenance note added; REQ-05 unchanged |

### Importer Tagging and the `drive-catalog-bootstrap-import` Baseline

The media-storage baseline (2026-08-11) created `openspec/specs/drive-catalog-bootstrap-import/spec.md` with:
- REQ-04 (deterministic bootstrap import) marked **ARCHIVED**, but carrying the caveat "Runtime re-run idempotency test not executed yet (task 4.1 pending)".
- REQ-05 (media variants pipeline) marked **DECLARED NOT IMPLEMENTED** (open gap for the follow-up slice).

The `catalog-category-mapping` change adds importer tagging behavior (the mapping requirement was folded into the `catalog-category-groups` delta spec, which includes "Importer SHALL tag categories at import time", and the proposal lists `drive-catalog-bootstrap-import` as a modified capability):
- The bootstrap importer (`build_category`) now assigns `category_group` to every category it creates via the shared mapping module, and never updates existing categories.
- Re-import idempotency is now proven: live re-run updated 0 categories, and `test_importer_tags.py` + `test_backfill_category_groups.py` cover tag-on-create, preserve-on-reimport, and unmatched -> uncategorized.

Baseline update applied in this archive:
- REQ-04 marker modified: importer tagging behavior is now satisfied/updated with live evidence, and the earlier "idempotency test not executed yet" caveat is resolved.
- NOTE: REQ-05 (media variants pipeline) remains **DECLARED NOT IMPLEMENTED** - it is a different requirement, untouched by this change, and still tracked as an open gap for the media-storage follow-up slice.

## Archive Contents

- exploration.md - present
- proposal.md - present
- specs/catalog-category-groups/spec.md - present (synced to baseline)
- specs/storefront-category-filtering/spec.md - present (synced to baseline)
- design.md - present
- tasks.md - present (16/16 complete)
- apply-progress.md - present
- verify-report.md - present (verdict PASS)
- archive-report.md - present (this file)

## Traceability

- Delta specs: `openspec/changes/catalog-category-mapping/specs/{catalog-category-groups,storefront-category-filtering}/spec.md`
- Design: `openspec/changes/catalog-category-mapping/design.md`
- Tasks: `openspec/changes/catalog-category-mapping/tasks.md`
- Apply progress: `openspec/changes/catalog-category-mapping/apply-progress.md`
- Verify: `openspec/changes/catalog-category-mapping/verify-report.md`

## Verification of Archive

- [x] Main specs updated correctly (`openspec/specs/catalog-category-groups/spec.md`, `openspec/specs/storefront-category-filtering/spec.md` created; `openspec/specs/drive-catalog-bootstrap-import/spec.md` updated)
- [x] Change folder moved to `openspec/changes/archive/2026-08-11-catalog-category-mapping/`
- [x] Archive contains all artifacts (proposal, specs, design, tasks, apply-progress, verify-report, archive-report)
- [x] Archived `tasks.md` has no unchecked implementation tasks (16/16 `[x]`)
- [x] Active changes directory no longer contains `catalog-category-mapping`

## Open Items (not blocking; carried outside this archive)

- `openspec/changes/media-storage/` remains ACTIVE with its own declared gaps (REQ-03 pricing enforcement, REQ-05 media variants pipeline, hardening tasks 1.3/2.x/3.x/4.x).
- PO sign-off on keyword rules and the `Hardware y Accesorios` -> gear precedence remains an open human task from the proposal (noted in verify-report as a SUGGESTION, non-blocking).
- Review-size note: code-only diff 574 lines exceeds the 400-line budget; delivery already resolved as single-pr-default at apply time (non-blocking).

## Next Steps

Follow-up slice on `media-storage` (pricing-variants capabilities) must deliver REQ-03, REQ-05, and hardening tasks, then fully archive `media-storage`.
The SDD cycle for `catalog-category-mapping` is complete.