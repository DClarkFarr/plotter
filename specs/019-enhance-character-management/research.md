# Research: Enhance Character Management

## Decisions

### Character characteristics storage

- **Decision**: Store characteristics as a nested object on the character document with fixed keys for defaults and optional values.
- **Rationale**: Matches the requirement for fixed labels while allowing omitted fields; aligns with existing model pattern of optional fields.
- **Alternatives considered**: Separate collection for characteristics (rejected due to added complexity and no cross-character queries required).

### Custom characteristics ordering

- **Decision**: Store `customCharacteristics` as an ordered array of `{ label, value }` objects; ordering is preserved by array order on save.
- **Rationale**: The UI allows sorting and the request states the entire object can be saved on sort, so array order is sufficient without extra indices.
- **Alternatives considered**: Add `sortIndex` or `id` fields (rejected as unnecessary for current needs).

### Expandable lists structure

- **Decision**: Store `lists` as an ordered array of `{ label, items }` objects, where `items` is a string array.
- **Rationale**: Supports default lists (strengths/weaknesses), custom lists, and expandable UI sections; array order naturally maps to UI ordering.
- **Alternatives considered**: Map/object keyed by label (rejected because order and duplicate labels become harder to manage).
