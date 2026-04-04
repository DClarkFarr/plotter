# Tasks: Enhance Character Management

**Input**: Design documents from `/specs/019-enhance-character-management/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/characters.md
**Tests**: Not requested

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Create default characteristic and list label map in web/src/utils/characterCharacteristics.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T002 Update character data model and inputs in express/src/models/characters.ts for `characteristics`, `customCharacteristics`, and `lists`
- [x] T003 [P] Add validation helpers for numeric fields and list payloads in express/src/utils/validators.ts
- [x] T004 Update character service workflows to accept new fields in express/src/services/characterService.ts
- [x] T005 Update character API parsing/response mapping in express/src/routers/characterRouter.ts
- [x] T006 Update character API types and inputs in web/src/api/types.ts
- [x] T007 Update character mutations payload handling in web/src/queries/character/character-mutations.ts to omit undefined fields and include new data

**Checkpoint**: API and types support characteristics, custom attributes, and lists

---

## Phase 3: User Story 1 - Create a character with characteristics (Priority: P1) 🎯 MVP

**Goal**: Create characters with default characteristics, custom attributes, and lists from a modal form.
**Independent Test**: Create a character with default values, custom attributes, and list items; verify saved data shows in the list.

- [x] T008 [US1] Build create-mode character modal shell in web/src/components/character/CharacterModal.tsx
- [x] T009 [P] [US1] Implement sortable custom attribute editor in web/src/components/character/CharacterCustomAttributes.tsx
- [x] T010 [P] [US1] Implement list accordion editor in web/src/components/character/CharacterListsAccordion.tsx
- [x] T011 [US1] Add modal state store in web/src/store/characterModalStore.ts and wire create flow in web/src/components/story/ManageCharactersPanel.tsx
- [x] T012 [US1] Wire "Add new" action to open modal in web/src/components/story/ScenePovSelect.tsx

**Checkpoint**: User Story 1 fully functional and testable

---

## Phase 4: User Story 2 - Edit character characteristics (Priority: P2)

**Goal**: Edit an existing character and update characteristics, custom attributes, and lists.
**Independent Test**: Edit a character, change values, and confirm updated values render after save.

- [x] T013 [US2] Add edit-mode support and initial value hydration in web/src/components/character/CharacterModal.tsx
- [x] T014 [US2] Add edit action wiring in web/src/components/story/ManageCharactersPanel.tsx and web/src/components/character/CharacterCardPopover.tsx

**Checkpoint**: User Stories 1 and 2 both work independently

---

## Phase 5: User Story 3 - Review character details in the management view (Priority: P3)

**Goal**: Display key characteristics in the management view for quick review.
**Independent Test**: Open manage characters and see summary fields per character without entering edit mode.

- [x] T015 [US3] Add characteristics summary layout in web/src/components/story/ManageCharactersPanel.tsx
- [x] T016 [US3] Update character display components to show summary fields in web/src/components/character/CharacterDisplay.tsx and web/src/components/character/CharacterCard.tsx

**Checkpoint**: All user stories independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T017 [P] Validate quickstart steps and update specs/019-enhance-character-management/quickstart.md if payloads or UI steps changed

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → User Stories (US1, US2, US3) → Polish
- US1 is the MVP; US2 and US3 build on the same API foundation but are independently testable after Phase 2

## Parallel Execution Examples

**US1 parallel**:

- T009 (custom attributes editor) and T010 (lists accordion) can run in parallel.

**Foundational parallel**:

- T002 (model updates) and T003 (validators) can run in parallel.

## Implementation Strategy

- Deliver MVP by completing Phases 1–3 first.
- Add edit flow (Phase 4), then management summary (Phase 5).
- Finish with polish and quickstart validation (Phase 6).
