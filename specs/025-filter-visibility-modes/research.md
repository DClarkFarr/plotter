# Research: Filter Visibility Modes

## Summary

No unresolved clarification items were found in the spec. The research below captures implementation-oriented decisions based on existing project conventions.

## Decisions

### Decision: Store visibility mode in existing story UI state

- **Decision**: Add the filter visibility mode to the existing client-side story filter state (Zustand).
- **Rationale**: Keeps filter-related UI state centralized and consistent across plot grid and list view.
- **Alternatives considered**: Local component state in each view (rejected due to inconsistent cross-view behavior).

### Decision: Shared plot filtering helper

- **Decision**: Implement a shared `applyFiltersToPlots` helper that returns filtered plots plus the included scene IDs.
- **Rationale**: Ensures both grid and list views apply the same filtering rules and can uniformly compute `isFilterExcluded`.
- **Alternatives considered**: Duplicating filter logic per view (rejected due to risk of drift).

### Decision: Plot-level filters exclude scenes for non-matching plots

- **Decision**: When a plot filter is active, keep all plots but exclude scenes for plots that do not match.
- **Rationale**: Preserves grid structure while still respecting plot-level filtering intent.
- **Alternatives considered**: Removing non-matching plots entirely (rejected due to grid layout disruption).
