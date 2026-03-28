# Quickstart: Query Documentation Refresh

## Goal

Verify that all specs describing queries or mutations reflect the new per-model query directory and query key abstraction pattern, and that deprecated references are removed.

## Steps

1. Review specs that discuss data access patterns and update their wording to match the new organization.
2. Search specs for deprecated references and remove or replace them with descriptive language.
3. Confirm terminology for queries, mutations, and query keys is consistent across updated specs.

## Verification

- A search in specs/ returns zero matches for the deprecated reference.
- Each relevant spec describes the new query organization in plain language.
- No new file-specific references were introduced.

## Validation Notes (2026-03-28)

- Deprecated file name search: 0 matches in specs/
- Relevant specs updated or confirmed with no query/mutation references
