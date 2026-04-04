# Feature Specification: Character Card

**Feature Branch**: `018-character-card`  
**Created**: April 3, 2026  
**Status**: Draft  
**Input**: User description: "I want to add a \"caracter card\" component, that shows a larger caracter image, with stylized name and description below. The card should be around 350px across. Clicking on the image should expand the lightbox to a full-size lightbox view (maybe a modal effect, outside the card). There should be a \"on hover\" top-right positioned edit button that allows the user to upload a new character image.

This CharacterCard component will be used with pass-through props in a CharacterCardPopover component. The CharacterCardPopover will be used in 2 locations:

1. When clicking on a SceneCard > CharacterDisplay component.
2. When clicking on a ManageCharactersPanel > Character Avatar. (Note: this will replace the current \"click to upload\" functionality here, which will now exist in the CharacterCardPopover > CharacterCard)"

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View character details at a glance (Priority: P1)

As a user, I can open a character card to see a larger character image, the character name, and a short description so I can quickly identify the character.

**Why this priority**: This is the primary value of the card and enables faster recognition and selection of characters.

**Independent Test**: Can be fully tested by opening a character card from either entry point and confirming the image, name, and description are presented.

**Acceptance Scenarios**:

1. **Given** a character with an image, name, and description, **When** I open the character card, **Then** I see the large image, stylized name, and description within a card around 350px wide.
2. **Given** a character without a description, **When** I open the character card, **Then** I see the name and an empty-state description message.

---

### User Story 2 - Expand to full-size view (Priority: P2)

As a user, I can click the character image to open a full-size lightbox view so I can examine the character artwork in detail.

**Why this priority**: The lightbox gives a richer view of the character image without leaving the current workflow.

**Independent Test**: Can be tested by clicking the card image and confirming the lightbox opens and can be dismissed.

**Acceptance Scenarios**:

1. **Given** the character card is open, **When** I click the character image, **Then** a full-size lightbox view appears outside the card.
2. **Given** the lightbox is open, **When** I dismiss it, **Then** I return to the character card in the same context.

---

### User Story 3 - Update character image (Priority: P3)

As a user with edit access, I can hover over the character card to reveal an edit button and upload a new character image so the artwork stays current.

**Why this priority**: Keeping character images up to date is a common maintenance task that should be available without leaving the workflow.

**Independent Test**: Can be tested by hovering over the card to reveal the edit control and completing an image upload.

**Acceptance Scenarios**:

1. **Given** I have edit access, **When** I hover over the character card, **Then** I see an edit button in the top-right corner.
2. **Given** the edit button is visible, **When** I select it and upload a new image, **Then** the character image updates in the card and lightbox.

### Edge Cases

- What happens when a character has no image available?
- How does the system handle image upload failures or unsupported file types?
- What happens when a user without edit access hovers over the card?
- How does the lightbox behave when the image fails to load?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST provide a character card that displays a large character image, stylized name, and description.
- **FR-002**: The character card MUST be approximately 350px wide.
- **FR-003**: The character image MUST be clickable to open a full-size lightbox view outside the card.
- **FR-004**: The lightbox MUST be dismissible without leaving the current context.
- **FR-005**: The character card MUST expose an edit button on hover, positioned at the top-right of the card.
- **FR-006**: Users with edit access MUST be able to upload a new character image from the edit button.
- **FR-007**: The updated image MUST appear in both the card and the lightbox after a successful upload.
- **FR-008**: The character card MUST be usable within a reusable character card popover surfaced from both the scene character display and the manage characters list.
- **FR-009**: The manage characters list MUST use the character card for image updates instead of a separate click-to-upload interaction.
- **FR-010**: The character card MUST provide a clear empty state for missing descriptions and missing images.

### Key Entities _(include if feature involves data)_

- **Character**: Represents a story character with name, description, and image reference.
- **Character Image**: Represents the primary visual asset associated with a character.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 95% of users can open a full-size character image within 1 second of clicking the card image.
- **SC-002**: 90% of users who attempt an image update complete it without leaving the current page or workflow.
- **SC-003**: The character card fits within a 350px width band (350px +/- 10%) across supported viewports.
- **SC-004**: At least 90% of users report the character card makes it easier to identify characters in feedback or usability tests.

## Assumptions

- Users without edit access do not see the edit button or upload controls.
- If no image exists, the card shows a consistent placeholder state.
- The lightbox can be dismissed by clicking outside the image or using a close control.
- Existing image upload capabilities are available for reuse.

## Dependencies

- Character image storage and retrieval are already available.
- Permission rules for editing character data are defined elsewhere.
