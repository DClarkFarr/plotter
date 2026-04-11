# Contracts: Shifted Resources in Scene/Section Mutations

## Overview

These endpoints may return `shiftedResources` for optimistic UI reconciliation.

## Scene Endpoints

### Create Scene

- **Method**: `POST`
- **Path**: `/:storyId/plots/:plotId/scenes`
- **Response**:
  - `scene`: Scene
  - `shiftedResources?`: { `scenes[]`, `sections[]` }

### Update Scene (move via verticalIndex update)

- **Method**: `PATCH`
- **Path**: `/:storyId/scenes/:sceneId`
- **Response**:
  - `scene`: Scene

### Move Scene Within Plot

- **Method**: `POST`
- **Path**: `/:storyId/scenes/:sceneId/move-within-plot`
- **Body**: `{ fromPlotId, toPlotId, fromIndex, toIndex }`
- **Response**:
  - `scene?`: Scene
  - `shiftedResources?`: { `scenes[]`, `sections[]` }

### Delete Scene

- **Method**: `DELETE`
- **Path**: `/:storyId/scenes/:sceneId`
- **Response**:
  - `deleted`: true
  - `shiftedResources?`: { `scenes[]`, `sections[]` }

## Section Endpoints

### List Sections

- **Method**: `GET`
- **Path**: `/:storyId/sections`
- **Response**:
  - `sections`: Section[]

### Create Section

- **Method**: `POST`
- **Path**: `/:storyId/sections`
- **Body**: `{ title, verticalIndex, type }`
- **Response**:
  - `section`: Section
  - `shiftedResources?`: { `scenes[]`, `sections[]` }

### Update Section (move via verticalIndex update)

- **Method**: `PATCH`
- **Path**: `/:storyId/sections/:sectionId`
- **Body**: `{ title?, verticalIndex?, type? }`
- **Response**:
  - `section`: Section
  - `shiftedResources?`: { `scenes[]`, `sections[]` }

### Delete Section

- **Method**: `DELETE`
- **Path**: `/:storyId/sections/:sectionId`
- **Response**:
  - `deleted`: true
  - `shiftedResources?`: { `scenes[]`, `sections[]` }
