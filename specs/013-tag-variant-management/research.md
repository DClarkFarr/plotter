# Research: Tag Variant Management

## Decisions

### 1) Scene variant selections stored alongside scene tags

- **Decision**: Add a scene-level mapping to persist which variant is selected for a tag, while keeping the existing tag ID list for base selection.
- **Rationale**: Preserves compatibility with existing tag selection flows and avoids a breaking migration of scene tags while still enabling per-variant selection and validation.
- **Alternatives considered**:
  - Replace `scene.tags` with an array of objects containing tag + variant data (more invasive API and UI changes).
  - Store variant selection only in client state (would be lost on reload and cannot enforce deletion rules).

### 2) Tag variant management via tag update endpoints

- **Decision**: Add tag update endpoints that can toggle `variant` state and add or remove entries from `variants`.
- **Rationale**: The backend already supports tag updates in the model layer; exposing a route keeps changes minimal and aligned with REST patterns.
- **Alternatives considered**:
  - Create a new variants collection (overkill for a list of strings tied to a tag).
  - Store variants in a separate service without API changes (prevents UI from updating persisted data).

### 3) Block deleting variants in use

- **Decision**: Reject variant delete requests when any scene references that tag + variant selection.
- **Rationale**: Prevents data integrity issues and aligns with existing tag deletion protection based on scene usage.
- **Alternatives considered**:
  - Allow deletion and auto-clear selections (risk of silent data loss).
  - Soft-delete variants and keep hidden (adds complexity without clear UX benefit).
