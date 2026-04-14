# Research: Color Palette System

## Color Collection Design

**Decision**: A new `colors` MongoDB collection stores palette entries tagged by `resourceType` + `resourceId`.  
**Rationale**: Using a dedicated collection (rather than embedding colors in the story or user document) allows one uniform read/write surface for both user-level and story-level palettes. The `resourceType: "user" | "story"` field plus `resourceId` makes it trivial to query colors for a given resource, copy a batch from user → story, or swap sort order without touching story or user documents.  
**Alternatives considered**: Embedding a `colors` array directly on the story document — rejected because user-level palette seeding requires a second document type, complicating the schema. A separate `userColors` vs. `storyColors` collection — rejected as redundant since the shape is identical.

## Seed Cascade (Lazy Initialization)

**Decision**: Colors are seeded on-demand when `GET /api/stories/:storyId/colors` is called for the first time.  
**Rationale**: Eagerly seeding colors on story creation would require migration of existing stories. A lazy approach is zero-migration and natural — colors appear when the feature is first used. The cascade is: if no story colors exist → clone the user's colors into story scope; if the user also has no colors → clone the 10 system defaults into user scope first, then clone to story.  
**Alternatives considered**: Seeding at story creation — rejected because it would require a migration script for all existing stories. A DB migration to pre-populate — rejected per project convention of avoiding schema migrations.

## Default Color Palette (10 Colors)

**Decision**: Ten system-default colors chosen for visual diversity and usability across plot grids, tags, and import flows.

| Position | Hex       | Label  |
| -------- | --------- | ------ |
| 1        | `#ef4444` | Red    |
| 2        | `#f97316` | Orange |
| 3        | `#eab308` | Yellow |
| 4        | `#22c55e` | Green  |
| 5        | `#14b8a6` | Teal   |
| 6        | `#3b82f6` | Blue   |
| 7        | `#8b5cf6` | Violet |
| 8        | `#ec4899` | Pink   |
| 9        | `#64748b` | Slate  |
| 10       | `#f59e0b` | Amber  |

**Rationale**: All ten are distinct across the visible spectrum, pass reasonable contrast tests against both dark and light backgrounds, align with Tailwind's 500-level palette (familiar to the project's existing color vocabulary), and cover the range used by the existing hardcoded import palette (`paletteColors` in `ImportOutlinePreviewTabs.tsx`).  
**Alternatives considered**: Picking brand colors — rejected, no brand palette defined. Using exclusively light pastels — rejected, insufficient contrast in plot headers.

## Drag-and-Drop Library Choice for Palette Panel

**Decision**: Use `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` (the older v5-style API).  
**Rationale**: The palette panel is a simple vertical sortable list — identical in shape to `CharacterCustomAttributes.tsx` and `SceneTodoList.tsx`, which already use this API. Using the same pattern keeps the codebase consistent and avoids mixing two dnd-kit API generations in the same component type.  
**Alternatives considered**: Using `@dnd-kit/react` (v6 style, used in `PlotGrid`) — rejected; the v6 API is used for the complex 2D grid drag, overkill for a vertical list.

## Palette Dropdown Component

**Decision**: A custom dropdown component (`ColorPaletteDropdown`) that renders palette swatches in a popover and embeds a native `<input type="color">` for freehand selection.  
**Rationale**: No Flowbite React component covers the combined "swatch grid + color picker" pattern. A custom component composed from Tailwind CSS + Flowbite's `Popover` (or a Tailwind-positioned `div`) is the correct approach per constitution. The native `<input type="color">` within the dropdown is still valid because it is not the primary selection mechanism — it is hidden behind the palette swatches and labeled as "Custom."  
**Alternatives considered**: A full third-party color picker library — rejected, introduces an unapproved dependency. Replacing the native color picker entirely with a hex input — rejected, the spec explicitly requires a color picker within the dropdown.

## Frontend Color Access Pattern

**Decision**: A single TanStack Query hook `useStoryColors(storyId)` fetches and caches story palette colors. Components consuming the palette dropdown pass `storyId` down to the hook.  
**Rationale**: Consistent with the project's server-state-in-TanStack-Query principle. The hook invalidates on any color mutation, ensuring the palette panel and all downstream dropdowns stay in sync.  
**Alternatives considered**: Zustand store for palette colors — rejected; palette is server state (persisted), not ephemeral UI state.

## API Surface

**Decision**: Two endpoints under `/api/stories/:storyId/colors`:

- `GET /` — get-or-create palette (triggers seed cascade), returns 10 entries
- `PATCH /:colorId` — update a single entry's `color`, `ignored`, or `sortOrder`

**Rationale**: Order changes are expressed as individual `sortOrder` updates; when the user reorders via drag, the client computes new sort orders and fires a single PATCH per changed entry (or a batch endpoint if performance demands it). A dedicated reorder endpoint is not needed until profiling shows it as a bottleneck.  
**Alternatives considered**: A `POST /reorder` endpoint for bulk sort updates — deferred, not needed for the initial list of ten items given low reorder frequency.

## Resolved Clarifications

All `NEEDS CLARIFICATION` items from Technical Context resolved:

- Color storage: dedicated `colors` collection with `resourceType + resourceId` indexing
- Seed trigger: GET colors endpoint (lazy, no migration)
- Default colors: 10 system defaults (table above)
- DnD API choice: `@dnd-kit/core` + `@dnd-kit/sortable`
- Dropdown implementation: custom component using Tailwind + native color input
