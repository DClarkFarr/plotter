# Tasks: Import Tags Modal

**Input**: Design documents from `/specs/021-import-tags-modal/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/import-tags.md

**Tests**: Not requested (manual verification only)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution**: Include tasks for input validation, error handling, and performance targets where relevant.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Add import tag API types in web/src/api/types.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T002 [P] Add import tags API client in web/src/api/stories.ts
- [x] T003 [P] Add import tags mutation hook in web/src/queries/tag/tag-mutation.ts
- [x] T004 [P] Add tag alignment utility in web/src/utils/tagImportTable.ts
- [x] T005 Add tag import lookup helper in express/src/models/tags.ts
- [x] T006 Add tag import service in express/src/services/tagService.ts
- [x] T007 Add import tags endpoint + validation in express/src/routers/storyRouter.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Import tags from another story (Priority: P1) MVP

**Goal**: Provide the modal entry point, story list, and import action with loading and toasts.

**Independent Test**: Import at least one tag from another story and confirm it appears in the current story after the modal closes.

### Implementation for User Story 1

- [x] T008 [US1] Add "Import tags" button with tooltip + modal state in web/src/components/story/ManageTagsPanel.tsx
- [x] T009 [US1] Build import modal shell + story list view in web/src/components/story/ImportTagsModal.tsx
- [x] T010 [US1] Wire import mutation with loading + success/error toasts in web/src/components/story/ImportTagsModal.tsx
- [x] T011 [US1] Close modal and refresh current story tags on success in web/src/components/story/ImportTagsModal.tsx

**Checkpoint**: User Story 1 is fully functional and independently testable

---

## Phase 4: User Story 2 - Compare tags before importing (Priority: P2)

**Goal**: Show a two-column comparison table with aligned rows and de-emphasized duplicates.

**Independent Test**: Select a story that shares a tag name and confirm the matching tag is visually de-emphasized on the current-story column.

### Implementation for User Story 2

- [x] T012 [US2] Load source + current story tags in web/src/components/story/ImportTagsModal.tsx
- [x] T013 [US2] Render aligned two-column table using grouping utility in web/src/components/story/ImportTagsModal.tsx
- [x] T014 [US2] De-emphasize matching current-story tag rows in web/src/components/story/ImportTagsModal.tsx

**Checkpoint**: User Story 2 is independently functional

---

## Phase 5: User Story 3 - Select tags to import (Priority: P3)

**Goal**: Allow selection toggles on source tags and use selected tags for import.

**Independent Test**: Toggle selection on multiple rows and confirm only selected tags are submitted to the import request.

### Implementation for User Story 3

- [x] T015 [US3] Add selectable state + row click toggles in web/src/components/story/ImportTagsModal.tsx
- [x] T016 [US3] Apply selected styling and submit selected tag ids in web/src/components/story/ImportTagsModal.tsx

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T017 [P] Run the manual quickstart steps in specs/021-import-tags-modal/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 (UI reuse is optional)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2

### Parallel Opportunities

- T002, T003, T004 can run in parallel (frontend API/hook/util)
- User story phases can run in parallel after Foundational if staffed

---

## Parallel Example: User Story 2

```bash
Task: "Load source + current story tags in web/src/components/story/ImportTagsModal.tsx"
Task: "Render aligned two-column table using grouping utility in web/src/components/story/ImportTagsModal.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate User Story 1 independently

### Incremental Delivery

1. Complete Setup + Foundational
2. Add User Story 1 -> Test independently -> Demo
3. Add User Story 2 -> Test independently -> Demo
4. Add User Story 3 -> Test independently -> Demo
5. Run Polish steps
