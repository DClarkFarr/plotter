# Tasks: Character Card

**Input**: Design documents from `/specs/018-character-card/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested for this feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution**: UI work stays within React + Tailwind + Flowbite React. No new libraries.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the component scaffolding used across all stories.

- [x] T001 [P] Create shared CharacterCard prop types in web/src/components/character/character-card.types.ts
- [x] T002 [P] Create CharacterCard component scaffold in web/src/components/character/CharacterCard.tsx
- [x] T003 [P] Create CharacterCardPopover component scaffold in web/src/components/character/CharacterCardPopover.tsx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared popover wiring that all stories rely on.

- [x] T004 Define popover trigger + pass-through props contract in web/src/components/character/CharacterCardPopover.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View character details at a glance (Priority: P1) 🎯 MVP

**Goal**: Show a 350px-wide character card with image, stylized name, and description from both entry points.

**Independent Test**: Open the popover from SceneCard and ManageCharactersPanel to confirm the card displays image, name, and description with empty states.

### Implementation for User Story 1

- [x] T005 [US1] Implement CharacterCard layout (image, name, description, empty states, ~350px width) in web/src/components/character/CharacterCard.tsx
- [x] T006 [US1] Render CharacterCard inside the popover container in web/src/components/character/CharacterCardPopover.tsx
- [x] T007 [P] [US1] Add CharacterCardPopover trigger support to CharacterDisplay in web/src/components/character/CharacterDisplay.tsx
- [x] T008 [P] [US1] Replace ManageCharactersPanel avatar click target with CharacterCardPopover in web/src/components/story/ManageCharactersPanel.tsx
- [x] T009 [US1] Wire SceneCard character display to open the popover in web/src/components/plot/SceneRenderer/SceneCard.tsx

**Checkpoint**: User Story 1 is independently functional

---

## Phase 4: User Story 2 - Expand to full-size view (Priority: P2)

**Goal**: Provide a full-size lightbox view when clicking the character image.

**Independent Test**: Click the image in the card to open a modal and dismiss it without leaving the popover context.

### Implementation for User Story 2

- [x] T010 [US2] Add image click handling + full-size modal view in web/src/components/character/CharacterCard.tsx
- [x] T011 [US2] Ensure popover + modal stacking and focus behavior in web/src/components/character/CharacterCardPopover.tsx

**Checkpoint**: User Story 2 is independently functional

---

## Phase 5: User Story 3 - Update character image (Priority: P3)

**Goal**: Enable hover edit control to upload a new image and update the card/lightbox.

**Independent Test**: Hover the card to reveal edit, upload a new image, and confirm it updates in the card and modal.

### Implementation for User Story 3

- [x] T012 [US3] Add hover edit button and upload callback wiring in web/src/components/character/CharacterCard.tsx
- [x] T013 [US3] Connect upload mutation and update character image state in web/src/components/character/CharacterCardPopover.tsx
- [x] T014 [US3] Remove legacy image upload input and route updates through the popover in web/src/components/story/ManageCharactersPanel.tsx

**Checkpoint**: User Story 3 is independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and UX cleanup.

- [x] T015 [P] Validate quickstart flows and update notes in specs/018-character-card/quickstart.md
- [x] T016 [P] Verify empty/error image states and hover affordances in web/src/components/character/CharacterCard.tsx

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Depends on User Story 1 (card must render before lightbox)
- **User Story 3 (P3)**: Depends on User Story 1 (card must render before edit)

### Parallel Opportunities

- Phase 1 tasks T001-T003 can run in parallel
- Within US1, T007 and T008 can run in parallel
- Polish tasks T015 and T016 can run in parallel

---

## Parallel Example: User Story 1

```bash
Task: "Add CharacterCardPopover trigger support to CharacterDisplay in web/src/components/character/CharacterDisplay.tsx"
Task: "Replace ManageCharactersPanel avatar click target with CharacterCardPopover in web/src/components/story/ManageCharactersPanel.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate the popover flow from both entry points

### Incremental Delivery

1. Add User Story 1 → Validate
2. Add User Story 2 → Validate lightbox
3. Add User Story 3 → Validate upload flow
4. Finish polish tasks
