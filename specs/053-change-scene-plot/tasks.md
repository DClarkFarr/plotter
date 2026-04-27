# Tasks: Change Scene Plot Without Dragging

**Input**: Design documents from `/specs/053-change-scene-plot/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No explicit automated-test requirement in the feature spec; this task list focuses on implementation and manual validation.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align existing move endpoint and UI dependencies for both non-drag entry points.

- [ ] T001 [P] Confirm contract alignment for non-drag plot changes in specs/053-change-scene-plot/contracts/scene-plot-change.md
- [ ] T002 [P] Confirm quickstart validation scenarios in specs/053-change-scene-plot/quickstart.md map to current story grid behavior
- [ ] T003 Audit current scene move call sites in web/src/queries/scene/scene-mutations.ts and web/src/api/stories.ts for reuse constraints

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish one shared mutation pathway and shift semantics before UI entry-point work.

**⚠️ CRITICAL**: No user story implementation should begin until this phase is complete.

- [ ] T004 Ensure a single reusable scene plot-change mutation path exists in web/src/queries/scene/scene-mutations.ts
- [ ] T005 Ensure optimistic shift calculation uses `getMoveRangeShift` consistently for plot changes in web/src/queries/scene/scene-mutations.ts and web/src/queries/story/shift-logic.ts
- [ ] T006 Ensure success reconciliation always applies `shiftedResources` and moved scene payload in web/src/queries/scene/scene-mutations.ts and web/src/queries/story/shifted-resources.ts
- [ ] T007 Verify move-within-plot request/response typing consistency in web/src/api/stories.ts and web/src/api/types.ts
- [ ] T008 Verify backend move contract still enforces destination occupancy/shift behavior in express/src/services/sceneService.ts and express/src/routers/sceneRouter.ts

**Checkpoint**: Shared mutation and shift semantics are stable for all UI entry points.

---

## Phase 3: User Story 1 - Change Plot From Scene Actions (Priority: P1) 🎯 MVP

**Goal**: Users can change a scene's plot directly from scene action controls without dragging.

**Independent Test**: From scene actions, select Change Plot and move a scene to a different plot; confirm immediate optimistic move and persisted final state.

### Implementation for User Story 1

- [ ] T009 [US1] Add `Change Plot` action trigger in web/src/components/plot/SceneRenderer/SceneCard.tsx
- [ ] T010 [US1] Implement plot list/dropdown UI with current-plot exclusion in web/src/components/plot/SceneRenderer/SceneCard.tsx
- [ ] T011 [US1] Wire scene-action selection to shared move mutation in web/src/components/plot/SceneRenderer/SceneCard.tsx and web/src/queries/scene/scene-mutations.ts
- [ ] T012 [US1] Ensure action interaction remains accessible (hover/focus/keyboard) in web/src/components/plot/SceneRenderer/SceneCard.tsx
- [ ] T013 [US1] Keep action-card layout stable while adding change-plot affordance in web/src/components/plot/SceneRenderer/SceneActionsCard.tsx

**Checkpoint**: Scene-action-driven plot change is functional and independently testable.

---

## Phase 4: User Story 2 - Change Plot From Scene Form (Priority: P2)

**Goal**: Users can change a scene's plot from a selector above the scene title in the sidebar form.

**Independent Test**: Open SceneForm, change plot via new selector above title, and verify optimistic + persisted move.

### Implementation for User Story 2

- [ ] T014 [US2] Add plot selector section above title in web/src/components/story/SceneForm.tsx
- [ ] T015 [US2] Reuse selector interaction pattern to keep SceneForm UX consistent (reference web/src/components/story/ScenePovSelect.tsx, implement in web/src/components/story/SceneForm.tsx)
- [ ] T016 [US2] Connect SceneForm plot selection to shared move mutation in web/src/components/story/SceneForm.tsx and web/src/queries/scene/scene-mutations.ts
- [ ] T017 [US2] Prevent no-op submission when selected plot equals current plot in web/src/components/story/SceneForm.tsx
- [ ] T018 [US2] Preserve existing SceneForm edit behaviors (title/description/tags/todo/snippets) while adding plot selector in web/src/components/story/SceneForm.tsx

**Checkpoint**: Scene-form-driven plot change is functional and independently testable.

---

## Phase 5: User Story 3 - Preserve Grid Ordering During Target Collisions (Priority: P3)

**Goal**: Occupied target rows shift downward at the target index, and optimistic behavior mirrors server outcomes.

**Independent Test**: Move a scene to a plot where the same verticalIndex is occupied and verify downward shift from that index with no scene loss and no post-response divergence.

### Implementation for User Story 3

- [ ] T019 [US3] Enforce and document destination-collision downward shift semantics in express/src/services/sceneService.ts
- [ ] T020 [US3] Ensure router response always returns moved scene + shifted resources as available in express/src/routers/sceneRouter.ts
- [ ] T021 [US3] Align optimistic collision-shift behavior with server semantics for occupied target rows in web/src/queries/scene/scene-mutations.ts and web/src/queries/story/shift-logic.ts
- [ ] T022 [US3] Ensure rollback restores pre-move scene/section cache snapshot on mutation error in web/src/queries/scene/scene-mutations.ts
- [ ] T023 [US3] Reconcile final state from server payload to avoid optimistic drift in web/src/queries/scene/scene-mutations.ts and web/src/queries/story/shifted-resources.ts

**Checkpoint**: Collision shifts are deterministic, preserve ordering, and optimistic state mirrors server results.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency checks and manual validation coverage.

- [ ] T024 [P] Run manual validation checklist in specs/053-change-scene-plot/quickstart.md and record outcomes in specs/053-change-scene-plot/checklists/requirements.md
- [ ] T025 Verify non-drag and drag scene moves remain behaviorally consistent in web/src/components/plot/PlotGrid.tsx and web/src/queries/scene/scene-mutations.ts
- [ ] T026 [P] Update contract notes if implementation details changed in specs/053-change-scene-plot/contracts/scene-plot-change.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies; start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all user story work.
- **Phase 3-5 (User Stories)**: Depend on Phase 2 completion.
- **Phase 6 (Polish)**: Depends on completion of target user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational; no dependency on US2/US3 implementation.
- **US2 (P2)**: Starts after Foundational; can proceed in parallel with US1 once shared mutation path is stable.
- **US3 (P3)**: Starts after Foundational and should be validated against both US1 and US2 entry points.

### Within Each User Story

- Wire UI triggers/selectors to shared mutation path before UX polish.
- Ensure optimistic shift and rollback behavior are complete before final reconciliation checks.
- Validate independent test scenario before moving to next phase.

### Parallel Opportunities

- T001 and T002 can run in parallel.
- T007 and T008 can run in parallel after T004-T006 begin.
- US1 UI tasks T009-T010 can run in parallel with foundational review tasks on separate files.
- US3 tasks T019 and T021 can run in parallel across backend/frontend files.
- T024 and T026 can run in parallel during polish.

---

## Parallel Example: User Story 1

```bash
Task: "Add Change Plot action trigger in web/src/components/plot/SceneRenderer/SceneCard.tsx"
Task: "Keep action-card layout stable in web/src/components/plot/SceneRenderer/SceneActionsCard.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Confirm server collision shift semantics in express/src/services/sceneService.ts"
Task: "Align optimistic collision shift handling in web/src/queries/scene/scene-mutations.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1 and Phase 2.
2. Implement Phase 3 (US1).
3. Validate US1 independently from scene actions.

### Incremental Delivery

1. Deliver US1 scene-action flow.
2. Deliver US2 SceneForm selector flow.
3. Deliver US3 collision/optimistic parity hardening.
4. Execute polish and quickstart validation.

### Parallel Team Strategy

1. Developer A: Scene action + SceneForm UI work in web/src/components/plot/SceneRenderer/SceneCard.tsx and web/src/components/story/SceneForm.tsx.
2. Developer B: Shared mutation and optimistic logic in web/src/queries/scene/scene-mutations.ts and web/src/queries/story/shift-logic.ts.
3. Developer C: Backend move semantics verification in express/src/services/sceneService.ts and express/src/routers/sceneRouter.ts.
