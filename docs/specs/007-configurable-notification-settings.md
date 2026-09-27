---
status: done
depends: SPEC-004
supersedes: SPEC-004 (AC1, AC2, AC3)
---
# SPEC-007: Configurable notification settings

## Why

SPEC-004 hardcoded the schedule (08:00/13:00/19:00 Europe/Paris), one fiche per run, and one definition bullet per notification. The user wants to tune these without editing code: how many timeslots and which ones, how many distinct buzzwords per run, and how much of the definition (0 to all bullets) to show.

## Acceptance criteria

- [x] AC1: The system shall read notification settings from `notify.config.json` at the repo root: `timeZone`, `targets` (array of `HH:00` local times), `count` (number of distinct fiches per run), and `bulletCount` (number of definition bullets per notification: a non-negative integer, or `"all"`). When the file is absent, it shall use SPEC-004's original defaults (`Europe/Paris`; `08:00`, `13:00`, `19:00`; count 1; bulletCount 1). (`targets` format widened from `HH:00` to any 5-minute mark, superseded by SPEC-008)
- [x] AC2: When the scheduled workflow runs at one of the configured target local times, the system shall send `count` notifications, each for a distinct fiche chosen uniformly at random without replacement; if fewer than `count` fiches exist, it shall send one notification per available fiche instead (0 fiches: none, per SPEC-004 AC5).
- [x] AC3: Each notification's message shall contain the fiche's first `bulletCount` explanation bullets as plain text (blank line between bullets) when `bulletCount` >= 1, all bullets when `bulletCount` is `"all"`, and no message body when `bulletCount` is 0; title (SPEC-004 AC3) and click-through URL (SPEC-004 AC4) are unchanged and computed per fiche.
- [x] AC4: If `notify.config.json` exists but is not valid JSON, or has an invalid field (`count` not a positive integer, `bulletCount` neither a non-negative integer nor `"all"`, a `targets` entry not on the hour), then the workflow shall fail with an error naming the cause, before attempting any send.
- [x] AC5: If ntfy rejects any of the notifications sent in a run, then the workflow shall fail with an error naming the cause, whether or not other notifications in the same run already succeeded.
- [x] AC6: The scheduled GitHub Actions workflow shall run once every hour, all year, so that changing `targets` in `notify.config.json` takes effect without editing the workflow file. (Infrastructure, no unit test: manual check in the PR, as for SPEC-004 AC1's cron.) (schedule moved from hourly to every 5 minutes, superseded by SPEC-008)

## Out of scope

- Target times finer than the hour (e.g. `08:30`). (in scope as of SPEC-008)
- A different `count` or `bulletCount` per timeslot (one setting applies to every configured target).
- Any UI to edit the config; it's a plain JSON file edited and committed like any other data file in this repo.

## Open questions

_None._

## Decisions

- `bulletCount: 0` means title-only, no message body (user, 2026-09-27).
- `notify.config.json` lives at the repo root and is committed straight to `main`, like `buzzwords/**`/`docs/**` — no branch/PR needed to change settings (user, 2026-09-27).
- `count` is one fixed number for every timeslot, not configurable per slot (user, 2026-09-27).
- Missing config file falls back to SPEC-004's original defaults, so behavior is unchanged until the user creates the file (agent default, cheap to change).
- Fewer fiches than `count`: send one per available fiche rather than failing or skipping (generalizes SPEC-007's original two-notification fallback).
- The workflow's cron moves from 6 fixed UTC runs/day to hourly (still free on a public repo) so that `targets` changes never require touching `.github/workflows/notify.yml` again (confirmed, user, 2026-09-27).

## Setup (user, optional)

Create `notify.config.json` at the repo root and commit it straight to `main` to override any default, e.g.:

```json
{ "timeZone": "Europe/Paris", "targets": ["08:00", "13:00", "19:00"], "count": 2, "bulletCount": 1 }
```

Omit any field to keep its default. Deleting the file restores SPEC-004's original behavior.

## Plan

- [x] Acceptance tests for `parseNotifyConfig`, `pickRandomFiches`, `buildMessage`'s `bulletCount` and `notify`'s multi-send/fail-fast behavior, appended to `test/notify.test.mjs`.
- [x] `scripts/notify.mjs`: `parseNotifyConfig` (validates `notify.config.json`, defaults when absent), `pickRandomFiches` (distinct picks without replacement, capped), `getBullets`/`buildMessage(fiche, bulletCount)`, `notify(...)` sending one request per picked fiche and failing fast on any rejection, `main()` wired to the config file.
- [x] `.github/workflows/notify.yml`: cron moved from 6 fixed UTC runs/day to hourly.
- [ ] Manual check (documented in the PR, not unit tested): the workflow fires hourly and only sends at the configured local times, including after editing `notify.config.json` on `main` without touching the workflow file.
