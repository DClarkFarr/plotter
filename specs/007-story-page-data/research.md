# Research: Story Page Data Hookup

## Decision 1: Server state via TanStack Query hooks

**Decision**: Use TanStack Query hooks for story detail, story tags, story plots (with scenes), and story update mutations.
**Rationale**: Constitution mandates TanStack Query for server state and aligns with existing hooks.
**Alternatives considered**: Local component state or Zustand for server data (rejected by constitution).

## Decision 2: Story UI state in Zustand

**Decision**: Create a story UI store for filters, card size, and card display settings.
**Rationale**: These settings are client state shared across story page components.
**Alternatives considered**: React context or component state (harder to share and persist).

## Decision 3: Story tags and plots endpoints

**Decision**: Use dedicated story endpoints to fetch tags and plots, with plots returning scenes.
**Proposed endpoints**:

- `GET /stories/:storyId/tags`
- `GET /stories/:storyId/plots` (returns plots with embedded scenes)
  **Rationale**: Keeps fetches story-scoped and minimizes extra client requests.
  **Alternatives considered**: Query tags/plots by query params on collection endpoints (less explicit, harder to secure).

## Decision 4: Story heading update

**Decision**: Update story title/description via `PATCH /stories/:storyId` with optimistic UI updates and a refetch on success.
**Rationale**: Provides immediate feedback while keeping server as source of truth.
**Alternatives considered**: Full refetch without optimistic state (slower and less responsive).

## Decision 5: Description editing input

**Decision**: Use a simple textarea or contentEditable for description editing until a rich text library is approved.
**Rationale**: Constitution forbids adding a new rich text library until one is selected.
**Alternatives considered**: Introducing a third-party editor (blocked by constitution).
