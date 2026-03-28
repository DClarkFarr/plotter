# Research: Query Documentation Refresh

## Decision: Documentation-only scope

**Decision**: Limit work to specs in the specs/ directory that describe query or mutation organization.
**Rationale**: The feature is explicitly about updating documentation to reflect the new query layout and naming.
**Alternatives considered**: Update code comments or READMEs outside specs/. Rejected to keep scope aligned to the requested spec update.

## Decision: Describe the pattern without file-specific references

**Decision**: Use descriptive language for per-model query directories and query key methods without naming individual files.
**Rationale**: The spec requires removing deprecated file references and avoiding new file-specific references.
**Alternatives considered**: Reference the current file names directly. Rejected to avoid future churn as the structure evolves.

## Decision: Normalize terminology across specs

**Decision**: Use consistent terms for queries, mutations, and query keys across all updated specs.
**Rationale**: Consistency reduces confusion for contributors and reviewers.
**Alternatives considered**: Keep existing wording per spec. Rejected to avoid mismatched terminology.
