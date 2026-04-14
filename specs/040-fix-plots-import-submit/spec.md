# Feature Specification: Fix Plot Customizations Submission on Import

**Feature Branch**: `040-fix-plots-import-submit`  
**Created**: 2026-04-13  
**Status**: Draft  
**Input**: User description: "I added a 'plots' tab to ImportOutlinePreviewTabs. I want to be able to have a default 'Main' plot by default, and have it checked as 'Make default plot'. And I did all that, but I did it wrong. As the 'tags' array I am modifying never gets sent to the server. So we need to modify the preview modal to be able to send plots with the color and default plot selected."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## Background

The import outline flow has a multi-step modal: upload a `.docx` → preview detected content → approve import. The preview step includes a "Plots" tab where users can see which tags have been promoted to plots, assign a custom color to each plot, and mark one plot as the default (main) plot.

A synthetic "Main" plot entry is always included in the plots list and pre-checked as the default. Users can change both colors and the default selection before approving. However, none of these customizations are currently included in the data submitted to the server — the server always creates plots with a hardcoded grey color and ignores the default plot preference.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Plot Colors Are Preserved on Import (Priority: P1)

A user imports an outline with multiple plots. They assign unique colors to each plot in the Plots tab to match their story's color scheme. When they click "Approve import," the created plots in the story reflect the colors they selected.

**Why this priority**: Colors are a key visual organizational tool in the plotter app. Without this, every imported plot is grey, forcing users to manually recolor all plots after every import.

**Independent Test**: Upload a document, preview it, change the color of at least one plot in the Plots tab, approve the import, then verify the created story has plots with the correct colors.

**Acceptance Scenarios**:

1. **Given** the user is on the Plots preview tab, **When** they change a plot's color, **Then** the color picker updates immediately in the UI.
2. **Given** the user has customized plot colors and clicks "Approve import," **Then** each created plot in the story has the color the user selected in the preview.
3. **Given** the user has not changed a plot's color (leaving the default), **When** the import is approved, **Then** the plot is created with the default color shown in the UI preview.

---

### User Story 2 - Default Plot Selection Is Respected on Import (Priority: P2)

A user imports an outline with multiple plots. They want one of their tag-converted plots (not the "Main" placeholder) to be the story's primary plot. They check "Make Default Plot" on that plot and approve the import. The story is created with that plot as the primary one.

**Why this priority**: The default plot determines the primary plot row in the story dashboard. An incorrect default forces users to manually reorder after import.

**Independent Test**: Upload a document with at least one tag convertible to a plot, convert it in the Tags tab, switch to Plots tab, check "Make Default Plot" on it, approve the import, verify the story reflects the correct default plot.

**Acceptance Scenarios**:

1. **Given** the Plots tab is open with the "Main" plot pre-checked as default, **When** the user checks "Make Default Plot" on a different plot, **Then** the "Main" plot's checkbox unchecks automatically (only one can be default at a time).
2. **Given** the user has designated a specific plot as default, **When** they click "Approve import," **Then** the created story has that plot as its primary/default plot.
3. **Given** the user has not changed the default plot selection, **When** the import is approved, **Then** the "Main" plot remains the default plot.

---

### Edge Cases

- What happens when a tag that was marked as default plot gets unchecked from "Convert to plot" in the Tags tab? The default designation must be cleared.
- What happens if no plot is marked as default when submitting? The server must fall back gracefully (e.g., treat the "Main" plot as default).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The import submission payload MUST include the color for each plot (keyed by plot tag ID).
- **FR-002**: The import submission payload MUST include the ID of the plot designated as the default plot.
- **FR-003**: The server MUST use the submitted plot color when creating each plot during import, instead of a hardcoded default color.
- **FR-004**: The server MUST use the default plot designation from the submission to determine which plot is created as the story's primary plot.
- **FR-005**: The "Main" (synthetic) plot MUST always be included in the plots list with its color and default-state editable, so its color and default status can be submitted.
- **FR-006**: If no default plot is designated in the submission, the server MUST fall back to using "Main" as the default.
- **FR-007**: Removing a tag from the "plots" list (unchecking "Convert to plot") MUST also clear any default-plot designation for that tag, keeping the submission consistent.

### Key Entities

- **Plot Customization**: Per-plot data captured in the preview UI — color (hex string) and whether it is the default plot — associated with a plot tag ID.
- **Import Customizations**: The configuration object submitted from the UI to the server on final approval, extended to carry plot customization data alongside existing fields (ignored characters, character merges, and plot tag IDs).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A user can complete an import with custom plot colors and have those exact colors reflected in the story without any manual post-import recoloring.
- **SC-002**: A user can designate any plot as the default during the preview step and have the created story use that plot as its primary plot.
- **SC-003**: The preview UI shows live color and default-plot changes immediately, so users can verify their selections before submitting.
- **SC-004**: Zero manual steps are required to correct plot colors or the default plot after an import where the user made explicit selections in the preview.

## Assumptions

- The application uses horizontal position (index 0 = primary) to determine which plot is the story default. The implementation plan will clarify the exact mechanism.
- A fallback color (the one shown in the `PlotsTab` color picker on first load) should be used server-side if a plot's color is omitted from the submission.
- The "Main" synthetic plot (`id: "main_plot_id"`) always corresponds to the server's hardcoded "Main" plot creation; its color and default status are submitted the same way as any other plot.
