# Research: Create Tag Form Reuse

## Decisions

### Shared create-tag form component

- **Decision**: Create a reusable create-tag form component in the story component area and use it in both the tag management panel and the scene tagging modal.
- **Rationale**: Ensures consistent fields and validation while reducing duplicate UI logic.
- **Alternatives considered**: Duplicating the form UI in each view (rejected due to maintenance overhead).

### Reuse existing create-tag mutation

- **Decision**: Continue using the existing tag creation mutation and alert handling already wired in the scene tagging view.
- **Rationale**: Keeps behavior consistent and avoids introducing new data flows.
- **Alternatives considered**: Creating a new mutation hook for the management view (rejected as unnecessary duplication).
