# Tasks: ListView Sidebar Enhancements

**Input**: Design documents from `/specs/035-listview-sidebar-enhancements/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Organization**: Tasks are grouped by user story. Each story is independently testable and deliverable.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the new `ListViewSidebarItem` component file and wire the skeleton into `ListView.tsx` so all subsequent phases have a stable base to build on.

- [x] T001 Create `web/src/components/story/ListViewSidebarItem.tsx` with empty component scaffold (typed props matching data-model.md: `entry`, `isActive`, `isFilterExcluded`, `filterVisibilityMode`, `onClick`)
- [x] T002 Add `scrollContainerRef` (`useRef<HTMLDivElement>`) and `activeIndex` state (`useState<number | null>(null)`) to `web/src/components/story/ListView.tsx`
- [x] T003 Add `virtuosoRef` (`useRef<VirtuosoHandle>`) to `web/src/components/story/ListView.tsx` and attach to the sidebar `<Virtuoso ref={virtuosoRef} />`

**Checkpoint**: Project structure ready. Types compile, component renders nothing but doesn't break.

---

## Phase 2: Foundational (DOM IDs — Blocking Prerequisite)

**Purpose**: Add stable DOM `id` attributes to every main list item. This must be done before click-to-scroll (US1) and IntersectionObserver (US1/US2) can function.

**⚠️ CRITICAL**: All user story phases depend on these IDs.

- [x] T004 In `web/src/components/story/ListView.tsx`, wrap each `<ListViewScene>` in the `orderedScenes.map()` block with `<div id={\`list-item-scene-${scene.id}\`}>`(remove the naked`key` prop from the inner component, hoist it to the wrapper)
- [x] T005 In `web/src/components/story/ListView.tsx`, wrap each `<ListViewSection>` in the `orderedScenes.map()` block with `<div id={\`list-item-section-${section.id}\`}>`
- [x] T006 Attach `ref={scrollContainerRef}` to the outer `overflow-y-auto` div in `web/src/components/story/ListView.tsx`

**Checkpoint**: Inspect DOM — all main list items have namespaced IDs. Scroll container is ref'd.

---

## Phase 3: User Story 1 — Sidebar Navigation (Priority: P1) 🎯 MVP

**Goal**: Clicking any sidebar entry scrolls the main content area to that item.

**Independent Test**: Open a story List View → click a scene/chapter/act label in the sidebar → main list scrolls to that item. No hover or filter interactions required yet.

### Implementation for User Story 1

- [x] T007 [US1] In `web/src/components/story/ListViewSidebarItem.tsx`, implement the `onClick` handler: call `props.onClick()` on button/div click; when `filterVisibilityMode === "hide"` and `isFilterExcluded` is true, do nothing (guard the click)
- [x] T008 [US1] In `web/src/components/story/ListView.tsx`, build the `handleSidebarClick(index: number)` function: derive the DOM ID from `orderedScenes[index]` (scene or section) and call `document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })`
- [x] T009 [US1] Replace the existing inline `itemContent` in the sidebar `<Virtuoso>` with `<ListViewSidebarItem>`, passing `entry`, `isActive={activeIndex === _index}`, `isFilterExcluded`, `filterVisibilityMode`, and `onClick={() => handleSidebarClick(_index)}`
- [x] T010 [US1] Add `useEffect` that watches `activeIndex` and calls `virtuosoRef.current?.scrollIntoView({ index: activeIndex, behavior: 'auto' })` when `activeIndex` is non-null in `web/src/components/story/ListView.tsx`

**Checkpoint**: Clicking sidebar entries scrolls the main list. P1 independently verified.

---

## Phase 4: User Story 2 — Visual Hierarchy & Active Highlight (Priority: P2)

**Goal**: Sidebar shows clear visual hierarchy (acts > chapters > scenes), plot-colored left borders on scenes, and a sky-700 active highlight with right arrow on the currently-visible item.

**Independent Test**: Visually inspect sidebar with a story containing acts, chapters, and scenes across multiple plots. Scroll main list — active highlight moves to track position.

### Implementation for User Story 2

- [x] T011 [P] [US2] In `web/src/components/story/ListViewSidebarItem.tsx`, implement the **section** branch render: act entries use `text-lg font-bold py-2 px-3`, chapter entries use `text-base font-semibold py-1 px-3`; both wrap in a full-width `<button>` with active state classes (`bg-sky-50 text-sky-700` + `~icons/mdi/arrow-right` icon) when `isActive` is true
- [x] T012 [P] [US2] In `web/src/components/story/ListViewSidebarItem.tsx`, implement the **scene** branch render: `text-sm py-1 pl-2 pr-3 border-l-4 border-l-[var(--plot-color)]` using `usePlotTheme`; apply `bg-sky-50 text-sky-700` + `~icons/mdi/arrow-right` when `isActive` is true; fall back gracefully (no border, no CSS variable) when plot has no color
- [x] T013 [US2] Add `useEffect` with `IntersectionObserver` to `web/src/components/story/ListView.tsx`: create observer with `root: scrollContainerRef.current`, `rootMargin: '0px 0px -70% 0px'`, `threshold: 0`; on each callback, find the observed entry with the lowest non-negative `boundingClientRect.top` and map its `id` back to an index in `orderedScenes` to call `setActiveIndex(index)`; observe all `[id^="list-item-"]` elements inside the scroll container; clean up observer on unmount; re-run when `orderedScenes` changes
- [x] T014 [US2] Add `truncate` (or `overflow-hidden text-ellipsis`) to title text nodes in `ListViewSidebarItem.tsx` to prevent long titles from overflowing the sidebar container

**Checkpoint**: Visual hierarchy correct, plot borders visible, active highlight tracks scroll. P2 independently verified.

---

## Phase 5: User Story 3 — Filtered Item States in Sidebar (Priority: P3)

**Goal**: When filters are active, sidebar entries reflect filter exclusion. "Minify" mode shows greyed/struck-through but clickable entries; "hide" mode shows disabled, non-clickable entries.

**Independent Test**: Activate a character or tag filter → switch between "hide" and "minify" modes → verify excluded scene sidebar entries change appearance and clickability accordingly.

### Implementation for User Story 3

- [x] T015 [US3] In `web/src/components/story/ListView.tsx`, compute `isFilterExcluded` per entry in the `itemContent` callback: `entryIsScene(entry) ? (hasFilters && !includedSceneIdSet.has(entry.scene.id)) : false`; pass to `<ListViewSidebarItem>`
- [x] T016 [US3] In `web/src/components/story/ListViewSidebarItem.tsx`, implement **minify** filter state for scene entries: when `isFilterExcluded && filterVisibilityMode === 'minify'`, add `opacity-40 line-through` classes; preserve `cursor-pointer` and allow click to proceed
- [x] T017 [US3] In `web/src/components/story/ListViewSidebarItem.tsx`, implement **hide** filter state for scene entries: when `isFilterExcluded && filterVisibilityMode === 'hide'`, add `opacity-30 cursor-not-allowed` classes; suppress click handler (guard early return or `pointer-events-none`)
- [x] T018 [US3] Confirm section entries (acts, chapters) are unconditionally rendered without any filter exclusion styling — verify `isFilterExcluded` is always `false` for section entries (enforced in T015)

**Checkpoint**: Filter exclusion states render correctly in both visibility modes. P3 independently verified.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish line cleanup and validation.

- [x] T019 [P] Remove stale CSS class names `list-miniview-scene` and `list-miniview-section` from `web/src/components/story/ListView.tsx` (they were on the old inline divs replaced by `ListViewSidebarItem`)
- [ ] T020 Run quickstart.md manual test checklist end-to-end: visual hierarchy, borders, click nav, scroll sync active highlight, filter minify mode, filter hide mode

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (DOM IDs)**: Depends on Phase 1 — **blocks all user stories**
- **Phase 3 (US1 — Navigation)**: Depends on Phase 2
- **Phase 4 (US2 — Visual Hierarchy)**: Depends on Phase 2; can start alongside Phase 3
- **Phase 5 (US3 — Filter States)**: Depends on Phase 3 (needs `ListViewSidebarItem` rendered) and Phase 4 (visual states are part of the item)
- **Phase 6 (Polish)**: Depends on all story phases complete

### User Story Dependencies

- **US1 (P1)**: After Phase 2 — no dependency on US2/US3
- **US2 (P2)**: After Phase 2 — can overlap with US1; T011/T012 are parallel
- **US3 (P3)**: After US1 and US2 complete (filter styles build on the rendered component)

### Parallel Opportunities

Within Phase 4: T011 (section rendering) and T012 (scene rendering) touch different branches of `ListViewSidebarItem` — **can be worked in parallel**.

---

## Parallel Example: User Story 2

```
Phase 2 complete
       │
       ├─ T011 [P] Section branch render (act/chapter styles + active state)
       ├─ T012 [P] Scene branch render (border + active state)
       │
       ▼ (both done)
       T013 IntersectionObserver (activeIndex tracking)
       T014 Title truncation
```

---

## Implementation Strategy (MVP Scope)

**MVP** = Phase 1 + Phase 2 + Phase 3 (US1) = click-to-scroll sidebar navigation only.

This delivers immediate user value (functional table of contents) with the smallest code surface. US2 (visuals + active sync) and US3 (filter states) layer on top as independent increments.

---

## Task Count Summary

| Phase                         | Tasks  | Story | Notes                  |
| ----------------------------- | ------ | ----- | ---------------------- |
| Phase 1: Setup                | 3      | —     | Scaffold + refs        |
| Phase 2: DOM IDs              | 3      | —     | Foundation, blocks all |
| Phase 3: US1 Navigation       | 4      | US1   | MVP                    |
| Phase 4: US2 Visual Hierarchy | 4      | US2   | 2 parallel             |
| Phase 5: US3 Filter States    | 4      | US3   |                        |
| Phase 6: Polish               | 2      | —     |                        |
| **Total**                     | **20** |       |                        |
