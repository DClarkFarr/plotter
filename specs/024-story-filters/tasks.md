# Tasks: Story Filters

**Input**: Design documents from `/specs/024-story-filters/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested (manual QA only)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution**: Follow Zustand for client state, Flowbite React for UI components, and Tailwind CSS for styling. Do not add new libraries.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm existing data sources and state locations

- [x] T001 Review story queries and state usage in web/src/queries/story/story-queries.ts and web/src/store/storyStore.ts to confirm available tags/plots/characters data

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared filter state and helpers required by all stories

- [x] T002 Define filter types and shape (`type`, `value1`, `value2`) in web/src/store/storyStore.ts
- [x] T003 Implement filter actions in web/src/store/storyStore.ts (add, remove, replace variant, clear all, prevent duplicates)
- [x] T004 Add selector helpers in web/src/store/storyStore.ts for `hasFilters` and `filtersByType` to simplify UI rendering

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Apply structured filters (Priority: P1) 🎯 MVP

**Goal**: Allow users to apply tag, plot, and character filters via the story top bar.

**Independent Test**: Open a story, apply a tag (with and without variants), a plot, and a character filter, and confirm each appears as active.

### Implementation for User Story 1

- [x] T005 [P] [US1] Add or extend story character query in web/src/queries/story/story-queries.ts (if missing) to supply character options for filters
- [x] T006 [US1] Create filters menu UI in web/src/components/story/StoryFiltersMenu.tsx with Flowbite dropdown and search inputs for tags, plots, and characters
- [x] T007 [US1] Implement tag variant submenu with All option in web/src/components/story/StoryFiltersMenu.tsx and apply tag filters with `value2`
- [x] T008 [US1] Wire filter apply handlers to story store in web/src/components/story/StoryFiltersMenu.tsx and close dropdown after applying a filter
- [x] T009 [US1] Integrate the filters menu into the story top bar in web/src/pages/story.tsx

**Checkpoint**: Structured filters can be applied independently

---

## Phase 4: User Story 2 - Apply custom text filter (Priority: P2)

**Goal**: Allow users to apply a custom text filter via a modal.

**Independent Test**: Open the custom text modal, submit a non-empty value, and confirm the filter is applied.

### Implementation for User Story 2

- [x] T010 [P] [US2] Create custom text modal in web/src/components/story/StoryFilterTextModal.tsx with validation for non-whitespace input
- [x] T011 [US2] Connect the custom text option in web/src/components/story/StoryFiltersMenu.tsx to open the modal, close the dropdown, and apply a `search` filter on submit

**Checkpoint**: Custom text filter works independently

---

## Phase 5: User Story 3 - Manage active filters (Priority: P3)

**Goal**: Show active filters in a bar and let users clear individually or all at once.

**Independent Test**: Apply two filters, remove one, then clear all and confirm the bar hides.

### Implementation for User Story 3

- [x] T012 [P] [US3] Create filters bar UI in web/src/components/story/StoryFiltersBar.tsx with badges, remove actions, and clear-all
- [x] T013 [US3] Render filters bar at the top of the story page in web/src/pages/story.tsx and hide it when no filters are active

**Checkpoint**: Filters bar fully manages active filters

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T014 Validate manual QA flow in specs/024-story-filters/quickstart.md and adjust any steps if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational completion; can proceed in priority order
- **Polish (Phase 6)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Requires Phase 2 completion, no dependency on other stories
- **User Story 2 (P2)**: Requires Phase 2 completion, minimal coupling to US1
- **User Story 3 (P3)**: Requires Phase 2 completion, depends on filters being applied by US1/US2

### Parallel Opportunities

- T005 and T010 can run in parallel (separate files)
- T012 can begin once filter state exists, in parallel with US2 work

---

## Parallel Example: User Story 1

```bash
Task: "Add or extend story character query in web/src/queries/story/story-queries.ts"
Task: "Create filters menu UI in web/src/components/story/StoryFiltersMenu.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate User Story 1 independently

### Incremental Delivery

1. Add User Story 1 → validate
2. Add User Story 2 → validate
3. Add User Story 3 → validate
4. Finish polish and quickstart verification
