# Quickstart: Server Error Logging

## Goal

Trigger a failing request and confirm the server logs include a reference id, stack trace, and request context, while the client receives a safe response.

## Steps

1. Start the API server from the `express/` directory.
2. Trigger a failing request (example below).
3. Verify the response includes `referenceId`.
4. Find the same `referenceId` in the server logs and confirm the entry includes route, method, and stack trace.

## Example Request

```bash
curl -X POST \
  http://localhost:1000/api/stories/invalid/scenes/invalid/move-within-plot \
  -H "Content-Type: application/json" \
  -d '{"plotId":"missing","fromIndex":"bad","toIndex":1}'
```

## Expected Result

- Response returns a 4xx or 5xx with `{ "error": "...", "referenceId": "..." }`.
- Server logs include the same reference id plus request context and stack trace.
