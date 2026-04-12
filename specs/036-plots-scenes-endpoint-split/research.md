# Research: Plots & Scenes Endpoint Split

**Feature**: 036-plots-scenes-endpoint-split  
**Date**: 2026-04-11

## Decision 1: Scene query strategy — single story-level endpoint vs. per-plot `useQueries`

**Decision**: Single endpoint `GET /stories/:storyId/scenes` returning all scenes for the story as a flat array, consumed by a single `useStoryScenesQuery(storyId)` hook.

**Rationale**: All scene operations already scope to a story. The grid renders every scene for every visible plot simultaneously — fetching them per-plot via `useQueries` would produce N parallel requests (one per plot) and require recombining the results client-side anyway. A single request avoids the waterfall, reduces connection overhead, and gives the client a single `["story", storyId, "scenes"]` cache key to update atomically during mutations. Per-plot queries would only pay off if plots were loaded lazily (e.g., virtual columns), which is not the current model.

**Alternatives considered**:

- `GET /stories/:storyId/plots/:plotId/scenes` per plot via `useQueries` — O(N) requests, complex cache management, no real performance gain given all plots render at once.
- Keep scenes inside the plots response — original problem; scenes grow unbounded, every scene mutation blows away all `Plot` object references.

---

## Decision 2: Cache key structure after the split

**Decision**:

- `["story", storyId, "plots"]` → `Plot[]` — plot metadata only, no scenes. Updated only when plot titles/colors/positions change.
- `["story", storyId, "scenes"]` → `Scene[]` — flat array of all scenes across all plots in the story. Updated on every scene CRUD and move operation.

**Rationale**: Separation means `Plot` objects are stable references. Column headers and plot-dependent components subscribe to `["story", storyId, "plots"]` and will not re-render when scenes change. Scene cards and grid cells subscribe to `["story", storyId, "scenes"]` and re-render only when scene data changes. This achieves the primary performance goal: a single scene update no longer triggers a re-render of the entire plot grid structure.

**Alternatives considered**:

- Per-plot scene cache keys `["story", storyId, "plots", plotId, "scenes"]` — finer granularity but complicates cross-plot operations (move scene, shift grid, delete scene), which need to update multiple cache entries atomically. Gains are marginal since TanStack Query already does structural equality on `setQueryData`.

---

## Decision 3: Refactoring `shift-logic.ts` — scene access pattern

**Decision**: Refactor all functions in `shift-logic.ts` that currently accept `plots: Plot[]` and traverse `plot.scenes` to instead accept `scenes: Scene[]` as a separate parameter alongside `plots: Plot[]`.

**Rationale**: Functions like `hasSceneOnPlotIndex`, `hasSceneOnStoryIndex`, `shouldShiftForSceneInsert`, `shouldShiftAfterSceneRemoval`, `getMoveRangeShift`, and the scene-related predicates in `shifted-resources.ts` all read from `plot.scenes`. After the split, `Plot` has no `scenes` field. These functions need to be given the flat scene array and filter by `plotId` themselves.

The change is mechanical: `plot.scenes.some(...)` becomes `scenes.filter(s => s.plotId === plot.id).some(...)` or direct filtering on the flat array. The call sites in `scene-mutations.ts` pass both `plots` and `scenes` query data.

**Alternatives considered**:

- Pass a `Map<plotId, Scene[]>` — premature optimization; the scene arrays are small and the shift logic runs once per mutation, not in a render loop.

---

## Decision 4: Handling `applyFiltersToPlots`

**Decision**: Change the signature of `applyFiltersToPlots` to accept `plots: Plot[]` and `scenes: Scene[]` as separate arguments. The `matchesPlotFilter` logic remains unchanged (it only reads `plot.title`). The inner loop that was `plots.forEach(plot => plot.scenes.forEach(scene => ...))` becomes a direct `scenes.forEach(scene => ...)` over the flat array, looking up the parent plot via a `Map<plotId, Plot>` for the plot-level filter check.

**Rationale**: The function's callers — `PlotGridBody` and `ListView` — already have the scenes query available (they will call `useStoryScenesQuery`). Passing scenes in is a small signature change; no structural rethink needed.

---

## Decision 5: `PlotGrid` and `ListView` — removing the `plots` prop

**Decision**: Remove the `plots: Plot[]` prop from both `PlotGrid` and `ListView`. Both components receive `storyId` already; they will call `useStoryPlotsQuery(storyId)` and `useStoryScenesQuery(storyId)` internally.

**Rationale**: The user explicitly requested this (point 1). Removing the prop also means `StoryPage` no longer needs to derive `plots` from the query and pass it down — the page becomes a thin shell that just renders the components. More importantly, React's bailout logic can now avoid re-rendering `PlotGrid` because its props (`{ storyId }`) are always the same object shape with no changing reference.

**Alternatives considered**:

- Keep props, pass both `plots` and `scenes` — no structural improvement; the parent would still be the subscriber, just forwarding data down.

---

## Decision 6: Backend — `GET /stories/:storyId/scenes` endpoint shape

**Decision**: Add `GET /stories/:storyId/scenes` to `storyRouter.ts`. Returns `{ scenes: Scene[] }` where each scene has the same shape as scene CRUD responses already use. No additional filtering query params needed initially — returns all scenes for the story.

Access control: validates that the requesting user has access to the story (calls `getStoryForUser`), then fetches all plots for the story to get their IDs, then calls the existing `listScenesByPlotIds` model function. No new MongoDB queries needed.

**Rationale**: `listScenesByPlotIds` already exists in `express/src/models/scenes.ts` and is already used by `listStoryPlotsWithScenesForUser` in `storyService.ts`. We reuse that model function, just exposing it via a new route rather than embedding results in the plots response.

---

## Decision 7: Server — `listStoryPlotsWithScenesForUser` → `listStoryPlotsForUser`

**Decision**: Replace `listStoryPlotsWithScenesForUser` in `storyService.ts` with a leaner `listStoryPlotsForUser` that returns plain `PlotDocument[]` without scenes. The old function is used only by the plots list route; replacing it keeps the service clean.

**Rationale**: The `getPlotWithScenes` plot service function (used by PATCH) is also no longer needed. The PATCH handler can return the updated plot document directly, avoiding a second DB round-trip.

---

## Summary Table

| Area                                    | Before                                        | After                                                 |
| --------------------------------------- | --------------------------------------------- | ----------------------------------------------------- |
| `GET /stories/:storyId/plots`           | Returns `Plot[]` with `scenes` embedded       | Returns `Plot[]` metadata only                        |
| `GET /stories/:storyId/scenes`          | Does not exist                                | Returns flat `Scene[]` for the story                  |
| `PATCH /stories/:storyId/plots/:plotId` | Re-fetches plot + scenes                      | Returns updated plot metadata only                    |
| `POST /stories/:storyId/plots`          | Returns plot with `scenes: []`                | Returns plot metadata only                            |
| `Plot` type (client)                    | `{ ..., scenes: Scene[] }`                    | `{ ... }` (no scenes)                                 |
| Plots cache `["story", id, "plots"]`    | Includes scenes; invalidated on scene changes | Metadata only; never invalidated by scene ops         |
| Scenes cache `["story", id, "scenes"]`  | Does not exist                                | Flat `Scene[]`; updated by all scene mutations        |
| `scene-mutations.ts`                    | Reads/writes `plot.scenes` inside plots cache | Reads/writes flat scenes cache; plots cache untouched |
| `shifted-resources.ts`                  | Shifts scenes inside `plot.scenes`            | Shifts scenes in flat scenes cache                    |
| `shift-logic.ts`                        | Traverses `plot.scenes`                       | Takes flat `scenes: Scene[]` parameter                |
| `applyFiltersToPlots`                   | Iterates `plot.scenes`                        | Takes flat `scenes: Scene[]` parameter                |
| `PlotGrid`                              | Receives `plots: Plot[]` as prop              | Calls `useStoryPlotsQuery` + `useStoryScenesQuery`    |
| `ListView`                              | Receives `plots: Plot[]` as prop              | Calls `useStoryPlotsQuery` + `useStoryScenesQuery`    |
| `listViewOrdering.ts`                   | Takes `plots: Plot[]`, iterates scenes        | Takes `plots: Plot[]` + `scenes: Scene[]`             |
