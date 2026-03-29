# Feature Specification: Assets Management

**Feature Branch**: `014-assets-management`  
**Created**: 2026-03-29  
**Status**: Draft  
**Input**: User description: "Time to add general story management for story character and story tags. Currently, these lists appear in modals, in the context. Now, add another section to the Portal top menu: Assets. The buttons will be characters and tags (icons with tooltips). Clicking them will open the sidebar in manage characters or manage tags respectively. Tag management: list works like the scene selection one but no checkboxes; allow renaming the main tag title only. Character management: page is a searchable list with the image and color."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Open assets management from the portal (Priority: P1)

As a story manager, I can access general asset management from the Portal top menu so I can manage story-wide tags and characters outside scene context.

**Why this priority**: This is the new entry point that enables all other management actions.

**Independent Test**: Can be fully tested by opening the Portal menu and launching each management view without relying on any other feature changes.

**Acceptance Scenarios**:

1. **Given** I am viewing a story in the Portal, **When** I open the Assets section, **Then** I see buttons for characters and tags with icons and tooltips.
2. **Given** I am in the Portal, **When** I click the characters button, **Then** the sidebar opens in manage characters view.
3. **Given** I am in the Portal, **When** I click the tags button, **Then** the sidebar opens in manage tags view.

---

### User Story 2 - Rename story tags in the assets list (Priority: P2)

As a story manager, I can review and rename tag titles from a list so I can keep story tags organized without entering a scene context.

**Why this priority**: Tag naming is essential for story organization and must be maintained outside scene context.

**Independent Test**: Can be fully tested by opening manage tags and renaming a tag title from the list.

**Acceptance Scenarios**:

1. **Given** the manage tags sidebar is open, **When** I view the list, **Then** tags appear in a list format similar to scene selection but without selection checkboxes.
2. **Given** the manage tags list is shown, **When** I rename a tag title, **Then** the updated title is shown in the list and stored for the story.
3. **Given** a tag has variants, **When** I rename the main tag title, **Then** variant labels remain unchanged.

---

### User Story 3 - Search and edit story characters (Priority: P3)

As a story manager, I can search and edit characters in place so I can keep character details up to date without leaving the list.

**Why this priority**: Character data changes frequently, and inline editing keeps the workflow fast.

**Independent Test**: Can be fully tested by opening manage characters, filtering the list, and editing a character row.

**Acceptance Scenarios**:

1. **Given** the manage characters sidebar is open, **When** I view the list, **Then** each character shows its image and color alongside the name.
2. **Given** the character list is visible, **When** I enter a search term, **Then** the list filters to characters whose names match the term.
3. **Given** a character row is visible, **When** I click the character image, **Then** I can select a new image to upload for that character.
4. **Given** a character row is visible, **When** I edit the name field, **Then** it appears as a bold, inline field with a subtle background similar to the scene form.
5. **Given** a character row is visible, **When** I edit the description field, **Then** it appears as an inline textbox for that character.
6. **Given** no character names match the search term, **When** the list updates, **Then** an empty state is shown indicating no results.

### Edge Cases

- Tags or characters list is empty and the view shows a friendly empty state.
- Renaming a tag to an existing title results in a clear validation message and no change is applied.
- Character images are missing; the list still renders with a placeholder.
- The sidebar opens but data fails to load; the user sees a retry or error message.
- A character cannot be deleted because it is assigned to scenes; the user sees a clear reason.
- Image upload fails; the user sees an error message and the previous image remains.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The Portal top menu MUST include an Assets section with characters and tags buttons.
- **FR-002**: Assets buttons MUST display icons and show tooltips on hover or focus.
- **FR-003**: Clicking the characters button MUST open the sidebar in manage characters view for the current story.
- **FR-004**: Clicking the tags button MUST open the sidebar in manage tags view for the current story.
- **FR-005**: The manage tags list MUST mirror the scene selection list layout but MUST NOT display selection checkboxes.
- **FR-006**: Users MUST be able to rename the main tag title from the manage tags list.
- **FR-007**: Renaming a main tag title MUST NOT modify tag variant labels.
- **FR-008**: The manage characters view MUST show a searchable list of characters with image and color shown per item.
- **FR-009**: Character search MUST filter by character name and provide a no-results state.
- **FR-010**: Errors loading tags or characters MUST be communicated with a clear recovery action.
- **FR-011**: Character list items MUST support inline editing of image, name, and description.
- **FR-012**: Character image updates MUST be initiated by clicking the image and selecting a new file.
- **FR-013**: Character name editing MUST use a bold inline field with a subtle background similar to the scene form style.
- **FR-014**: Character description editing MUST use an inline textbox.
- **FR-015**: Users MUST be able to delete a character only when it is not assigned to any scenes.
- **FR-016**: Attempting to delete an in-use character MUST show a clear reason and not remove the character.

### Assumptions

- Access to Assets is available to the same users who can access existing story management in the Portal.
- The manage tags and manage characters views are already supported in the sidebar and can be opened outside scene context.

### Key Entities _(include if feature involves data)_

- **Story**: The container for tags and characters being managed.
- **Tag**: A story label with a main title and optional variants; only the main title is editable here.
- **Character**: A story participant with a name, image, and color.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 95% of users can open manage characters or manage tags from the Assets menu on the first attempt.
- **SC-002**: Users can locate a specific character via search in under 10 seconds for lists up to 200 characters.
- **SC-003**: Tag title renames succeed without errors in at least 98% of attempts.
- **SC-004**: Users report improved discoverability of story assets in post-release feedback (average rating 4/5 or higher).
