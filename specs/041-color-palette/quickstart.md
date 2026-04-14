# Quickstart: Color Palette System

## Overview

This feature adds a per-story color palette system. A story inherits its palette from the user's palette on first access; users who have never customized their palette receive 10 system defaults. The palette is managed via a sidebar panel and consumed by a reusable dropdown component that replaces all native color inputs in the app.

---

## Backend Changes

### 1. New model: `express/src/models/colors.ts`

- Collection name: `colors`
- Schema: `{ resourceType, resourceId, color, sortOrder, ignored }`
- Indexes: `(resourceType, resourceId)` and unique `(resourceType, resourceId, sortOrder)`
- Exports:
  - `findColorsByResource(type, id)` — returns docs sorted by sortOrder
  - `insertDefaultColors(type, id)` — inserts 10 system defaults
  - `copyColorsFromUser(userId, storyId)` — copies user's 10 docs as story docs
  - `updateColor(colorId, storyId, patch)` — updates color/ignored/sortOrder
- Add `colors` to the `COLLECTIONS` constant in `collections.ts`

### 2. New service: `express/src/services/colorService.ts`

- `getStoryColors(storyId, userId)` — auth-gates via `getStoryForUser`, then runs the seed cascade and returns story colors
- `updateStoryColor(storyId, colorId, userId, patch)` — auth-gate, then calls `updateColor`

### 3. New router: `express/src/routers/colorRouter.ts`

```
GET  /api/stories/:storyId/colors          → colorService.getStoryColors
PATCH /api/stories/:storyId/colors/:colorId → colorService.updateStoryColor
```

Register in `express/src/routers/apiRouter.ts`:

```ts
applyNestedRouter(apiRouter, "/stories", colorRouter);
```

### 4. Validation in router

- `GET`: requires `storyId` param
- `PATCH`: requires `colorId` param; validates body fields per contracts/colors-api.md

---

## Frontend Changes

### 5. New type: `web/src/types/color.ts`

```ts
export type StoryColor = {
  id: string;
  color: string;
  sortOrder: number;
  ignored: boolean;
};
```

### 6. New API client: `web/src/api/colors.ts`

```ts
getStoryColors(storyId: string): Promise<StoryColor[]>
updateStoryColor(storyId: string, colorId: string, patch: Partial<Pick<StoryColor, "color" | "ignored" | "sortOrder">>): Promise<StoryColor>
```

### 7. New hook: `web/src/hooks/useStoryColors.ts`

```ts
useStoryColors(storyId: string)
  → { data: StoryColor[], isPending, isError }
  queryKey: ["stories", storyId, "colors"]

useUpdateStoryColor(storyId: string)
  → mutation that PATCHes a color and invalidates ["stories", storyId, "colors"]
```

### 8. New palette panel: `web/src/components/story/ColorPalettePanel.tsx`

- Sortable list using `@dnd-kit/core` + `@dnd-kit/sortable` (same pattern as `CharacterCustomAttributes.tsx`)
- Each row: drag handle, `<input type="color">` as a styled clickable circle, hex text input, ignore checkbox
- `onDragEnd` handler: swaps `sortOrder` of dragged and target items, fires two `updateStoryColor` mutations
- Hex input validation: accept 3- or 6-digit hex (with or without `#`), normalize to `#rrggbb` before sending
- No add/remove controls

### 9. New dropdown: `web/src/components/ui/ColorPaletteDropdown.tsx`

Props:

```ts
type ColorPaletteDropdownProps = {
  storyId: string | null; // null = no story context, show only custom picker
  value: string; // current hex color
  onChange: (color: string) => void;
};
```

- Renders a trigger button (colored circle showing current value) that toggles a popover
- Popover body: grid of colored circles for each non-ignored palette color, active color highlighted
- Below swatches: labeled `<input type="color">` for custom color selection
- Selecting a swatch or custom color calls `onChange` and closes the popover
- When `storyId` is null, renders only the custom color picker

### 10. Update `SidebarView` type: `web/src/store/sidebarStore.ts`

```ts
// Before:
export type SidebarView = "scene" | "section" | "character" | "tag";
// After:
export type SidebarView = "scene" | "section" | "character" | "tag" | "palette";
```

### 11. Register panel in `DashboardLayout.tsx`

```tsx
{
  currentView === "palette" && <ColorPalettePanel />;
}
```

`ColorPalettePanel` reads `storyId` from the router params (same pattern as `ManageTagsPanel`).

### 12. Add Assets button in `web/src/pages/story.tsx`

```tsx
<CustomTooltip placement="bottom" content="Color palette">
  <button
    type="button"
    onClick={() => {
      addSidebarView("palette");
      openSidebar();
    }}
    className="button px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-600"
  >
    <IconPalette className="text-sm" />
  </button>
</CustomTooltip>
```

### 13. Replace native color inputs

| File                                                        | Component                   | Change                                                       |
| ----------------------------------------------------------- | --------------------------- | ------------------------------------------------------------ |
| `web/src/components/story/CreateTagForm.tsx`                | tag color picker            | Replace `<input type="color">` with `<ColorPaletteDropdown>` |
| `web/src/components/plot/SceneRenderer/PlotHeader.tsx`      | plot color picker           | Replace `<input type="color">` with `<ColorPaletteDropdown>` |
| `web/src/components/dashboard/ImportOutlinePreviewTabs.tsx` | per-plot color in Plots tab | Replace `<input type="color">` with `<ColorPaletteDropdown>` |

For `ImportOutlinePreviewTabs.tsx`: replace the hardcoded `paletteColors` auto-assign array with the first N non-ignored colors from the story palette (fetched via `useStoryColors`). If no story palette available, fall back to system defaults constant.

---

## Dependency Order

1. Backend: `colors.ts` model → `colorService.ts` → `colorRouter.ts` → register in `apiRouter.ts`
2. Frontend types + API client
3. `useStoryColors` hook
4. `ColorPaletteDropdown` component (stateless, depends on hook)
5. `ColorPalettePanel` component (depends on hook + dnd-kit)
6. Sidebar wiring (`SidebarView`, `DashboardLayout`, `story.tsx` button)
7. Replace three native color inputs (depends on `ColorPaletteDropdown`)
