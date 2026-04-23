# Data Model: Drag Section Headings

## Entities

### Section

- **Represents**: An act or chapter heading that occupies a full-width row in the plot grid.
- **Key Fields**: `id` (string), `storyId` (string), `title` (string), `type` ("act" | "chapter"), `verticalIndex` (number)
- **Constraint**: At most one section per `verticalIndex` within a story.
- **Move Semantics**: Moving a section shifts the bounded range of rows between `fromIndex` and `toIndex` by ±1 to maintain contiguity. Other sections and scenes within that range are displaced together, preserving their relative positions.

### Section Drop Zone

- **Represents**: A full-width droppable area rendered at each grid row position that accepts a dragged section.
- **Presence**: Always rendered in the DOM (one per data row). Has zero height when inactive; animates to a visible height when a section drag is active and the zone is a valid target.
- **Valid Target**: A zone is valid when a section is being dragged AND the zone's `verticalIndex` does not belong to the dragged section AND the zone's row does not already contain a different section.
- **Invalid Target** (disabled): (a) no drag in progress, (b) zone is the dragged section's own row, (c) zone is another section's row.

### SectionEditorStore (client state)

- **Represents**: Zustand store tracking section editor and drag state.
- **Added Fields**:
  - `draggingSection: Section | null` — the section currently being dragged, or null.
  - `startDraggingSection(section: Section): void`
  - `stopDraggingSection(): void`

## Relationships

- A `SectionDropZone` targets a single `verticalIndex` in the grid.
- A `Section` is associated with its own `verticalIndex`; the drop zone at that index is disabled during its drag.
- Moving a `Section` produces a `shiftedResources` response containing updated `scenes[]` and `sections[]` with their new `verticalIndex` values.

## State Transitions

| Trigger                           | State Change                                                                                                |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| User grabs section drag handle    | `draggingSection` set to that section; all SectionDropZones become visible (except disabled ones).          |
| User hovers a valid drop zone     | Drop zone highlights (active drop-target style).                                                            |
| User drops on a valid drop zone   | `PATCH /sections/:id` called with new `verticalIndex`; optimistic shift applied; `draggingSection` cleared. |
| User cancels drag (Escape / miss) | dnd-kit `onDragEnd` fires with no target; `draggingSection` cleared; grid unchanged.                        |
| Mutation succeeds                 | `shiftedResources` reconciles scenes and sections caches via `applyShiftedResources`.                       |
| Mutation fails                    | Optimistic update rolled back by TanStack Query `onError` context.                                          |

## Grid Layout Note

`PlotGrid` renders three passes per data row inside a single CSS Grid. Pass 0 (new) renders the `SectionDropZone` as a spanning element across content columns. Passes 1 and 2 (existing) are unchanged. Each pass occupies one CSS Grid row; when pass 0 has `height: 0` the row is visually absent.
