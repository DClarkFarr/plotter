# Quickstart: ListView Sidebar Enhancements

**Branch**: `035-listview-sidebar-enhancements`

## Development Setup

This is a pure frontend change. No backend server is needed for UI development, though the full stack is required to load real story data.

### Start the frontend

```bash
cd web
npm run dev
```

### Start the backend (for real data)

```bash
cd express
npm run dev
```

Navigate to a story's List View to develop and test the sidebar.

---

## Key Files to Modify

| File                                               | Change                                                                                                                                                                |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `web/src/components/story/ListView.tsx`            | Add `id` attrs to list items, add `scrollContainerRef`, `VirtuosoHandle` ref, `activeIndex` state, IntersectionObserver, pass `isActive` + `onClick` to sidebar items |
| `web/src/components/story/ListViewSidebarItem.tsx` | **NEW** — sidebar item component with all visual states                                                                                                               |

## Implementation Notes

### 1. DOM IDs on main list items

In the `orderedScenes.map()` block in `ListView.tsx`, add `id` to the wrapper element of each item:

- Scene: the `<ListViewScene>` wrapper div gets `id={`list-item-scene-${scene.id}`}`
- Section: the `<ListViewSection>` wrapper div gets `id={`list-item-section-${section.id}`}`

> `ListViewScene` and `ListViewSection` render their own root elements. Wrap each in a `<div id={...}>` rather than modifying the child components.

### 2. IntersectionObserver

Use a `useEffect` in `ListView.tsx` that:

1. Queries all `[id^="list-item-"]` elements inside `scrollContainerRef.current`
2. Creates an `IntersectionObserver` with `root: scrollContainerRef.current` and `rootMargin: '0px 0px -70% 0px'`
3. On intersection change, finds the entry with the smallest positive `top` and calls `setActiveIndex(index)` using the element's ID to look up its index in `orderedScenes`

Re-run when `orderedScenes` changes (dependency array).

### 3. Sidebar Virtuoso scroll sync

```tsx
const virtuosoRef = useRef<VirtuosoHandle>(null);

useEffect(() => {
  if (activeIndex !== null) {
    virtuosoRef.current?.scrollIntoView({
      index: activeIndex,
      behavior: "auto",
    });
  }
}, [activeIndex]);
```

Attach `ref={virtuosoRef}` to the sidebar `<Virtuoso>`.

### 4. ListViewSidebarItem visual rules

- **Acts**: Use `text-lg font-bold` (or similar bump above default sidebar text)
- **Chapters**: Use `text-base font-semibold`
- **Scenes**: Use `text-sm` with `border-l-4 border-l-[var(--plot-color)]` and `pl-2`
- **Active state**: Add `bg-sky-50 text-sky-700` and render `~icons/mdi/arrow-right` on the right
- **Filtered + minify**: Add `opacity-40 line-through`
- **Filtered + hide**: Add `opacity-30 cursor-not-allowed pointer-events-none`

### 5. Testing the feature manually

1. Open a story list view with acts, chapters, and scenes across multiple plots.
2. Verify act > chapter > scene text size hierarchy in sidebar.
3. Verify scene sidebar entries show plot-colored left borders.
4. Click a scene entry — confirm main list scrolls to it.
5. Scroll the main list slowly — confirm sidebar highlight moves to match.
6. Activate a filter. Switch to "minify" mode — confirm filtered sidebar items are greyed/struck but clickable.
7. Switch to "hide" mode — confirm filtered sidebar items are muted and clicking does nothing.
