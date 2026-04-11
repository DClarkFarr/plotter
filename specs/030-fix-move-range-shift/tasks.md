# Tasks: Fix Move Range Shift Logic

**Input**: Design documents from `/specs/030-fix-move-range-shift/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested. Skip automated tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Review existing move/shift utilities in express/src/utils/plotGridUtils.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T002 Identify all `getMoveRangeShift` call sites and expected inputs in express/src/services/sceneService.ts and express/src/services/sectionService.ts

---

## Phase 3: User Story 1 - Move Items Without Unintended Shifts (Priority: P1) 🎯 MVP

**Goal**: Same-plot, same-row moves produce no shift plan.

**Independent Test**: Move a scene or section to the same row in the same plot and confirm no grid shifts are applied.

### Implementation

- [x] T003 [US1] Implement same-plot + same-index early return (null) in express/src/utils/plotGridUtils.ts
- [x] T004 [US1] Update `getMoveRangeShift` usage to new props-based signature in express/src/services/sceneService.ts and express/src/services/sectionService.ts

---

## Phase 4: User Story 2 - Move Items Across Plots at the Same Row (Priority: P2)

**Goal**: Cross-plot, same-row moves shift only when the target row is occupied.

**Independent Test**: Move a scene from plot A row N to plot B row N and verify shift occurs only when occupied.

### Implementation

- [x] T005 [US2] Add same-row cross-plot occupancy checks and shift plan (down by 1 from target index) in express/src/utils/plotGridUtils.ts

---

## Phase 5: User Story 3 - Move Items Across Rows (Priority: P3)

**Goal**: Adjacent and multi-row moves shift only the required range based on row occupancy.

**Independent Test**: Move items across adjacent and multi-row indices and confirm bounded shifts follow occupancy rules.

### Implementation

- [x] T006 [US3] Implement source-row emptiness checks by resource type in express/src/utils/plotGridUtils.ts
- [x] T007 [US3] Implement adjacent and multi-row range shift calculation in express/src/utils/plotGridUtils.ts

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T008 Run quickstart validation steps in specs/030-fix-move-range-shift/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Phase 6)**: Depends on desired user stories completion

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies beyond Phase 2
- **User Story 2 (P2)**: Can start after Phase 2 and after T003 completes
- **User Story 3 (P3)**: Can start after Phase 2 and after T006 completes

### Parallel Opportunities

- T003 and T004 can run in parallel after T002
- T006 and T007 can run in parallel after T005 (if split by file sections)

---

## Parallel Example: User Story 1

```bash
Task: "Implement same-plot + same-index early return (null) in express/src/utils/plotGridUtils.ts"
Task: "Update getMoveRangeShift usage to new props-based signature in express/src/services/sceneService.ts and express/src/services/sectionService.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Manually verify same-row moves do not shift

### Incremental Delivery

1. Complete Setup + Foundational
2. Add User Story 1 → validate
3. Add User Story 2 → validate
4. Add User Story 3 → validate
5. Run quickstart validation
