# Data Model: Color Palette System

## New Collection: `colors`

### Collection Name

`colors`

### Document Schema

```typescript
type ColorResourceType = "user" | "story";

type ColorDefinition = {
  resourceType: ColorResourceType; // "user" | "story"
  resourceId: ObjectId; // userId or storyId
  color: string; // 7-char hex string, e.g. "#ef4444"
  sortOrder: number; // 1–10, unique per resourceType+resourceId
  ignored: boolean; // default false
};
```

### Indexes

| Index                    | Fields                                    | Options |
| ------------------------ | ----------------------------------------- | ------- |
| Query by resource        | `{ resourceType, resourceId }`            | —       |
| Unique slot per resource | `{ resourceType, resourceId, sortOrder }` | unique  |

### Constraints

- `color` must be a valid 7-character lowercase hex string (`#rrggbb`).
- `sortOrder` must be an integer in `[1, 10]`.
- Exactly 10 documents exist per `(resourceType, resourceId)` combination once seeded. No inserts or hard-deletes are made by normal app operations after seeding; only updates.
- `ignored` defaults to `false`.

---

## System Defaults (seed data)

These 10 colors are written to a user's palette the first time their colors are requested. Story palettes are copied from the user's palette.

| Position | Hex       |
| -------- | --------- |
| 1        | `#ef4444` |
| 2        | `#f97316` |
| 3        | `#eab308` |
| 4        | `#22c55e` |
| 5        | `#14b8a6` |
| 6        | `#3b82f6` |
| 7        | `#8b5cf6` |
| 8        | `#ec4899` |
| 9        | `#64748b` |
| 10       | `#f59e0b` |

---

## Seed Cascade Logic

```
GET /api/stories/:storyId/colors
  ↓
colorModel.findByResource("story", storyId)
  → [] (no story colors yet)
  ↓
colorModel.findByResource("user", userId)
  → [] (no user colors yet)
  ↓
colorModel.insertDefaults("user", userId)   // writes 10 default documents
  ↓
colorModel.copyFromUser(userId, storyId)     // duplicates user docs as story docs
  ↓
return story colors (10 docs)
```

If user already has colors (story does not):

```
GET /api/stories/:storyId/colors
  ↓
colorModel.findByResource("story", storyId) → []
  ↓
colorModel.findByResource("user", userId)   → [10 docs]
  ↓
colorModel.copyFromUser(userId, storyId)
  ↓
return story colors
```

If story already has colors, return them directly (no cascade needed).

---

## No Changes to Existing Collections

No existing documents or schemas are modified:

- `stories` collection: unchanged
- `users` collection: unchanged
- `plots` collection: `color` field remains a plain hex string (unchanged)
- `tags` collection: `color` field remains a plain hex string (unchanged)

The palette system is additive only. Existing color values on plots and tags are not linked to palette entries — the palette is a selection helper, not a foreign-key constraint.

---

## TypeScript Types (express-side)

```typescript
// express/src/models/colors.ts

export type ColorResourceType = "user" | "story";

export type ColorDefinition = {
  resourceType: ColorResourceType;
  resourceId: ObjectId;
  color: string;
  sortOrder: number;
  ignored: boolean;
};

export type ColorDocument = ModelDocument<ColorDefinition>;
```

---

## TypeScript Types (web-side)

```typescript
// web/src/types/color.ts  (or similar)

export type StoryColor = {
  id: string;
  color: string; // "#rrggbb"
  sortOrder: number; // 1–10
  ignored: boolean;
};
```
