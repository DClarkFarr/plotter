# Implementation Plan: Plots & Scenes Endpoint Split

**Branch**: `036-plots-scenes-endpoint-split` | **Date**: 2026-04-11 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/036-plots-scenes-endpoint-split/spec.md`

## Summary

Decouple scenes from the plots API response to eliminate the performance bottleneck where every scene mutation caused a full re-render of the plot grid. The plots list endpoint returns plot metadata only. A new story-level scenes endpoint returns all scenes as a flat array. Client-side, plots and scenes are held in separate TanStack Query caches; scene changes no longer invalidate plot objects. `PlotGrid` and `ListView` remove their `plots` prop and call both queries internally.

## Technical Context

**Language/Version**: TypeScript 5.x (both express/ and web/)  
**Primary Dependencies**: Express 4, MongoDB (via driver), React 18, TanStack Query v5, TanStack Router, Zustand, dnd-kit  
**Storage**: MongoDB — no schema changes; all data already exists  
**Testing**: None required (per constitution)  
**Target Platform**: Node.js server + browser SPA  
**Performance Goals**: Plots cache must not be touched by scene mutations; scene CRUD response time unchanged  
**Constraints**: No new third-party libraries; no MongoDB schema migrations; TypeScript must compile with zero errors after refactor  
**Scale/Scope**: Full-stack refactor touching ~12 files; no new pages or routes beyond the single new GET endpoint

## Constitution Check

All principles honored:

- **I. Stack Guardrails** — Express + MongoDB backend unchanged. React frontend; TanStack Query for both the plots and new scenes query; no new libraries introduced.
- **II. Clean Architecture** — New route is thin; new service function `listStoryScenesForUser` holds the workflow; MongoDB access stays in `models/scenes.ts` via existing `listScenesByPlotIds`.
- **III. Routing / Services / Data Access** — Route added to `storyRouter.ts`; service function in `storyService.ts`; no MongoDB calls outside models/.
- **IV. Security** — New route validates user access to story via `getStoryForUser` before returning scenes.
- **V. Performance** — Eliminates O(scenes) plot payload inflation; plots cache becomes stable across scene mutations.

## Project Structure

### Documentation (this feature)

```text
specs/036-plots-scenes-endpoint-split/
├── plan.md          ← this file
├── research.md      ← architectural decisions
├── data-model.md    ← type and signature changes
├── quickstart.md    ← verification steps
└── contracts/
    └── api.md       ← endpoint contracts
```

### Source files modified

```text
express/
└── src/
    ├── routers/
    │   └── storyRouter.ts          # new GET /scenes route; strip scenes from plot responses
    └── services/
        ├── storyService.ts         # new listStoryScenesForUser; replace listStoryPlotsWithScenesForUser
        └── plotService.ts          # remove getPlotWithScenes

web/
└── src/
    ├── api/
    │   ├── types.ts                # Plot type loses scenes; new ScenesResponse
    │   └── stories.ts              # new listStoryScenes() API function
    ├── queries/
    │   ├── story/
    │   │   ├── story-queries.ts    # new useStoryScenesQuery
    │   │   ├── shifted-resources.ts # applyShiftedScenes → scenes cache; applyOptimisticShiftToState signature
    │   │   └── shift-logic.ts      # replace plots+scenes traversal with flat scenes parameter
    │   ├── scene/
    │   │   └── scene-mutations.ts  # all cache ops target scenes cache key; rebuild optimistic logic
    │   └── plot/
    │       └── plot-mutations.ts   # optimistic plots cache no longer carries scenes field
    ├── components/
    │   ├── plot/
    │   │   └── PlotGrid.tsx        # remove plots prop; call queries internally
    │   └── story/
    │       └── ListView.tsx        # remove plots prop; call queries internally
    ├── pages/
    │   └── story.tsx               # remove plots prop from PlotGrid and ListView
    └── utils/
        ├── applyFiltersToPlots.ts  # new scenes parameter; iterate flat scenes array
        └── listViewOrdering.ts     # new scenes parameter
```

---

## Phase 0: Research

All NEEDS CLARIFICATION items resolved. See [research.md](./research.md) for full decision log.

**Key resolved decisions**:

- Single `GET /stories/:storyId/scenes` endpoint (not per-plot `useQueries`) — one request, one cache key.
- Cache keys: `["story", storyId, "plots"]` for metadata; `["story", storyId, "scenes"]` for flat scene array.
- `Plot` type drops `scenes` field entirely; no backward compat layer needed.
- All shift-logic functions accept flat `scenes: Scene[]` instead of traversing `plot.scenes`.
- `PlotGrid` and `ListView` remove `plots` prop and call both queries internally.

---

## Phase 1: Design & Contracts

### 1.1 Data model

See [data-model.md](./data-model.md). Summary:

- `Plot` interface: remove `scenes: Scene[]`
- Add `ScenesResponse` interface
- `applyFiltersToPlots` signature: add `scenes: Scene[]` second parameter
- `shift-logic.ts` functions: replace `plots: Plot[]` with `scenes: Scene[]`
- `applyOptimisticShiftToState`: operate on `{ scenes, sections }` instead of `{ plots, sections }`

### 1.2 API contracts

See [contracts/api.md](./contracts/api.md). Summary:

- `GET /stories/:storyId/plots` — removes `scenes` from each plot object
- `GET /stories/:storyId/scenes` — new endpoint
- `POST /stories/:storyId/plots` — removes `scenes` from response
- `PATCH /stories/:storyId/plots/:plotId` — removes `scenes` from response

### 1.3 Agent context

Run after writing this plan:

```bash
cd /Users/daniel/git/plotter && .specify/scripts/bash/update-agent-context.sh copilot
```

---

## Implementation Order

Work must proceed back-to-front: server first (so the new endpoint exists), then client types, then query layer, then components, then utilities.

### Step 1 — Server: service layer

**File**: `express/src/services/storyService.ts`

1. Add `listStoryPlotsForUser(storyId, userId)`:
   - Calls `getStoryForUser` then `listPlots({ storyId })`
   - Returns `PlotDocument[]` (no scenes)
2. Add `listStoryScenesForUser(storyId, userId)`:
   - Calls `getStoryForUser`, then `listPlotIdsByStoryId`, then `listScenesByPlotIds`
   - Returns scene documents
3. Remove `listStoryPlotsWithScenesForUser` (only used by the plots route)

**File**: `express/src/services/plotService.ts`

4. Remove `getPlotWithScenes` (no longer called by any route)

---

### Step 2 — Server: router

**File**: `express/src/routers/storyRouter.ts`

5. Update `toPlotResponse` helper — remove `scenes` parameter and mapping:

   ```ts
   // Remove: scenes: Array<...> from parameter type
   // Remove: scenes: plot.scenes.map(toSceneResponse) from return
   ```

6. Update import: replace `listStoryPlotsWithScenesForUser` with `listStoryPlotsForUser` and import `listStoryScenesForUser`.

7. Update `GET /:storyId/plots` route handler:
   - Call `listStoryPlotsForUser` instead of `listStoryPlotsWithScenesForUser`
   - Response shape: `{ plots: plots.map(toPlotResponse) }`

8. Update `POST /:storyId/plots` route handler:
   - Currently returns `toPlotResponse({ ...plot, scenes: [] })` — change to `toPlotResponse(plot)`

9. Update `PATCH /:storyId/plots/:plotId` route handler:
   - Remove the `getPlotWithScenes` call after `updatePlotById`
   - Return `toPlotResponse(updated)` directly

10. Add `GET /:storyId/scenes` route handler:
    ```ts
    storyRouter.get(
      "/:storyId/scenes",
      handleAsync(async (req, res) => {
        const userId = requireUserId(req);
        const storyId = assertparamIsString(req.params.storyId, "storyId");
        const scenes = await listStoryScenesForUser(storyId, userId);
        res.status(200).json({ scenes: scenes.map(toSceneResponse) });
      }),
    );
    ```

---

### Step 3 — Client: types

**File**: `web/src/api/types.ts`

11. Remove `scenes: Scene[]` from the `Plot` interface.
12. Add `ScenesResponse` interface: `{ scenes: Scene[] }`.

---

### Step 4 — Client: API function

**File**: `web/src/api/stories.ts`

13. Add `listStoryScenes(storyId: string): Promise<Scene[]>`:
    ```ts
    const { data } = await apiClient.get<ScenesResponse>(
      `/stories/${storyId}/scenes`,
    );
    return data.scenes;
    ```
14. Import `ScenesResponse` at the top of the file.

---

### Step 5 — Client: query hooks

**File**: `web/src/queries/story/story-queries.ts`

15. Add `useStoryScenesQuery(storyId: string)`:
    ```ts
    export function useStoryScenesQuery(storyId: string) {
      return useQuery({
        queryKey: useStoryScenesQuery.queryKey(storyId),
        queryFn: () => listStoryScenes(storyId),
        enabled: Boolean(storyId),
        staleTime: 30 * 1000,
      });
    }
    useStoryScenesQuery.queryKey = (storyId: string) => [
      "story",
      storyId,
      "scenes",
    ];
    ```

---

### Step 6 — Client: shift-logic refactor

**File**: `web/src/queries/story/shift-logic.ts`

The core change: replace `plots: Plot[]` with `scenes: Scene[]` in all helper functions that previously accessed `plot.scenes`. The `plots: Plot[]` parameter in `getMoveRangeShift` is only used to read scenes — it becomes `scenes: Scene[]`.

16. Replace `hasSceneOnPlotIndex(plots, plotId, verticalIndex, excludeId?)`:

    ```ts
    // Before: finds plot by plotId, checks plot.scenes
    // After: filters flat scenes array by plotId
    const hasSceneOnPlotIndex = (
      scenes: Scene[],
      plotId: string,
      verticalIndex: number,
      excludeId?: string,
    ) =>
      scenes.some(
        (s) =>
          s.plotId === plotId &&
          s.verticalIndex === verticalIndex &&
          s.id !== excludeId,
      );
    ```

17. Replace `hasSceneOnStoryIndex(plots, verticalIndex, excludeId?)`:

    ```ts
    const hasSceneOnStoryIndex = (
      scenes: Scene[],
      verticalIndex: number,
      excludeId?: string,
    ) =>
      scenes.some(
        (s) => s.verticalIndex === verticalIndex && s.id !== excludeId,
      );
    ```

18. Update `shouldShiftForSceneInsert(plots, sections, ...)` → `(scenes, sections, ...)`.
19. Update `shouldShiftAfterSceneRemoval(plots, sections, ...)` → `(scenes, sections, ...)`.
20. Update `MoveRangeShiftProps`: replace `plots: Plot[]` with `scenes: Scene[]`.
21. Update `getMoveRangeShift` to use `scenes` instead of `plots`.
22. Remove the `Plot` import if no longer needed; add `Scene` import.

---

### Step 7 — Client: shifted-resources refactor

**File**: `web/src/queries/story/shifted-resources.ts`

23. Replace `applyShiftedScenes(plots, scenes)` — instead of patching `plot.scenes` arrays, update the flat scenes cache:

    ```ts
    // New: operates on Scene[] directly
    const applyShiftedScenes = (
      current: Scene[],
      shifted: ShiftedResources["scenes"],
    ): Scene[] => {
      if (shifted.length === 0) return current;
      const map = new Map(shifted.map((s) => [s.id, s]));
      return sortScenes(current.map((s) => map.get(s.id) ?? s));
    };
    ```

24. Update `applyShiftedResources` to write scenes to `useStoryScenesQuery.queryKey`:

    ```ts
    queryClient.setQueryData<Scene[]>(
      useStoryScenesQuery.queryKey(storyId),
      (current) =>
        current
          ? applyShiftedScenes(current, shiftedResources.scenes)
          : current,
    );
    ```

25. Update `applyShiftRangeToScenes` (replaces `applyShiftRangeToPlots`) — operates on `Scene[]`:

    ```ts
    const applyShiftRangeToScenes = (
      scenes: Scene[],
      shift: MoveRangeShift,
    ): Scene[] =>
      scenes.map((s) =>
        shouldShiftIndex(s.verticalIndex, shift)
          ? { ...s, verticalIndex: s.verticalIndex + shift.shift }
          : s,
      );
    ```

26. Update `applyOptimisticShiftToState(plots, sections, shift)` → `(scenes, sections, shift)`:
    - Replace `applyShiftRangeToPlots(plots, shift)` with `applyShiftRangeToScenes(scenes, shift)`
    - Return type: `{ scenes: Scene[], sections: Section[] }`

27. Update `applyOptimisticShift(queryClient, storyId, shift)` to read/write scenes cache:
    ```ts
    export const applyOptimisticShift = (...) => {
      const { scenes, sections } = applyOptimisticShiftToState(
        queryClient.getQueryData<Scene[]>(useStoryScenesQuery.queryKey(storyId)) ?? [],
        queryClient.getQueryData<Section[]>(useStorySectionsQuery.queryKey(storyId)) ?? [],
        shift,
      );
      queryClient.setQueryData<Scene[]>(useStoryScenesQuery.queryKey(storyId), scenes);
      queryClient.setQueryData<Section[]>(useStorySectionsQuery.queryKey(storyId), sections);
    };
    ```

---

### Step 8 — Client: scene mutations refactor

**File**: `web/src/queries/scene/scene-mutations.ts`

All four mutations (`useCreateSceneMutation`, `useUpdateSceneMutation`, `useDeleteSceneMutation`, `useMoveSingleWithinPlot`) are refactored. The pattern is the same for each:

**Old pattern** (all four mutations):

- Cancel queries on `useStoryPlotsQuery.queryKey`
- Read `Plot[]` from plots cache
- Find/modify/remove scenes by traversing `plot.scenes`
- Write back to plots cache

**New pattern**:

- Cancel queries on `useStoryScenesQuery.queryKey`
- Read `Scene[]` from scenes cache
- Operate on the flat array directly
- Write back to scenes cache
- Plots cache (`useStoryPlotsQuery.queryKey`) is never touched by scene mutations

28. **`useCreateSceneMutation`**:
    - `onMutate`: cancel scenes query; read `Scene[]`; build optimistic scene; call `shouldShiftForSceneInsert(scenes, sections, ...)` (new signature); call `applyOptimisticShiftToState(scenes, sections, shift)` → gets `{ scenes, sections }`; push optimistic scene; write back scenes + sections.
    - `onError`: restore previous scenes and sections.
    - `onSuccess`: replace temp scene in scenes cache via `setQueryData<Scene[]>`.

29. **`useUpdateSceneMutation`**:
    - `onMutate`: cancel scenes query; read `Scene[]`; call `shiftScenesForInsert` on the flat array (already operates on `Scene[]`, unchanged); map to update target scene; write back.
    - `onError`: restore.
    - `onSuccess`: replace scene in scenes cache.

30. **`useDeleteSceneMutation`**:
    - `onMutate`: cancel scenes query; read `Scene[]`; find target scene by ID; remove from array; call `shouldShiftAfterSceneRemoval(scenes, sections, ...)` (new signature); apply shift; write back.
    - `onError`: restore.
    - `onSuccess`: filter scene out of scenes cache.

31. **`useMoveSingleWithinPlot`** (inside `MoveSceneMutations`):
    - `onMutate`: cancel scenes query; read `Scene[]`; find moved scene by `input.sceneId` (no longer needs to find which plot it's in first — just filter by id); call `getMoveRangeShift({ ..., scenes, sections })` (new signature); apply optimistic shift; update moved scene's `verticalIndex` and `plotId`; write back.
    - `onError`: restore.
    - `onSuccess`: call `applyShiftedResources` (already updated in step 24).

---

### Step 9 — Client: plot mutations

**File**: `web/src/queries/plot/plot-mutations.ts`

32. **`useCreatePlotMutation`** — `onMutate` optimistic plot no longer has `scenes: []` field. Remove it.

33. **`useUpdatePlotMutation`** — `onMutate` optimistic spread no longer touches scenes (they weren't included, but confirm no scene-related code remains). `onSuccess` writes updated plot to plots cache — fine, no scenes involved.

---

### Step 10 — Client: utilities

**File**: `web/src/utils/applyFiltersToPlots.ts`

34. Add `scenes: Scene[]` as second parameter (after `plots`).
35. Remove iteration of `plot.scenes`. Replace with direct iteration of `scenes` array.
36. Build a `Map<string, Plot>` from `plots` keyed by `plot.id` for the `matchesPlotFilter` lookup:
    ```ts
    const plotById = new Map(plots.map((p) => [p.id, p]));
    // ...
    scenes.forEach((scene) => {
      const plot = plotById.get(scene.plotId);
      if (!plot || !matchesPlotFilter(plot)) return;
      if (
        matchesTagFilter(scene) &&
        matchesCharacterFilter(scene) &&
        matchesSearchFilter(scene)
      ) {
        includedSceneIds.push(scene.id);
      }
    });
    ```
37. Update `matchesPlotFilter` — now receives a `Plot` directly (already only uses `plot.title`), no API change needed internally.
38. Remove the `Plot["scenes"][number]` type references in `matchesTagFilter`, `matchesCharacterFilter`, `matchesSearchFilter` — replace with `Scene` type.

**File**: `web/src/utils/listViewOrdering.ts`

39. Add `scenes: Scene[]` as second parameter (after `plots`).
40. Replace `plots.flatMap(plot => plot.scenes.map(s => ({ scene: s, plot })))` with:
    ```ts
    const plotById = new Map(plots.map((p) => [p.id, p]));
    const sceneEntries: OrderedSceneEntry[] = scenes
      .filter((s) => plotById.has(s.plotId))
      .map((s) => ({ scene: s, plot: plotById.get(s.plotId)! }));
    ```

---

### Step 11 — Client: PlotGrid

**File**: `web/src/components/plot/PlotGrid.tsx`

41. Remove `plots: Plot[]` from `PlotGridProps`.
42. Import and call `useStoryPlotsQuery(storyId)` and `useStoryScenesQuery(storyId)` inside the component (both `PlotGrid` and `PlotGridBody`).
43. Where `plots` was used from props, use `plots = plotsQuery.data ?? []`.
44. Where scenes were read from `plot.scenes` in `getGridRows`, `scenesByColIndex`, `grid` construction: replace with the flat `scenes` array from `useStoryScenesQuery`.
45. Update `getGridRows(plots, sections)` helper — scenes are now needed separately:
    - Currently iterates `plot.scenes` to find max `verticalIndex`. Change to iterate `scenes` directly.
46. Update `scenesByColIndex` memo — instead of `plot.scenes`, build from the flat scenes array:
    ```ts
    const scenesByColIndex = useMemo(() => {
      const plotMap = new Map<string, Map<number, Scene>>();
      for (const scene of scenes) {
        let inner = plotMap.get(scene.plotId);
        if (!inner) {
          inner = new Map();
          plotMap.set(scene.plotId, inner);
        }
        inner.set(scene.verticalIndex, scene);
      }
      return plotMap;
    }, [scenes]);
    ```
47. Update `grid` construction — `plot.scenes.findIndex(s => s.verticalIndex === r)` replaced with checking the scene map directly.
48. Pass correct scene data to `SceneActionsCard` and `DraggableSceneData` (scene comes from the flat scenes map, not `plot.scenes[index]`).

Note: `DraggableSceneData` currently holds `plot: Plot` which is used in drag events. After the split, `Plot` has no scenes — this is fine; drag data will hold the plot metadata and move operations still work because `useMoveSingleWithinPlot` now operates on the scenes cache.

---

### Step 12 — Client: ListView

**File**: `web/src/components/story/ListView.tsx`

49. Remove `plots: Plot[]` from `ListViewProps`.
50. Call `useStoryPlotsQuery(storyId)` and `useStoryScenesQuery(storyId)` inside the component.
51. Update `applyFiltersToPlots` call to pass `scenes` as second argument.
52. Update `orderScenesForListView` call to pass `scenes` as second argument.

---

### Step 13 — Client: StoryPage

**File**: `web/src/pages/story.tsx`

53. Remove the `plots` prop from `<PlotGrid storyId={storyId} plots={plots} />` → `<PlotGrid storyId={storyId} />`.
54. Remove the `plots` prop from `<ListView storyId={storyId} plots={plots} />` → `<ListView storyId={storyId} />`.
55. Remove `const plots = plotsQuery.data ?? []` if the page no longer uses `plots` directly (check: `StoryFiltersMenu` also receives `plots` — keep the query result for that).
56. The `isLoading` / `error` guards can stay as-is; `plotsQuery` is still valid.

Note: `StoryFiltersMenu` receives `plots` for filtering UI (filter by plot title). The page still needs `plotsQuery.data` for that prop. Keep the query; just stop forwarding `plots` to the grid components.

---

### Step 14 — Client: StoryFiltersBar

**File**: `web/src/components/story/StoryFiltersBar.tsx`

57. Check if `StoryFiltersBar` receives `plots` as a prop. If so, it only needs plot metadata (titles) — no scenes needed. No change required, but verify during implementation.

---

## Phase 1 re-check: Constitution

All changes remain within constitution bounds:

- Only `storyService.ts` and `storyRouter.ts` modified on the backend — clean architecture preserved.
- Frontend queries use TanStack Query; no server state in Zustand.
- No new libraries.
- No MongoDB queries added outside models/.

---

## Key invariants to preserve

1. **Scenes always carry `plotId`** — never lost; scenes come from the server with `plotId` set.
2. **Optimistic updates must mirror server confirmation** — temp IDs are replaced in the scenes cache (not plots) on `onSuccess`.
3. **`applyShiftedResources`** — must write to the scenes cache key (not the plots key) so shift corrections from scene CRUD apply correctly.
4. **`shouldShiftForSceneInsert` and `shouldShiftAfterSceneRemoval`** — now receive `scenes: Scene[]` from the scenes cache; callers read this from `queryClient.getQueryData(useStoryScenesQuery.queryKey(storyId))`.
5. **`getGridRows`** — max vertical index must now be derived from the flat scenes array, not plot.scenes loops.
6. **`MoveSceneMutations.useMoveSingleWithinPlot`** — drag-and-drop move; the `DraggableSceneData` type carries `scene: Scene` (unchanged) so scene identification during drag still works after removing `plot.scenes`.
