# Feature Specification: Plots & Scenes Endpoint Split

**Feature Branch**: `036-plots-scenes-endpoint-split`  
**Created**: 2026-04-11  
**Status**: Draft  
**Input**: User description: "I want to refactor the plots and scenes endpoint to improve performance. Specifically, the plots endpoint should just return plots, without nested scenes. The scenes for plots should then be queries through a different endpoint and compiled."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Load Story Plot Grid (Priority: P1)

When a user navigates to a story's plot grid view, the application fetches the list of plots for that story. Currently this request also fetches all scenes for all plots in the same response, which grows unbounded as a story gains more scenes. After this change, the plots list endpoint returns only plot metadata. The UI then issues a separate request to retrieve scenes for the plots it needs to display, compiling them client-side into the grid structure.

**Why this priority**: This is the core performance bottleneck. A story with hundreds of scenes forces the server to load and serialize all of them on every page load, even if only a few plots are in view. Splitting the requests allows the UI to load the grid shell immediately and hydrate scenes progressively or on-demand.

**Independent Test**: Navigate to a story page. The plot grid headings render immediately from the plots-only response. Scene cards load in a subsequent request. Both requests complete with correct data.

**Acceptance Scenarios**:

1. **Given** a story with multiple plots and scenes, **When** the plots list endpoint is called, **Then** the response contains only plot metadata (id, title, description, color, storyId, horizontalIndex) with no scene data embedded.
2. **Given** a list of plot IDs, **When** the scenes endpoint is called with those IDs, **Then** the response contains all scenes belonging to the specified plots.
3. **Given** the client has received plots and scenes separately, **When** the UI compiles the grid, **Then** each scene is correctly associated with its plot.

---

### User Story 2 - Update a Plot and Receive Fresh Plot Data (Priority: P2)

When a user edits a plot (e.g., renames it or changes its color), the server returns the updated plot record. Currently, the PATCH plot endpoint re-fetches and returns the plot with all its nested scenes. After this change, the response contains only the updated plot metadata, consistent with the new plots list shape.

**Why this priority**: Consistency with the new plots response shape is required so the client can merge updates without having to handle two different Plot shapes.

**Independent Test**: Send a PATCH request to update a plot title. The response contains the updated plot without a scenes array.

**Acceptance Scenarios**:

1. **Given** an existing plot, **When** a PATCH request updates its title, **Then** the response plot object contains the new title and no nested scenes.
2. **Given** a PATCH request for a non-existent plot, **When** the server processes it, **Then** a 404 error is returned.

---

### User Story 3 - Create a Plot and Receive Consistent Plot Data (Priority: P3)

When a user creates a new plot, the server returns the newly created plot. The response shape should be consistent with the plots list endpoint — plot metadata only, no nested scenes.

**Why this priority**: Consistency across create and list shapes simplifies the client data model. New plots have no scenes, so the change is non-breaking, but alignment is still required.

**Independent Test**: POST to create a plot. The response plot object has no scenes field.

**Acceptance Scenarios**:

1. **Given** a valid create-plot request, **When** the server processes it, **Then** the response contains the new plot with metadata only (no scenes array).

---

### Edge Cases

- What happens when the scenes endpoint is called with an empty list of plot IDs? The response should return an empty scenes array rather than an error.
- What happens when a plot ID in the request does not belong to the authenticated user's story? Those scenes must not be returned; the endpoint should enforce story-scoped access.
- What happens if a plot has no scenes? Its ID may be included in the request, and the response simply returns no scenes for that plot — this is not an error.
- What happens when the scenes for multiple plots are requested at once? All matching scenes are returned in a single flat list; the client groups them by plotId.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The plots list endpoint (`GET /stories/:storyId/plots`) MUST return only plot metadata — it MUST NOT include nested scene data.
- **FR-002**: A dedicated scenes endpoint MUST exist that accepts one or more plot IDs scoped to a story and returns all scenes belonging to those plots.
- **FR-003**: The scenes endpoint MUST enforce story-level access control — it MUST NOT return scenes for plots that do not belong to the requested story or that the authenticated user cannot access.
- **FR-004**: The PATCH plot endpoint MUST return updated plot metadata only, without nested scenes, consistent with FR-001.
- **FR-005**: The POST plot (create) endpoint MUST return the created plot metadata only, without a scenes array, consistent with FR-001.
- **FR-006**: The client MUST compile plots and scenes into the grid structure client-side after receiving both responses.
- **FR-007**: The scenes endpoint MUST handle an empty plot ID list gracefully, returning an empty scenes collection.
- **FR-008**: All existing scene CRUD operations (create, update, delete, move) MUST remain unchanged in behavior and response shape.

### Key Entities

- **Plot**: A column in the story grid. Attributes: id, title, description, color, storyId, horizontalIndex. After this change, plots no longer carry an embedded scenes list in list/create/update responses.
- **Scene**: A card in the plot grid. Attributes: id, title, description, plotId, tags, tagVariants, todo, snippets, verticalIndex, pov. Scenes are fetched independently and associated to plots by plotId.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The plots list response payload size is reduced proportionally to the number of scenes in the story — a story with 200 scenes produces a plots response that does not grow with scene count.
- **SC-002**: The time to first meaningful render of the story grid (plot headers visible) is faster than before the change because the plots request no longer waits for scene data to be loaded and serialized.
- **SC-003**: All existing story grid functionality (creating, editing, moving, and deleting scenes and plots) continues to work correctly after the refactor.
- **SC-004**: No data is lost or incorrectly associated — scenes returned by the scenes endpoint match the scenes previously embedded in the plots response.

## Assumptions

- The scenes endpoint will accept a list of plot IDs as a query parameter or request body; the exact mechanism is an implementation detail left to the plan.
- The client already has logic to group scenes by plotId (since the `plotId` field exists on each scene); the main change is triggering that grouping after a separate fetch rather than unpacking nested data.
- The `getPlotWithScenes` service function used by the PATCH plot endpoint can be replaced by returning the updated plot document directly, since the scenes are no longer needed in the response.
- Backward compatibility with older clients is not required; client and server will be updated together.
