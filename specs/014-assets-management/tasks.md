# Tasks: Assets Management

**Input**: Design documents from `/specs/014-assets-management/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md
**Tests**: Not requested

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Add `VITE_CDN_BASE_URL` to web/.env and document in web/README.md

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T002 Add `multer` upload dependency in express/package.json
- [ ] T003 [P] Add scene POV usage counter in express/src/models/scenes.ts
- [ ] T004 Implement character update/delete services in express/src/services/characterService.ts (depends on T003)
- [ ] T005 Implement character update/delete endpoints in express/src/routers/characterRouter.ts (depends on T004)
- [ ] T006 [P] Add upload router for character images in express/src/routers/uploadRouter.ts
- [ ] T007 Wire upload router and static `/uploads` serving in express/src/server.ts (depends on T006)
- [ ] T008 [P] Add character update/delete APIs in web/src/api/stories.ts
- [ ] T009 [P] Extend character types for image URL updates in web/src/api/types.ts
- [ ] T010 [P] Add character update/delete mutations in web/src/queries/character/character-mutations.ts (depends on T008)
- [ ] T011 [P] Add upload API helper in web/src/api/uploads.ts
- [ ] T012 [P] Add upload mutation hook in web/src/queries/character/character-mutations.ts (depends on T011)

**Checkpoint**: Upload infrastructure and character CRUD support are available to the UI.

---

## Phase 3: User Story 1 - Open assets management from the portal (Priority: P1) 🎯 MVP

**Goal**: Provide an Assets section in the Portal top menu that opens manage characters or manage tags views in the sidebar.
**Independent Test**: Open a story, click Assets > Characters or Assets > Tags, and verify the sidebar opens to the correct view.

- [ ] T013 [US1] Add Assets menu buttons with icons/tooltips in web/src/pages/story.tsx
- [ ] T014 [US1] Extend sidebar view handling in web/src/store/sidebarStore.ts to support assets views
- [ ] T015 [US1] Render assets views in sidebar shell via web/src/components/layout/DashboardLayout.tsx

**Checkpoint**: Assets menu launches the correct sidebar view without scene context.

---

## Phase 4: User Story 2 - Rename story tags in the assets list (Priority: P2)

**Goal**: Show a tag list that mirrors scene selection layout without checkboxes and allows renaming the main tag title.
**Independent Test**: Open manage tags, rename a tag, and confirm the change persists after refresh.

- [ ] T016 [US2] Build manage tags list UI without selection checkboxes in web/src/components/story/ManageTagsPanel.tsx
- [ ] T017 [US2] Reuse or adapt tag row styling from web/src/components/story/SceneTagRow.tsx for rename-only rows
- [ ] T018 [US2] Wire tag rename interactions to useUpdateTagMutation in web/src/components/story/ManageTagsPanel.tsx
- [ ] T019 [US2] Add empty/error states for manage tags in web/src/components/story/ManageTagsPanel.tsx

**Checkpoint**: Tag rename works from the assets list and variants remain unchanged.

---

## Phase 5: User Story 3 - Search and edit story characters (Priority: P3)

**Goal**: Provide a searchable character list with inline editing of image, name, and description, plus guarded deletion.
**Independent Test**: Filter the list, update character fields, upload a new image, and attempt deletion of an in-use character.

- [ ] T020 [US3] Build manage characters list layout with image/color display in web/src/components/story/ManageCharactersPanel.tsx
- [ ] T021 [US3] Add character search input and filtering in web/src/components/story/ManageCharactersPanel.tsx
- [ ] T022 [US3] Implement inline name and description editing in web/src/components/story/ManageCharactersPanel.tsx
- [ ] T023 [US3] Implement image upload flow using upload mutation in web/src/components/story/ManageCharactersPanel.tsx
- [ ] T024 [US3] Add delete action with 409 handling in web/src/components/story/ManageCharactersPanel.tsx
- [ ] T025 [US3] Add character image URL resolution using VITE_CDN_BASE_URL in web/src/utils/characterImage.ts
- [ ] T026 [US3] Add empty/error states for manage characters in web/src/components/story/ManageCharactersPanel.tsx

**Checkpoint**: Character search and inline edits work; deletion is blocked when assigned.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T027 [P] Update assets documentation and local setup in specs/014-assets-management/quickstart.md
- [ ] T028 [P] Validate upload and asset management flows against specs/014-assets-management/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Phase 6)**: After desired user stories complete

### User Story Dependencies

- **US1**: No dependencies beyond Foundational
- **US2**: Depends on US1 (entry point), otherwise independent
- **US3**: Depends on US1 (entry point), otherwise independent

### Parallel Opportunities

- T003, T006, T008, T009, T011 can run in parallel
- T016 and T020 can run in parallel after US1 is wired
- T027 and T028 can run after feature completion

---

## Parallel Example: User Story 2

- T016 [US2] Build manage tags list UI without selection checkboxes in web/src/components/story/ManageTagsPanel.tsx
- T017 [US2] Reuse or adapt tag row styling from web/src/components/story/SceneTagRow.tsx for rename-only rows

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2
2. Implement US1 tasks T013-T015
3. Validate Assets menu opens the correct sidebar views

### Incremental Delivery

1. Complete US1 → validate navigation entry point
2. Complete US2 → validate tag rename
3. Complete US3 → validate character search + inline edits
4. Run polish tasks for quickstart verification
