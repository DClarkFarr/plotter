# Tasks: List View

**Input**: Design documents from `/specs/022-list-view/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested (manual QA only)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Constitution Check

- Stack guardrails honored (Express + MongoDB backend in express/, React in web/).
- Frontend library mandates followed: TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, unplugin-icons.
- Tailwind CSS used for styling; no new styling systems introduced.
- No new API routes, services, or models required for this UI-only feature.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Shared scaffolding used across all user stories.

- [x] T001 [P] Create list view component scaffolds in web/src/components/story/ListView.tsx and web/src/components/story/ListViewScene.tsx
- [x] T002 [P] Create todo display scaffold in web/src/components/story/ListViewTodoList.tsx
- [x] T003 [P] Add list ordering helper with sorting logic in web/src/utils/listViewOrdering.ts

**Checkpoint**: Scaffolding exists and compiles.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core UI primitives required before user stories.

- [x] T004 Extend tag badge sizing with a `size` prop and `lg` option in web/src/components/story/TagBadge.tsx
- [x] T005 Add list view display mode type in web/src/store/storyStore.types.ts ("normal" | "filterExcluded")

**Checkpoint**: Tag badges support list view sizing and display mode type is available.

---

## Phase 3: User Story 1 - Switch to list view (Priority: P1) 🎯 MVP

**Goal**: Replace the plot grid with a list view when users select list view.

**Independent Test**: Select "List view" on a story page and verify the plot grid is replaced by the list view, with an empty state when no scenes exist.

### Implementation for User Story 1

- [x] T006 [US1] Implement ListView container with empty state messaging in web/src/components/story/ListView.tsx
- [x] T007 [US1] Use list view ordering helper to flatten scenes in web/src/components/story/ListView.tsx
- [x] T008 [US1] Wire StoryPage to switch between PlotGrid and ListView based on `cardDisplay` in web/src/pages/story.tsx
- [x] T009 [US1] Handle missing optional data gracefully (avatar, tags, description, todo) in web/src/components/story/ListView.tsx and web/src/components/story/ListViewScene.tsx

**Checkpoint**: User Story 1 is independently functional.

---

## Phase 4: User Story 2 - Read a scene in written format (Priority: P2)

**Goal**: Render each scene with avatar, title, badges, description, and edit control.

**Independent Test**: Open a story in list view and verify a scene renders avatar above right-aligned title, badges below title, rich text description, and edit control.

### Implementation for User Story 2

- [x] T010 [US2] Implement ListViewScene layout with avatar, title, badges, and edit control in web/src/components/story/ListViewScene.tsx
- [x] T011 [US2] Render SceneTags with `TagBadge` size `lg` in web/src/components/story/ListViewScene.tsx
- [x] T012 [US2] Render rich text description with `tiptap` styles and `dangerouslySetInnerHTML` in web/src/components/story/ListViewScene.tsx
- [x] T013 [US2] Add display mode handling (`normal` vs `filterExcluded`) in web/src/components/story/ListViewScene.tsx
- [x] T014 [US2] Open scene editor sidebar from the list view edit button using store actions in web/src/components/story/ListViewScene.tsx

**Checkpoint**: User Story 2 is independently functional.

---

## Phase 5: User Story 3 - Review scene tasks (Priority: P3)

**Goal**: Show todo items after the description with completed items at the end.

**Independent Test**: For a scene with todos, verify incomplete items appear first and completed items appear last with strike-through.

### Implementation for User Story 3

- [x] T015 [US3] Implement ListViewTodoList display with sorted todo items in web/src/components/story/ListViewTodoList.tsx
- [x] T016 [US3] Render ListViewTodoList after description in web/src/components/story/ListViewScene.tsx

**Checkpoint**: User Story 3 is independently functional.

---

## Phase 6: User Story 4 - Scan scenes in grid order (Priority: P3)

**Goal**: Order scenes by vertical index, then plot horizontal index, with no empty gaps.

**Independent Test**: For scenes sharing a vertical index, verify list order matches left-to-right plot order.

### Implementation for User Story 4

- [x] T017 [US4] Use ordering helper to avoid empty placeholders in web/src/components/story/ListView.tsx

**Checkpoint**: User Story 4 is independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation updates.

- [ ] T018 [P] Validate quickstart steps and update if needed in specs/022-list-view/quickstart.md
- [ ] T019 [P] Perform manual performance check for ~100 scenes render time in web/src/components/story/ListView.tsx

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion.
- **User Stories (Phase 3+)**: Depend on Foundational completion.
- **Polish (Final Phase)**: Depends on user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational.
- **US2 (P2)**: Depends on Foundational; independent of US1 aside from ListView scaffolding.
- **US3 (P3)**: Depends on Foundational; uses ListViewScene.
- **US4 (P3)**: Depends on Foundational; uses ordering helper used by US1.

### Parallel Opportunities

- T001, T002, T003 can run in parallel.
- T004 and T005 can run in parallel.
- T009, T010, T011, T012, T013 can be split across developers once ListViewScene exists.

---

## Parallel Example: User Story 2

```bash
Task: "Implement ListViewScene layout in web/src/components/story/ListViewScene.tsx"
Task: "Render SceneTags with TagBadge size lg in web/src/components/story/ListViewScene.tsx"
Task: "Render rich text description with tiptap styles in web/src/components/story/ListViewScene.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate list view switching and empty state

### Incremental Delivery

1. US1 (list view switch) → validate
2. US2 (scene layout) → validate
3. US3 (todo display) → validate
4. US4 (ordering) → validate

---

## Notes

- Keep list view rendering purely presentational; reuse existing queries and store actions.
- Avoid adding new libraries; use existing Tailwind, Flowbite, and TipTap styling.
- Ensure list view handles missing optional data gracefully (avatar, tags, description, todo).
