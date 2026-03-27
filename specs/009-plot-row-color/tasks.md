# Tasks: Plot Row Color Sync

**Input**: Design documents from `/specs/009-plot-row-color/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested for this feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project orientation and scope validation

- [x] T001 Review SceneRenderer components and plot prop usage in web/src/components/plot/SceneRenderer/\*.tsx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared theming logic needed by all stories

- [x] T002 Create `usePlotTheme()` with color parsing, luminance, blending, and contrast logic in web/src/hooks/usePlotTheme.ts

**Checkpoint**: Theme hook ready for component integration

---

## Phase 3: User Story 1 - Consistent Row Background (Priority: P1) 🎯 MVP

**Goal**: Every element in a plot row shares a consistent background and text color derived from the plot color.

**Independent Test**: Render a row with mixed elements and confirm each uses the same softened background and text color.

### Implementation for User Story 1

- [x] T003 [P] [US1] Apply `usePlotTheme()` and CSS vars (`--plot-color`, `--plot-color-soft`, `--plot-text`) on PlotHeader container in web/src/components/plot/SceneRenderer/PlotHeader.tsx
- [x] T004 [P] [US1] Apply `usePlotTheme()` and CSS vars on PlotHeaderCreate container in web/src/components/plot/SceneRenderer/PlotHeaderCreate.tsx
- [x] T005 [P] [US1] Apply `usePlotTheme()` and CSS vars on SceneCard container in web/src/components/plot/SceneRenderer/SceneCard.tsx
- [x] T006 [P] [US1] Apply `usePlotTheme()` and CSS vars on EmptyCard container in web/src/components/plot/SceneRenderer/EmptyCard.tsx
- [x] T007 [P] [US1] Add Tailwind classes using CSS vars (`bg-[var(--plot-color-soft)]`, `text-[var(--plot-text)]`, `border-[var(--plot-color)]`) in the same SceneRenderer components

**Checkpoint**: User Story 1 is independently functional and visually consistent per row

---

## Phase 4: User Story 2 - Live Color Updates (Priority: P2)

**Goal**: Row colors update together with a subtle transition when plot color changes.

**Independent Test**: Change a plot color and confirm all row elements transition to the new color within 0.5 seconds.

### Implementation for User Story 2

- [x] T008 [P] [US2] Add `transition-colors duration-300` to the outermost elements in web/src/components/plot/SceneRenderer/PlotHeader.tsx
- [x] T009 [P] [US2] Add `transition-colors duration-300` to the outermost elements in web/src/components/plot/SceneRenderer/PlotHeaderCreate.tsx
- [x] T010 [P] [US2] Add `transition-colors duration-300` to the outermost elements in web/src/components/plot/SceneRenderer/SceneCard.tsx
- [x] T011 [P] [US2] Add `transition-colors duration-300` to the outermost elements in web/src/components/plot/SceneRenderer/EmptyCard.tsx

**Checkpoint**: User Story 2 is independently functional with smooth row transitions

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validation and consistency checks across stories

- [ ] T012 Run quickstart validation steps from specs/009-plot-row-color/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 completion
- **Polish (Phase 5)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Requires `usePlotTheme()` to be available
- **User Story 2 (P2)**: Builds on User Story 1 theming integration

### Parallel Opportunities

- T003-T006 can run in parallel (separate component files)
- T008-T011 can run in parallel (separate component files)

---

## Parallel Example: User Story 1

```bash
Task: "Apply usePlotTheme() and CSS vars on PlotHeader container in web/src/components/plot/SceneRenderer/PlotHeader.tsx"
Task: "Apply usePlotTheme() and CSS vars on PlotHeaderCreate container in web/src/components/plot/SceneRenderer/PlotHeaderCreate.tsx"
Task: "Apply usePlotTheme() and CSS vars on SceneCard container in web/src/components/plot/SceneRenderer/SceneCard.tsx"
Task: "Apply usePlotTheme() and CSS vars on EmptyCard container in web/src/components/plot/SceneRenderer/EmptyCard.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate User Story 1 independently

### Incremental Delivery

1. Setup + Foundational
2. User Story 1 → Validate independently
3. User Story 2 → Validate independently
4. Polish tasks
