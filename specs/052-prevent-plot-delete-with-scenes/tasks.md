# Tasks: Prevent Plot Deletion When Scenes Exist

**Input**: Design documents from `/specs/052-prevent-plot-delete-with-scenes/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Not explicitly requested in the spec; no dedicated test-file tasks included.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align shared backend/frontend error contract assumptions before story work.

- [x] T001 [P] Add blocked-delete API error payload typing support in web/src/api/types.ts
- [x] T002 [P] Add a canonical blocked-delete reason/message constant in express/src/services/plotService.ts
- [x] T003 Align delete-plot route conflict response payload fields in express/src/routers/storyRouter.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish deletion reason plumbing used by both UI and endpoint behavior.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [x] T004 Extend DeletePlotForStoryResult with a blocked reason (`plot-has-scenes`) in express/src/services/plotService.ts
- [x] T005 Add a scene-usage lookup step for the source plot before merge target resolution in express/src/services/plotService.ts
- [x] T006 Map `plot-has-scenes` to HTTP 409 with a clear message in express/src/routers/storyRouter.ts

**Checkpoint**: Shared blocked-delete reason and response contract are ready for story implementation.

---

## Phase 3: User Story 1 - Prevent Deleting In-Use Plots (Priority: P1) 🎯 MVP

**Goal**: Users can see deletion is blocked for plots that still contain scenes.

**Independent Test**: Open delete modal for a plot with scenes and confirm explanatory copy is shown and destructive action is unavailable.

### Implementation for User Story 1

- [x] T007 [US1] Derive selected-plot scene usage from story scene query data in web/src/components/story/PlotForm.tsx
- [x] T008 [US1] Disable danger-zone delete action for in-use plots in web/src/components/story/PlotForm.tsx
- [x] T009 [US1] Disable modal confirmation action for in-use plots in web/src/components/story/PlotForm.tsx
- [x] T010 [US1] Update blocked-delete explanatory copy in danger zone and modal in web/src/components/story/PlotForm.tsx
- [x] T011 [US1] Preserve dismiss/cancel behavior with no side effects for blocked delete state in web/src/components/story/PlotForm.tsx

**Checkpoint**: In-use plots are visibly non-deletable in the modal flow.

---

## Phase 4: User Story 3 - Enforce the Rule Server-Side (Priority: P1)

**Goal**: Endpoint rejects delete requests for plots with scenes before merge logic executes.

**Independent Test**: Submit delete request for a plot with scenes and verify a conflict response with a clear message; verify plot and scenes remain unchanged.

### Implementation for User Story 3

- [x] T012 [US3] Add early `plot-has-scenes` return before `getSecondaryPlot` and `combineScenes` in express/src/services/plotService.ts
- [x] T013 [US3] Ensure blocked requests do not call delete/shift operations in express/src/services/plotService.ts
- [x] T014 [US3] Keep existing merge-and-delete path unchanged for zero-scene plots in express/src/services/plotService.ts
- [x] T015 [P] [US3] Return conflict error message for blocked deletes in express/src/routers/storyRouter.ts
- [x] T016 [US3] Keep existing not-found and cannot-delete-last-plot mappings intact in express/src/routers/storyRouter.ts

**Checkpoint**: Backend enforces non-deletable in-use plots regardless of client behavior.

---

## Phase 5: User Story 2 - Delete Empty Plots Safely (Priority: P2)

**Goal**: Empty plots remain deletable and existing successful delete UX continues to work.

**Independent Test**: Open delete modal for an empty plot, confirm delete is enabled, delete succeeds, and sidebar closes with updated plot/scenes data.

### Implementation for User Story 2

- [x] T017 [US2] Show merge-to-adjacent explanatory text only for deletable empty-plot state in web/src/components/story/PlotForm.tsx
- [x] T018 [US2] Keep delete confirmation enabled for empty plots when not pending and not last active plot in web/src/components/story/PlotForm.tsx
- [x] T019 [US2] Confirm blocked 409 responses rollback optimistic plot changes correctly in web/src/queries/plot/plot-mutations.ts
- [x] T020 [US2] Preserve success invalidation behavior for plot and scene queries after valid deletes in web/src/queries/plot/plot-mutations.ts

**Checkpoint**: Empty-plot delete path remains functional while blocked path is safely denied.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final alignment and feature-level validation artifacts.

- [ ] T021 [P] Add manual verification checklist items for blocked vs allowed plot deletion in specs/052-prevent-plot-delete-with-scenes/checklists/requirements.md
- [ ] T022 Record final validation outcomes for modal behavior and endpoint responses in specs/052-prevent-plot-delete-with-scenes/checklists/requirements.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately.
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories.
- **User Story Phases (Phase 3-5)**: Depend on Foundational completion.
- **Polish (Phase 6)**: Depends on completion of targeted user stories.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational; independent from server merge internals.
- **User Story 3 (P1)**: Starts after Foundational; can run in parallel with User Story 1.
- **User Story 2 (P2)**: Starts after Foundational; should be validated after User Story 3 enforcement to confirm allowed-delete path remains intact.

### Within Each User Story

- Compute eligibility state before updating modal/button behavior.
- Apply service guard before route mapping checks.
- Preserve existing successful behavior after introducing blocked-path handling.

### Parallel Opportunities

- **Setup**: T001 and T002 can run in parallel.
- **User Story 3**: T015 can proceed in parallel with T012-T014 once the blocked reason value is established.
- **Polish**: T021 can run in parallel with final code validation.

---

## Parallel Example: User Story 1

```bash
# Limited parallelism: US1 is concentrated in one file.
Task: "Derive selected-plot scene usage in web/src/components/story/PlotForm.tsx"
Task: "Draft blocked-delete copy updates in web/src/components/story/PlotForm.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Add early guard in express/src/services/plotService.ts"
Task: "Map plot-has-scenes to 409 response in express/src/routers/storyRouter.ts"
```

## Parallel Example: User Story 2

```bash
Task: "Update empty-plot modal copy and enablement in web/src/components/story/PlotForm.tsx"
Task: "Verify optimistic rollback/invalidation behavior in web/src/queries/plot/plot-mutations.ts"
```

---

## Implementation Strategy

### MVP First (US1 + US3)

1. Complete Phase 1 and Phase 2.
2. Implement User Story 1 (UI prevention clarity).
3. Implement User Story 3 (server enforcement).
4. Validate blocked deletes end-to-end before moving on.

### Incremental Delivery

1. Deliver blocked delete behavior (US1 + US3).
2. Validate and preserve allowed empty-plot delete behavior (US2).
3. Complete polish checklist and finalize.

### Parallel Team Strategy

1. Developer A: `web/src/components/story/PlotForm.tsx` (US1/US2 UI behavior).
2. Developer B: `express/src/services/plotService.ts` (US3 guard placement).
3. Developer C: `express/src/routers/storyRouter.ts` + `web/src/queries/plot/plot-mutations.ts` (error mapping + mutation resilience).
