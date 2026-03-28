# Research: Scene POV Selection

## Decision 1: Store POV as a character reference on scenes

- **Decision**: Add an optional `pov` reference on scenes that points to a character ID.
- **Rationale**: Enables quick lookup and display while keeping characters centralized by story.
- **Alternatives considered**: Store POV as a string on the scene; duplicate character data on each scene.

## Decision 2: Create a characters collection scoped to stories

- **Decision**: Add a `characters` collection with fields for story ownership and optional image metadata.
- **Rationale**: Story-scoped character data is reusable across scenes and supports list/create flows.
- **Alternatives considered**: Embed characters in story documents; reuse tags collection for POV.

## Decision 3: Provide story-scoped list/create endpoints for characters

- **Decision**: Expose REST endpoints to list characters for a story and create new characters inline.
- **Rationale**: Supports POV selection and inline character creation without leaving the scene editor.
- **Alternatives considered**: Admin-only character management UI; batch creation workflow outside the editor.

## Decision 4: Use single-select UI for POV with avatar rendering

- **Decision**: Use a single-select control that renders name + avatar and allows clearing the selection.
- **Rationale**: POV is singular and must stay consistent with the scene model.
- **Alternatives considered**: Multi-select; text input with freeform names.
