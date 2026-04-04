# Research: Character Card

## Decisions

### Lightbox presentation

- **Decision**: Use an existing Flowbite React modal pattern to present the full-size character image outside the card.
- **Rationale**: Aligns with UI component guardrails and provides consistent modal behavior without new dependencies.
- **Alternatives considered**: Custom modal overlay built from scratch; third-party lightbox libraries (rejected to avoid new dependencies).

### Image upload entry point

- **Decision**: Trigger the existing character image upload flow from a hover-revealed edit action within the character card.
- **Rationale**: Keeps the update workflow in one place and replaces the legacy click-to-upload interaction in ManageCharactersPanel.
- **Alternatives considered**: Retaining the separate upload entry in ManageCharactersPanel (rejected to avoid duplicate UX).

### Reusable popover integration

- **Decision**: Expose the CharacterCard through a CharacterCardPopover with pass-through props for use in SceneCard and ManageCharactersPanel.
- **Rationale**: Ensures a single source of truth for the card UI and behavior across entry points.
- **Alternatives considered**: Duplicating the card UI in each location (rejected due to maintenance cost).
