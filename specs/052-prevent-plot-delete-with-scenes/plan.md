# Implementation Plan: Block Plot Deletion When Scenes Exist

**Branch**: `052-prevent-plot-delete-with-scenes` | **Date**: 2026-04-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/052-prevent-plot-delete-with-scenes/spec.md` plus user direction to keep existing scene-merge delete logic in place but block access to it when the plot still has scenes.

## Summary

Add an early guard to plot deletion so plots with assigned scenes cannot proceed into the existing scene-merge delete workflow. The backend will check for scenes before target-plot selection or merge logic, return a clear conflict-style error when scenes exist, and leave the current merge helpers untouched for plots that remain eligible for deletion. The frontend will surface the same rule in the delete confirmation modal by explaining why deletion is blocked and disabling the destructive confirmation action.

## Technical Context

**Language/Version**: TypeScript 5.x (Express backend + React frontend)  
**Primary Dependencies**: Express, MongoDB Node driver, React, TanStack Query, Zustand, Flowbite React, Tailwind CSS  
**Storage**: MongoDB (`plots`, `scenes`, `stories`)  
**Testing**: Manual workflow validation plus existing typecheck/build commands for `express/` and `web/`  
**Target Platform**: Browser client + API server  
**Project Type**: Monorepo web application (`express/` + `web/`)  
**Performance Goals**: Deletion eligibility should resolve immediately in normal story views without introducing visible delay in sidebar or modal interactions  
**Constraints**: Preserve existing delete/merge implementation for eligible plots; reject ineligible deletes before any scene reassignment begins; keep UI and API messages aligned  
**Scale/Scope**: Small cross-stack feature touching one delete service path, one delete route, one sidebar form, and related API/query plumbing

## Constitution Check

- Stack guardrails honored (Express/Mongo backend, React frontend).
- Existing frontend architecture retained (TanStack Query, Zustand, Flowbite patterns).
- Clean boundaries preserved: router validation and response mapping, service orchestration, model-backed reads for plots/scenes.
- No new framework or state libraries required.
- Access control remains based on the existing story ownership check before plot deletion.

## Project Structure

### Documentation (this feature)

```text
specs/052-prevent-plot-delete-with-scenes/
├── spec.md
├── plan.md
└── checklists/
    └── requirements.md
```

### Source Code (planned touch points)

```text
express/src/
├── services/
│   └── plotService.ts               # early scene-existence guard before merge/delete flow
├── routers/
│   └── storyRouter.ts               # map blocked delete reason to clear API error response
└── models/
    └── scenes.ts                    # existing scene lookups reused to determine plot usage

web/src/
├── components/story/
│   └── PlotForm.tsx                 # modal messaging and disabled confirm state for in-use plots
├── queries/plot/
│   └── plot-mutations.ts            # preserve delete mutation behavior, handle new blocked-delete error
├── api/
│   ├── stories.ts                   # existing delete call retained
│   └── types.ts                     # align blocked-delete error handling with current client contract
└── queries/story/
    └── story-queries.ts             # existing plot/scene query data reused for modal eligibility state
```

**Structure Decision**: Keep the feature confined to the existing plot deletion path. Do not redesign plot deletion or remove the current merge helpers; instead, insert a guard at the earliest safe decision point and reflect that same decision in the sidebar modal.

## Behavioral Decisions for This Plan

1. The current merge path in `deletePlotForStory` stays in place for plots with no assigned scenes.
2. The new in-use guard runs before target plot resolution and before `combineScenes` is called.
3. A plot with one or more scenes is not deletable, even if other plots exist and would otherwise be valid merge targets.
4. The delete confirmation modal remains the user-facing place where this rule is explained.
5. The blocked-delete response should use a message shape the current frontend can display without ambiguity.

## Implementation Phases

### Phase 1: Backend Early Guard in Plot Delete Service

Goal: Prevent the delete workflow from reaching merge logic when the plot still has scenes.

1. Update `express/src/services/plotService.ts` delete result typing:
   - Add a new failure reason for in-use plots, such as `plot-has-scenes`.
   - Optionally include `sceneCount` if it helps UI messaging or logging, but keep the minimum payload simple.
2. In `deletePlotForStory`, fetch scene presence for the source plot immediately after plot lookup and before target-plot selection.
3. If one or more scenes are found:
   - Return the new blocked reason.
   - Do not call `getSecondaryPlot`, `combineScenes`, `deletePlotById`, or index-shift helpers.
4. Leave the existing merge-and-delete code path intact for plots with zero scenes.
5. Preserve the current last-active-plot guard for empty plots so existing protection still applies.

### Phase 2: Router Error Mapping and API Contract Alignment

Goal: Return a clear user-facing error when a blocked delete request reaches the endpoint.

1. Update `express/src/routers/storyRouter.ts` to map the new `plot-has-scenes` result to a conflict-style response.
2. Use a clear message such as: "Cannot delete a plot that still has scenes. Move or remove its scenes first."
3. Ensure the response shape matches what the client currently reads for API errors.
   - Preferred: include `message` in the JSON error payload.
   - If existing backend conventions require `error`, return both fields or adjust the client normalizer in the same slice.
4. Keep current `404` and `cannot-delete-last-plot` handling unchanged unless small alignment is needed for consistent messaging.

### Phase 3: Frontend Modal Eligibility State

Goal: Show users that deletion is blocked for plots with scenes before they submit the request.

1. Update `web/src/components/story/PlotForm.tsx` to derive whether the selected plot currently has scenes.
   - Reuse existing story scene query data rather than adding a new API call.
   - Continue using current plot count logic for the last-active-plot case.
2. Adjust modal copy for in-use plots so it explains that deletion is unavailable while scenes remain assigned.
3. Disable the destructive confirmation button when the selected plot has scenes.
4. Keep the modal dismissible so the user can back out without side effects.
5. Remove or replace the current text that says scenes will be moved to an adjacent plot when the selected plot has scenes, because that is no longer the accessible path in this workflow.

### Phase 4: Client Error Handling and Mutation Safety

Goal: Ensure blocked delete responses surface cleanly and do not trigger misleading optimistic UI behavior.

1. Review `web/src/queries/plot/plot-mutations.ts` optimistic delete behavior against the new guard.
2. Confirm blocked delete errors roll back any optimistic plot removal correctly.
3. If necessary, narrow optimistic updates so they only apply once the request is expected to succeed, or rely on current rollback behavior if it is already sufficient.
4. Confirm the surfaced error message shown in `PlotForm.tsx` matches the backend rejection reason.

### Phase 5: Validation and Regression Checks

Goal: Prove the new guard blocks the merge path without disturbing eligible deletes.

1. Backend validation:
   - Delete request for a plot with scenes returns a conflict response and message.
   - `combineScenes` is not reached for blocked deletes.
   - Plot and scene records remain unchanged after a blocked delete attempt.
2. Frontend validation:
   - Opening delete confirmation for a plot with scenes shows explanatory copy and disabled confirm action.
   - Opening delete confirmation for an empty plot still allows deletion.
   - A blocked delete request surfaced from the API shows the same explanation in the sidebar.
3. Regression validation:
   - Last-active-plot protection still works.
   - Existing delete behavior for empty plots still completes successfully.

## Risks and Mitigations

1. The frontend API normalizer may not display the new server error if the response shape does not match existing expectations.
   - Mitigation: align on a `message` field or support both `message` and `error` in the same implementation slice.
2. The modal may become inconsistent if eligibility is computed only from stale client cache.
   - Mitigation: treat the UI state as advisory and rely on the backend guard as the final source of truth.
3. Existing optimistic deletion may briefly remove the plot before the blocked response returns.
   - Mitigation: verify rollback behavior and reduce optimism if needed for this mutation path.

## Definition of Done

1. Plot deletion is blocked before merge logic when the target plot still has scenes.
2. The existing merge/delete implementation remains in the codebase for eligible empty-plot deletes.
3. The delete endpoint returns a clear error message for in-use plots.
4. The delete confirmation modal explains the rule and disables destructive confirmation for in-use plots.
5. Empty plots remain deletable under current rules, and last-active-plot protection still works.
