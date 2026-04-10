# Data Model: Sections Collection

## Section

- **id**: string
- **storyId**: string
- **title**: string
- **verticalIndex**: number
- **type**: "act" | "section"
- **createdAt**: string (ISO)
- **updatedAt**: string | null (ISO)

## Story

- **id**: string
- **title**: string
- **description**: string | null

## Plot

- **id**: string
- **storyId**: string
- **horizontalIndex**: number

## Scene

- **id**: string
- **plotId**: string
- **verticalIndex**: number

## Grid Shift Behavior

- Grid rows are shared between scenes (per plot) and sections (per story).
- When inserting a section at `verticalIndex`, if any plot has a scene at that index, all scenes in all plots at or beyond that index shift up by 1.
- Sections shift upward by 1 for the story starting at the target index whenever the grid shifts.

## Validation Rules

- `title` is required and non-empty.
- `verticalIndex` is a non-negative integer.
- `type` must be either `act` or `section`.
- `storyId` must reference an existing story.
- `verticalIndex` must be unique per story across sections.
