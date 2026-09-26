---
status: in-progress
depends: SPEC-001
---
# SPEC-003: Backlinks on fiche pages

## Why

A relation is only written in the fiche that declares it. When a new fiche says `Kafka < Event-Driven Architecture`, the existing EDA page never learns about Kafka, so the glossary only links "backwards in time". Updating older fiches from `/buzzword save` would slow the skill down, rewrite fiches the user already validated, and write inverse relations (such as `>`) the user never chose. Computing backlinks at build time keeps the skill fast, keeps fiches exactly as saved, and stays consistent when fiches are added, renamed or deleted.

## Acceptance criteria

- [ ] AC1: When a relation of fiche A resolves to fiche B (same matching as SPEC-001 AC3), the system shall list A in a "Cité par" section on B's page, labelled with A's acronym when present (otherwise its term), linked to A, under the inverse operator: `<` becomes `>`, `>` becomes `<`, and `&`, `=`, `≠` are unchanged.
- [ ] AC2: If one of B's own relations already resolves to A, then the system shall not list A in B's "Cité par" section.
- [ ] AC3: The system shall group "Cité par" entries by operator in the same order as the "Buzzwords liés" groups, and sort them alphabetically by label within a group, each fiche appearing at most once per group.
- [ ] AC4: If no fiche remains to list for B after AC2, then the system shall not render a "Cité par" section on B's page.
- [ ] AC5: The system shall compute backlinks at build time from `buzzwords/*.md` only, without modifying any fiche file.

## Out of scope

- Changes to the `/buzzword` skill or to the fiche data contract.
- Writing inverse relations into fiche files.
- Backlinks on the home page or in the search index.
- Relation graph visualization.

## Open questions

_None._

## Plan

- [ ] `scripts/lib/fiches.mjs`: add a `backlinkResolver(fiches, resolveRelation)` that, for each fiche, computes the fiches whose relations resolve to it, grouped by the inverse operator (`in`/`contains` swap, `near`/`same`/`not` unchanged), deduped per group, excluding any fiche the target already relates to itself (AC2), sorted like `sortByTerm` (acronym-or-term label, French collation, slug tie-break).
- [ ] `scripts/lib/render.mjs`: add a `renderBacklinks` section ("Cité par", same group markup/order as "Buzzwords liés") and wire it into `renderFiche` via a new parameter; omit the section when there is nothing to show (AC4).
- [ ] `scripts/build.mjs`: build the resolver once per build and pass it to `renderFiche` for every fiche (AC5: computed in memory from the loaded fiches, no write back to `buzzwords/`).
- [ ] Run `npm test` and `npm run build`; iterate until the SPEC-003 acceptance tests pass.
