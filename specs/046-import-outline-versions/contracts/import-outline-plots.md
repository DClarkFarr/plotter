# API Contract: Import Outline — `POST /import/outline` (addendum)

**Version**: v2 (plot-as-resource addendum)  
**Branch**: `046-import-outline-versions`

---

## Overview

This document extends the existing `POST /import/outline` contract (see `contracts/import-outline.md`
if present) to describe the changes introduced by the plot-as-resource feature.

---

## Response Changes

### `ImportOutlineResponse` — preview mode

The preview response now includes an optional `plots` array alongside the existing `tags` array.

```jsonc
{
  "mode": "preview",
  "storyName": "The Lost City",
  "summary": "...",
  "elements": [...],
  "tags": [
    { "id": "tag_1", "name": "Romance", "variant": null, "color": null }
  ],
  "plots": [
    { "id": "plot_1", "name": "Main Journey", "color": "#ffaa00" },
    { "id": "plot_2", "name": "Side Quest",   "color": null }
  ],
  "characters": [...],
  "issues": [...]
}
```

**Backward-compatibility**: `plots` is absent (or an empty array) for legacy imports — existing
clients that do not read `plots` continue to work without change.

---

## Element Shape Changes

### Scene elements in `elements[]`

`scene` elements now carry an optional `plotIds` field in addition to `tagIds`.

```jsonc
{
  "id": "scene_1",
  "type": "scene",
  "title": "Arrival",
  "povCharacterId": "character_1",
  "tagIds": ["tag_1"],
  "plotIds": ["plot_1"],
  "characterIds": ["character_1"],
  "content": ["<p>...</p>"],
  "snippets": [],
}
```

**Backward-compatibility**: `plotIds` is absent for legacy-parsed scenes; clients treat a missing
`plotIds` as an empty array.

---

## Validation (backend router)

No new required fields. `importType` validation is unchanged.

---

## Error Semantics

No new error codes. Plot detection failures result in `issues[]` warnings (not HTTP errors):

- `"Modern plot heading is missing a plot title."` — plot heading found but title is empty.
- `"Detected consecutive plot headings before a scene; using the latest one."` — informational.
- `"Scene heading is not preceded by a modern plot heading."` — scene has no plot.
