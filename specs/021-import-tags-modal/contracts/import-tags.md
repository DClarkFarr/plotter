# Import Tags Contract

## Endpoint

`POST /stories/:toStoryId/tags/import`

## Request

```json
{
  "fromStoryId": "string",
  "toStoryId": "string",
  "tagIds": ["string"]
}
```

## Response (201)

```json
{
  "createdTags": [
    {
      "id": "string",
      "name": "string",
      "color": "string",
      "variant": false,
      "variants": [],
      "storyId": "string"
    }
  ],
  "skippedTagIds": ["string"]
}
```

## Error Responses

- `400` validation error (missing or invalid fields)
- `404` story not found or tag not found
- `409` duplicate tag name detected (if not skipped automatically)
