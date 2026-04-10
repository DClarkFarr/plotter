# Tasks: Sections Collection

**Input**: Design documents from `/specs/028-sections-collection/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/sections-api.md

**Tests**: Not requested (manual validation only).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Create section query scaffolds in web/src/queries/section/section-queries.ts and web/src/queries/section/section-mutations.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T002 Add sections collection constant in express/src/models/collections.ts
- [x] T003 Create section model + indexes in express/src/models/sections.ts
- [x] T004 Add Section types + response envelopes in web/src/api/types.ts

---

## Phase 3: User Story 1 - Define sections for a story (Priority: P1) 🎯 MVP

**Goal**: Create and list sections for a story with required fields and story linkage.

**Independent Test**: Create a story section via API and list sections for the story to confirm linkage.

### Implementation

- [x] T005 [US1] Implement section create/list service logic in express/src/services/sectionService.ts
- [x] T006 [US1] Add GET/POST section routes in express/src/routers/sectionRouter.ts
- [x] T007 [US1] Register section router in express/src/routers/apiRouter.ts
- [x] T008 [US1] Add list/create section HTTP methods in web/src/api/stories.ts
- [x] T009 [US1] Implement section queries/mutations with cache updates in web/src/queries/section/section-queries.ts and web/src/queries/section/section-mutations.ts

---

## Phase 4: User Story 2 - Order sections within a story (Priority: P2)

**Goal**: Preserve ordering and grid alignment when inserting sections on occupied vertical indices.

**Independent Test**: Create sections at occupied and unoccupied indices; verify scenes and sections shift as specified.

### Implementation

- [x] T010 [US2] Add section ordering helpers in web/src/queries/section/section-helpers.ts
- [x] T011 [US2] Update grid shift logic to include sections in express/src/services/sceneService.ts
- [x] T012 [US2] Shift scenes + sections on section insert/update in express/src/services/sectionService.ts
- [x] T013 [US2] Return shifted sections in move-within-plot response in express/src/routers/sceneRouter.ts
- [x] T014 [US2] Update client grid shift logic to include sections in web/src/queries/scene/scene-mutations.ts
- [x] T015 [US2] Load sections for the story grid in web/src/pages/story.tsx

---

## Phase 5: User Story 3 - Differentiate section types (Priority: P3)

**Goal**: Allow sections to be typed as act or section and update type values.

**Independent Test**: Create and update sections with both types and verify stored type values.

### Implementation

- [x] T016 [US3] Add PATCH section endpoint in express/src/routers/sectionRouter.ts
- [x] T017 [US3] Add update section HTTP method + mutation in web/src/api/stories.ts and web/src/queries/section/section-mutations.ts
- [x] T018 [US3] Enforce section type validation on updates in express/src/services/sectionService.ts

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T019 Update quickstart validation notes in specs/028-sections-collection/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** → **Foundational (Phase 2)** → **User Stories (Phase 3-5)** → **Polish (Phase 6)**

### User Story Dependencies

- **US1 (P1)** depends on Phase 2 only.
- **US2 (P2)** depends on US1 (sections created) and Phase 2.
- **US3 (P3)** depends on US1 (sections created) and Phase 2.

### Parallel Opportunities

- T002, T003, T004 can run in parallel after T001.
- T008 and T009 can run in parallel once T004 is done.
- T010 and T011 can run in parallel after US1 endpoints exist.

---

## Parallel Example: User Story 1

```bash
Task: "Add list/create section HTTP methods in web/src/api/stories.ts"
Task: "Implement section queries/mutations with cache updates in web/src/queries/section/section-queries.ts and web/src/queries/section/section-mutations.ts"
```

---

## Parallel Example: User Story 2

```bash
Task: "Add section ordering helpers in web/src/queries/section/section-helpers.ts"
Task: "Update grid shift logic to include sections in express/src/services/sceneService.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2
2. Complete Phase 3 (US1)
3. Validate create/list flow via API

### Incremental Delivery

1. Add US2 grid shift behavior and validate ordering
2. Add US3 type updates and validate edit flow
3. Finish polish updates in quickstart.md
