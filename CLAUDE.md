# Project rules

Project: a personal glossary of IT strategy and enterprise-architecture buzzwords. The `/buzzword` skill saves each fiche to `buzzwords/<slug>.md`, and a static site on GitHub Pages lists them all (user-facing copy in French).

## Commands

- Install: `npm ci` (Node 22+)
- Test: `npm test` (built-in `node:test` runner, files `test/**/*.test.mjs`)
- Build: `npm run build` (reads `buzzwords/*.md`, writes the static site to `_site/`)

## Rules

- All code, comments, commits and docs in English (user-facing copy follows the product's language).
- Code never goes directly to the default branch (or the branch named here): use a `feat/…` or `fix/…` branch and a pull request with passing checks. Docs (`docs/**`, this file) and buzzword fiches (`buzzwords/**`, written by the `/buzzword` skill) may be committed straight to it.
- Trivial change (typo, small obvious bug): no spec, just a `fix/…` branch and a pull request.
- A request that is not a bug fix or a trivial change starts as `/spec new` (explore, then draft spec). No code until a spec is `ready`.
- Conventional Commits, with the spec reference when there is one: `feat(auth): lock account after 5 failures (SPEC-012)`.
- Run the commands above before each commit that touches code. Never weaken a test to make it pass unless the spec changed.
- If a spec, an ADR and the code disagree, stop and report it. Do not resolve it silently.
- Specs and ADRs live in `docs/` and follow the `/spec` skill (formats and workflow).
- If the session-start board lists drafts or proposed ADRs, mention them in one line in your first reply.
