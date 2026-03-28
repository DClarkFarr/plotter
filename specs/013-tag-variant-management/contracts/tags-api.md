# Contracts: Tag Variant Management API

## Update Tag

`PATCH /stories/:storyId/tags/:tagId`

**Request Body**

```json
{
  "name": "string?",
  "color": "string?",
  "variant": "boolean?",
  "variants": ["string"]?
}
```

**Response**

```json
{
  "tag": {
    "id": "string",
    "name": "string",
    "color": "string",
    "variant": true,
    "variants": ["string"],
    "storyId": "string"
  }
}
```

**Errors**

- 400 if validation fails (duplicate variant, invalid fields)
- 404 if tag not found

## Add Variant

`POST /stories/:storyId/tags/:tagId/variants`

**Request Body**

```json
{
  "name": "string"
}
```

**Response**

```json
{
  "tag": {
    "id": "string",
    "name": "string",
    "color": "string",
    "variant": true,
    "variants": ["string"],
    "storyId": "string"
  }
}
```

**Errors**

- 400 if duplicate or invalid variant name
- 404 if tag not found

## Delete Variant

`DELETE /stories/:storyId/tags/:tagId/variants/:variantName`

**Response**

```json
{
  "tag": {
    "id": "string",
    "name": "string",
    "color": "string",
    "variant": true,
    "variants": ["string"],
    "storyId": "string"
  }
}
```

**Errors**

- 400 if variant is in use or invalid
- 404 if tag or variant not found

## Update Scene Tags (Variant Selection)

`PATCH /stories/:storyId/scenes/:sceneId`

**Request Body**

```json
{
  "tags": ["string"],
  "tagVariants": [
    {
      "tagId": "string",
      "variant": "string"
    }
  ]
}
```

**Response**

```json
{
  "scene": {
    "id": "string",
    "tags": ["string"],
    "tagVariants": [
      {
        "tagId": "string",
        "variant": "string"
      }
    ]
  }
}
```

**Errors**

- 400 if tag variant selection is invalid
- 404 if scene not found
