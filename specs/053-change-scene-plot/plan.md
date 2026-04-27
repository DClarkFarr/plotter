# Implementation Plan: Change Scene Plot Without Dragging

**Branch**: `053-change-scene-plot` | **Date**: 2026-04-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/053-change-scene-plot/spec.md` plus explicit user requirement that target-row collisions shift the grid downward and optimistic updates mirror server shift behavior.

## Summary

Add two non-drag entry points to move scenes between plots: a "Change Plot" action from scene card actions and a plot selector in the scene sidebar form (above title). Reuse the existing scene move mutation flow that already supports cross-plot movement and row shifting, while enforcing one canonical shift rule: if the destination plot already has a scene at the destination vertical index, shift the story grid downward from that index before placing the moved scene. Optimistic cache updates will use the same move-range shift semantics as the backend and reconcile with server `shiftedResources`.

## Technical Context

**Language/Version**: TypeScript 5.x (Express backend + React frontend)  
**Primary Dependencies**: Express, MongoDB Node driver, React, TanStack Query, Zustand, Flowbite React, Tailwind CSS, dnd-kit (existing drag flows remain)  
**Storage**: MongoDB (`stories`, `plots`, `scenes`, `sections`)  
**Testing**: Manual feature validation plus existing TypeScript/lint checks in `express/` and `web/`  
**Target Platform**: Browser client + API server
**Project Type**: Monorepo web application (`express/` + `web/`)  
**Performance Goals**: Scene plot changes remain interactive and optimistic; backend move endpoint remains aligned with constitution target (<200ms normal load)  
**Constraints**: No new state-management or UI frameworks; optimistic updates must mirror server shift outcomes; no scene overwrite on destination collisions; keep existing drag-and-drop behavior intact  
**Scale/Scope**: Cross-stack feature touching scene actions UI, scene sidebar UI, scene mutation orchestration, and scene move API contract reuse

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Stack guardrails honored: existing Express/Mongo backend and React frontend remain unchanged.
- Frontend mandates honored: TanStack Query for mutations/cache, Zustand for local editor state, Flowbite/Tailwind patterns maintained.
- Clean architecture boundaries preserved: router validates/authenticates, service orchestrates shifts/move, model layer remains query owner.
- No new third-party libraries required.
- Performance and correctness constraints addressed through optimistic+server reconciliation using existing shifted resource responses.

## Project Structure

### Documentation (this feature)

```text
specs/053-change-scene-plot/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── README.md
│   └── scene-plot-change.md
└── tasks.md                # created by /speckit.tasks
```

### Source Code (planned touch points)

```text
web/src/
├── components/plot/SceneRenderer/
│   ├── SceneCard.tsx                    # add/change action affordance for plot reassignment
│   └── SceneActionsCard.tsx             # host action trigger region behavior
├── components/story/
│   ├── SceneForm.tsx                    # add plot selector above scene title
│   └── ScenePovSelect.tsx               # reuse selector interaction pattern
├── queries/scene/
│   └── scene-mutations.ts               # reuse/extend move mutation for both entry points
├── queries/story/
│   ├── shift-logic.ts                   # canonical optimistic shift calculation
│   └── shifted-resources.ts             # reconcile server-shifted scenes/sections
└── api/
    ├── stories.ts                       # move endpoint client call (existing)
    └── types.ts                         # shifted resource and scene response shapes

express/src/
├── routers/
│   └── sceneRouter.ts                   # move endpoint request/response contract
├── services/
│   └── sceneService.ts                  # move orchestration + shift semantics
└── utils/
    └── plotGridUtils.ts                 # grid occupancy and shift helper behavior
```

**Structure Decision**: Reuse the existing move endpoint and optimistic shift infrastructure instead of introducing a parallel API path. New UX entry points call the same mutation flow so server and optimistic behavior stay aligned.

## Behavioral Decisions for This Plan

1. Destination collision rule is mandatory: when destination plot has a scene at destination `verticalIndex`, shift rows downward from that index before placing the moved scene.
2. Both UX entry points (scene actions + scene form selector) must call the same mutation path as drag/drop move behavior.
3. Optimistic update logic must use the same shift strategy as server move logic (move-range and destination-collision semantics).
4. Server response `shiftedResources` remains the final authority and is always applied on success.
5. Same-plot no-op selections are prevented in UI and ignored safely in mutation pipeline.

## Phase 0: Research

Create `research.md` with decisions for:

1. Reusing existing `move-within-plot` endpoint for cross-plot changes from non-drag UX.
2. Enforcing one canonical collision-shift behavior across server and optimistic updates.
3. Choosing optimistic reconciliation strategy that first applies local shift prediction then server `shiftedResources`.

## Phase 1: Design and Contracts

### Data Model Deliverable

Create `data-model.md` describing:

- `Scene`, `Plot`, `Section`, `GridRow`, and `ShiftedResources`
- `ScenePlotChangeRequest` with `fromPlotId`, `toPlotId`, `fromIndex`, `toIndex`
- state transition for destination-collision shift then scene placement

### Contract Deliverables

Create `contracts/scene-plot-change.md` documenting:

- Reused endpoint `POST /stories/:storyId/scenes/:sceneId/move-within-plot`
- request/response payloads including `shiftedResources`
- collision behavior expectation for occupied destination row
- error semantics and no-op behavior

Create `contracts/README.md` summarizing contract scope and linkage to existing API behavior.

### Quickstart Deliverable

Create `quickstart.md` with manual verification flows for:

1. Move scene from action menu to a different plot.
2. Move scene from scene form selector.
3. Occupied destination row causing downward shift.
4. Optimistic update parity with final server response.
5. Failed mutation rollback restoring pre-move state.

## Implementation Phases

### Phase 2A: Scene Action "Change Plot" UX

Goal: add plot reassignment directly from scene action controls.

1. Add change-plot trigger in scene action area with plot list dropdown/menu.
2. Filter/select destination plot, disallow current plot as actionable target.
3. Compute destination row (same vertical index by default) and invoke shared move mutation.
4. Keep keyboard/mouse behavior accessible and non-blocking.

### Phase 2B: Scene Form Plot Selector UX

Goal: support plot reassignment while editing a scene.

1. Add a plot selector above title in `SceneForm` mirroring POV selector style.
2. Default selector to current scene plot.
3. On change, invoke same move mutation path as scene action entry.
4. Preserve existing SceneForm save behavior for title/description/tags/todo.

### Phase 2C: Mutation and Optimistic Shift Consistency

Goal: ensure optimistic updates match server behavior for all plot-change flows.

1. Route both entry points through the same scene move mutation helper.
2. Use `getMoveRangeShift` optimistic calculation with current scenes/sections cache.
3. For occupied destination rows, ensure optimistic shift is downward from target index (unbounded range) before scene relocation.
4. On success, apply `shiftedResources` and returned scene payload to reconcile.
5. On error, restore cached scenes/sections from mutation context.

### Phase 2D: Backend Contract Verification and Guardrails

Goal: guarantee server-side shift semantics match documented behavior.

1. Verify scene move service handles cross-plot moves with destination occupancy checks.
2. Confirm collision shift path runs before scene placement and returns shifted resources.
3. Ensure endpoint validation/auth remain unchanged and robust for both new UI entry points.

### Phase 2E: End-to-End Validation

Goal: verify user-visible correctness and no regressions.

1. Validate both entry points complete move + persistence + reconciliation.
2. Validate occupied-row move shifts story grid downward at target index.
3. Validate no scene overwrite or loss during shifts.
4. Validate no-op selection and mutation failures are handled gracefully.

## Constitution Check (Post-Design)

- Design keeps existing framework and architecture constraints intact.
- Planned contracts reuse existing API surface; no non-compliant libraries added.
- Shift logic remains centralized in existing server/client helpers, reducing drift risk.
- UX additions are constrained to existing scene editing and action components.

## Risks and Mitigations

1. Optimistic and server shift logic drift in edge cases.
   - Mitigation: route both entry points through one mutation and always reconcile with `shiftedResources`.
2. Action-menu and form-selector flows diverge over time.
   - Mitigation: enforce single shared mutation utility and shared destination-index rules.
3. Dense-grid collisions could produce unexpected cascades.
   - Mitigation: explicit manual validation scenarios for multi-row downward shifts.

## Complexity Tracking

No constitution violations expected.
