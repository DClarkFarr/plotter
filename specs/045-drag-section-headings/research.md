# Research: Drag Section Headings

## Decision 1: No new backend endpoints needed

**Decision**: Reuse the existing `PATCH /:storyId/sections/:sectionId` endpoint (served by `updateSectionForStory`) to move a section by sending a new `verticalIndex`.

**Rationale**: `updateSectionForStory` in `express/src/services/sectionService.ts` already calls `getMoveRangeShift` → `shiftGridInVerticalIndexRange` to shift the bounded row range between `fromIndex` and `toIndex`, then updates the section's `verticalIndex`. The response includes `shiftedResources` which the client uses to reconcile the cache. No new logic is needed server-side.

**Alternatives considered**:

- Adding a dedicated `POST /:storyId/sections/:sectionId/move` endpoint. Rejected because the existing PATCH endpoint already handles the full move workflow.

---

## Decision 2: Section move shift semantics (bounded range)

**Decision**: Use `getMoveRangeShift` for section moves, which produces a bounded range shift between `fromIndex` and `toIndex`. This shifts the rows between the two positions to "close the gap" left by the moving section and "open the slot" at the destination.

**Rationale**: This is consistent with how scene moves work. Moving a section from index 3 to index 6 produces `{ rangeStart: 4, rangeEnd: 6, shift: -1 }`, shifting rows 4–6 up by one to fill the gap at 3 and clear slot 6. Moving from 6 to 3 produces `{ rangeStart: 3, rangeEnd: 5, shift: +1 }`, shifting rows 3–5 down to make room at 3.

**Alternatives considered**:

- Wholesale reindex after move. Rejected because `shiftGridInVerticalIndexRange` already handles this correctly and returns `shiftedResources` for optimistic reconciliation.

---

## Decision 3: Section dragging state tracked in `sectionEditorStore`

**Decision**: Add `draggingSection: Section | null`, `startDraggingSection`, and `stopDraggingSection` to `sectionEditorStore` (mirroring the `draggingScene` pattern in `sceneEditorStore`). The `PlotGrid` `onDragStart` handler checks `source.type === "section"` to set this state.

**Rationale**: `SectionDropZone` components need to know when a section is being dragged to animate into visibility. Using Zustand store state (instead of prop drilling through `PlotGrid`) keeps components loosely coupled.

**Alternatives considered**:

- Storing drag state in a React context. Rejected: Zustand is the mandated client-state solution per the constitution.
- Using the dnd-kit drag state directly inside each drop zone. Rejected: dnd-kit does not expose a React hook to query "is anything being dragged right now" without subscribing to manager internals.

---

## Decision 4: `SectionDropZone` rendered as a Pass 0 row in PlotGrid

**Decision**: Add a "Pass 0" render loop inside `PlotGrid`'s `grid.map` Fragment, before the existing pass 1 (action cards) and pass 2 (content). Pass 0 emits two cells per row: a `nbsp` div for the col-header column, and a `SectionDropZone` with `style={{ gridColumn: "2 / -1" }}` spanning all content columns.

**Rationale**: The CSS Grid renders all three passes sequentially. Pass 0 produces one CSS Grid row per data row (col-header col + spanning content col), just like pass 1 and pass 2. When `h-0` (default), the row has zero visual height. When a section drag is active and the zone is valid, the zone animates to a visible height. This mirrors how `SceneActionsCard` works as a hidden pass-1 element that expands on hover.

**Alternatives considered**:

- Rendering SectionDropZone inside pass 1 by replacing `nbsp` for `section` cells. Rejected: section rows need to span all content columns but the existing pass emits one cell per column; changing only the `section` cell type would leave `section-spacer` cells dangling and break column auto-placement.
- Adding SectionDropZone inline when rendering `col-header` in pass 2. Rejected: this would inject a spanning element mid-row in a pass that also emits individual-column elements, causing layout misalignment.

---

## Decision 5: Drop zones disabled at section rows and the dragged section's row

**Decision**: `SectionDropZone` computes `isDisabled` as `true` when: (a) no section is currently being dragged, (b) the row's `verticalIndex` matches the dragged section's `verticalIndex` (can't drop on self), or (c) the row contains a different section (sections can't be dropped on top of other sections). Pass 0 always renders `SectionDropZone` for every row; the component itself handles enabling/disabling.

**Rationale**: Consistent with `SceneActionsCard`, which is always rendered but uses `disabled` on `useDroppable` to suppress drop-target behaviour when conditions are not met. Keeping all zones in the DOM avoids layout reflow on drag start.

**Alternatives considered**:

- Conditionally mounting SectionDropZone elements only when dragging. Rejected: causes layout shift when drag begins because new elements are inserted into the CSS Grid.

---

## Decision 6: `PlotGrid` `onDragStart` / `onDragEnd` updated to handle section type

**Decision**: In `PlotGrid.onDragStart`, check `event.operation.source?.type === "section"` and call `startDraggingSection`. In `onDragEnd`, add a branch alongside the existing scene handler: if `source.type === "section"` and `target.type === "section-droppable"`, call `moveSection({ sectionId, verticalIndex })` via `useUpdateSectionMutation`. The existing scene-drag guard (`assertIsDraggableSceneData`) is moved to the scene-specific path only.

**Rationale**: The current `onDragStart` handler rejects section drags via `assertIsDraggableSceneData`. Updating the handler to branch on source type is the minimal change to enable both drag types coexisting.

**Alternatives considered**:

- Separate `DragDropProvider` instances for scenes and sections. Rejected: dnd-kit's collision detection works across all registered draggables/droppables within a single provider; splitting providers would make cross-type priority ordering undefined.
