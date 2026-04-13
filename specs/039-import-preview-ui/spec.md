# Feature Specification: Import Preview UI

**Feature Branch**: `039-import-preview-ui`  
**Created**: 2026-04-12  
**Status**: Draft  
**Input**: User description: "Lets add UI to help the user visualize and customize the import. On the preview step, in addition to the summary, let's build a summarized UI that shows what will happen. The ui should be a tabs/panes layout. Tab/pane 1) should be a list of charcter names. Each list item should contain an right-aligned actions group. Action 1 is a checkbox with the label 'ignore' after the character. If selected, the item will be grayed out and struck through. Action 2 is a button to 'merge with'. Clicking that button converts the list to a select dropdown of all the characters. Selecting one will indicate that all occurrences of the character in the item should be replaced by the new character selected. Tab/pane 2) should show the elements. A list of acts, chapters and scenes. Should be an outline UI like the list view sidebar, except there aren't colors yet. For scenes, show a secondary line with the pov badge and tag badges. Tab/Pane 3) should show tags and plots. Basically, some tags should actually be plots. The requirement is that they cannot have variants. If the tag is in variant syntax, then it is only a tag. But all the other tags should have a 'convert to plot' checkbox. Checking this box will indicate that this is not a tag, it is actually a plot. Any scenes with that tag/plot should be added to that plot."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View a structured preview of what will be imported (Priority: P1)

As a writer uploading a .docx outline, I can see a rich tabbed preview of the parsed content so I understand exactly what will be created before I approve.

**Why this priority**: The tabbed preview is the core deliverable of this feature. Without it, users have no visibility into the parsed data before committing the import.

**Independent Test**: Can be fully tested by uploading a .docx with acts, chapters, scenes, characters, and tags and verifying all three tabs render correctly with the expected data.

**Acceptance Scenarios**:

1. **Given** I have uploaded a .docx file and the preview has loaded, **When** I view the preview step, **Then** I see a tabbed layout with three panes: "Characters", "Elements", and "Tags & Plots".
2. **Given** I am on the preview step, **When** the parsed document contains no characters or tags, **Then** the corresponding tabs show an empty state message rather than an error.
3. **Given** I am on the preview step, **When** I switch between tabs, **Then** my selections and changes in each tab are preserved.

---

### User Story 2 - Manage characters before import (Priority: P2)

As a writer, I can review all detected character names in the Characters tab, ignore characters I don't want, or merge duplicates and aliases into a single character so the import produces clean data.

**Why this priority**: Character names in outlines often contain slight variations or aliases. Without this step, duplicate or unwanted characters pollute the story structure.

**Independent Test**: Can be fully tested by uploading a .docx with multiple characters, ignoring one, merging another, and confirming the changes are reflected in the import result.

**Acceptance Scenarios**:

1. **Given** the Characters tab is active, **When** I view the list, **Then** each character name is shown as a list item with an "Ignore" checkbox and a "Merge with" button aligned to the right.
2. **Given** a character is shown, **When** I check the "Ignore" checkbox, **Then** that list item is visually grayed out and struck through, indicating it will be excluded from the import.
3. **Given** a character is shown, **When** I click the "Merge with" button, **Then** the button is replaced by a dropdown listing all other characters in the document.
4. **Given** the merge dropdown is open, **When** I select a target character, **Then** the item shows the merge assignment and all scenes referencing the original character will use the target character instead.
5. **Given** a character has a merge assignment, **When** I want to undo it, **Then** I can clear the assignment and the character reverts to its original state.
6. **Given** a character is ignored, **When** I uncheck the "Ignore" checkbox, **Then** the item returns to its normal state.

---

### User Story 3 - Browse the document outline structure (Priority: P3)

As a writer, I can review the full outline hierarchy in the Elements tab so I can verify acts, chapters, and scenes parsed correctly before approving.

**Why this priority**: Structural errors (e.g., missing chapter grouping or mis-parsed scenes) are easier to catch visually than from a flat summary count.

**Independent Test**: Can be fully tested by uploading a .docx with a known structure and verifying acts, chapters, and scenes appear in the correct nesting order in the Elements tab.

**Acceptance Scenarios**:

1. **Given** the Elements tab is active, **When** the document contains acts, chapters, and scenes, **Then** they are displayed as a nested outline list with acts at the top level, chapters nested under acts, and scenes nested under chapters.
2. **Given** a scene is shown in the outline, **When** the scene has a POV character, **Then** a POV badge is shown on a secondary line beneath the scene title.
3. **Given** a scene is shown in the outline, **When** the scene has assigned tags, **Then** each tag is shown as a badge on the secondary line alongside the POV badge.
4. **Given** the document has no acts or chapters, **When** I view the Elements tab, **Then** scenes are still displayed at the root level without error.

---

### User Story 4 - Classify tags as plots before import (Priority: P4)

As a writer, I can review all detected tags in the Tags & Plots tab and mark specific tags as plots so the import correctly creates plot rows for scenes tracked under that label.

**Why this priority**: Tags and plots are distinct concepts in the app. Without this classification step, all structural labels would default to tags, requiring manual plot creation after import.

**Independent Test**: Can be fully tested by uploading a .docx with several tags including variant-syntax tags, marking one plain tag as a plot, and confirming the import creates a plot rather than a tag for the checked item.

**Acceptance Scenarios**:

1. **Given** the Tags & Plots tab is active, **When** I view the list, **Then** each tag is shown with its name and, if it has a variant (colon syntax), it is shown as a tag-only item with no "Convert to plot" option.
2. **Given** a plain tag (no variant syntax) is shown, **When** I check the "Convert to plot" checkbox, **Then** the item is visually distinguished as a plot, and the import understands that all scenes referencing this tag should be assigned to that plot instead.
3. **Given** a tag has been marked as a plot, **When** I uncheck the "Convert to plot" checkbox, **Then** it reverts to being a plain tag.
4. **Given** a tag uses variant syntax (e.g., `[tag:variant]`), **When** it appears in the list, **Then** the "Convert to plot" checkbox is absent or disabled and it is clearly labelled as a tag-only item.

---

### Edge Cases

- A document with no characters shows an empty state in the Characters tab rather than an error.
- A document with no tags shows an empty state in the Tags & Plots tab.
- A document with no acts, chapters, or scenes shows an empty state in the Elements tab.
- Merging character A into character B when character B is also set to "Ignore" shows a warning or prevents the combination.
- A very large outline (100+ scenes) renders without layout overflow or performance collapse.
- Tags that only appear in variant syntax are never eligible to become plots.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The import preview step MUST display a tabbed layout with three panes: "Characters", "Elements", and "Tags & Plots".
- **FR-002**: The Characters tab MUST list every character name detected in the parsed document, one per row.
- **FR-003**: Each character row MUST include a right-aligned group of two actions: an "Ignore" checkbox and a "Merge with" button.
- **FR-004**: When a character's "Ignore" checkbox is checked, the row MUST be visually grayed out and struck through to indicate exclusion.
- **FR-005**: When a character's "Merge with" button is clicked, it MUST be replaced by a dropdown selector listing all other detected characters.
- **FR-006**: When a merge target is selected, the system MUST record that all document occurrences of the source character should be treated as the target character in the import.
- **FR-007**: Users MUST be able to undo both ignore and merge assignments by unchecking or clearing them.
- **FR-008**: The Elements tab MUST display acts, chapters, and scenes in a nested outline structure reflecting their document hierarchy.
- **FR-009**: Each scene row in the Elements tab MUST show the scene title as the primary line and, on a secondary line, a POV badge (if applicable) and tag badges for all assigned tags.
- **FR-010**: The Tags & Plots tab MUST list all distinct tags detected in the document.
- **FR-011**: Tags that use variant syntax (colon-separated name and variant) MUST be shown as tag-only items with no ability to convert to a plot.
- **FR-012**: Tags without variant syntax MUST each have a "Convert to plot" checkbox.
- **FR-013**: When a tag is marked as a plot, the import MUST treat every scene referencing that tag as belonging to that plot rather than having that tag.
- **FR-014**: All user customizations (ignores, merges, plot conversions) made in the preview tabs MUST be applied when the user approves the import.
- **FR-015**: Each tab MUST show an appropriate empty state when no items of that type exist in the parsed document.

### Key Entities

- **Character Preview Item**: Represents a detected character name with its ignore flag and optional merge-target assignment.
- **Element Preview Item**: Represents an act, chapter, or scene in the outline hierarchy; scenes carry POV and tag badge data.
- **Tag Preview Item**: Represents a detected tag, carrying its name, variant status, and whether it has been designated as a plot.
- **Import Customization State**: The complete set of user-defined overrides (ignored characters, merge mappings, plot designations) that modifies how the parsed data is submitted for creation.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can review all characters, elements, and tags in a single preview step without leaving the modal.
- **SC-002**: Users can configure ignores, merges, and plot designations and have those settings reflected in the created story without additional manual cleanup.
- **SC-003**: The tabbed preview renders within 2 seconds of the parse response being received, even for outlines with 50+ scenes.
- **SC-004**: After approving a customized import, the resulting story contains no characters, tags, or plain-tag plots that the user marked for exclusion or conversion.

## Assumptions

- The backend preview endpoint already returns parsed `elements`, `tags`, and `characters` arrays; this feature adds client-side customization state on top of that data rather than changing the API contract.
- "Convert to plot" only reclassifies tags at import time; it does not affect the document parse result.
- A character that is both ignored and the target of a merge from another character will be excluded; the merge from the other character is effectively also ignored.
- Scenes without a POV character show no POV badge in the Elements tab but still appear in the outline.
