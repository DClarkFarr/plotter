# Data Model: ListView Sidebar Enhancements

**Branch**: `035-listview-sidebar-enhancements`  
**Phase**: 1 — Design  
**Date**: 2026-04-11

> This feature introduces no new backend entities or API changes. All changes are component-layer UI state.

---

## Component State: `ListView.tsx`

### New state: `activeIndex`

```ts
const [activeIndex, setActiveIndex] = useState<number | null>(null);
```

| Field         | Type             | Description                                                                                                                                     |
| ------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `activeIndex` | `number \| null` | Index into the `orderedScenes` array that is currently in view in the main list. `null` = nothing tracked yet. Updated by IntersectionObserver. |

### New ref: `virtuosoRef`

```ts
const virtuosoRef = useRef<VirtuosoHandle>(null);
```

Used to call `virtuosoRef.current.scrollIntoView({ index: activeIndex })` when `activeIndex` changes, keeping the sidebar in sync.

### New ref: `scrollContainerRef`

```ts
const scrollContainerRef = useRef<HTMLDivElement>(null);
```

Attached to the outer `overflow-y-auto` div. Passed as `root` to `IntersectionObserver` so intersection detection is scoped to the scroll container, not the viewport.

---

## New Component: `ListViewSidebarItem`

**File**: `web/src/components/story/ListViewSidebarItem.tsx`

### Props

```ts
export type ListViewSidebarItemProps = {
  entry: OrderedSceneEntry;
  isActive: boolean;
  isFilterExcluded: boolean;
  filterVisibilityMode: FilterVisibilityMode;
  onClick: () => void;
};
```

| Prop                   | Type                   | Description                                                                                                                 |
| ---------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `entry`                | `OrderedSceneEntry`    | The scene or section entry to render. Discriminated union — `entryIsScene()` guard used internally.                         |
| `isActive`             | `boolean`              | Whether this item is the currently-highlighted (in-viewport) item. Renders sky-700 highlight, right arrow icon when `true`. |
| `isFilterExcluded`     | `boolean`              | Whether this entry is excluded by active filters. Only meaningful for scene entries.                                        |
| `filterVisibilityMode` | `FilterVisibilityMode` | `"hide"` or `"minify"` — controls how excluded items are de-emphasized.                                                     |
| `onClick`              | `() => void`           | Called when the entry is clicked (if not disabled). Triggers `scrollIntoView` in parent.                                    |

### Visual States Matrix (Scene Entries)

| `isActive` | `isFilterExcluded` | `filterVisibilityMode` | Visual Treatment                                                       |
| ---------- | ------------------ | ---------------------- | ---------------------------------------------------------------------- |
| `true`     | `false`            | any                    | Sky-50 bg, sky-700 text, right arrow, plot border                      |
| `false`    | `false`            | any                    | Default: subtle, plot-colored left border                              |
| `false`    | `true`             | `"minify"`             | `opacity-40`, `line-through`, clickable, plot border                   |
| `false`    | `true`             | `"hide"`               | `opacity-30`, `cursor-not-allowed`, non-clickable, no border highlight |
| `true`     | `true`             | `"minify"`             | Sky highlight + de-emphasis (active wins for background)               |

### Section Entry Visual States (Acts and Chapters)

| Section Type       | Visual Treatment                                                        |
| ------------------ | ----------------------------------------------------------------------- |
| `"act"`            | Large bold text (e.g., `text-lg font-bold`), full width, never filtered |
| `"chapter"`        | Medium text (e.g., `text-base font-semibold`), never filtered           |
| Either, `isActive` | Sky-50 bg + sky-700 text + right arrow                                  |

---

## DOM ID Convention

Each main list item rendered in the `orderedScenes.map()` block gets a stable `id`:

| Entry Type | DOM ID                            |
| ---------- | --------------------------------- |
| Scene      | `list-item-scene-${scene.id}`     |
| Section    | `list-item-section-${section.id}` |

The sidebar `onClick` handler calls:

```ts
document
  .getElementById(`list-item-scene-${scene.id}`)
  ?.scrollIntoView({ behavior: "smooth", block: "start" });
```

---

## IntersectionObserver Setup

```
Root: scrollContainerRef.current   (the overflow-y-auto div)
Targets: all [id^="list-item-"] elements
Threshold: 0
rootMargin: "0px 0px -70% 0px"    (only top 30% of container counts as "visible")
```

On intersection change, the entry with the smallest `boundingClientRect.top ≥ 0` (nearest to top) wins and sets `activeIndex` to its position in `orderedScenes`.
