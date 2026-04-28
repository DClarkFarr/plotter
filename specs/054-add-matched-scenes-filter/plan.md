# Implementation Plan: Matched Results Only Filter Mode

**Branch**: `054-add-matched-scenes-filter` | **Date**: 2026-04-27 | **Spec**: [specs/054-add-matched-scenes-filter/spec.md](specs/054-add-matched-scenes-filter/spec.md)
**Input**: Feature specification from `/specs/054-add-matched-scenes-filter/spec.md`

## Summary

Add a third filter visibility state, "show only matched scenes", and apply it consistently across story views. In this state, unmatched scenes are removed from rendering entirely, and in grid mode any plot with zero matched scenes is also removed from rendering. The change is primarily frontend and will reuse existing filter matching logic while extending it to support strict match-only projection.

## Technical Context

**Language/Version**: TypeScript 5.x (React + Vite frontend)  
**Primary Dependencies**: React, Zustand, TanStack Router, TanStack Query, Flowbite React, Tailwind CSS, react-virtuoso, dnd-kit  
**Storage**: N/A for this feature (frontend rendering behavior over existing fetched story data)  
**Testing**: Type checking/build plus manual story-page verification in grid and list modes  
**Target Platform**: Modern desktop browsers  
**Project Type**: Web application (`web/` frontend with `express/` backend unchanged)  
**Performance Goals**: Maintain responsive filtering and mode toggling at current story-size expectations  
**Constraints**: No new libraries; preserve current filter semantics; avoid regressions in existing hide/minify modes  
**Scale/Scope**: Focused change in story rendering pipeline, filter mode state, and filter mode controls

## Constitution Check

- Stack guardrails honored (Express/Mongo backend and React frontend remain unchanged).
- Frontend library mandates honored (TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS).
- No architecture boundary violations expected; changes remain in `web/` and existing store/component/util patterns.
- No additional security surface introduced; feature affects rendering only.

## Project Structure

### Documentation (this feature)

```text
specs/054-add-matched-scenes-filter/
├── spec.md
├── plan.md
└── checklists/
    └── requirements.md
```

### Source Code (planned touch points)

```text
web/src/
├── pages/
│   └── story.tsx                             # filter mode toggle behavior and icon/tooltip text
├── store/
│   ├── storyStore.types.ts                   # extend FilterVisibilityMode with match-only value
│   └── storyStore.ts                         # default/reset handling for new mode
├── utils/
│   └── applyFiltersToPlots.ts                # derive matched scene IDs and matched plot IDs
├── components/plot/
│   ├── PlotGrid.tsx                          # exclude non-matching plots and scenes from grid render graph
│   └── SceneRenderer/
│       └── SceneCard.tsx                     # render nothing for excluded scenes in match-only mode
└── components/story/
    ├── ListView.tsx                          # remove unmatched scenes from list stream in match-only mode
    ├── ListViewScene.tsx                     # render nothing for excluded scenes in match-only mode
    └── ListViewSidebarItem.tsx               # remove/skip excluded scene entries in match-only mode
```

**Structure Decision**: Frontend-only implementation in `web/`, reusing existing filter utility and story store state.

## Implementation Phases

### Phase 1: Extend Filter Mode Domain and UI Control

Goal: Introduce a third visibility mode and make mode switching explicit and deterministic.

1. Extend `FilterVisibilityMode` to include a third value for match-only rendering.
2. Keep existing default mode unchanged (`hide`) unless product direction says otherwise.
3. Update the filter toggle control in `story.tsx` from binary toggle to 3-state cycle.
4. Update tooltip and icon mapping so each mode communicates its behavior clearly.
5. Confirm mode resets and persisted behavior still work with the new enum value.

### Phase 2: Enrich Filter Projection Output

Goal: Compute all data required to project matched-only rendering without duplicating logic in components.

1. Extend `applyFiltersToPlots` result shape to include both:
   - `includedSceneIds`
   - `includedPlotIds` (plots with at least one included scene)
2. Keep behavior identical when no filters are active (all scenes and plots included).
3. Ensure plot-only filters and combined filters still produce expected included scene/plot sets.
4. Maintain backward compatibility for existing consumers during migration.

### Phase 3: Apply Match-Only Behavior in Grid Mode

Goal: Render only matching scenes and only plots containing matches when mode is match-only.

1. In `PlotGrid.tsx`, derive active render datasets from filter mode:
   - Existing behavior for hide/minify.
   - Pruned plots/scenes for match-only.
2. Build `plotsHorizontalIndexMap`, scene maps, and grid structure from the pruned datasets in match-only mode.
3. Ensure plot headers for unmatched plots are not rendered in match-only mode.
4. Ensure unmatched scenes are not rendered in any card/placeholder form in match-only mode.
5. Preserve drag-and-drop and section rendering behavior for remaining visible cells.

### Phase 4: Apply Match-Only Behavior in List Mode

Goal: Remove unmatched scenes from list and sidebar item streams in match-only mode.

1. In `ListView.tsx`, filter ordered entries so excluded scenes are omitted when mode is match-only.
2. Keep section entries stable and in-order; avoid dangling references or broken scroll indices.
3. Ensure sidebar entries mirror main list visibility exactly in match-only mode.
4. Update scene-level render guards (`ListViewScene.tsx`, `ListViewSidebarItem.tsx`) to return no UI for excluded scenes in match-only mode.

### Phase 5: Empty-Results and Transition Correctness

Goal: Handle edge states and mode transitions cleanly.

1. Show clear empty-results messaging when filters are active and match-only mode yields no scenes.
2. Verify transitions across all three modes do not leave stale hidden/minified remnants.
3. Verify clearing filters while match-only is selected restores full rendering.
4. Verify rapid mode switching keeps UI consistent in both grid and list views.

### Phase 6: Validation and Regression Checks

Goal: Validate feature requirements and protect existing behavior.

1. Grid checks:
   - Mixed-match dataset: only matched scenes render.
   - Unmatched plots do not render in match-only mode.
   - Hide/minify modes remain unchanged.
2. List checks:
   - Excluded scenes fully omitted in match-only mode.
   - Sidebar items match rendered list content.
3. Empty state checks:
   - No matches shows explicit empty-results state.
4. Regression checks:
   - Existing filtering criteria still determine matches exactly as before.
   - Story navigation and editing affordances remain functional for visible scenes.

## Risks and Mitigations

1. Grid coordinate assumptions may break when entire plots are removed.
   - Mitigation: centralize dataset pruning before map/grid construction and validate row/column mappings.
2. List/sidebar synchronization may drift after filtering entries out.
   - Mitigation: derive both from the same filtered ordered entry array.
3. Mode UX ambiguity with a single-button toggle across three states.
   - Mitigation: explicit tooltip text and distinct icons per state; verify user comprehension in QA.

## Definition of Done

1. A third filter visibility mode is available and selectable from story controls.
2. In match-only mode, unmatched scenes are fully removed from rendering in grid and list views.
3. In match-only mode, unmatched plots are fully removed from rendering in grid view.
4. Empty-results state appears when no scenes match.
5. Existing hide/minify modes continue to behave as before.
6. Manual validation passes for primary scenarios and edge cases listed in the spec.

## Post-Design Constitution Check

- No constitution violations introduced.
- No new dependencies required.
- Feature remains within existing frontend architecture patterns.
