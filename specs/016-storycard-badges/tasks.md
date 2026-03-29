# Tasks: Story Card Count Badges

**Input**: Design documents from `/specs/016-storycard-badges/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested for this feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution**: Ensure routes stay thin, services compose workflow, and MongoDB queries live in models.

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Confirm story stats contract coverage in specs/016-storycard-badges/contracts/story-stats.md

---

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T002 [P] Add count helper for characters in express/src/models/characters.ts
- [x] T003 [P] Add count helper for tags in express/src/models/tags.ts

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - See full story counts at a glance (Priority: P1)

**Goal**: Provide character and tag counts in story stats and show badges on each story card.

**Independent Test**: Load the dashboard with seeded data and verify plots, scenes, characters, and tags badges display correct counts (including zero).

### Implementation

- [x] T004 [US1] Expand `StoryStats` and `getStoryStats` to include character/tag counts in express/src/services/storyService.ts (depends on T002, T003)
- [x] T005 [US1] Update story responses to return expanded stats in express/src/routers/storyRouter.ts
- [x] T006 [P] [US1] Extend StoryStats type in web/src/api/types.ts
- [x] T007 [US1] Render characters and tags badges in web/src/components/dashboard/StoryCard.tsx

**Checkpoint**: Story cards display four badges with accurate counts.

---

## Phase 4: User Story 2 - Compare story scope across the grid (Priority: P2)

**Goal**: Ensure story cards present consistent, scannable stats across the grid.

**Independent Test**: Load a dashboard grid with multiple stories and verify consistent badge ordering and layout.

### Implementation

- [x] T008 [US2] Ensure badge ordering and layout remain consistent across story cards in web/src/components/dashboard/StoryCard.tsx

**Checkpoint**: All story cards show badges in the same order and layout.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T009 Validate quickstart steps in specs/016-storycard-badges/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion.
- **User Stories (Phase 3+)**: Depend on Foundational completion.
- **Polish (Phase 5)**: Depends on desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 tasks.
- **US2 (P2)**: Depends on US1 completion.

### Parallel Opportunities

- T002 and T003 can run in parallel (different model files).
- T006 can run in parallel with backend changes (separate frontend type file).

---

## Parallel Example: User Story 1

```bash
Task: "Add count helper for characters in express/src/models/characters.ts"
Task: "Add count helper for tags in express/src/models/tags.ts"
Task: "Extend StoryStats type in web/src/api/types.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate story cards show four badges with accurate counts

### Incremental Delivery

1. Deliver US1 for expanded stats + badges
2. Deliver US2 for layout consistency validation
3. Complete polish checklist
