# Tasks: Drag Section Headings

**Input**: Design documents from `/specs/045-drag-section-headings/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅

**Tests**: Not requested — manual QA via quickstart.md.

**Scope**: Frontend-only. No backend changes. 3 files modified, 1 file created.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new dependencies or infra needed — all libraries already in use.

- [x] T001 Verify `@dnd-kit/abstract` exports `CollisionPriority` in web/package.json (used by SectionDropZone; already used in SceneActionsCard — confirm import path)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Zustand drag state must exist before PlotGrid or SectionDropZone can read it.

- [x] T002 Add `draggingSection: Section | null`, `startDraggingSection(section: Section): void`, and `stopDraggingSection(): void` to `web/src/store/sectionEditorStore.ts`

**Checkpoint**: `useSectionEditorStore` now exposes drag state — SectionDropZone and PlotGrid can proceed.

---

## Phase 3: User Story 1 — Drag a Section to a New Position (Priority: P1) 🎯 MVP

**Goal**: Users can pick up a section heading, see animated drop zones at every valid row, and drop the section to reposition it. The grid shifts other rows to close gaps and maintain relative order.

**Independent Test**: Open a story with one act section (row 2), scenes at rows 3–5, and one chapter section (row 6). Drag the act from row 2 and drop it on row 5. Confirm: act is at row 5; scenes have shifted up to rows 2–4; chapter remains at row 6. Check network tab for `PATCH /sections/:id` with `{ verticalIndex: 5 }` and `shiftedResources` in the response.

### Implementation for User Story 1

- [x] T003 [P] [US1] Create `web/src/components/plot/SceneRenderer/SectionDropZone.tsx`

- [x] T004 [US1] Update `web/src/components/plot/PlotGrid.tsx` — add pass-0 rendering (SectionDropZone per row)

- [x] T005 [US1] Update `onDragStart` in `web/src/components/plot/PlotGrid.tsx` — branch on section vs scene source type

- [x] T006 [US1] Update `onDragEnd` in `web/src/components/plot/PlotGrid.tsx` — call `stopDraggingSection()` unconditionally; add section-drop branch calling `useUpdateSectionMutation`

**Checkpoint**: Sections can be dragged and dropped; grid reorders correctly with optimistic update and server reconciliation.

---

## Phase 4: User Story 2 — Hover Actions on Section Headings (Priority: P2)

**Goal**: Drag handle and edit button are visible on hover and hidden otherwise. Edit button still opens the section sidebar.

**Independent Test**: Hover an act row — confirm drag handle (`mdi/arrow-all`) and edit button (`mdi/lead-pencil`) appear. Move mouse away — confirm buttons disappear. Click edit button — confirm section sidebar opens. Verify `SectionRow` already implements this via the `group` / `group-hover:opacity-100` pattern; confirm no regression.

### Implementation for User Story 2

- [x] T007 [P] [US2] Verify `web/src/components/plot/SectionRow.tsx` — confirmed: `ref={handleRef}` on drag handle, `group-hover:opacity-100` for buttons, `type: "section"` on `useDraggable`. No changes needed.

**Checkpoint**: Hover affordances confirmed working; drag handle correctly initiates drag.

---

## Phase 5: User Story 3 — Drop Zone Spans All Columns (Priority: P2)

**Goal**: Each drop zone uses `gridColumn: "2 / -1"` so it spans all plot columns regardless of how many plots exist.

**Independent Test**: Open a story with 4+ plots. Drag a section. Confirm each drop zone strip spans the full width of all plot columns visually (no gaps, no overflow).

### Implementation for User Story 3

- [x] T008 [P] [US3] Confirmed `SectionDropZone` uses `style={{ gridColumn: "2 / -1" }}` — spans all content columns at any grid width.

**Checkpoint**: Drop zones span all columns at any grid width.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T009 [P] Confirm section drag does not interfere with scene drag: in the same story, perform a section drag, then a scene drag, and confirm both complete successfully with correct grid state.
- [ ] T010 [P] Confirm cancel/escape behaviour: start a section drag and press Escape (or release outside any drop zone). Confirm grid returns to original layout and no `PATCH` request is made.
- [ ] T011 [P] Confirm `SectionDropZone` at the dragged section's own `verticalIndex` is disabled (does not highlight, does not accept drops).
- [ ] T012 [P] Confirm `SectionDropZone` at another section's `verticalIndex` is disabled (sections cannot be dropped on top of other sections).

---

## Dependencies

```
T002 (store) → T004, T005, T006 (PlotGrid reads draggingSection)
T003 (SectionDropZone) → T004 (PlotGrid imports SectionDropZone)
T003 + T004 + T005 + T006 → T007 (US2 verify), T008 (US3 verify)
T003–T008 → T009–T012 (polish)
```

## Parallel Execution

- T001 can run immediately (read-only verification)
- After T002: T003 and T005 can start in parallel (different files)
- After T003: T004 can start (imports SectionDropZone)
- After T004 + T005: T006 can start (completes PlotGrid wiring)
- After T006: T007, T008, T009–T012 can all run in parallel

## Implementation Strategy

**MVP (US1 only — P1)**: T001 → T002 → T003 + T005 in parallel → T004 → T006
This delivers the full drag-and-drop move flow. US2 hover actions already work (existing `SectionRow` implementation). US3 column spanning is built into `SectionDropZone` from T003.

**Full feature**: Add T007–T012 for verification and polish.

**Total tasks**: 12 | **New files**: 1 (`SectionDropZone.tsx`) | **Modified files**: 2 (`sectionEditorStore.ts`, `PlotGrid.tsx`) | **Verified unchanged**: 1 (`SectionRow.tsx`)
