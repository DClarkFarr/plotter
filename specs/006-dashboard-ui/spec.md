# Feature Specification: User Dashboard

**Feature Branch**: `006-dashboard-ui`  
**Created**: March 21, 2026  
**Status**: Draft  
**Input**: User description: "Let's build the user dashboard. layout: Should have a topbar. The right should be the user's avatar wtih a dropdown. The avatar contains the first two letters of the user's name, in uppercase. The dropdown has the avatar, then the full name in the top section. Then action links. Currently there will only be a link to \"logout\". The dashboard page content main page content should start below the topbar and be 100% width and 100% height minus the height of the top bar. No scrolling. Content sections should scroll when they hit max. Pages: For the main `/dashboard` page we'll have a grid of created stories. There can be a title / heading and a \"+ story\" button. Clicking \"+ story\" should show a modal with basic story info. Clicking create closes the modal and redirects to the new story's URL. A story single page will be on `/dashboard/story/:storyId`. For now, the story page can be \"Hello story page\". Remember to define all components and jsx layouts in components/\*. IMPORTANT: NO COMPONENTS SHOULD BE DEFINED IN THE routes/ DIRECTORY"

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## Clarifications

### Session 2026-03-21

- Q: What basic story info is required in the create-story modal? → A: Title only (required)
- Q: How should the avatar letters be derived from the user name? → A: Use first + last initials for two-word names; otherwise use first two characters
- Q: How should scrolling behave for the dashboard page, grid, and overlays? → A: Page is fixed; grid area scrolls; modal and dropdown overlay without page scroll
- Q: How should the avatar dropdown close? → A: Close on outside click and Esc key
- Q: How should the avatar render when the name has fewer than two characters? → A: Use the available single character only

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Navigate the dashboard (Priority: P1)

As a signed-in user, I can open the dashboard, see a topbar with my avatar and name, and view a grid of my stories in the main content area.

**Why this priority**: It is the primary landing experience for the dashboard and validates the overall layout and navigation.

**Independent Test**: Can be fully tested by loading the dashboard with an existing user profile and verifying layout, topbar, and story grid visibility.

**Acceptance Scenarios**:

1. **Given** a signed-in user with a name and at least one story, **When** they open the dashboard, **Then** the topbar shows an avatar with the first two uppercase letters of their name and the main area shows a grid of their stories.
2. **Given** a signed-in user, **When** the dashboard loads, **Then** the main content starts below the topbar, fills the remaining height and width, and the page itself does not scroll.

---

### User Story 2 - Create a new story from the dashboard (Priority: P2)

As a signed-in user, I can open a create-story modal, enter basic story information, and create a new story that takes me to its page.

**Why this priority**: Creating stories is a core action and must be accessible from the dashboard.

**Independent Test**: Can be tested by opening the modal, completing required fields, and verifying redirection to the newly created story page.

**Acceptance Scenarios**:

1. **Given** the dashboard is open, **When** I select “+ story”, **Then** a modal opens that asks for basic story information.
2. **Given** the create-story modal is open with valid inputs, **When** I confirm creation, **Then** the modal closes and I am redirected to the new story page.

---

### User Story 3 - View a story page shell (Priority: P3)

As a signed-in user, I can open a single story page from the dashboard and see a placeholder page that confirms I navigated correctly.

**Why this priority**: It establishes the routing destination for created stories and confirms navigation flow.

**Independent Test**: Can be tested by navigating to a story URL and verifying a placeholder message is shown.

**Acceptance Scenarios**:

1. **Given** I navigate to a story URL, **When** the page loads, **Then** I see a simple placeholder message indicating the story page.

### Edge Cases

- What happens when the user has no stories yet and the grid is empty?
- How does the avatar render when the user name has fewer than two characters or includes non-letters?
- What happens if the create-story modal is canceled without saving?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The dashboard MUST display a topbar with a user avatar on the right.
- **FR-002**: The avatar MUST display two uppercase characters derived from the user name, using first + last initials for two-word names; otherwise use the first two characters.
- **FR-003**: The avatar MUST open a dropdown that shows the avatar, the full user name, and a logout action link.
- **FR-004**: The dashboard main content area MUST start below the topbar, fill the remaining viewport width and height, and the page itself MUST not scroll.
- **FR-005**: The dashboard grid area MUST scroll independently when content overflows.
- **FR-011**: The create-story modal and avatar dropdown MUST render as overlays without enabling page-level scrolling.
- **FR-012**: The avatar dropdown MUST close when the user clicks outside it or presses Esc.
- **FR-013**: If the user name has fewer than two characters, the avatar MUST display the available single character in uppercase.
- **FR-006**: The dashboard page MUST display a title/heading, a “+ story” action, and a grid of existing stories.
- **FR-007**: Selecting “+ story” MUST open a modal that collects a required story title.
- **FR-008**: Confirming story creation MUST close the modal and redirect the user to the new story URL.
- **FR-009**: The story detail page MUST be reachable at a story-specific URL and display a placeholder message for now.
- **FR-010**: Layout and UI components MUST be defined outside route definitions.

### Key Entities _(include if feature involves data)_

- **User**: Person signed into the dashboard, identified by name used for avatar and dropdown display.
- **Story**: User-created item displayed in the dashboard grid and accessible via a story-specific URL.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 95% of test users can locate the “+ story” action within 10 seconds of landing on the dashboard.
- **SC-002**: 95% of test users can create a story and reach its page in under 60 seconds.
- **SC-003**: The dashboard loads with no global page scroll and maintains a stable layout across common desktop and mobile viewport sizes.
- **SC-004**: At least 90% of users in usability testing can identify the logout action from the avatar dropdown without assistance.

## Assumptions

- Users are already authenticated when they access dashboard routes.
- Basic story information includes a required title only.
- Story creation always results in an immediate redirect to a unique story URL.

## Out of Scope

- Story content editing beyond the placeholder view.
- Advanced story filtering, sorting, or search on the dashboard.
- Additional dropdown actions beyond logout.
