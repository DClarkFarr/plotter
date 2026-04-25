# Tasks: Import Name Standardization

**Input**: Design documents from `/specs/049-normalize-import-names/`
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/import-outline-normalization.md`, `quickstart.md`

**Tests**: No new automated test tasks are included. Validation is driven by manual quickstart scenarios and build checks defined in feature artifacts.

**Organization**: Tasks are grouped by user story to enable independent implementation and validation of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare shared contracts and utility surface used by all stories.

- [ ] T001 Create import normalization utility module with exported helper stubs in `/Users/daniel/git/plotter/express/src/utils/importNormalization.ts`
- [ ] T002 Define backend normalization report interfaces and response type extensions in `/Users/daniel/git/plotter/express/src/types/importOutline.ts`
- [ ] T003 [P] Define frontend normalization report types matching backend contract in `/Users/daniel/git/plotter/web/src/api/types.ts`
- [ ] T004 [P] Wire import API response typing updates for normalization payload in `/Users/daniel/git/plotter/web/src/api/api.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement canonicalization and shared matching behavior that all user stories depend on.

**Critical**: No user story implementation starts until this phase is complete.

- [ ] T005 Implement deterministic normalized key generation (trim + whitespace collapse + case-fold) in `/Users/daniel/git/plotter/express/src/utils/importNormalization.ts`
- [ ] T006 Implement canonical display-name formatter for tags and characters in `/Users/daniel/git/plotter/express/src/utils/importNormalization.ts`
- [ ] T007 Implement consolidation-tracking helpers for raw variants and counts in `/Users/daniel/git/plotter/express/src/utils/importNormalization.ts`
- [ ] T008 Integrate normalization helper usage into modern parser identity mapping in `/Users/daniel/git/plotter/express/src/services/importOutlineModernParser.ts`
- [ ] T009 Preserve legacy import-mode compatibility by reusing shared normalization utilities in `/Users/daniel/git/plotter/express/src/services/importOutlineService.ts`

**Checkpoint**: Shared normalization foundation is complete and user stories can proceed.

---

## Phase 3: User Story 1 - Import with standardized names (Priority: P1) MVP

**Goal**: Import consolidates case/whitespace variants for tags and characters into one standardized stored name per unique value.

**Independent Test**: Import a document containing uppercase/lowercase/mixed-case variants (for tags and characters) and confirm one canonical stored name per logical value with mapped references.

### Implementation

- [ ] T010 [US1] Apply normalized-key grouping for imported character tokens before scene/reference mapping in `/Users/daniel/git/plotter/express/src/services/importOutlineService.ts`
- [ ] T011 [US1] Apply normalized-key grouping for imported tag tokens before scene/reference mapping in `/Users/daniel/git/plotter/express/src/services/importOutlineService.ts`
- [ ] T012 [US1] Ensure canonical display name assignment for newly created characters in `/Users/daniel/git/plotter/express/src/services/importOutlineService.ts`
- [ ] T013 [US1] Ensure canonical display name assignment for newly created tags in `/Users/daniel/git/plotter/express/src/services/importOutlineService.ts`
- [ ] T014 [US1] Map all scene-level character/tag references to consolidated canonical IDs in `/Users/daniel/git/plotter/express/src/services/importOutlineService.ts`
- [ ] T015 [US1] Manually validate FR-001 to FR-004 scenarios using import examples documented in `/Users/daniel/git/plotter/specs/049-normalize-import-names/quickstart.md`

**Checkpoint**: Single-import normalization and reference mapping are independently functional.

---

## Phase 4: User Story 2 - Predictable import results (Priority: P2)

**Goal**: Re-imports reuse existing standardized names and avoid creating case-variant duplicates.

**Independent Test**: Run two imports with case-variant names and verify second import reuses existing names without creating duplicates.

### Implementation

- [ ] T016 [US2] Build existing-character lookup map keyed by normalized key for target story in `/Users/daniel/git/plotter/express/src/services/importOutlineService.ts`
- [ ] T017 [US2] Build existing-tag lookup map keyed by normalized key for target story in `/Users/daniel/git/plotter/express/src/services/importOutlineService.ts`
- [ ] T018 [US2] Update character creation flow to reuse existing records when normalized keys match in `/Users/daniel/git/plotter/express/src/services/importOutlineService.ts`
- [ ] T019 [US2] Update tag creation flow to reuse existing records when normalized keys match in `/Users/daniel/git/plotter/express/src/services/importOutlineService.ts`
- [ ] T020 [P] [US2] Ensure reused/created counters for normalization outcomes are computed for create mode in `/Users/daniel/git/plotter/express/src/services/importOutlineService.ts`
- [ ] T021 [US2] Manually validate re-import dedupe behavior and FR-005/SC-003 outcomes in `/Users/daniel/git/plotter/specs/049-normalize-import-names/quickstart.md`

**Checkpoint**: Re-import behavior is stable and does not create case-variant duplicates.

---

## Phase 5: User Story 3 - Visibility into normalization outcomes (Priority: P3)

**Goal**: Preview/create responses and UI clearly show which raw names were consolidated into canonical names.

**Independent Test**: Complete preview and create imports with case variants and verify normalization mappings plus counts are visible in API responses and import UI.

### Implementation

- [ ] T022 [US3] Add normalization report assembly (tags, characters, counts) to import result payload in `/Users/daniel/git/plotter/express/src/services/importOutlineService.ts`
- [ ] T023 [US3] Extend router response passthrough to include normalization payload consistently in preview/create responses in `/Users/daniel/git/plotter/express/src/routers/importRouter.ts`
- [ ] T024 [US3] Align backend normalization response shape with contract definitions in `/Users/daniel/git/plotter/specs/049-normalize-import-names/contracts/import-outline-normalization.md`
- [ ] T025 [US3] Render normalization summary blocks (canonical name, raw variants, counts, reused flag) in `/Users/daniel/git/plotter/web/src/components/dashboard/ImportOutlineModal.tsx`
- [ ] T026 [P] [US3] Update frontend import response adapters/selectors for normalization fields in `/Users/daniel/git/plotter/web/src/api/api.ts`
- [ ] T027 [US3] Manually validate FR-007 and SC-004 feedback visibility scenarios in `/Users/daniel/git/plotter/specs/049-normalize-import-names/quickstart.md`

**Checkpoint**: Users can see and understand normalization consolidation outcomes end-to-end.

---

## Phase 6: Polish & Cross-Cutting Validation

**Purpose**: Verify regressions, quality gates, and documentation alignment across all stories.

- [ ] T028 [P] Run backend build/type validation and fix regressions in `/Users/daniel/git/plotter/express/`
- [ ] T029 [P] Run frontend build/type validation and fix regressions in `/Users/daniel/git/plotter/web/`
- [ ] T030 Validate legacy and modern mode regression scenarios (including no-tags/no-characters imports) in `/Users/daniel/git/plotter/specs/049-normalize-import-names/quickstart.md`
- [ ] T031 Validate success criteria SC-001 through SC-004 against implemented behavior in `/Users/daniel/git/plotter/specs/049-normalize-import-names/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 -> no dependencies, start immediately.
- Phase 2 -> depends on Phase 1, blocks all user stories.
- Phase 3 (US1) -> depends on Phase 2 and delivers MVP normalization behavior.
- Phase 4 (US2) -> depends on Phase 2 and builds on US1 creation/mapping behavior.
- Phase 5 (US3) -> depends on Phase 2 and uses outcomes from US1/US2 for reporting.
- Phase 6 -> runs after all targeted user stories are complete.

### User Story Dependencies

- US1 (P1): no dependency on other stories after Phase 2.
- US2 (P2): depends on foundational normalization and US1 consolidation flow.
- US3 (P3): depends on normalization data generated by US1/US2 and response contracts.

### Parallel Opportunities

- Setup: T003 and T004 can run in parallel.
- US2: T020 can run in parallel with T018/T019 once lookup maps are available.
- US3: T026 can run in parallel with UI work in T025 after response shape is finalized.
- Polish: T028 and T029 can run in parallel.

---

## Parallel Example: User Story 1

```bash
Task: "Apply normalized-key grouping for imported character tokens in /Users/daniel/git/plotter/express/src/services/importOutlineService.ts"
Task: "Apply normalized-key grouping for imported tag tokens in /Users/daniel/git/plotter/express/src/services/importOutlineService.ts"
```

## Parallel Example: User Story 2

```bash
Task: "Build existing-character lookup map in /Users/daniel/git/plotter/express/src/services/importOutlineService.ts"
Task: "Build existing-tag lookup map in /Users/daniel/git/plotter/express/src/services/importOutlineService.ts"
```

## Parallel Example: User Story 3

```bash
Task: "Render normalization summary blocks in /Users/daniel/git/plotter/web/src/components/dashboard/ImportOutlineModal.tsx"
Task: "Update frontend response adapters for normalization fields in /Users/daniel/git/plotter/web/src/api/api.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate US1 independently using quickstart scenarios.
4. Demo/import with case-variant sample document before expanding scope.

### Incremental Delivery

1. Deliver US1 normalization and consolidation mapping.
2. Add US2 existing-record reuse for predictable repeat imports.
3. Add US3 user-visible normalization reporting in API + UI.
4. Finish with Phase 6 cross-cutting build/regression validation.
