# Feature Specification: Duplicate Story Card

**Feature Branch**: `042-duplicate-story-card`  
**Created**: 2026-04-16  
**Status**: Draft  
**Input**: User description: "From the dashboard, I want the story cards to have a horizontal ... icon next to the 'right arrow -> click to view story' icon. The ... icon will open a dropdown menu. The first button will be 'duplicate story'. Clicking the button will show a new card outline on the grid, but in a spinner/duplicating state. The story will then be duplicated, with all its assets, including, colors, characters, tags, plots and scenes. When the story is duplicated, the spinner card will disappear and be replaced with the newly created story's card, which will be selected. Let's also do a success toast saying 'story created'."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Trigger Story Duplication from Card Menu (Priority: P1)

A user on the dashboard sees a horizontal "..." (ellipsis) actions icon on each story card, alongside the existing "view story" arrow icon. Clicking "..." opens a small dropdown menu. The user selects "Duplicate story" to begin the duplication process.

**Why this priority**: This is the entry point for the entire feature. Without it nothing else can be triggered.

**Independent Test**: Can be fully tested by opening the dashboard and verifying an ellipsis icon appears on each story card that, when clicked, reveals a dropdown with a "Duplicate story" option.

**Acceptance Scenarios**:

1. **Given** the user is on the dashboard and at least one story exists, **When** they view a story card, **Then** a horizontal "..." icon is visible next to the view-story arrow icon.
2. **Given** the "..." icon is visible, **When** the user clicks it, **Then** a dropdown menu appears containing at least one option: "Duplicate story".
3. **Given** the dropdown is open, **When** the user clicks outside it or presses Escape, **Then** the dropdown closes without taking any action.

---

### User Story 2 - Optimistic Placeholder Card While Duplicating (Priority: P2)

After the user clicks "Duplicate story", an animated placeholder card immediately appears in the story grid in a spinner/duplicating state, giving instant visual feedback that the operation is in progress.

**Why this priority**: Immediate feedback is essential to reassure the user the action was registered and prevent repeated clicks.

**Independent Test**: Can be fully tested by clicking "Duplicate story" and confirming a spinner/loading card appears in the grid before the operation completes.

**Acceptance Scenarios**:

1. **Given** the user clicks "Duplicate story", **When** the duplication begins, **Then** a placeholder card in a spinner/loading state is immediately appended to the story grid.
2. **Given** the placeholder card is visible, **When** the operation is still in progress, **Then** the placeholder clearly communicates a loading/duplicating state through animation and muted styling.
3. **Given** the placeholder card is showing, **When** the user navigates away and returns to the dashboard, **Then** no orphaned placeholder cards are shown.

---

### User Story 3 - Completed Duplication: Replace Placeholder with New Story Card (Priority: P3)

When the server confirms the story has been fully duplicated (including colors, characters, tags, plots, and scenes), the placeholder card is replaced by the real card for the new story. The new card appears in a selected/highlighted state and a success toast confirms the action.

**Why this priority**: Completing the visual lifecycle of duplication delivers the full user value and closes the feedback loop.

**Independent Test**: Can be fully tested by allowing a duplication to complete and verifying the spinner card is replaced with a real highlighted story card and a "story created" toast is shown.

**Acceptance Scenarios**:

1. **Given** duplication completes successfully, **When** the server responds, **Then** the placeholder spinner card disappears and is replaced by the new story's real card at the same grid position.
2. **Given** the new story card appears, **When** it is rendered, **Then** it is visually selected or highlighted, distinct from other cards.
3. **Given** duplication completes successfully, **When** the card appears, **Then** a toast notification with the message "story created" is displayed.
4. **Given** duplication fails, **When** the error is received, **Then** the placeholder card is removed and an appropriate error message is communicated to the user.

---

### Edge Cases

- What if the user clicks "Duplicate story" multiple times rapidly? The action must be disabled or debounced for that story while a duplication is already in progress.
- What if the story is deleted before duplication completes? The operation fails gracefully, the placeholder is removed, and an error message is shown.
- What if the story grid is very long? The placeholder card is appended at the end and scrolled into view.
- What if duplication fails mid-way (e.g., story record created but scenes fail to copy)? The system must either complete fully or roll back to avoid a partially duplicated story appearing in the dashboard.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Each story card on the dashboard MUST display a horizontal ellipsis ("...") actions icon alongside the existing view-story icon.
- **FR-002**: Clicking the ellipsis icon MUST open a dropdown menu anchored to that story card.
- **FR-003**: The dropdown menu MUST contain a "Duplicate story" action as its first item.
- **FR-004**: Clicking "Duplicate story" MUST immediately insert a placeholder card in a spinner/loading state into the story grid.
- **FR-005**: The duplication operation MUST copy all story assets: color palette, characters, tags, plots, and scenes.
- **FR-006**: Upon successful duplication, the placeholder card MUST be replaced by the real card for the newly created story.
- **FR-007**: The newly created story card MUST appear in a visually selected or highlighted state after duplication completes.
- **FR-008**: A success toast notification with the message "story created" MUST be displayed when duplication completes.
- **FR-009**: If duplication fails, the placeholder card MUST be removed and the user MUST see an error message.
- **FR-010**: The "Duplicate story" action MUST be prevented from being triggered more than once per story while a duplication is already in progress for that story.

### Key Entities

- **Story**: The top-level content container being duplicated. A duplicated story is a fully independent copy.
- **Story Assets**: All items belonging to a story that must be duplicated — color palette entries, characters, tags, plots, and scenes.
- **Placeholder Card**: A transient UI element in the story grid representing an in-progress duplication. It has no real story ID and is not persisted.
- **Dropdown Menu**: A contextual actions menu attached to a story card, triggered by the ellipsis icon.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can initiate story duplication in 2 interactions or fewer from the dashboard (click "..." then click "Duplicate story").
- **SC-002**: A visual indicator of duplication in progress appears within 200ms of the user clicking "Duplicate story".
- **SC-003**: The duplicated story card replaces the placeholder within the same session without requiring a page refresh.
- **SC-004**: 100% of story assets (colors, characters, tags, plots, scenes) are present in the duplicated story upon completion.
- **SC-005**: A success toast confirming the action is visible to the user upon successful completion.
- **SC-006**: Duplication failures result in no orphaned, partially created stories appearing in the user's dashboard.

## Assumptions

- The dashboard currently shows a grid of story cards; the placeholder card will be appended at the end of the grid.
- The existing view-story arrow icon remains unchanged; the ellipsis icon is additive.
- The selected/highlighted state for the newly created card reuses an existing visual affordance already in the UI (e.g., the `recentlyImportedId` highlight used for imported stories).
- Story duplication is performed server-side; the client sends a duplicate request and awaits confirmation.
- A story and all its assets can be duplicated within a reasonable timeframe (under 30 seconds) even for large stories.
- The toast notification system is already in place in the application.
- No confirmation dialog is needed before duplicating — the action is low-stakes as it does not delete or irreversibly alter existing data.
- The duplicated story's title will be assigned by the server (e.g., "Copy of [Original Title]") without requiring user input at duplication time.

## Out of Scope

- Renaming the duplicate at duplication time via a user prompt.
- Duplicating a story across user accounts or shared workspaces.
- Additional dropdown menu items beyond "Duplicate story" (may be added in future features).
- Undo/undo duplication functionality.
