# Tasks: Scene Form Keyboard UX Improvements

**Input**: Design documents from `/specs/044-scene-form-keyboard-ux/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Organization**: Tasks are grouped by user story. US1 (title→description) and US2 (Enter for todo) are independent of each other and of the shared foundation. US3 (snippet title→snippet text) depends on the foundation task (T001) but is otherwise independent.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend `RichTextEditor` with an imperative focus handle — this is the foundational piece that US1 and US3 both depend on. US2 is independent and can proceed in parallel.

- [x] T001 Add `forwardRef` + `useImperativeHandle` to `RichTextEditor`, export `RichTextEditorHandle` type in `web/src/components/forms/RichTextEditor.tsx`

**Checkpoint**: `RichTextEditor` now accepts a `ref` of type `RichTextEditorHandle` and exposes `focus()`. All callers of `RichTextEditor` that do not pass a `ref` are unaffected.

---

## Phase 2: User Story 1 - Tab from Title to Description (Priority: P1) 🎯 MVP

**Goal**: Pressing Tab in the scene title input moves focus directly into the description editor body.

**Independent Test**: Open a scene sidebar, focus the title input, press Tab — cursor should appear in the description editor content area ready to type.

- [x] T002 [US1] Add `descriptionEditorRef` and Tab `onKeyDown` handler to the title `<input>` in `web/src/components/story/SceneForm.tsx`
- [x] T003 [US1] Attach `descriptionEditorRef` to the description `<RichTextEditor>` in `web/src/components/story/SceneForm.tsx`

**Checkpoint**: US1 fully functional — Tab from title lands in description editor body. Shift+Tab is unaffected.

---

## Phase 3: User Story 2 - Enter Key Submits Todo Item (Priority: P2)

**Goal**: Pressing Enter in the "Add todo item" input submits the item without clicking the Add button.

**Independent Test**: Focus the add-todo input, type text, press Enter — item appears in the list, input is cleared, focus stays on the input for the next entry.

- [x] T004 [P] [US2] Add `onKeyDown` Enter handler (calling `handleAdd`) to the add-item `<input>` in `web/src/components/story/SceneTodoList.tsx`

**Checkpoint**: US2 fully functional — Enter submits todo; empty input Enter is a no-op; focus retained after submission.

---

## Phase 4: User Story 3 - Tab from Snippet Title to Snippet Text Editor (Priority: P3)

**Goal**: Pressing Tab in a snippet title input (modal or inline expanded) moves focus directly into that snippet's text editor body.

**Independent Test (modal)**: Open "Add snippet" modal, type a title, press Tab — cursor appears in the snippet text editor body.  
**Independent Test (inline)**: Expand an existing snippet, focus its inline title input, press Tab — cursor appears in that snippet's text editor body.

- [x] T005 [US3] Add `newSnippetEditorRef` and Tab `onKeyDown` to the snippet title input in the "Add snippet" modal section of `web/src/components/story/SceneForm.tsx`
- [x] T006 [US3] Attach `newSnippetEditorRef` to the modal's `<RichTextEditor>` in `web/src/components/story/SceneForm.tsx`
- [x] T007 [US3] Add `snippetEditorRefs` array and Tab `onKeyDown` to each inline expanded snippet title `<input>` in the snippets list in `web/src/components/story/SceneForm.tsx`
- [x] T008 [US3] Attach each `snippetEditorRefs[index]` ref to the corresponding inline snippet `<RichTextEditor>` in `web/src/components/story/SceneForm.tsx`

**Checkpoint**: US3 fully functional — Tab from snippet title (both modal and inline) lands in the snippet text editor body.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T009 [P] Run manual regression check per quickstart.md: verify all three stories pass and Tab order for POV, Tags, and all other fields is unchanged

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (T001)**: No dependencies — start immediately
- **Phase 2 (T002–T003)**: Depends on T001 (needs `RichTextEditorHandle` ref type)
- **Phase 3 (T004)**: Independent of all other tasks — can run in parallel with Phase 1 and 2
- **Phase 4 (T005–T008)**: Depends on T001 (needs `RichTextEditorHandle` ref type)
- **Phase 5 (T009)**: Depends on all prior phases complete

### User Story Dependencies

- **US1 (P1)**: Depends on T001 → then T002, T003 in sequence
- **US2 (P2)**: No dependencies — T004 is fully independent
- **US3 (P3)**: Depends on T001 → then T005–T008

### Parallel Opportunities

- T004 (US2) can be worked in parallel with T001 and T002–T003
- T002 and T003 are sequential (T003 requires the ref created in T002)
- T005 and T007 can run in parallel (different snippet contexts, same file — use care with conflicts)
- T006 and T008 attach refs; can follow T005/T007 respectively

---

## Parallel Example: Working US1 and US2 simultaneously

```
Agent A:                          Agent B:
T001 (RichTextEditor forwardRef)  T004 (SceneTodoList Enter key)
T002 (descriptionEditorRef)
T003 (attach ref to editor)
T009 (regression check)
```

Agent B's T004 is fully independent and deliverable as a standalone increment.

---

## Implementation Strategy

**MVP**: T004 alone (US2, Enter for todo) is zero-dependency and can ship first.  
**Next increment**: T001 → T002 → T003 (US1, Tab title→description).  
**Final increment**: T001 (already done) → T005 → T006 → T007 → T008 (US3, snippet Tab).
