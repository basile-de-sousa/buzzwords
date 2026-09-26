---
status: in-progress
---
# SPEC-001: Buzzword catalog site

## Why

The `/buzzword` skill saves every fiche to `buzzwords/<slug>.md`. Reading them one file at a time on GitHub is slow, and the relations between terms (`<`, `>`, `&`, `=`, `≠`) are only text. A static site built from these files turns them into a browsable catalog where each relation leads to the related fiche. It costs nothing to host (GitHub Pages) and keeps the repo as the only source of truth: the site is derived, never edited by hand.

### Data contract (written by `/buzzword`)

```markdown
---
term: Enterprise Service Bus      # required, full name
slug: enterprise-service-bus      # required, equals the file name
acronym: ESB                      # optional
aliases: [Integration Bus]        # optional
tags: [integration, middleware]   # optional, lowercase kebab-case
relations:                        # optional, each list optional
  in: [EAI, SOA]                  # <
  contains: []                    # >
  near: [API Gateway]             # &
  same: [Integration Bus]         # =
  not: [ETL]                      # ≠
created: 2026-09-26               # required
updated: 2026-09-26               # required
---
(fiche body in Markdown, without the "Buzzwords :" line: relations come from the frontmatter)
```

## Acceptance criteria

- [ ] AC1: The system shall generate a home page listing every fiche in `buzzwords/*.md`, sorted alphabetically by `term`, each showing its acronym when present and linking to its fiche page.
- [ ] AC2: The system shall generate one page per fiche, at `/<slug>/`, rendering its Markdown body and its relations grouped by operator (`<`, `>`, `&`, `=`, `≠`).
- [ ] AC3: When a relation matches the `term`, `acronym` or an `alias` of another fiche (case-insensitive), the system shall render it as a link to that fiche; otherwise it shall render it as plain text marked "pas encore de fiche".
- [ ] AC4: If a fiche lacks `term`, `slug`, `created` or `updated`, or its `slug` differs from its file name, then the build shall fail with an error naming the file.
- [ ] AC5: When a commit is pushed to `main`, the system shall build the site and deploy it to GitHub Pages.

## Out of scope

- Search and tag filtering (SPEC-002).
- Editing fiches from the site: the repo is the only place they change.
- Relation graph visualization.
- Any database or server: the site is fully static.

## Open questions

_None._

## Decisions

- Public hosting accepted (2026-09-26): the catalog is published on GitHub Pages at `basile-de-sousa.github.io/buzzwords`, publicly reachable.

## Plan

- [x] Load and validate fiches: parse frontmatter and body of `buzzwords/*.md`, fail on missing required fields or slug/file-name mismatch (AC4); expose the sorted fiche list for SPEC-002.
- [x] Render pages: home page sorted by term with acronyms (AC1), one page per fiche with Markdown body and relation groups (AC2), relation resolution against term/acronym/aliases (AC3), relative links, French copy, shared stylesheet.
- [x] CLI entry: `npm run build` reads `buzzwords/` and writes `_site/`, exits non-zero on error (AC4).
- [ ] Deploy: GitHub Actions workflow building and deploying to Pages on push to `main`, plus CI on pull requests (AC5).
- [ ] ADRs for the build stack and the Pages deployment source.
