# Contracts: Story Grid Shift Endpoint

## Overview

Provides a single endpoint to persist grid row insert/remove actions and return shifted resources for reconciliation.

## Shift Grid Rows

- **Method**: `POST`
- **Path**: `/:storyId/grid-shift`
- **Body**:
  - `startIndex`: number (0-based)
  - `shift`: number (`1` to insert/shift down, `-1` to remove/shift up)
- **Validation**:
  - `startIndex` must be >= 0
  - If `shift` is `-1`, the target row at `startIndex` must be empty (no scenes or sections)
- **Response**:
  - `shiftedResources?`: { `scenes[]`, `sections[]` }
