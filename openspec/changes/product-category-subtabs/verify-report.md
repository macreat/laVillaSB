```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:c74ecbf6df2011fb3fd7a5cf08e6f1444266438c23a20e91d523c718d375c9e5
verdict: fail
blockers: 1
critical_findings: 1
requirements: 5/10
scenarios: 18/24
test_command: pytest tests/test_category_groups.py tests/test_subcategory.py tests/test_product_out.py tests/test_products_api.py tests/test_products_api_ordering.py tests/test_list_products_ordering.py tests/test_merchandising.py
test_exit_code: 0
test_output_hash: sha256:0947741cf0b6246bd1821adf903d5a26337550116584d20e1e132ccb6f9548d6
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:257fa917965bc3194f19504b2558eb8634fda398ca497a9b22677ae7e1f65d15
```

# Verification Report

**Change**: `product-category-subtabs`

**Version**: OpenSpec delta.

**Mode**: Strict TDD.

**Verified at**: 2026-08-12.

## Executive Summary

All 15 tasks are checked complete in `tasks.md` and `apply-progress.md`.

The focused catalog, gateway, frontend, typecheck, lint, build, smoke, HTTP, and compose checks passed.

Verification fails closed because the required empty-subcategory omission scenario has no covering passing test, and strict TDD does not permit source inspection alone to mark that scenario compliant.

No application code was modified during verification.

The worktree was already dirty with the implementation and OpenSpec artifacts before verification.

## Completeness

| Metric | Value |
|---|---:|
| Tasks total | 15 |
| Tasks complete | 15 |
| Tasks incomplete | 0 |
| Requirements fully verified | 5/10 |
| Scenarios fully verified | 18/24 |

## Commands and Evidence

All hashes below are SHA-256 digests of the exact captured command output.

| Check | Command | Result | Exit | Output hash |
|---|---|---|---:|---|
| Catalog focused tests | `(cd app/microservices/catalog && pytest tests/test_category_groups.py tests/test_subcategory.py tests/test_product_out.py tests/test_products_api.py tests/test_products_api_ordering.py tests/test_list_products_ordering.py tests/test_merchandising.py)` | 54 passed | 0 | `0947741cf0b6246bd1821adf903d5a26337550116584d20e1e132ccb6f9548d6` |
| Gateway focused test | `(cd app/backend/gateway && php artisan test --filter=CatalogPublicRoutesTest)` | 5 passed, 19 assertions | 0 | `418b540728dfa9abd04abd79dfd8b2ec5c2229beec570fe59e41fcc9744505d4` |
| Frontend focused tests | `(cd app/frontend && npx vitest run src/components/store/CategorySubtabs.contract.test.ts src/lib/store-catalog.test.ts)` | 21 passed | 0 | `aa3bf2139b66e25ab4197a9bf716ac7d4be98d810fa770e8dd748b767297f294` |
| Frontend full Vitest | `(cd app/frontend && npx vitest run)` | 28 passed | 0 | `df7b77350679c013c944564260b57a64705950e01d99a49ae048555b84228f52` |
| Frontend typecheck | `(cd app/frontend && npm run typecheck)` | Passed | 0 | `4c0f3b850251c1bee3b594bb49252e793f5eb8bf9f1f9d28356f153667da8b84` |
| Frontend lint | `(cd app/frontend && npm run lint)` | Passed with 2 pre-existing warnings | 0 | `8f9d3a750c854195a31c62d2471f7bd57e3b14b3ce498a503c76a1b3bc7868c1` |
| Frontend production build | `(cd app/frontend && npm run build)` | Passed | 0 | `257fa917965bc3194f19504b2558eb8634fda398ca497a9b22677ae7e1f65d15` |
| Post-build typecheck | `(cd app/frontend && npm run typecheck)` | Passed after build | 0 | `4c0f3b850251c1bee3b594bb49252e793f5eb8bf9f1f9d28356f153667da8b84` |
| Category subtabs smoke | `(cd app/frontend && npm run smoke:category-subtabs)` | Catalog/storefront HTTP 200, 1,500 products, 20 populated labels, source contracts present | 0 | `41a2f7a7fd1bde2a23afc168aef1743b414bd7cc7d515f226f0ffa07cda89922` |
| Local HTTP checks | `curl` checks for catalog, gateway, `/products`, all group URLs, valid Hoodies state, and stale state | 9/9 HTTP 200 | 0 | `fc6ca37678eaa58f264636311baa9867499c1919745891beb7d0c8b2ca4021af` |
| Compose runtime | `docker compose ps` | catalog, gateway, and frontend running | 0 | `d670b46adf00a498b20f7b2805315399f9f35bab9f5a17c4a223f426329adcd2` |

The existing final review evidence is preserved at `/tmp/opencode/subtabs-review-evidence.json`.

Its evidence digest is `sha256:c74ecbf6df2011fb3fd7a5cf08e6f1444266438c23a20e91d523c718d375c9e5`.

The existing evidence records the Docker rebuild and the same live runtime checks used here.

## Runtime Localhost:3000 Results

| URL | Result |
|---|---|
| `http://localhost:3000/products` | HTTP 200 |
| `http://localhost:3000/products?category=decks` | HTTP 200 |
| `http://localhost:3000/products?category=apparel` | HTTP 200 |
| `http://localhost:3000/products?category=accessories` | HTTP 200 |
| `http://localhost:3000/products?category=gear` | HTTP 200 |
| `http://localhost:3000/products?category=apparel&subcategory=Hoodies` | HTTP 200 |
| `http://localhost:3000/products?category=apparel&subcategory=Stale` | HTTP 200 |

The gateway and catalog endpoints also returned HTTP 200.

The smoke check observed 1,500 products and all 20 expected non-empty subcategory values.

Observed live counts were decks `3, 34, 12, 37, 6, 7, 5`, apparel `1061, 45, 47, 78, 52, 8, 3`, accessories `15, 8`, and gear `38, 30, 6, 5` in the specified label order.

## Spec Compliance Matrix

| Requirement | Scenario | Covering test or evidence | Result |
|---|---|---|---|
| Catalog classification precedence | Maderos category parses `8.25` and preserves raw category | `test_subcategory.py::test_classify_subcategory_uses_canonical_values` and `test_product_out.py::test_to_product_out_preserves_existing_fields` | ✅ COMPLIANT |
| Catalog classification precedence | `Long Board` is classified after numeric deck sizes | `test_subcategory.py::test_classify_subcategory_uses_canonical_values` | ✅ COMPLIANT |
| Catalog classification precedence | Shoes outrank clothing-name rules | `test_subcategory.py::test_classify_subcategory_uses_canonical_values` | ✅ COMPLIANT |
| Catalog classification precedence | `Hoodie` and `Hoddie` map to Hoodies | The test covers `Hoddie`; implementation contains both checks | ⚠️ PARTIAL |
| Catalog classification precedence | Unmatched apparel uses `Other Apparel` | `test_subcategory.py::test_classify_subcategory_uses_canonical_values` | ✅ COMPLIANT |
| Catalog classification precedence | Hardware y Accesorios remains Gear with the additive subcategory | `test_category_groups.py`, `test_subcategory.py`, and live smoke payload | ✅ COMPLIANT |
| Product serialization | Classified response contains the additive value and existing fields | `test_product_out.py`, `test_products_api.py`, gateway test, and live payload | ✅ COMPLIANT |
| Product serialization | Missing source data serializes safely with a null subcategory | `test_product_out.py::test_to_product_out_serializes_uncategorized_when_no_category` and unknown-category test | ✅ COMPLIANT |
| Category-group mapping | Hardware y Accesorios maps to Gear by precedence | `test_category_groups.py::test_map_category_name_known_keywords` | ✅ COMPLIANT |
| Category-group mapping | Unknown category falls back to uncategorized | `test_category_groups.py::test_map_category_name_unmatched_falls_back_to_uncategorized` | ✅ COMPLIANT |
| ProductOut contract | Product list includes category fields and preserves product order | `test_products_api_ordering.py`, gateway feature test, and live payload | ✅ COMPLIANT |
| ProductOut contract | NULL stored group resolves to uncategorized and safe subcategory behavior | Direct serialization diagnostic passed; existing test asserts only the group | ⚠️ PARTIAL |
| Group filtering | Decks filter returns only deck products | `store-catalog.test.ts::returns only products matching the selected group` | ✅ COMPLIANT |
| Group filtering | Gear includes Hardware y Accesorios products | Catalog classifier tests and live smoke payload prove Gear precedence | ✅ COMPLIANT |
| Group filtering | All returns the full list in server order | `store-catalog.test.ts::returns the full list for all` | ✅ COMPLIANT |
| Group filtering | Combined Apparel and Hoodies filtering preserves original order | `store-catalog.test.ts::filters by group and known subcategory in original order` | ✅ COMPLIANT |
| Subtab derivation | Empty subcategories are omitted | No covering test for an empty known label was found | ❌ UNTESTED |
| Subtab derivation | Group All retains all products, including unknown and uncategorized values | `store-catalog.test.ts::keeps unknown and uncategorized products in the group All result` | ✅ COMPLIANT |
| URL state | Shared Hoodies URL restores combined filter state | Domain tests and live HTTP 200 pass; no browser DOM harness verifies page interaction | ⚠️ PARTIAL |
| URL state | Stale subcategory falls back to All without error | `store-catalog.test.ts::falls back to the group when a subcategory is stale or unknown` and live stale URL HTTP 200 | ✅ COMPLIANT |
| Accessible responsive navigation | Keyboard-focusable named links, active state, no-wrap, focus, overflow, and reduced motion | `CategorySubtabs.contract.test.ts` and CSS source contract; browser DOM unavailable | ⚠️ PARTIAL |
| Regression and deployment | Complete change has focused service, frontend, build, and smoke coverage | All focused commands, full frontend Vitest, and smoke passed | ✅ COMPLIANT |
| Regression and deployment | Existing group URLs return 200 and render applicable subtabs | 7 URL checks and source-path smoke passed; rendered DOM is unavailable | ⚠️ PARTIAL |

**Compliance summary**: 18/24 scenarios are fully compliant, 5 are partial, and 1 is untested.

## Task Matrix

| Task | Status | Verification evidence |
|---|---|---|
| 1.1 Classifier RED tests | ✅ Complete | `test_subcategory.py` exists and the focused catalog suite passed 18 classifier cases. |
| 1.2 Classifier implementation | ✅ Complete | `src/subcategory.py` uses shared mapping, precedence, canonical labels, and nullable results. |
| 1.3 Additive ProductOut and API | ✅ Complete | ProductOut, detail, null-safety, and ordering tests passed. |
| 1.4 Catalog refactor and preservation | ✅ Complete | Focused catalog suite passed 54 tests and preserved ordering/group regression coverage. |
| 2.1 Gateway RED contract | ✅ Complete | `CatalogPublicRoutesTest.php` passed 5 tests and 19 assertions. |
| 2.2 Gateway pass-through | ✅ Complete | Gateway test confirms additive fields and sequence pass through without recomputation. |
| 3.1 Frontend RED coverage | ✅ Complete | `store-catalog.test.ts` passed 17 domain tests covering mapping, tabs, filtering, URL encoding, and stale state. |
| 3.2 Frontend domain implementation | ✅ Complete | Mapper, known-tab derivation, combined filtering, normalization, and URL helpers are present and typechecked. |
| 3.3 Frontend preservation refactor | ✅ Complete | All frontend tests passed and server-order/fallback assertions remain green. |
| 4.1 Accessibility RED/manual fallback | ⚠️ Complete with limitation | The source contract test passed 4 tests, but browser DOM and keyboard interaction proof are unavailable. |
| 4.2 Storefront UI implementation | ✅ Complete | Component/page source contract, production build, valid URL, and stale URL smoke checks passed. |
| 4.3 CSS responsive/reduced-motion refactor | ✅ Complete | Contract tests and smoke source checks passed for overflow, no-wrap, focus, active underline, and reduced motion. |
| 5.1 Focused tests, typecheck, lint, and build | ✅ Complete | All current commands passed; lint has two pre-existing warnings. |
| 5.2 Docker rebuild and runtime smoke | ✅ Complete | Existing final review evidence records the rebuild; current compose services and 9/9 HTTP checks pass. |
| 5.3 Keyboard, URL, and reduced-motion evidence | ⚠️ Complete with limitation | URL and source contracts pass, but `browserDom: false` prevents browser-rendered interaction proof. |

## Correctness Against the Implementation

| Area | Status | Notes |
|---|---|---|
| Catalog-owned taxonomy | ✅ Implemented | Classification is additive and uses the shared category mapper. |
| Additive API contract | ✅ Implemented | `categorySubcategory` is nullable and existing fields/order remain present in tests and live payloads. |
| Gateway pass-through | ✅ Implemented | The public proxy forwards the additive field unchanged. |
| Known-only subtabs | ✅ Implemented | Frontend derives only supported labels and preserves canonical order. |
| Combined filtering and fallback | ✅ Implemented | Group filtering precedes known subcategory filtering, and stale values resolve to All. |
| URL construction | ✅ Implemented | `URLSearchParams` encodes canonical labels and omits subcategory for All. |
| Accessible control source contract | ✅ Implemented statically | Anchors, names, `aria-current`, focus, no-wrap, overflow, and reduced-motion rules are present. |
| Empty-label regression coverage | ❌ Not verified | The implementation filters populated labels, but no test exercises omission of an empty known label. |

## Design Coherence

| Decision | Followed? | Notes |
|---|---|---|
| Catalog owns taxonomy | ✅ Yes | `subcategory.py` calls the shared category mapping module. |
| No migration, importer change, or `/categories` dependency | ✅ Yes | The change uses existing product responses and no new endpoint. |
| Explicit classification precedence | ✅ Yes | Shoes, named apparel families, group rules, and fallback are ordered in code. |
| Unknown values are not tabs | ✅ Yes | The frontend filters against fixed known labels and retains unknown values under All. |
| Single-line accessible visual control | ✅ Yes statically | CSS and component contracts passed. |
| NULL stored group serializes a null subcategory | ⚠️ Deviation | The design says null, while the implementation can derive a value from the category when the stored group is NULL. The base spec permits a safely derived value, so this is a design warning rather than a direct spec contradiction. |

## TDD Compliance

| Check | Result | Details |
|---|---|---|
| TDD evidence reported | ✅ | `apply-progress.md` contains a full TDD Cycle Evidence table for all 15 tasks. |
| Test files and evidence paths exist | ✅ | Every test path named by the TDD table exists; build, smoke, and manual rows have corresponding evidence. |
| RED evidence cross-checked | ⚠️ | RED evidence is present semantically, but several rows use prose such as `Written` rather than the strict `✅ Written` label. |
| GREEN evidence cross-checked | ✅ | Current catalog, gateway, frontend, typecheck, build, and smoke commands pass. |
| Triangulation | ⚠️ | Classifier, filtering, and contract behaviors have multiple cases, but empty known-label omission has no test. |
| Safety net | ✅ | Safety-net results are recorded in `apply-progress.md`; new test files are correctly marked N/A and modified files report prior passing baselines. |
| Assertion quality | ✅ | No tautologies, ghost loops, orphan empty assertions, type-only-only assertions, or mock-heavy files were found. |

**TDD Compliance**: 5/7 checks fully passed; 2 checks are warnings.

## Test Layer Distribution

| Layer | Tests | Files | Tools |
|---|---:|---:|---|
| Unit | 41 | 3 | pytest and Vitest |
| Integration | 9 | 3 | FastAPI TestClient and PHPUnit |
| E2E/browser | 0 | 0 | No browser harness or Chromium executable |
| Static contract/unknown | 4 | 1 | Vitest source contract |
| **Total** | **54** | **7** | |

The smoke script is live HTTP and source-path evidence rather than a browser E2E test.

## Changed File Coverage

Coverage analysis skipped because no coverage tool was detected in the catalog or frontend test environments.

## Quality Metrics

**Linter**: Passed with two pre-existing warnings in `src/app/(dashboard)/admin/settings/page.tsx` and `src/app/layout.tsx`.

**Type checker**: Passed with no errors after the production build.

**Catalog quality tool**: No separate catalog linter was configured or detected.

## Issues Found

### CRITICAL

1. The required `Empty subcategories are omitted` scenario is UNTESTED.

`deriveSubcategoryTabs` has implementation logic that filters populated labels, but no repository test supplies a group with an empty known label and asserts that the label is absent.

Under strict TDD, the implementation and live non-empty smoke counts do not replace a passing covering test.

Minimal remediation to report, not apply: add a focused frontend test with an Accessories product set that omits `Grip Tape`, then assert the derived tabs contain `All` and `Bags & Waist Packs` only.

### WARNING

1. `browserDom: false` is an explicit environment limitation.

No browser DOM harness or Chromium executable is available.

The smoke check proves live HTTP responses, Next assets, and exact production source contracts, but it does not prove browser-rendered DOM, keyboard activation, focus movement, pixel layout, or actual reduced-motion behavior.

2. NULL stored groups can produce an inconsistent taxonomy pair.

The reproduced diagnostic for category `Ropa / Talla L` with `category_group = NULL` returned `categoryGroup: uncategorized` and `categorySubcategory: Hoodies`.

The existing final reliability review identified this same behavior.

The base spec permits a safely derived subcategory, but the design interface explicitly expects NULL for this case, and the existing null-group test does not assert the subcategory.

Minimal remediation to report, not apply: choose and test one contract, preferably return NULL when the stored group is absent or update the design to explicitly accept derived values.

3. The Hoodie spelling scenario tests `Hoddie` but not the normal `Hoodie` spelling.

The implementation handles both spellings, but the runtime assertion covers only one branch.

4. The full catalog Pytest suite remains blocked during collection by the pre-existing missing `pytesseract` dependency in `tests/test_ocr_pricing.py`.

The documented focused catalog suite passed independently.

5. Frontend lint emits two pre-existing warnings unrelated to this change.

### SUGGESTION

1. Add a browser-capable component or Playwright harness before claiming complete accessibility and viewport verification.

2. Centralize the canonical subcategory label list if the taxonomy is expected to evolve frequently, because backend, frontend, and smoke evidence currently duplicate it.

3. Add changed-file coverage reporting when a coverage tool is available.

## Remaining Limitations

- Browser DOM and keyboard interaction proof is unavailable and is recorded honestly as `browserDom: false`.
- The existing local runtime smoke is source-contract and HTTP evidence, not rendered DOM evidence.
- The full catalog suite requires the unrelated `pytesseract` dependency.
- Coverage percentages are unavailable.
- Verification did not rebuild the Docker stack again because the existing final review evidence already records the rebuild and the current compose services are running.

## Verdict

**FAIL** - runtime and build checks pass and all tasks are marked complete, but strict verification cannot pass an untested required empty-subcategory scenario.

No application remediation was applied.

The next action is to add the minimal omission test and rerun verification, while separately deciding the NULL-group subcategory contract.
