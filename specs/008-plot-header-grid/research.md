# Research: Plot Header Grid Enhancements

## Decision 1: Color picker input

**Decision**: Use the native HTML color input (`type="color"`) for plot color selection.
**Rationale**: No color picker library is currently in the stack, and the constitution forbids adding new UI libraries without approval. The native input is accessible, light-weight, and requires no additional dependency.
**Alternatives considered**: Third-party color picker component (rejected due to new dependency and stack guardrails), fixed preset palette (less flexible for users).

## Decision 2: Plot create/update endpoints

**Decision**: Add story-scoped plot create and update endpoints in the story router.
**Rationale**: The existing list endpoint lives under `/stories/:storyId/plots`, and story access checks already exist in the story router. This keeps authorization and resource scoping consistent.
**Alternatives considered**: Dedicated `/plots` router with storyId in payload (adds duplicate auth logic).

## Decision 3: Optimistic cache updates

**Decision**: Use TanStack Query optimistic updates for plot create, update, and move operations on the `['story', storyId, 'plots']` cache.
**Rationale**: The app already uses TanStack Query for server state. Optimistic updates keep the grid responsive and match the story heading pattern.
**Alternatives considered**: Refetch-only updates (slower and less responsive).

## Decision 4: Disabled scene creation

**Decision**: Add an explicit `disabled` or `isDisabled` prop to empty scene cards and prevent interaction when the plot is missing.
**Rationale**: The grid renders extra columns; a clear disabled state prevents users from creating scenes for plots that do not exist yet.
**Alternatives considered**: Hide empty cards entirely (breaks discoverability of extra rows/columns).
