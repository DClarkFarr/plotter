# Contract: Import Outline (Docx AST)

## Endpoint

`POST /api/imports/outline`

## Description

Accepts a .docx file upload and parses it into structured elements. In `preview` mode, returns a parsed structure without creating records. In `create` mode, creates the story and returns the created id.

## Request

- Content-Type: `multipart/form-data`
- Form fields:
  - `file` (required): .docx file
  - `mode` (required): `preview` | `create`
  - `storyName` (optional): string

## Response (preview)

```json
{
  "mode": "preview",
  "summary": "Import completed",
  "storyName": "Imported outline",
  "elements": [
    {
      "id": "act_1",
      "type": "act",
      "title": "Act 1",
      "content": ["<p>Act notes</p>"]
    },
    {
      "id": "chapter_1",
      "type": "chapter",
      "title": "Chapter 1",
      "actId": "act_1"
    },
    {
      "id": "scene_1",
      "type": "scene",
      "title": "Scene title",
      "chapterId": "chapter_1",
      "povCharacterId": "character_1",
      "tagIds": ["tag_1"],
      "characterIds": ["character_1"],
      "snippets": [
        { "id": "snippet_1", "order": 0, "content": ["<p>Snippet text</p>"] }
      ],
      "content": ["<p>Scene body</p>"]
    }
  ],
  "tags": [
    { "id": "tag_1", "name": "tag", "variant": null, "color": "#ffcc00" }
  ],
  "characters": [{ "id": "character_1", "name": "Character 1" }],
  "issues": []
}
```

## Response (create)

```json
{
  "mode": "create",
  "summary": "Import completed",
  "message": "Import completed",
  "storyId": "64f3e9...",
  "storyName": "Imported outline"
}
```

## Errors

- `400` for missing fields or invalid mode
- `413` for oversized files
- `415` for non-docx uploads
- `422` for parsing errors that prevent import (response includes `issues` payload)
