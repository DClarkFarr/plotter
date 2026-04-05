---
description: "Task list for create tag form reuse"
---

# Tasks: Create Tag Form Reuse

**Input**: Design documents from `/specs/020-tag-create-form/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested. Manual verification only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution**: Include tasks for input validation, error handling, and performance targets where relevant.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align on existing create-tag behavior and data flow

- [x] T001 Review create-tag flow in web/src/components/story/SceneTagsModal.tsx to mirror behavior in shared form
- [x] T002 Review create-tag mutation signature in web/src/queries/tag/tag-mutation.ts for reuse in both views

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared create-tag form component used by all stories

- [x] T003 Create shared create-tag form in web/src/components/story/CreateTagForm.tsx (name, color, submit, Enter key)
- [x] T004 Add validation and error feedback for empty names in web/src/components/story/CreateTagForm.tsx

**Checkpoint**: Shared form component ready for integration

---

## Phase 3: User Story 1 - Create a Tag While Managing (Priority: P1) 🎯 MVP

**Goal**: Allow tag creation from the tag management view using the shared form

**Independent Test**: Create a tag from the management view and confirm it appears in the tag list

### Implementation for User Story 1

- [x] T005 [US1] Add create-tag mutation wiring in web/src/components/story/ManageTagsPanel.tsx
- [x] T006 [US1] Render CreateTagForm in web/src/components/story/ManageTagsPanel.tsx and connect submit + loading state

**Checkpoint**: Tag creation works in ManageTagsPanel

---

## Phase 4: User Story 2 - Create a Tag While Assigning (Priority: P2)

**Goal**: Reuse the shared form in the scene tagging modal

**Independent Test**: Create a tag from the scene tagging modal and confirm it is selectable

### Implementation for User Story 2

- [x] T007 [US2] Replace inline create-tag UI with CreateTagForm in web/src/components/story/SceneTagsModal.tsx
- [x] T008 [US2] Connect CreateTagForm submit + loading state to existing callbacks in web/src/components/story/SceneTagsModal.tsx

**Checkpoint**: Tag creation works in SceneTagsModal with shared form

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, consistency, and manual validation

- [x] T009 [P] Remove unused imports and ensure shared form consistency in web/src/components/story/ManageTagsPanel.tsx
- [x] T010 [P] Remove unused imports and ensure shared form consistency in web/src/components/story/SceneTagsModal.tsx
- [ ] T011 Run quickstart checks in specs/020-tag-create-form/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational phase completion
- **Polish (Phase 5)**: Depends on both user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - no dependency on US2
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - no dependency on US1

### Parallel Opportunities

- After Phase 2, US1 and US2 tasks can proceed in parallel
- Polish tasks T009 and T010 can run in parallel

---

## Parallel Example: User Story 1

```bash
Task: "Add create-tag mutation wiring in web/src/components/story/ManageTagsPanel.tsx"
Task: "Render CreateTagForm in web/src/components/story/ManageTagsPanel.tsx and connect submit + loading state"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Create a tag from the management view

### Incremental Delivery

1. Complete Setup + Foundational
2. Add User Story 1 → Validate independently
3. Add User Story 2 → Validate independently
4. Run quickstart validation
