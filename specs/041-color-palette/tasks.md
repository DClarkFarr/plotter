# Tasks: Color Palette System

**Input**: Design documents from `/specs/041-color-palette/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/colors-api.md ✅, quickstart.md ✅

**Organization**: Tasks grouped by user story to enable independent implementation and testing.
**Tests**: Not requested — no test tasks included.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Register the new `colors` collection name before any model code is written.

- [x] T001 Add `colors` to the `COLLECTIONS` constant in `express/src/models/collections.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend model, service, and router; frontend types, API client, and TanStack Query hook. All user stories depend on this phase.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 [P] Create `express/src/models/colors.ts` with `ColorDefinition` type, indexes, and model functions: `findColorsByResource`, `insertDefaultColors`, `copyColorsFromUser`, `updateColor`
- [x] T003 [P] Create `web/src/types/color.ts` with `StoryColor` type (`id`, `color`, `sortOrder`, `ignored`)
- [x] T004 [P] Add `"palette"` to `SidebarView` union type in `web/src/store/sidebarStore.ts`
- [x] T005 Create `express/src/services/colorService.ts` with `getStoryColors` (auth-gate + seed cascade: story → user → defaults) and `updateStoryColor` (auth-gate + update)
- [x] T006 Create `express/src/routers/colorRouter.ts` with `GET /:storyId/colors` (calls `getStoryColors`) and `PATCH /:storyId/colors/:colorId` (validates `color` as `/^#[0-9a-fA-F]{6}$/`, `sortOrder` in `[1,10]`, `ignored` as boolean; calls `updateStoryColor`)
- [x] T007 Register `colorRouter` in `express/src/routers/apiRouter.ts` via `applyNestedRouter(apiRouter, "/stories", colorRouter)`
- [x] T008 Create `web/src/api/colors.ts` with `getStoryColors(storyId)` and `updateStoryColor(storyId, colorId, patch)` API client functions
- [x] T009 Create `web/src/hooks/useStoryColors.ts` with `useStoryColors(storyId)` query (`queryKey: ["stories", storyId, "colors"]`) and `useUpdateStoryColor(storyId)` mutation (invalidates same key on success)

**Checkpoint**: `GET /api/stories/:storyId/colors` returns 10 colors (seeded on first call). `PATCH /api/stories/:storyId/colors/:colorId` updates and returns the entry. Frontend hook resolves data from the API.

---

## Phase 3: User Story 1 — Manage Story Color Palette (Priority: P1) 🎯 MVP

**Goal**: Expose the palette editor in the story sidebar so users can reorder, edit, and ignore colors.

**Independent Test**: Open a story → click Color Palette in Assets → verify 10 sortable rows appear, each with drag handle, color circle, hex input, and ignore checkbox. Reorder, change a color, check ignore — refresh and confirm persistence.

- [x] T010 [US1] Create `web/src/components/story/ColorPalettePanel.tsx`: sortable list using `@dnd-kit/core` + `@dnd-kit/sortable` (same pattern as `CharacterCustomAttributes.tsx`); each row has a drag handle (`useSortable` listeners), `<input type="color">` styled as a clickable circle, a hex text input (validates 3- or 6-digit hex, normalizes to `#rrggbb`, shows inline error on invalid), and an `ignored` checkbox; `onDragEnd` swaps `sortOrder` of dragged and target entries and fires two `useUpdateStoryColor` mutations; color picker and hex input sync bidirectionally; no add/remove controls
- [x] T011 [US1] Add `{currentView === "palette" && <ColorPalettePanel />}` to `web/src/components/layout/DashboardLayout.tsx`
- [x] T012 [US1] Add Color Palette button to the Assets `button-group` in `web/src/pages/story.tsx` that calls `addSidebarView("palette")` and `openSidebar()` (use `IconPalette` from unplugin-icons, tooltip "Color palette")

**Checkpoint**: Full palette management is usable end-to-end. US1 independently verified.

---

## Phase 4: User Story 2 — Color Palette Dropdown Component (Priority: P2)

**Goal**: Build the reusable `ColorPaletteDropdown` that all three replacement sites will use.

**Independent Test**: Render `<ColorPaletteDropdown storyId={id} value="#ef4444" onChange={fn} />` in any context — trigger button shows the current color, popover opens with non-ignored swatches + custom picker, selecting a swatch fires `onChange` and closes, clicking outside closes without change.

- [x] T013 [US2] Create `web/src/components/ui/ColorPaletteDropdown.tsx`: accepts `{ storyId: string | null, value: string, onChange: (color: string) => void }` props; trigger is a colored circle button (background = `value`); popover body shows a grid of non-ignored palette color swatches in `sortOrder` order (active swatch ring-highlighted), followed by a labeled `<input type="color">` for custom selection; clicking a swatch or committing a custom color calls `onChange` and closes the popover; clicking outside closes without change; when `storyId` is `null` renders only the custom color picker; uses `useStoryColors(storyId)` when `storyId` is provided

**Checkpoint**: `ColorPaletteDropdown` renders, opens, selects, and closes correctly. US2 independently verified.

---

## Phase 5: User Story 3 — Tag Panel Color Uses Palette Dropdown (Priority: P3)

**Goal**: Replace the native `type="color"` input in the tag creation form with `ColorPaletteDropdown`.

**Independent Test**: Open Manage Tags, start creating a tag — the color control is now the palette dropdown. Select a swatch and submit; tag is created with the selected color.

- [x] T014 [US3] In `web/src/components/story/CreateTagForm.tsx`, replace `<input type="color" ...>` with `<ColorPaletteDropdown storyId={storyId} value={tagColor} onChange={setTagColor} />` (pass `storyId` down from `ManageTagsPanel` or read from router params using the same pattern as other panels in the story context)

**Checkpoint**: Tag creation uses the palette dropdown. US3 independently verified.

---

## Phase 6: User Story 4 — Plot Header Color Uses Palette Dropdown (Priority: P3)

**Goal**: Replace the native `type="color"` input in the plot column header edit mode with `ColorPaletteDropdown`.

**Independent Test**: Enter plot header edit mode — the color field is the palette dropdown. Select a swatch; plot color updates immediately and dropdown closes.

- [x] T015 [US4] In `web/src/components/plot/SceneRenderer/PlotHeader.tsx`, replace the `<input type="color" value={draftColor} onChange={onChangeColor}>` with `<ColorPaletteDropdown storyId={storyId} value={draftColor} onChange={onChangeColor} />` (pass `storyId` from the plot's context, already available via the story page)

**Checkpoint**: Plot header color selection uses the palette dropdown. US4 independently verified.

---

## Phase 7: User Story 5 — Import Modal Plot Row Color Uses Palette Dropdown (Priority: P3)

**Goal**: Replace per-plot native color inputs in the import modal and swap out the hardcoded `paletteColors` auto-assign array.

**Independent Test**: Open the import modal → Plots tab — each plot row's color control is the palette dropdown. Select a color; the swatch updates and dropdown closes. Auto-assigned colors for new plots cycle through the story palette, not the old hardcoded array.

- [x] T016 [P] [US5] In `web/src/components/dashboard/ImportOutlinePreviewTabs.tsx`, replace each plot row's `<input type="color" ...>` with `<ColorPaletteDropdown storyId={storyId} value={plot.color} onChange={(c) => updatePlotColor(plot.id, c)} />`
- [x] T017 [P] [US5] In `web/src/components/dashboard/ImportOutlinePreviewTabs.tsx`, replace the hardcoded `paletteColors` array used for auto-assigning colors to new plots with the non-ignored colors from `useStoryColors(storyId)` (in `sortOrder` order); fall back to the system default hex values if no story palette is available yet

**Checkpoint**: Import modal uses the palette dropdown for all plot color selection. Auto-assigned colors use the story palette. US5 independently verified.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [x] T018 Verify all three former `type="color"` locations no longer contain a bare native color input — confirm SC-003
- [x] T019 [P] Verify ignored colors never appear in `ColorPaletteDropdown` swatches across all three consumer sites — confirm SC-004
- [x] T020 [P] Verify palette `sortOrder` and `color` values persist across page refresh — confirm SC-005

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on T001 — **blocks all user stories**
- **Phase 3 (US1)**: Depends on Phase 2 (needs API + hook + sidebar type)
- **Phase 4 (US2)**: Depends on Phase 2 (needs `useStoryColors` hook)
- **Phases 5–7 (US3–US5)**: Depend on Phase 4 (`ColorPaletteDropdown` must exist)
- **Phase 8 (Polish)**: Depends on Phases 3–7 all complete

### User Story Dependencies

| Story                         | Depends On    | Can Parallel With |
| ----------------------------- | ------------- | ----------------- |
| US1 (P1) — Palette panel      | Phase 2       | —                 |
| US2 (P2) — Dropdown component | Phase 2       | US1               |
| US3 (P3) — Tag panel          | Phase 4 (US2) | US4, US5          |
| US4 (P3) — Plot header        | Phase 4 (US2) | US3, US5          |
| US5 (P3) — Import modal       | Phase 4 (US2) | US3, US4          |

### Within Phase 2 (Parallel Opportunities)

T002 (model), T003 (type), and T004 (SidebarView) can all start in parallel after T001.  
T005 (service) depends on T002.  
T006 (router) depends on T005.  
T007 (register) depends on T006.  
T008 (API client) depends on T003.  
T009 (hook) depends on T008.

### Parallel Opportunities Summary

```
T001
├── T002 [P] → T005 → T006 → T007
├── T003 [P] → T008 → T009
└── T004 [P]  (independent — just a type union addition)

After Phase 2 completes:
├── T010 → T011 → T012   (US1, sequential — panel before layout before button)
└── T013                  (US2, can parallel with US1)

After T013 completes:
├── T014 [P]  (US3)
├── T015 [P]  (US4)
└── T016 [P] + T017 [P]  (US5, both in parallel within story)
```

---

## Implementation Strategy

**MVP Scope (deliver first)**: Complete Phases 1–3 (US1).  
This gives a fully functional palette management panel end-to-end with a working API, seed cascade, and sortable UI — independently testable before any dropdown work begins.

**Increment 2**: Phase 4 (US2) — the reusable dropdown component. No visual change yet in the app until the replacements are wired in.

**Increment 3**: Phases 5–7 (US3–US5) — all three can be parallelized since they each touch a different file.

**Total task count**: 20 tasks  
**Per story**: US1 = 3 tasks | US2 = 1 task | US3 = 1 task | US4 = 1 task | US5 = 2 tasks  
**Foundational**: 9 tasks (T001–T009)  
**Polish**: 3 tasks
