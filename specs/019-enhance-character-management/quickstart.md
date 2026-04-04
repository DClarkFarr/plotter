# Quickstart: Enhance Character Management

## Prerequisites

- Node.js dependencies installed in both `express/` and `web/`.
- MongoDB available and running.

## Run the stack

```bash
cd express
npm run dev
```

```bash
cd web
npm run dev
```

## Try the workflow

1. Open the story page and click "Manage characters".
2. Click "Add new" from the task details panel to open the character modal.
3. Fill in default characteristics and add custom attributes and lists.
4. Save and confirm the character appears with the updated details.

## Sample payload

```json
{
  "title": "Ava Carson",
  "characteristics": {
    "description": "A stoic sailor.",
    "history": "Raised in the coastal fleets.",
    "height": "173",
    "weight": "62",
    "age": "29",
    "hair": "Black",
    "eyeColor": "Green",
    "mantra": "Stay the course",
    "skinColor": "Tan",
    "build": "Athletic"
  },
  "customCharacteristics": [{ "label": "Scar", "value": "Left cheek" }],
  "lists": [
    { "label": "strengths", "items": ["Navigation", "Patience"] },
    { "label": "weaknesses", "items": ["Seasick"] }
  ]
}
```
