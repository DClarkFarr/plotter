# Data Model: Server Error Logging

## Overview

This feature does not introduce new persistent data models. It defines runtime-only structures for logging and error responses.

## Runtime Structures

### Error Log Context

- **referenceId**: unique identifier for a request error occurrence
- **method**: HTTP method
- **route**: matched route or request path
- **statusCode**: response status code
- **userId**: optional, when available from session
- **storyId**: optional, when present in params
- **plotId**: optional, when present in params or payload
- **sceneId**: optional, when present in params or payload
- **timestamp**: ISO-8601 timestamp

### Error Response

- **error**: human-friendly summary
- **referenceId**: correlation id for server logs
- **field**: optional, for validation errors
