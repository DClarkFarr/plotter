# Data Model: Fix Move Range Shift Logic

## Story

- **id**: string

## Plot

- **id**: string
- **storyId**: string

## Scene

- **id**: string
- **plotId**: string
- **verticalIndex**: number
- **deletedAt**: date | null

## Section

- **id**: string
- **storyId**: string
- **verticalIndex**: number
- **type**: "act" | "section"

## Move Range Shift Props

- **fromIndex**: number
- **toIndex**: number
- **fromPlotId**: string
- **toPlotId**: string
- **resource**:
  - **id**: string
  - **type**: "scene" | "section"

## Move Range Shift Result

- **rangeStart**: number
- **rangeEnd**: number | undefined
- **shift**: number

## Validation Rules

- `verticalIndex` is a non-negative integer for scenes and sections.
- Sections are unique per story per `verticalIndex`.
- Scenes are unique per plot per `verticalIndex`.
- A section anchors a story-wide row at its `verticalIndex`.

## Shift Rules (Logical)

- Same plot + same index: no shift.
- Different plot + same index: if target index occupied, shift down from target index by 1.
- Adjacent move (difference of 1):
  - If source row becomes empty and target row is occupied, shift the target row down by 1.
  - If source row remains occupied, shift the grid up from the target row by 1.
- Multi-row move (difference > 1):
  - If source row becomes empty and target row is occupied, shift rows between indices toward the source.
  - If source row remains occupied, shift the grid up from the target row by 1.
