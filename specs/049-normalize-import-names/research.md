# Research: Import Name Standardization

**Branch**: `049-normalize-import-names`

## Decision 1: Canonical display format for imported names

- Decision: Canonicalize display names to trimmed title-style words while preserving readability for common acronyms and mixed tokens.
- Rationale: The feature requires standardized names that remain user-readable, not only lowercase matching keys.
- Alternatives considered:
  - Keep first-seen raw casing (rejected: non-deterministic across imports).
  - Force all-uppercase or all-lowercase (rejected: poor readability).

## Decision 2: Matching key for deduplication

- Decision: Match tags and characters by a normalized key built from trim + case-fold + whitespace collapse.
- Rationale: Existing import utilities already use this strategy and it satisfies case-insensitive equivalence in the spec assumptions.
- Alternatives considered:
  - Locale-sensitive fuzzy matching (rejected: overreach and false merges).
  - Exact raw-string matching (rejected: would not solve case-variant duplicates).

## Decision 3: Where normalization runs

- Decision: Apply canonicalization in both parse-stage identity maps and create-stage grouping/reuse checks.
- Rationale: Parse-stage dedupe prevents duplicated in-memory entities; create-stage dedupe prevents DB duplicates when prior imports already contain equivalents.
- Alternatives considered:
  - Parse-only normalization (rejected: still allows DB duplicates against existing records).
  - Create-only normalization (rejected: preview feedback would not reflect final consolidation behavior).

## Decision 4: Existing-record reuse strategy

- Decision: Build per-story lookup maps of existing tags/characters by normalized key and reuse IDs when keys match.
- Rationale: Re-imports should produce zero new case-variant duplicates and map all references to a single stored record.
- Alternatives considered:
  - Create then cleanup duplicates afterward (rejected: riskier and non-atomic behavior).
  - Add new unique indexes immediately (rejected: this plan does not include schema migration).

## Decision 5: Import feedback contract for consolidation

- Decision: Extend import result payload with a normalization report including canonical name and raw variants for tags and characters.
- Rationale: The spec requires user-visible consolidation outcomes; report should be present in preview and create responses.
- Alternatives considered:
  - Put details only in log statements (rejected: not user-visible).
  - Return only aggregate counts (rejected: does not show which values were consolidated).

## Decision 6: Scope boundaries

- Decision: Restrict normalization to import paths and imported tag/character entities only.
- Rationale: Aligns with feature assumptions and avoids unintended edits to unrelated CRUD flows.
- Alternatives considered:
  - Global rename across all existing entities (rejected: out of feature scope).

## Resolved Clarifications

- Canonical format behavior: resolved.
- Dedup key behavior for whitespace/case variants: resolved.
- Preview/create feedback representation: resolved.
- Legacy and modern import mode compatibility: resolved.
