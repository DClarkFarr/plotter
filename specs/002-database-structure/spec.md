# Feature Specification: Database Structure

**Feature Branch**: `[002-database-structure]`  
**Created**: March 21, 2026  
**Status**: Draft  
**Input**: User description: "Spec 002 -> Database Structure"

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## Clarifications

### Session 2026-03-21

- Q: How should ordering conflicts be handled when two plots or scenes share the same position? -> A: Shift existing items down to make room (stable insert).
- Q: When a story is deleted, what should happen to its tags, plots, and scenes? -> A: Soft delete story, keep related items.
- Q: How should an expired session token be treated when used? -> A: Reject as unauthorized/expired.
- Q: When an email is already used by another user, what should happen? -> A: Reject creation/update with a duplicate email.
- Q: Where should cross-collection validation and orchestration live? -> A: Services only; models are CRUD-only and must not import other models.
- Q: Should model files be refactored to remove cross-model imports with logic moved into services? -> A: Yes; remove cross-model imports and move that logic into /services.
- Q: Should multi-collection helper methods live in services even for read-only logic? -> A: Yes; move all multi-collection helpers (reads or writes) into services.
- Q: Should we enforce the no model-to-model import rule automatically? -> A: Yes; add a lint or CI check to forbid model-to-model imports.
- Q: How should services be organized? -> A: By domain (StoryService, PlotService, SceneService, UserService, SessionService, TagService).

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Create and Share Stories (Priority: P1)

As a story owner, I create a story, add a description, and invite collaborators with roles so we can edit the same narrative.

**Why this priority**: Collaborative story setup is the foundation for all other features.

**Independent Test**: Can be fully tested by creating a story and assigning an editor role, which delivers immediate collaboration value.

**Acceptance Scenarios**:

1. **Given** no story exists, **When** an owner creates a story with title and description, **Then** the story is saved and viewable.
2. **Given** a story exists, **When** the owner adds an editor user to the story, **Then** that user is recorded with the editor role.

---

### User Story 2 - Organize Plots, Scenes, and Tags (Priority: P2)

As a collaborator, I structure a story by adding plots, scenes, and tags, and I can order them so the board reflects the intended sequence.

**Why this priority**: Organizing plots and scenes is the core creative workflow after a story is created.

**Independent Test**: Can be fully tested by creating a plot and a scene with tags and confirming their ordering values persist.

**Acceptance Scenarios**:

1. **Given** a story exists, **When** a collaborator creates a plot and assigns its order, **Then** the plot is stored with that order.
2. **Given** a plot exists, **When** a collaborator creates scenes with tags and vertical ordering, **Then** scenes are stored with correct tag references and order values.

---

### User Story 3 - Start and End Sessions (Priority: P3)

As a user, I start a session when I sign in and the session ends when it expires or I sign out.

**Why this priority**: Sessions enable secure access but can be implemented after core data structures are ready.

**Independent Test**: Can be tested by creating a session token and confirming it becomes invalid after expiration.

**Acceptance Scenarios**:

1. **Given** valid credentials, **When** a session is started, **Then** a token and expiration timestamp are recorded.
2. **Given** an active session, **When** it is ended or expired, **Then** the session is no longer considered valid.

### Edge Cases

- Duplicate emails are rejected on create/update.
- Ordering conflicts are resolved by shifting existing items down to make room (stable insert).
- Deleting a story is a soft delete and does not remove related tags, plots, or scenes.
- Expired session tokens are rejected as unauthorized/expired.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST store users with first name, last name, email, and a non-reversible hashed password.
- **FR-002**: System MUST enforce unique user email addresses.
- **FR-003**: System MUST store stories with title and description.
- **FR-004**: System MUST allow a story to include multiple user permissions with roles of owner or editor.
- **FR-005**: System MUST store tags with name, color, variant flag, and optional sub-variants linked to a story.
- **FR-006**: System MUST store plots with title, description, color, story linkage, and horizontal ordering.
- **FR-007**: System MUST store scenes with title, description, plot linkage, tag references, todos, optional scene content, and vertical ordering.
- **FR-008**: System MUST allow creation, retrieval, update, and deletion for users, stories, tags, plots, scenes, and sessions.
- **FR-009**: System MUST preserve created and updated timestamps for all entities that are mutable.
- **FR-010**: System MUST prevent references to non-existent stories, plots, or tags.
- **FR-011**: System MUST store sessions with user linkage, token, payload, creation timestamp, and expiration timestamp.
- **FR-012**: System MUST invalidate sessions once they expire or are explicitly ended.
- **FR-013**: System MUST resolve ordering conflicts by shifting existing plots/scenes down to make room for inserts.
- **FR-014**: System MUST soft delete stories without deleting related tags, plots, or scenes.
- **FR-015**: System MUST reject expired session tokens as unauthorized.
- **FR-016**: System MUST reject create/update actions with a duplicate email.
- **FR-017**: Cross-collection validation and orchestration MUST live in services; model modules provide CRUD-only operations and MUST NOT import other model modules.
- **FR-018**: Model files MUST not import other model modules; any cross-collection logic MUST be moved into service modules under /services.
- **FR-019**: All multi-collection helper methods (including read-only helpers) MUST live in services.
- **FR-020**: The codebase MUST include an automated check (lint/CI) that forbids model-to-model imports.
- **FR-021**: Services MUST be organized by domain (StoryService, PlotService, SceneService, UserService, SessionService, TagService).

## Constraints

- Model modules are CRUD-only and must not import other model modules; multi-collection logic is owned by services.
- Refactor existing model modules to remove cross-model imports and relocate their multi-collection logic into services.
- Multi-collection helpers (read or write) are service responsibilities, not model responsibilities.
- Enforce the model import rule with automated checks (lint or CI).
- Organize services by domain (StoryService, PlotService, SceneService, UserService, SessionService, TagService).

### Key Entities _(include if feature involves data)_

- **User**: Person using the system; includes identity and authentication fields.
- **Story**: Shared narrative container; includes title, description, and user permissions.
- **Story Permission**: Relationship between a user and story with a role of owner or editor.
- **Tag**: Label within a story; includes color and optional variant metadata.
- **Plot**: High-level story segment; includes order within a story.
- **Scene**: Detailed narrative unit within a plot; includes order, tags, and todo items.
- **Session**: Authentication session for a user; includes token, payload, and lifetime.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can create a story with at least 3 plots and 10 scenes in under 5 minutes without data errors.
- **SC-002**: 95% of create, update, and delete actions complete within 2 seconds as observed in usability testing.
- **SC-003**: 90% of test users can invite an editor and confirm role access on their first attempt.
- **SC-004**: Automated integrity checks detect zero invalid references across stories, plots, scenes, and tags.

## Assumptions

- Session lifetimes default to 30 days unless configured otherwise.
- Colors are stored as human-readable values (for example, names or codes).
- Rich text fields are stored as formatted text content without imposing a specific format.
