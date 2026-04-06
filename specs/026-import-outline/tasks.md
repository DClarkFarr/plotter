---
description: "Task list for import outline modal"
---

# Tasks: Import Outline Modal

**Input**: Design documents from `/specs/026-import-outline/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested for this feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution**: Include tasks for input validation, error handling, and performance targets where relevant.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Shared scaffolding used by all user stories

- [x] T001 Create ImportOutlineModal scaffold in web/src/components/dashboard/ImportOutlineModal.tsx
- [x] T002 [P] Add import modal open/close state in web/src/store/dashboardStore.ts
- [x] T003 [P] Add import outline request/response types in web/src/api/types.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core API wiring needed for the upload flow

- [x] T004 [P] Add import outline service stub in express/src/services/importOutlineService.ts
- [x] T005 Add POST /api/imports/outline route with multer validation in express/src/routers/importRouter.ts
- [x] T006 [P] Add import outline API client (multipart) in web/src/api/stories.ts
- [x] T007 Add import outline mutation in web/src/queries/story/story-mutations.ts

---

## Phase 3: User Story 1 - Start an outline import (Priority: P1) 🎯 MVP

**Goal**: User can open and close the import modal from the dashboard.

**Independent Test**: From the dashboard, click the import button to open the modal and close it without changes.

### Implementation for User Story 1

- [x] T008 [US1] Add import button near create story in web/src/pages/dashboard.tsx
- [x] T009 [US1] Render ImportOutlineModal with open/close wiring in web/src/pages/dashboard.tsx

**Checkpoint**: Modal opens and closes from dashboard without errors.

---

## Phase 4: User Story 2 - Understand document formatting rules (Priority: P2)

**Goal**: Modal shows clear .docx formatting instructions.

**Independent Test**: Open the modal and confirm the instructions are visible and readable.

### Implementation for User Story 2

- [x] T010 [US2] Add heading and indentation mapping guidance in web/src/components/dashboard/ImportOutlineModal.tsx
- [x] T011 [US2] Add POV and tag syntax examples in web/src/components/dashboard/ImportOutlineModal.tsx

**Checkpoint**: Instruction copy is complete and matches the spec requirements.

---

## Phase 5: User Story 3 - Preview and approve an import (Priority: P3)

**Goal**: User can upload a .docx file, see a preview placeholder, and proceed to approval.

**Independent Test**: Upload a .docx file, see the TODO summary, and toggle between preview and approval actions.

### Implementation for User Story 3

- [x] T012 [US3] Add upload form UI and client-side file checks in web/src/components/dashboard/ImportOutlineModal.tsx
- [x] T013 [US3] Wire upload to import outline mutation with mode=preview in web/src/components/dashboard/ImportOutlineModal.tsx
- [x] T014 [US3] Display TODO preview summary and approve/cancel controls in web/src/components/dashboard/ImportOutlineModal.tsx

**Checkpoint**: Upload completes and preview mode displays the TODO summary without creating data.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [ ] T015 [P] Validate quickstart flow in specs/026-import-outline/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Stories (Phase 3+)**: Depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 1
- **User Story 2 (P2)**: Depends on Phase 1
- **User Story 3 (P3)**: Depends on Phase 2 and Phase 1

### Parallel Opportunities

- T002 and T003 can run in parallel during Setup.
- T004 and T006 can run in parallel across backend/frontend scaffolding.

---

## Parallel Example: User Story 3

```bash
Task: "Add import outline service stub in express/src/services/importOutlineService.ts"
Task: "Add import outline API client (multipart) in web/src/api/stories.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 3: User Story 1
3. Validate modal open/close flow

### Incremental Delivery

1. Setup + Foundational
2. User Story 1 → Validate
3. User Story 2 → Validate instructions
4. User Story 3 → Validate upload + preview

---

## Notes

- [P] tasks = different files, no dependencies
- Each user story should be independently completable and testable
- Keep preview responses as TODO placeholders until parser work begins
