# Data Model: Plot Grid Utilities

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

## Plot Grid Shift

- **storyId**: string
- **plotId**: string | null
- **fromIndex**: number
- **toIndex**: number
- **direction**: "up" | "down"
- **scope**: "story" | "plot"

## Validation Rules

- `verticalIndex` is a non-negative integer for scenes and sections.
- Sections are unique per story per `verticalIndex`.
- Scenes are unique per plot per `verticalIndex`.
- A section anchors a story-wide row at its `verticalIndex`.

## Shift Rules (Logical)

- Insert scene: shift only if the target plot already has an item at that index and the row is not anchored by a section.
- Insert section: shift if any plot or section exists at that index.
- Remove scene: shift only if the plot has no remaining scene at that index and the row is not anchored by a section.
- Remove section: shift only if no plot has a scene at that index after removal.
- Move scene/section: shift only within the bounded range between indices and preserve relative ordering.
