# Feature Specification: ListView Sidebar Enhancements

**Feature Branch**: `035-listview-sidebar-enhancements`  
**Created**: 2026-04-11  
**Status**: Draft  
**Input**: User description: "Style and flesh out the virtuoso sidebar in ListView.tsx — visual hierarchy, plot-colored borders, click-to-scroll navigation, and filter-state handling."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Sidebar Navigation (Priority: P1)

A user reading the story in List View uses the sticky sidebar as a mini table of contents. Clicking any sidebar entry — act, chapter, or scene — smoothly scrolls the main content area to that item.

**Why this priority**: Navigation is the core value of the sidebar. Without click-to-scroll, the sidebar is purely decorative and provides no functional benefit.

**Independent Test**: Can be fully tested by clicking sidebar entries and confirming the main list scrolls to the correct act, chapter, or scene.

**Acceptance Scenarios**:

1. **Given** the List View is open, **When** the user clicks a scene entry in the sidebar, **Then** the main content area scrolls to bring that scene into view.
2. **Given** the List View is open, **When** the user clicks a chapter entry in the sidebar, **Then** the main content area scrolls to bring that chapter heading into view.
3. **Given** the List View is open, **When** the user clicks an act entry in the sidebar, **Then** the main content area scrolls to bring that act heading into view.
4. **Given** the sidebar is visible, **When** the user scrolls through a long story, **Then** the sidebar remains sticky and always visible.

---

### User Story 2 - Visual Hierarchy in Sidebar (Priority: P2)

A user glances at the sidebar and immediately distinguishes acts, chapters, and scenes by text size. Acts appear largest and most prominent, chapters mid-size, and scenes compact with a colored left border matching their plot color — mirroring the visual treatment used in the main content area.

**Why this priority**: Visual hierarchy improves at-a-glance orientation and creates a coherent experience that mirrors the main list view.

**Independent Test**: Can be fully tested by visually inspecting the sidebar with a story that contains acts, chapters, and scenes across multiple plots.

**Acceptance Scenarios**:

1. **Given** the sidebar contains acts, chapters, and scenes, **When** viewed, **Then** act labels are visibly larger than chapter labels, which are visibly larger than scene labels.
2. **Given** a scene entry in the sidebar, **When** viewed, **Then** it displays a left border in the color of the plot it belongs to.
3. **Given** a chapter entry in the sidebar, **When** viewed, **Then** its text size is visually between act size and scene size.
4. **Given** a scene entry with no plot color defined, **When** viewed, **Then** the entry renders without a colored border and does not break the layout.

---

### User Story 3 - Filtered Item States in Sidebar (Priority: P3)

When filters are active, the sidebar reflects filter exclusions so the user understands which items are currently visible. In "minify" visibility mode, excluded items appear de-emphasized (greyed out or struck through) but remain clickable. In "hide" visibility mode, excluded items appear disabled and cannot be clicked.

**Why this priority**: Without filter state reflection, the sidebar can mislead users into clicking items that are hidden or collapsed in the main view.

**Independent Test**: Can be fully tested by activating a filter, switching between "hide" and "minify" visibility modes, and verifying sidebar entry appearance and clickability for excluded scenes.

**Acceptance Scenarios**:

1. **Given** filters are active and visibility mode is "minify", **When** a scene is filtered out, **Then** its sidebar entry appears visually de-emphasized (greyed out or struck through).
2. **Given** filters are active and visibility mode is "minify", **When** the user clicks a filtered-out sidebar entry, **Then** the main content scrolls to that item.
3. **Given** filters are active and visibility mode is "hide", **When** a scene is filtered out, **Then** its sidebar entry appears visually disabled (muted appearance, not-allowed cursor, no hover highlight).
4. **Given** filters are active and visibility mode is "hide", **When** the user attempts to click a filtered-out sidebar entry, **Then** nothing happens and no scroll is triggered.
5. **Given** no filters are active, **When** viewed, **Then** all sidebar entries appear fully active and respond to clicks.
6. **Given** filters are active, **When** viewing the sidebar, **Then** section entries (acts and chapters) are never filtered out — only scene entries reflect filter exclusion.

---

### Edge Cases

- What happens when a scene belongs to a plot with no color defined?
- How does the sidebar handle very long scene, chapter, or act titles (text overflow / truncation)?
- What if all scenes in the story are filtered out in "hide" mode — does the sidebar still show acts and chapters?
- What if the user clicks a sidebar item that is already fully in view?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Sidebar scene entries MUST display a left border in the color of their associated plot, matching the visual treatment of scenes in the main list.
- **FR-002**: Sidebar chapter entries MUST render at a font size visibly larger than scene entries.
- **FR-003**: Sidebar act entries MUST render at a font size visibly larger than chapter entries.
- **FR-004**: Each sidebar entry MUST be clickable and, when clicked, MUST scroll the main content area to the corresponding item.
- **FR-005**: When filters are active and visibility mode is "minify", excluded scene sidebar entries MUST appear visually de-emphasized (greyed out or struck through).
- **FR-006**: When filters are active and visibility mode is "minify", excluded scene sidebar entries MUST remain clickable and trigger scroll-to behavior.
- **FR-007**: When filters are active and visibility mode is "hide", excluded scene sidebar entries MUST appear visually disabled.
- **FR-008**: When filters are active and visibility mode is "hide", excluded scene sidebar entries MUST NOT respond to click events.
- **FR-009**: The sidebar MUST remain sticky and always visible as the user scrolls the main content area.
- **FR-010**: Section entries (acts and chapters) in the sidebar MUST NOT be subject to filter exclusion treatment — they are always shown as fully active and clickable.
- **FR-011**: Sidebar scene entries with no associated plot color MUST fall back gracefully without breaking layout.
- **FR-012**: Long titles in sidebar entries MUST be truncated or wrapped without overflowing the sidebar container.

### Key Entities

- **Sidebar Scene Entry**: Represents a single scene in the sidebar; carries plot association (for border color), filter exclusion state, and a reference to scroll to the corresponding main list item.
- **Sidebar Section Entry**: Represents an act or chapter heading; carries section type ("act" or "chapter") to determine font size treatment; never subject to filter exclusion.
- **FilterVisibilityMode**: Two-value mode (`"hide"` or `"minify"`) that controls how filtered-out items appear throughout the view, including in the sidebar.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A user can navigate from any sidebar entry to its corresponding main list item in a single click with no additional interaction.
- **SC-002**: Visual inspection confirms three distinct text sizes for acts, chapters, and scenes in the sidebar — distinguishable without relying solely on color.
- **SC-003**: Scene sidebar entries whose plot has a color display a left border; entries without a plot color render without a border and without layout issues.
- **SC-004**: When filters are active in "hide" mode, all filtered-out sidebar entries are non-interactive (no scroll triggered on click, disabled cursor shown).
- **SC-005**: When filters are active in "minify" mode, all filtered-out sidebar entries remain navigable via click.
- **SC-006**: In all filter states, act and chapter sidebar entries remain fully interactive and visually active.
