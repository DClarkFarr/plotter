# Research Notes: Story Card Count Badges

## Decision 1: Extend story stats via model count queries

**Decision**: Add character and tag counts using MongoDB count queries in models (e.g., countCharactersByStoryId, countTagsByStoryId) and return them from `getStoryStats`.

**Rationale**: Matches the existing stats pattern (plots + scenes) and keeps queries inside models, with services aggregating results.

**Alternatives considered**:

- Aggregate all stats in a single pipeline per story. Rejected for now to keep scope small and aligned with the current service implementation.

## Decision 2: Reuse existing story list/detail endpoints

**Decision**: Update the `/stories` list and `/stories/:storyId` detail responses to include the new stats fields.

**Rationale**: The dashboard already consumes these endpoints for story cards, so updating their payloads avoids introducing new endpoints and keeps data refresh behavior unchanged.

**Alternatives considered**:

- Add a new stats-only endpoint. Rejected to avoid extra round trips and redundant data flows.

## Decision 3: Client updates rely on type expansion

**Decision**: Extend the `StoryStats` type to include `characters` and `tags`, then update dashboard story card rendering to show the additional badges.

**Rationale**: Ensures type safety across the API client, hooks, and UI with minimal changes.

**Alternatives considered**:

- Hard-code badge values in the UI. Rejected because it would break type safety and fail with live data.
