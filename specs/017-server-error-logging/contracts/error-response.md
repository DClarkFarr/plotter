# Contract: Error Response

## Purpose

Define a consistent error response structure for API clients while keeping sensitive error details in server logs.

## Response Shape

```json
{
  "error": "Human-readable message",
  "referenceId": "string",
  "field": "optional-field-name"
}
```

## Notes

- `referenceId` is required for 5xx and logged server-side.
- `field` is included only for validation errors.
- The client must not receive stack traces or internal error metadata.
