# Implementation Plan: Plot Sidebar Edit and Soft Delete

**Branch**: `051-delete-plot-sidebar` | **Date**: 2026-04-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/051-delete-plot-sidebar/spec.md` plus user constraints for soft delete, scene transfer, and minimum-plot guard.

## Summary

Move plot editing from in-place header controls to a dedicated sidebar panel and add a danger-zone delete flow that matches scene UX patterns. Implement a real backend delete endpoint for plots as a soft delete, automatically transfer scenes from the deleted plot to an adjacent active plot (left first, otherwise right), prevent deletion when only one active plot remains, and ensure all plot queries consistently exclude soft-deleted records unless explicitly requested.

## Technical Context

**Language/Version**: TypeScript 5.x (Express backend + React frontend)  
**Primary Dependencies**: Express, MongoDB Node driver, React, TanStack Query, Zustand, Flowbite React, Tailwind CSS  
**Storage**: MongoDB (`plots`, `scenes`, `stories`)  
**Testing**: Manual workflow validation + existing build/typecheck/lint commands  
**Target Platform**: Browser + API server  
**Project Type**: Monorepo web application (`express/` + `web/`)  
**Performance Goals**: Plot edit/delete actions remain interactive with no visible regression in grid updates for normal story sizes  
**Constraints**: Soft delete must preserve data integrity; scene transfer must not orphan scenes; no destructive hard delete path from UI/API  
**Scale/Scope**: Single feature spanning plot UI, plot API, plot/scenes model logic, and client cache updates

## Constitution Check

- Stack guardrails honored (Express/Mongo backend, React frontend).
- Existing frontend architecture retained (TanStack Query + Zustand + Flowbite patterns).
- Clean boundaries preserved: router validation, service orchestration, model persistence.
- No new framework dependencies required.
- Security/access control remains based on existing story ownership checks.

## Project Structure

### Documentation (this feature)

```text
specs/051-delete-plot-sidebar/
├── spec.md
├── plan.md
└── checklists/
    └── requirements.md
```

### Source Code (planned touch points)

```text
express/src/
├── models/
│   ├── plots.ts                     # soft-delete fields/filters, delete and shift helpers
│   └── scenes.ts                    # scene reassignment helper(s) for plot deletion
├── services/
│   ├── plotService.ts               # delete orchestration, guards, reassignment flow
│   └── storyService.ts              # active plot listing/count behavior integration
└── routers/
    └── storyRouter.ts               # add DELETE /stories/:storyId/plots/:plotId

web/src/
├── api/
│   ├── stories.ts                   # deletePlot API call
│   └── types.ts                     # delete plot response type(s)
├── queries/plot/
│   └── plot-mutations.ts            # useDeletePlotMutation and cache updates
├── store/
│   ├── sidebarStore.ts              # add "plot" sidebar view
│   └── plotEditorStore.ts           # selected plot state for sidebar editing (new)
├── components/layout/
│   └── DashboardLayout.tsx          # render PlotForm when current sidebar view is plot
└── components/
    ├── plot/SceneRenderer/PlotHeader.tsx  # replace in-place edit with sidebar open action
    └── story/PlotForm.tsx                  # sidebar plot editor + danger zone + confirm modal (new)
```

**Structure Decision**: Keep all behavior in existing story/plot layers and extend current sidebar architecture (same pattern as SceneForm/SectionForm) rather than introducing a separate page or modal-only editor.

## Behavioral Decisions for This Plan

1. Plot delete endpoint path: `DELETE /stories/:storyId/plots/:plotId`.
2. Plot deletion semantics: soft delete (`deletedAt`) only.
3. Scene transfer target selection:
   - Prefer plot at `horizontalIndex - 1`.
   - If none exists (deleted plot was leftmost), use plot at `horizontalIndex + 1`.
4. Minimum active plot rule: when active plot count is 1, delete is blocked with a conflict-style error and explanatory message.
5. Post-delete index normalization: active plots to the right shift left by 1 to maintain contiguous horizontal indices.

## Implementation Phases

### Phase 1: Backend Plot Soft-Delete Foundation

Goal: Replace hard-delete semantics with a consistent active-plot model.

1. Extend plot schema/type in `express/src/models/plots.ts`:
   - Add optional `deletedAt?: Date | null` to plot definition.
   - Set `deletedAt: null` on create and duplicate paths.
2. Add an `activePlotFilter` helper and apply it to all active-read paths:
   - `listPlots`, `countPlotsByStoryId`, `listPlotIdsByStoryId`, `listPlotsByIds`, `getPlotById`, and index-shift helpers used by active logic.
3. Replace hard delete function:
   - Convert `deletePlotById` to soft-delete update (set `deletedAt` + touch timestamps).
4. Update indexes for active-only uniqueness:
   - Ensure `(storyId, horizontalIndex)` uniqueness applies only to active plots (partial index), matching current scene soft-delete style.
5. Validate no other plot collection query unintentionally includes deleted rows.

### Phase 2: Plot Delete Service Orchestration

Goal: Implement full delete behavior with guardrails and scene reassignment.

1. Add service entrypoint in `express/src/services/plotService.ts` (for example `deletePlotForStory`):
   - Verify plot belongs to the story.
   - Count active plots and block delete when count is 1.
   - Resolve transfer target plot id using left-first, right-fallback rule.
2. Reassign scenes from deleted plot to target plot before soft delete:
   - Batch update all active scenes under the deleted plot to target plot id.
   - Preserve scene ordering deterministically; if vertical index conflicts occur, resolve by shifting/compacting via existing grid utilities or explicit per-index remap.
3. Soft delete the plot record.
4. Shift horizontalIndex for active plots to the right of deleted plot (`-1`) so active indices stay contiguous.
5. Return structured delete result payload including at minimum:
   - deleted flag
   - deleted plot id
   - target plot id
   - moved scene count
   - optionally updated plots/scenes if needed for immediate cache patching.

### Phase 3: Plot Delete Endpoint in Story Router

Goal: Ensure delete endpoint exists and is wired end-to-end.

1. Add route to `express/src/routers/storyRouter.ts`:
   - `DELETE /:storyId/plots/:plotId`
2. Reuse existing story access checks (`getStoryForUser`) before delete call.
3. Call new plot delete service and map outcomes:
   - `404` when plot not found in story scope
   - `409` when minimum-active-plot guard blocks deletion
   - success response payload for frontend reconciliation
4. Keep response/message style aligned with existing scene/section delete routes.

### Phase 4: Frontend Sidebar Plot Editor Migration

Goal: Replace in-place header editing with sidebar editing.

1. Add sidebar view support:
   - Extend `SidebarView` union in `web/src/store/sidebarStore.ts` with `plot`.
2. Add plot editor state store (`web/src/store/plotEditorStore.ts`):
   - selectedPlotId, selectPlot, clearSelection, optional isSaving/error helpers.
3. Create new `web/src/components/story/PlotForm.tsx`:
   - Load selected plot data from query cache.
   - Editable title, description, color controls.
   - Save behavior using existing update mutation pattern.
   - Unsaved-change handling consistent with current sidebar forms.
4. Update `web/src/components/layout/DashboardLayout.tsx`:
   - Render `PlotForm` when current sidebar view is `plot`.
5. Update `web/src/components/plot/SceneRenderer/PlotHeader.tsx`:
   - Remove in-place edit mode UI.
   - Edit button now selects plot, opens sidebar, and adds `plot` view.

### Phase 5: Frontend Delete Plot UX (Danger Zone + Confirm)

Goal: Implement plot deletion UX consistent with scenes.

1. Add API client function in `web/src/api/stories.ts`:
   - `deletePlot(storyId, plotId)` calling `DELETE /stories/:storyId/plots/:plotId`.
2. Add API response type(s) in `web/src/api/types.ts`.
3. Add `useDeletePlotMutation(storyId)` in `web/src/queries/plot/plot-mutations.ts`:
   - Optimistically remove deleted plot from plots cache.
   - Update scenes cache to moved target plot or invalidate scenes/plots queries on settle.
   - Handle 409 minimum-plot error cleanly.
4. In `web/src/components/story/PlotForm.tsx`, add danger zone section at bottom:
   - Delete button.
   - Confirmation modal text and button structure mirroring `SceneForm` style.
5. Delete availability guard in UI:
   - Disable delete button and show explanation when only one active plot remains.

### Phase 6: Validation and Regression Checks

Goal: Verify all required outcomes and prevent soft-delete leakage.

1. Backend validation:
   - Delete endpoint exists and returns expected status codes.
   - Plot rows are soft-deleted, not physically removed.
   - Active list/count/get queries ignore deleted plots.
   - Scene reassignment follows left-first/right-fallback rule.
   - Plot deletion blocked when only one active plot exists.
2. Frontend validation:
   - Plot edit opens in sidebar and no in-place form expansion remains.
   - Danger zone + modal flow works and matches scene delete interaction pattern.
   - Post-delete grid shows reassigned scenes in target plot and contiguous plot columns.
3. Query consistency checks:
   - Verify no stale references to deleted plot ids remain in UI state.

## Risks and Mitigations

1. Vertical-index collisions during scene transfer.
   - Mitigation: explicit deterministic remap strategy with conflict-safe updates, then verify unique index constraints hold.
2. Partial-index migration conflicts with existing non-null/absent `deletedAt` data.
   - Mitigation: normalize legacy rows before enforcing active-only uniqueness behavior.
3. Client cache drift after combined scene+plot updates.
   - Mitigation: conservative invalidation fallback for plots/scenes queries if optimistic patch complexity causes inconsistencies.

## Definition of Done

1. Plot delete endpoint exists and is implemented in router/service/model layers.
2. Plot deletion is soft delete only; active plot queries consistently exclude deleted rows.
3. Deleting a plot reassigns its scenes to adjacent target plot by rule: left first, else right.
4. Deleting the final remaining active plot is blocked by backend and reflected in UI.
5. Plot editing occurs in sidebar; danger zone delete flow is available with confirmation modal.
6. Manual validation confirms no orphan scenes, no index gaps in active plots, and no accidental hard deletes.
