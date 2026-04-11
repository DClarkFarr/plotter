# Research: ListView Sidebar Enhancements

**Branch**: `035-listview-sidebar-enhancements`  
**Phase**: 0 — Pre-design research  
**Date**: 2026-04-11

## Decision 1: Sidebar → Main Scroll (Click Navigation)

**Decision**: Use `document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'start' })`.

**Rationale**: The main list content is rendered as a plain `Array.map()` inside a scrollable `overflow-y-auto` div — it is **not** a Virtuoso instance. Native DOM scroll APIs are the correct and simplest approach. Each main list item gets a stable `id` attribute derived from its entry identity (`scene-${scene.id}` or `section-${section.id}`).

**Alternatives considered**:

- `Virtuoso.scrollToIndex()` — rejected. The main content is not a Virtuoso list; the sidebar Virtuoso renders the mini-entries, not the main items.
- `useRef` + manual `scrollTop` — rejected. More code, same result, less readable than `scrollIntoView`.

---

## Decision 2: Main Scroll → Sidebar Sync (Active Item Tracking)

**Decision**: Use a single `IntersectionObserver` (with `threshold: 0`, `rootMargin: '0px 0px -70% 0px'`) on the scrollable root div. The topmost intersecting entry becomes the active item. `activeIndex` is stored as `number | null` in `ListView` component state.

**Rationale**: IntersectionObserver is more performant than attaching a `scroll` event listener, handles items entering/leaving the viewport natively, and does not block the main thread. With the `rootMargin` trick, only items in the top ~30% of the viewport are considered "active", giving a natural "first visible item wins" behavior.

**Alternatives considered**:

- `onScroll` + manual `getBoundingClientRect()` polling — rejected. More CPU, worse battery, requires throttling.
- Virtuoso's built-in `rangeChanged` callback — rejected. The sidebar Virtuoso knows which sidebar items are visible, not which main list items are visible. The two Virtuoso instances are independent.

---

## Decision 3: Sidebar Virtuoso Scroll-to-Active Sync

**Decision**: Attach a `ref` (`useRef<VirtuosoHandle>`) to the sidebar `Virtuoso` component. When `activeIndex` changes, call `virtuosoRef.current?.scrollIntoView({ index: activeIndex, behavior: 'smooth' })`.

**Rationale**: `VirtuosoHandle.scrollIntoView` is the official Virtuoso API for programmatic scrolling to a specific item by index. The index maps 1:1 to the `orderedScenes` array index (same array driving both the sidebar and main content). Using `behavior: 'auto'` (not `smooth`) is preferred here to avoid conflicting animations when the sidebar tries to follow fast user scrolling.

**Alternatives considered**:

- `scrollToIndex` — also valid but `scrollIntoView` is preferred as it does nothing if the item is already visible.

---

## Decision 4: Component Decomposition

**Decision**: Extract a `ListViewSidebarItem` component that accepts `entry`, `plot` (for scenes), `isActive`, `isFilterExcluded`, `filterVisibilityMode`, and `onClick`. Keep the sidebar rendering logic out of `ListView.tsx`'s inline `itemContent` prop.

**Rationale**: The sidebar item logic is non-trivial (three visual states for section type, filter state, active state, plot border). Inlining it in `itemContent` would make `ListView.tsx` unreadable. A dedicated component matches the project pattern (`ListViewScene`, `ListViewSection` are similarly extracted).

---

## Decision 5: Active Item Highlight Design

**Decision**: Active sidebar entry gets `bg-sky-50` background, `text-sky-700` text color, and an `mdi:arrow-right` icon aligned to the right edge.

**Rationale**: Sky-700 is the user-specified highlight color. `bg-sky-50` (very light blue) provides a gentle background that does not overwhelm the sidebar. The arrow icon on the right provides a strong affordance that this is the "current position".

**Icon**: `~icons/mdi/arrow-right` (MDI, via unplugin-icons — constitution compliant).

---

## Decision 6: Filter State Rendering in Sidebar

**Decision**:

- `filterVisibilityMode === 'minify'` + `isFilterExcluded === true` → `opacity-40 line-through` classes, pointer events preserved, click still navigates.
- `filterVisibilityMode === 'hide'` + `isFilterExcluded === true` → `opacity-30 cursor-not-allowed` classes, `pointer-events-none` or `onClick` guard prevents scroll.
- Section entries (acts, chapters) are never treated as excluded.

**Rationale**: Matches the existing visual language in `ListViewScene` where "hide" completely suppresses the item and "minify" shows a de-emphasized version. The sidebar uses analogous treatment at a compact scale.

---

## Decision 7: DOM ID Format

**Decision**:

- Scene items: `id="list-item-scene-${scene.id}"`
- Section items: `id="list-item-section-${section.id}"`

**Rationale**: Stable, namespaced IDs avoid collisions with other elements. `scene.id` and `section.id` are MongoDB ObjectIDs — globally unique and URL-safe characters only (`[a-f0-9]{24}`), so no escaping needed in `getElementById`.
