# Data Model: Enhance Character Management

## Entity: Character

**Description**: A story character with optional characteristics, custom attributes, and lists.

**Fields (new/updated)**

- `characteristics` (object, optional)
  - `description` (string, optional)
  - `history` (string, optional)
  - `height` (string, optional)
  - `weight` (string, optional)
  - `age` (string, optional)
  - `hair` (string, optional)
  - `eyeColor` (string, optional)
  - `mantra` (string, optional)
  - `skinColor` (string, optional)
  - `build` (string, optional)
- `customCharacteristics` (array, optional)
  - items: `{ label: string, value: string }`
- `lists` (array, optional)
  - items: `{ label: string, items: string[] }`

**Validation Rules**

- `height`, `weight`, and `age` are stored as strings when provided.
- `label` and `value` are required for custom characteristics.
- `lists.label` is required; `lists.items` may be empty.

**Defaults**

- Default characteristics are defined in UI config with fixed labels (e.g., `description` labeled as "Description").
- Default lists: `strengths`, `weaknesses` with empty `items` when unset.

## Notes

- Array order for `customCharacteristics` and `lists` is preserved and represents user-defined ordering.
- Existing fields (`title`, `description`, `imageUrl`) remain unchanged.
