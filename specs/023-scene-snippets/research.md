# Research

## Decision 1: Snippet storage on scenes

- Decision: Store snippets directly on the scene document as an ordered array of objects with `label` and `text` (HTML) fields.
- Rationale: Matches existing scene content storage patterns (rich text as HTML) and keeps snippet data co-located with the scene.
- Alternatives considered: Separate snippets collection (rejected to avoid new collections and joins for sidebar rendering).

## Decision 2: Update API approach

- Decision: Reuse the existing scene update endpoint (`PATCH /stories/:storyId/scenes/:sceneId`) and follow the update payload pattern used by other scene fields.
- Rationale: Minimizes new surface area and aligns with existing optimistic updates and validation flow.
- Alternatives considered: New snippets-specific endpoint (rejected to keep API consistent and avoid redundant routes).

## Decision 3: Snippet editor mode

- Decision: Use the shared `RichTextEditor` in full mode (no `isSimpleMode`) for snippet content edits.
- Rationale: The requirement calls for full toolbar access and the editor already supports a full toolset.
- Alternatives considered: Simple mode or a separate editor component (rejected to avoid duplicating TipTap configuration).

## Decision 4: UI state updates

- Decision: Drive snippet state changes from explicit event handlers (click, submit, toggle) and avoid state updates in `useEffect`.
- Rationale: Matches existing scene edit patterns and avoids implicit side effects that are harder to reason about.
- Alternatives considered: Syncing local state via `useEffect` (rejected per team guidance).
