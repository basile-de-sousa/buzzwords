---
status: draft
supersedes: SPEC-004 (AC1, AC4, AC5), SPEC-008
---
# SPEC-010: Remove the GitHub Actions notification pipeline

## Why

Random buzzword notifications are now sent by a Claude scheduled task ("Buzzword notifications", 07:53, 12:53 and 18:53 Europe/Paris), which pushes to the phone through the Claude app. The GitHub Actions pipeline (SPEC-004, SPEC-007, SPEC-008) never delivered reliably: GitHub throttles the 5-minute cron to a few random runs a day, so the exact-minute check almost never matched (see SPEC-009 Decisions). It was disabled on 2026-10-14. Keeping its code, tests and ntfy secret adds maintenance for a path nobody uses.

The scheduled task reads the fiches and `notify.config.json` (`count`, `bulletCount`) straight from this repo, so those stay the source of truth. Delivery times now live in the scheduled task, not in the repo.

## Acceptance criteria

- [ ] AC1: The repository shall no longer contain `.github/workflows/notify.yml`, `scripts/notify.mjs`, `test/notify.test.mjs` or `test/fixtures/notify/`.
- [ ] AC2: `notify.config.json` shall keep `count` and `bulletCount` and shall no longer contain `targets`.
- [ ] AC3: `npm test` and `npm run build` shall pass after the removal.
- [ ] AC4: `README.md` or `CLAUDE.md` shall state in one line that notifications come from the Claude scheduled task "Buzzword notifications" and that it reads `notify.config.json`.

## Out of scope

- The scheduled task itself (configured in Claude, not in this repo).
- Deleting the `NTFY_TOPIC` secret and the ntfy app on the phone (user, manual).
- Changes to the site or to the `/buzzword` skill.

## Open questions

_None._

## Plan
