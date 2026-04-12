# Data Model: Plots & Scenes Endpoint Split

**Feature**: 036-plots-scenes-endpoint-split  
**Date**: 2026-04-11

---

## Plot (client `web/src/api/types.ts`)

**Before**:

```ts
export interface Plot {
  id: string;
  title: string;
  description: string;
  color: string;
  storyId: string;
  horizontalIndex: number;
  scenes: Scene[]; // ← removed
}
```

**After**:

```ts
export interface Plot {
  id: string;
  title: string;
  description: string;
  color: string;
  storyId: string;
  horizontalIndex: number;
  // scenes field removed — fetched via separate query
}
```

---

## New response type: `ScenesResponse`

Added to `web/src/api/types.ts`:

```ts
export interface ScenesResponse {
  scenes: Scene[];
}
```

The existing `Scene` interface is unchanged.

---

## API response shapes

### `GET /stories/:storyId/plots`

```json
{
  "plots": [
    {
      "id": "abc123",
      "title": "Act 1",
      "description": "",
      "color": "#94A3B8",
      "storyId": "xyz",
      "horizontalIndex": 0
    }
  ]
}
```

**Removed**: `scenes` array from each plot object.

---

### `GET /stories/:storyId/scenes` _(new)_

```json
{
  "scenes": [
    {
      "id": "scene1",
      "title": "Opening",
      "description": "...",
      "plotId": "abc123",
      "tags": [],
      "tagVariants": [],
      "todo": [],
      "snippets": [],
      "verticalIndex": 0,
      "pov": null
    }
  ]
}
```

All scenes for the story returned as a flat array. Each scene carries its `plotId` for client-side association.

---

### `POST /stories/:storyId/plots` — response

```json
{
  "plot": {
    "id": "newplot",
    "title": "New Plot",
    "description": "",
    "color": "#94A3B8",
    "storyId": "xyz",
    "horizontalIndex": 3
  }
}
```

**Removed**: Previously returned `{ ...plot, scenes: [] }`.

---

### `PATCH /stories/:storyId/plots/:plotId` — response

```json
{
  "plot": {
    "id": "abc123",
    "title": "Renamed Act",
    "description": "",
    "color": "#e11d48",
    "storyId": "xyz",
    "horizontalIndex": 0
  }
}
```

**Removed**: Previously fetched and embedded all scenes via `getPlotWithScenes`.

---

## Server-side response helper changes (`storyRouter.ts`)

The `toPlotResponse` helper currently accepts a plot shape with `scenes`. After this change it operates on plot metadata only:

```ts
// Before
const toPlotResponse = (plot: {
  _id: ...; title: ...; ...; scenes: Array<...>;
}) => ({
  id: ..., title: ..., ..., scenes: plot.scenes.map(toSceneResponse)
});

// After
const toPlotResponse = (plot: {
  _id: ...; title: ...; ...
}) => ({
  id: ..., title: ..., ...
  // no scenes
});
```

A new `toScenesResponse` helper (or inline mapping) handles `GET /stories/:storyId/scenes`.

---

## TanStack Query cache keys

| Cache key                      | Type      | Updated by                                                                     |
| ------------------------------ | --------- | ------------------------------------------------------------------------------ |
| `["story", storyId, "plots"]`  | `Plot[]`  | Plot create/update mutations                                                   |
| `["story", storyId, "scenes"]` | `Scene[]` | Scene create/update/delete/move mutations, `applyShiftedResources`, grid-shift |

**Removed**: The existing pattern where scene mutations patched scenes nested inside the plots cache.

---

## `applyFiltersToPlots` signature change

```ts
// Before
applyFiltersToPlots(plots: Plot[], filters: StoryFilter[], options?)

// After
applyFiltersToPlots(
  plots: Plot[],
  scenes: Scene[],
  filters: StoryFilter[],
  options?: { tags?: Tag[]; characters?: Character[] }
)
```

The function now iterates the flat `scenes` array instead of `plot.scenes` per plot. Plot-level filters look up the parent plot via a `Map<string, Plot>` keyed by `plotId`.

---

## `shift-logic.ts` function signature changes

Functions that previously traversed `plot.scenes` now accept a flat `scenes: Scene[]`:

```ts
// Before
shouldShiftForSceneInsert(plots, sections, plotId, verticalIndex)
shouldShiftAfterSceneRemoval(plots, sections, plotId, verticalIndex, removedId)
getMoveRangeShift({ ..., plots, sections })

// After (scenes added as parameter)
shouldShiftForSceneInsert(scenes, sections, plotId, verticalIndex)
shouldShiftAfterSceneRemoval(scenes, sections, plotId, verticalIndex, removedId)
getMoveRangeShift({ ..., scenes, sections })
// plots parameter removed from shift-logic (no longer needed — plots have no scenes)
```

---

## `listViewOrdering.ts` signature change

```ts
// Before
orderScenesForListView(plots: Plot[], sections: Section[])
// iterated plot.scenes per plot

// After
orderScenesForListView(plots: Plot[], scenes: Scene[], sections: Section[])
// iterates flat scenes array, looks up plot by scene.plotId
```

---

## `applyOptimisticShiftToState` signature change (`shifted-resources.ts`)

```ts
// Before
applyOptimisticShiftToState(plots: Plot[], sections: Section[], shift: MoveRangeShift)
// returned { plots: Plot[], sections: Section[] }

// After
applyOptimisticShiftToState(scenes: Scene[], sections: Section[], shift: MoveRangeShift)
// returned { scenes: Scene[], sections: Section[] }
```

`applyShiftRangeToPlots` (internal helper) is replaced by `applyShiftRangeToScenes` that operates on the flat array.

---

## Service layer changes (`storyService.ts`)

```ts
// Removed
listStoryPlotsWithScenesForUser(storyId, userId)

// Added
listStoryPlotsForUser(storyId, userId): Promise<PlotDocument[]>
listStoryScenesForUser(storyId, userId): Promise<SceneDocument[]>
```

`listStoryScenesForUser` validates story access, retrieves plot IDs for the story, then calls `listScenesByPlotIds`.

---

## `plotService.ts` changes

`getPlotWithScenes` is no longer used by any route handler. It can be removed or left unused — the implementation plan calls for removal to keep the service clean.
