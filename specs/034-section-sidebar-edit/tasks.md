# Tasks: Section Sidebar Editing

**Input**: Design documents from `/specs/034-section-sidebar-edit/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Organization**: Tasks grouped by user story. Backend data-model changes are foundational (required before US1), then frontend plumbing (US1), then form features (US2 title, US3 description, US4 delete).

---

## Phase 1: Setup

**Purpose**: No project scaffolding needed — this feature adds to existing files only. Phase 1 confirms the implementation order from quickstart.md.

- [x] T001 Review quickstart.md implementation order in `specs/034-section-sidebar-edit/quickstart.md`

---

## Phase 2: Foundational — Backend Description Field (Blocking)

**Purpose**: Add the `description` field to the `Section` data model across the entire backend stack. All frontend user stories depend on the API returning this field.

**⚠️ CRITICAL**: Frontend user stories cannot save descriptions until this phase is complete.

- [x] T002 Add `description?: string` to `SectionDefinition` interface in `express/src/models/sections.ts`
- [x] T003 [P] Add `description?: string` to `UpdateSectionInput` type in `express/src/services/sectionService.ts` and pass it through to the model update call in `updateSectionForStory`
- [x] T004 [P] Add `description?: string` to `createSectionForStory` input in `express/src/services/sectionService.ts` and store it in the document
- [x] T005 Add `description: section.description ?? null` to `toSectionResponse` in `express/src/routers/sectionRouter.ts`
- [x] T006 Parse `description` via `optionalString` in the PATCH handler in `express/src/routers/sectionRouter.ts` and include it in the updates spread
- [x] T007 [P] Parse `description` via `optionalString` in the POST handler in `express/src/routers/sectionRouter.ts` and pass it to `createSectionForStory`

**Checkpoint**: Backend ready — `GET /sections` returns `description: null` on existing sections; `PATCH` accepts and persists `description`.

---

## Phase 3: User Story 1 — Open Section Editor from Plot Grid (Priority: P1) 🎯 MVP

**Goal**: Clicking the edit button on any `SectionRow` opens the sidebar in section editing mode showing the selected section.

**Independent Test**: Hover a section row → click the edit pencil icon → sidebar slides open → correct section title is displayed in the panel.

### Implementation for User Story 1

- [x] T008 Add `description?: string | null` to `Section` interface, `description?: string` to `CreateSectionInput` and `UpdateSectionInput` in `web/src/api/types.ts`
- [x] T009 Create `web/src/store/sectionEditorStore.ts` with `selectedSectionId: string | null`, `isSaving: boolean`, and actions `selectSection`, `clearSelection`, `setSaving` — follow the pattern of `web/src/store/sceneEditorStore.ts`
- [x] T010 Add `"section"` to the `SidebarView` union type in `web/src/store/sidebarStore.ts`
- [x] T011 Add missing import `import { useSectionEditorStore } from "../../store/sectionEditorStore"` to `web/src/components/plot/SectionRow.tsx`
- [x] T012 Create `web/src/components/story/SectionForm.tsx` with skeleton structure: read `selectedSectionId` from `useSectionEditorStore`, resolve full section from `useStorySectionsQuery`, render section title as a read-only heading and a "Select a section to start editing." fallback when nothing is selected
- [x] T013 Add `import { useSectionEditorStore } from "../../store/sectionEditorStore"` and `import { SectionForm } from "../story/SectionForm"` to `web/src/components/layout/DashboardLayout.tsx`; add `currentView === "section"` case rendering `<SectionForm key={selectedSectionId} />`

**Checkpoint**: Sidebar opens and shows the selected section's title when the edit button is clicked.

---

## Phase 4: User Story 2 — Edit Section Title (Priority: P1)

**Goal**: The title field in the open `SectionForm` is editable and auto-saves with debounce, updating the plot grid in real time.

**Independent Test**: Open the section editor → change the title → observe the section row in the grid update within ~300ms.

### Implementation for User Story 2

- [x] T014 [US2] Add `description` to the optimistic patch spread in `onMutate` inside `useUpdateSectionMutation` in `web/src/queries/section/section-mutations.ts`
- [x] T015 [US2] Add editable title field to `SectionForm`: local `draftTitle` state, `useDebounce` (300ms) calling `useUpdateSectionMutation({ sectionId, title })`, input styled consistently with `SceneForm` title input in `web/src/components/story/SectionForm.tsx`
- [x] T016 [US2] Display section type and `verticalIndex` as a read-only context line above the title input (e.g. "Act — Row 1") in `web/src/components/story/SectionForm.tsx`

**Checkpoint**: Title edits persist and the section row in the grid reflects changes without a page reload.

---

## Phase 5: User Story 3 — Edit Section Description (Priority: P2)

**Goal**: A WYSIWYG rich-text description editor is available in the section form. Content auto-saves and reloads on re-open.

**Independent Test**: Open section editor → type formatted content in the description area → close sidebar → reopen the same section → content is pre-loaded.

### Implementation for User Story 3

- [x] T017 [US3] Add `descriptionHtml` local state and `useDebounce` (300ms) calling `useUpdateSectionMutation({ sectionId, description })` in `web/src/components/story/SectionForm.tsx`
- [x] T018 [US3] Render `<RichTextEditor value={descriptionHtml} onChange={handleDescriptionChange} isSimpleMode />` with a "Description" section label in `web/src/components/story/SectionForm.tsx` — follow the SceneForm description block pattern

**Checkpoint**: Rich-text description persists across close/reopen cycles.

---

## Phase 6: User Story 4 — Delete a Section (Priority: P2)

**Goal**: A delete button in the section form opens a confirmation modal; confirming removes the section from the grid and closes the sidebar.

**Independent Test**: Open section editor → click delete → confirm in modal → section row disappears from grid and sidebar closes.

### Implementation for User Story 4

- [x] T019 [US4] Add `isDeleteModalOpen` state, delete button (Flowbite `Button` color="failure"), and Flowbite `Modal` confirm dialog to `web/src/components/story/SectionForm.tsx`
- [x] T020 [US4] Implement `handleConfirmDelete` in `web/src/components/story/SectionForm.tsx`: call `useDeleteSectionMutation.mutateAsync(sectionId)`, on success call `clearSelection()` from `useSectionEditorStore` and `closeSidebar()` from `useSidebarStore`, on error call `alert.error(message)` following the `SceneForm` delete pattern

**Checkpoint**: Full CRUD cycle is complete — section can be created (existing), opened for edit, title/description edited, and deleted via the sidebar.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T021 [P] Verify `SectionForm` shows "Select a section to start editing." when `selectedSectionId` is null (e.g. sidebar opened via toggle without an edit click)
- [x] T022 [P] Verify switching from scene view to section view (and back) does not cause stale state or console errors in `web/src/components/layout/DashboardLayout.tsx`
- [x] T023 Run quickstart verification steps from `specs/034-section-sidebar-edit/quickstart.md` end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — review only
- **Phase 2 (Foundational)**: No dependencies — can start immediately; blocks US3 description save
- **Phase 3 (US1 — Open Sidebar)**: Depends on Phase 2 (types must exist); delivers working sidebar
- **Phase 4 (US2 — Title Edit)**: Depends on Phase 3 (SectionForm skeleton must exist)
- **Phase 5 (US3 — Description)**: Depends on Phase 2 backend ✅ and Phase 4 form structure ✅
- **Phase 6 (US4 — Delete)**: Depends on Phase 3 (SectionForm and store must exist)
- **Phase 7 (Polish)**: Depends on all prior phases

### User Story Dependencies

- **US1 (P1)**: After Phase 2 — no story dependencies
- **US2 (P1)**: After US1 (needs `SectionForm` skeleton)
- **US3 (P2)**: After US2 (shares the form's debounce structure); also needs Phase 2 backend
- **US4 (P2)**: After US1 (needs store and form); independent of US2/US3

### Parallel Opportunities within Each Phase

**Phase 2** — T003 and T004 can run in parallel (separate service functions); T006 and T007 can run in parallel (separate router handlers).

**Phase 3** — T008, T009, T010 can all run in parallel (separate files, no inter-dependencies). T011, T012, T013 depend on T009 and T010 being complete.

**Phase 7** — T021 and T022 can run in parallel.

---

## Parallel Execution Example: MVP (US1 + US2)

```
Phase 2 (sequential within file, some parallel across files):
  T002 → T005 → T006  (sections model → router response → router PATCH)
  T003 ──────────────  (service update — parallel to T004)
  T004 ──────────────  (service create — parallel to T003)
  T007 ──────────────  (router POST — parallel to T006)

Phase 3 (US1):
  T008, T009, T010  ←── all parallel
        ↓
  T011, T012        ←── parallel (depend on T009, T010)
        ↓
  T013              ←── wires it all together

Phase 4 (US2):
  T014 → T015 → T016
```

---

## Implementation Strategy

**MVP scope**: Complete Phase 2 + Phase 3 + Phase 4 (US1 + title editing). This gives the writer a working section editor that opens from the grid and saves titles — independently demonstrable.

**Increment 2**: Add Phase 5 (description WYSIWYG) — builds on the working form.

**Increment 3**: Add Phase 6 (delete) — completes the full CRUD lifecycle.

**Format validation**: All tasks follow `- [ ] [TID] [P?] [Story?] Description with file path` — ✅ confirmed.
