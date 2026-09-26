# ADR-001: Minimal Node build script with js-yaml and marked
Status: proposed - Date: 2026-09-26

## Context

SPEC-001 needs a static site generated from `buzzwords/*.md` (YAML frontmatter + Markdown body), with build-time validation that fails on bad fiches, relative links that work under the GitHub Pages project path `/buzzwords/`, and a structure SPEC-002 can extend with a build-time search index and client-side filtering. The site has two page types and no theme needs.

## Decision

Build the site with a small ESM script, `scripts/build.mjs` (Node 22), which exports `build({ srcDir, outDir })` and runs as `npm run build`. Loading and validation live in `scripts/lib/fiches.mjs` (`loadFiches` returns the parsed, sorted fiche list), HTML templates in `scripts/lib/render.mjs` (template literals, one shared `style.css`). Two runtime dependencies only: `js-yaml` for frontmatter and `marked` for Markdown. Tests use the built-in `node:test` runner, so no test framework dependency.

## Alternatives rejected (and why)

- Jekyll (GitHub Pages default): Ruby toolchain, and custom validation (fail on missing field or slug mismatch) and relation resolution would need plugins that GitHub's built-in Jekyll does not allow.
- Eleventy, Astro, Hugo: capable but heavy for two templates; more dependencies and configuration to maintain than the code they would replace.
- `gray-matter` instead of hand-splitting frontmatter: one more dependency (pulling an older js-yaml) for a ten-line regex.

## Consequences

- Full control over validation and output; the whole generator is a few hundred lines to read.
- Templates, escaping and styling are hand-written: any new page type is code, not configuration.
- Two dependencies to keep updated (Dependabot or occasional `npm update`).
- SPEC-002 can reuse `loadFiches` to emit a search index JSON next to the pages.
