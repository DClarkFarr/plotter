# Tasks: Tag Variant Management

**Input**: Design documents from `/specs/013-tag-variant-management/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested.

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Create tag row component scaffold in web/src/components/story/SceneTagRow.tsx

---

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T002 [P] Add tag variant selection fields to Scene types in web/src/api/types.ts
- [x] T003 [P] Extend scene model for tagVariants and usage queries in express/src/models/scenes.ts
- [x] T004 Add tagVariants validation in express/src/services/sceneService.ts
- [x] T005 Add tagVariants parsing/response mapping in express/src/routers/sceneRouter.ts and express/src/routers/storyRouter.ts
- [x] T006 Update scene API payload handling for tagVariants in web/src/api/stories.ts and web/src/queries/scene/scene-mutations.ts

**Checkpoint**: Scene data supports tag variant selections end-to-end.

---

## Phase 3: User Story 1 - Convert a tag into a variant (Priority: P1) 🎯 MVP

**Goal**: Allow a non-variant tag to become a variant and update the row state immediately.

**Independent Test**: Convert a non-variant tag and confirm the row switches to variant mode without refresh.

### Implementation

- [x] T007 [P] Implement tag update service and validation in express/src/services/tagService.ts
- [x] T008 Add tag update route in express/src/routers/storyRouter.ts
- [x] T009 [P] Add updateTag API + mutation in web/src/api/stories.ts and web/src/queries/tag/tag-mutation.ts
- [x] T010 Update SceneTagsModal to use SceneTagRow and trigger variant conversion in web/src/components/story/SceneTagsModal.tsx and web/src/components/story/SceneTagRow.tsx

**Checkpoint**: Tag conversion to variant works and updates UI state immediately.

---

## Phase 4: User Story 2 - Expand a variant tag to manage variants (Priority: P2)

**Goal**: Expand/collapse a variant tag row and select a variant for the scene.

**Independent Test**: Expand a variant tag row, select a variant, collapse, and see the selected variant badge.

### Implementation

- [x] T011 Update selected tag prop shape and selection logic in web/src/components/story/SceneTagsModal.tsx
- [x] T012 Update SceneForm to pass selected tags with variants and persist tagVariants in web/src/components/story/SceneForm.tsx
- [x] T013 Update SceneTags summary and collapsed-row badge in web/src/components/story/SceneTags.tsx and web/src/components/story/SceneTagRow.tsx
- [x] T014 Implement expandable variant list inside the tag row with auto-expand on check in web/src/components/story/SceneTagRow.tsx

**Checkpoint**: Variant rows expand/collapse, selected variants persist, and collapsed rows show the selected variant badge.

---

## Phase 5: User Story 3 - Add and remove variants (Priority: P3)

**Goal**: Add new variants and remove existing variants with in-use protection.

**Independent Test**: Add a variant, delete an unused variant, and verify deletion is blocked for in-use variants.

### Implementation

- [x] T015 Implement add/delete variant services with in-use validation in express/src/services/tagService.ts and express/src/models/scenes.ts
- [x] T016 Add variant management routes in express/src/routers/storyRouter.ts
- [x] T017 Add add/delete variant API + mutations in web/src/api/stories.ts and web/src/queries/tag/tag-mutation.ts
- [x] T018 Wire add/delete variant UI actions and error handling in web/src/components/story/SceneTagRow.tsx and web/src/components/story/SceneTagsModal.tsx

**Checkpoint**: Variant lifecycle operations work and enforce in-use protection.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T019 Run quickstart validation steps in specs/013-tag-variant-management/quickstart.md

---

## Dependencies & Execution Order

- **Phase 1** → **Phase 2** → **Phase 3 (US1)** → **Phase 4 (US2)** → **Phase 5 (US3)** → **Phase 6**
- US2 depends on tagVariants support from Phase 2.
- US3 depends on tag variant endpoints and scene variant usage checks from Phase 2.

## Parallel Execution Examples

### User Story 1

- T007 (service) and T009 (web mutation) can run in parallel.

### Foundational

- T002 and T003 can run in parallel.

## Implementation Strategy

- MVP scope: Phase 1 + Phase 2 + User Story 1 (tag conversion only).
- Then deliver User Story 2 (expand/select) followed by User Story 3 (variant lifecycle).
