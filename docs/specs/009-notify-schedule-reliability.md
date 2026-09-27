---
status: draft
depends: SPEC-008
---
# SPEC-009: Reliable notification delivery at the scheduled time

## Why

Since SPEC-008 merged, `.github/workflows/notify.yml`'s `schedule` trigger has not fired on its own: the GitHub API reports 0 runs ever from a `schedule` event, across roughly 4h45m of the earlier hourly cron and the time since on the current 5-minute cron. A target set for `04:05` Europe/Paris on 2026-09-27 produced no notification. A manual `workflow_dispatch` run on the same commit completed successfully and evaluated the local time correctly, so the job itself (config parsing, `NTFY_TOPIC` secret, ntfy request) is not at fault — only the automatic trigger is suspect.

GitHub's own documentation acknowledges `schedule` events can be delayed or dropped during periods of high load, more so than `push`-triggered workflows (`CI` and `Deploy site to GitHub Pages` in this repo fire reliably on every push). Whether that's the actual cause here, versus something specific to this repository, is not yet established.

## Acceptance criteria

- [ ] AC1: The scheduled workflow shall fire automatically, without manual intervention, at each local time listed in `notify.config.json`'s `targets` (extends the manual post-merge checks already called for by SPEC-004 AC1, SPEC-007 AC6 and SPEC-008 AC3, which have not yet been observed to pass).

## Out of scope

- Any change to `scripts/notify.mjs`'s logic — already confirmed correct via manual dispatch.
- Redesigning the notification mechanism away from ntfy.

## Open questions

- Is the non-firing schedule a transient GitHub platform issue (delay/congestion, self-resolving) or a persistent problem with this repository's Actions configuration? Needs more observation time before concluding either way.
- If it turns out to be a persistent GitHub-side limitation: is an external nudge (e.g., a free third-party cron service calling the GitHub API's `workflow_dispatch` endpoint on a schedule) an acceptable workaround, given it would need a repo-scoped token stored as a secret on that third-party service?

## Decisions

_None yet — holding open pending further observation (user, 2026-09-27)._
