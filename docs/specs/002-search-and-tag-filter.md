---
status: draft
depends: SPEC-001
---
# SPEC-002: Search and tag filter

## Why

Once the catalog holds more than a few dozen fiches, scrolling an alphabetical list stops working, especially on mobile right before an interview. A client-side search and tag filter keep the site static (no server, no cost) while making any term reachable in a couple of keystrokes.

## Acceptance criteria

- [ ] AC1: When the user types in the search field on the home page, the system shall show only fiches whose `term`, `acronym`, `aliases` or body contain the query, ignoring case and accents.
- [ ] AC2: When the user selects a tag, the system shall show only fiches carrying that tag; selecting it again shall clear the filter.
- [ ] AC3: While both a query and a tag are active, the system shall show only fiches matching both.
- [ ] AC4: If no fiche matches, then the system shall show "Aucun buzzword ne correspond." instead of an empty list.
- [ ] AC5: The system shall build the search index at build time from `buzzwords/*.md`, with no request to an external service at runtime.

## Out of scope

- Fuzzy matching and typo tolerance.
- Search from a fiche page (home page only).
- Filtering by relation or by date.

## Open questions

_None._

## Plan
