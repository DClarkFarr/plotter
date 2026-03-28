---
description: "Tasks for query documentation refresh"
---

# Tasks: Query Documentation Refresh

**Input**: Design documents from [specs/012-update-query-structure/](specs/012-update-query-structure/)
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Not requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare a shared reference for the documentation update.

- [x] T001 Create tracking list of spec files to review in specs/012-update-query-structure/notes.md
- [x] T002 [P] Add a terminology reference block in specs/012-update-query-structure/notes.md for queries, mutations, and query keys

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared wording for consistent updates.

- [x] T003 Draft the standard pattern description in specs/012-update-query-structure/notes.md (per-model query directory and query key abstraction)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Trust the Documentation (Priority: P1) 🎯 MVP

**Goal**: Update all relevant specs to remove deprecated references and reflect the new query organization.

**Independent Test**: Scan updated specs to confirm the new pattern is described and deprecated references are removed.

### Implementation for User Story 1

- [x] T004 [P] [US1] Update query/mutation wording in specs/001-story-plotting-dashboard/spec.md
- [x] T005 [P] [US1] Update query/mutation wording in specs/002-database-structure/spec.md
- [x] T006 [P] [US1] Update query/mutation wording in specs/004-auth-router/spec.md
- [x] T007 [P] [US1] Update query/mutation wording in specs/005-web-pages-layout/spec.md
- [x] T008 [P] [US1] Update query/mutation wording in specs/006-dashboard-ui/spec.md
- [x] T009 [P] [US1] Update query/mutation wording in specs/007-story-page-data/spec.md
- [x] T010 [P] [US1] Update query/mutation wording in specs/008-plot-header-grid/spec.md
- [x] T011 [P] [US1] Update query/mutation wording in specs/009-plot-row-color/spec.md
- [x] T012 [P] [US1] Update query/mutation wording in specs/010-create-scene-flow/spec.md
- [x] T013 [P] [US1] Update query/mutation wording in specs/011-scene-pov/spec.md

**Checkpoint**: User Story 1 is complete when all updated specs reflect the new pattern and deprecated references are removed.

---

## Phase 4: User Story 2 - Consistent Terminology (Priority: P2)

**Goal**: Ensure consistent terms across all updated specs.

**Independent Test**: Compare updated sections and confirm consistent wording for queries, mutations, and query keys.

### Implementation for User Story 2

- [x] T014 [P] [US2] Normalize terminology across specs/001-story-plotting-dashboard/spec.md, specs/002-database-structure/spec.md, specs/004-auth-router/spec.md
- [x] T015 [P] [US2] Normalize terminology across specs/005-web-pages-layout/spec.md, specs/006-dashboard-ui/spec.md, specs/007-story-page-data/spec.md
- [x] T016 [P] [US2] Normalize terminology across specs/008-plot-header-grid/spec.md, specs/009-plot-row-color/spec.md, specs/010-create-scene-flow/spec.md, specs/011-scene-pov/spec.md

**Checkpoint**: User Story 2 is complete when terminology is consistent across all updated specs.

---

## Phase 5: User Story 3 - Clear Migration Path (Priority: P3)

**Goal**: Make sure updated sections include brief context for the new pattern when applicable.

**Independent Test**: Review updated sections and confirm they include a short rationale where the old reference was removed.

### Implementation for User Story 3

- [x] T017 [P] [US3] Add brief rationale sentences where needed in specs/001-story-plotting-dashboard/spec.md, specs/002-database-structure/spec.md, specs/004-auth-router/spec.md
- [x] T018 [P] [US3] Add brief rationale sentences where needed in specs/005-web-pages-layout/spec.md, specs/006-dashboard-ui/spec.md, specs/007-story-page-data/spec.md
- [x] T019 [P] [US3] Add brief rationale sentences where needed in specs/008-plot-header-grid/spec.md, specs/009-plot-row-color/spec.md, specs/010-create-scene-flow/spec.md, specs/011-scene-pov/spec.md

**Checkpoint**: User Story 3 is complete when updated sections include rationale where applicable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate completion and capture audit results.

- [x] T020 [P] Record final audit results in specs/012-update-query-structure/notes.md (deprecated reference search and list of updated files)
- [x] T021 Run quickstart validation steps and update specs/012-update-query-structure/quickstart.md if adjustments are needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - no dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - relies on US1 updates
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - relies on US1 updates

### Parallel Opportunities

- T004-T013 can run in parallel by different editors.
- T014-T016 can run in parallel once US1 updates are complete.
- T017-T019 can run in parallel after US1 updates, in coordination with US2 edits.

---

## Parallel Example: User Story 1

```bash
Task: "Update query/mutation wording in specs/001-story-plotting-dashboard/spec.md"
Task: "Update query/mutation wording in specs/002-database-structure/spec.md"
Task: "Update query/mutation wording in specs/004-auth-router/spec.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate by searching for deprecated references and confirming pattern descriptions

### Incremental Delivery

1. Complete Setup + Foundational
2. Deliver User Story 1 (MVP)
3. Deliver User Story 2 (consistency pass)
4. Deliver User Story 3 (rationale pass)
5. Finish with Polish validation
