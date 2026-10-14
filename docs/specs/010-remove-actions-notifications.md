---
status: done
supersedes: SPEC-004 (AC1), SPEC-007 (AC1, AC6), SPEC-008
---
# SPEC-010: Send a notification on every scheduled run

## Why

GitHub throttles the 5-minute cron (SPEC-008) to about 4-5 runs a day at unpredictable minutes, and `isNotificationTime` only sends on an exact `HH:MM` target, so almost no run sends anything (see SPEC-009 Decisions). The delivery times were only indicative: the user has no timing constraint. Dropping the time check and scheduling the workflow three times a day makes every run that GitHub starts send a notification, with no external service and no Claude usage. The Claude scheduled task used as a stopgap is deleted once this ships.

## Acceptance criteria

- [x] AC1: When the notify workflow runs, from its schedule or a manual `workflow_dispatch`, the system shall send the notification (`count` fiches, `bulletCount` bullets each, per SPEC-007) without checking the local time.
- [x] AC2: The notify workflow shall be scheduled three times a day, morning, midday and evening Europe/Paris (cron `0 6,11,17 * * *` UTC; exact time and daylight saving shifts are not guaranteed).
- [x] AC3: The system shall no longer read or validate a `targets` field; `notify.config.json` shall contain only `count` and `bulletCount`.
- [x] AC4: The notify workflow shall be enabled again (it was disabled on 2026-10-14).

## Out of scope

- Exact delivery time, and runs GitHub delays or skips under load.
- Any external cron service, server or Claude scheduled task.
- Changes to the message format, ntfy or the `/buzzword` skill.

## Open questions

_None._

## Decisions

- No timing constraint: times are indicative, GitHub Actions only, no external service (user, 2026-10-14).

## Plan

- [x] Acceptance tests in `test/notify-every-run.test.mjs` (AC1-AC3); superseded time-gate and `targets` tests removed from `test/notify.test.mjs`.
- [x] `scripts/notify.mjs`: drop `isNotificationTime`, `targets` and `timeZone`; `parseNotifyConfig` reads only `count` and `bulletCount`.
- [x] `.github/workflows/notify.yml`: cron `0 6,11,17 * * *` plus `workflow_dispatch`; `notify.config.json` reduced to `count` and `bulletCount`.
- [x] Re-enable the notify workflow through the GitHub API (AC4).
