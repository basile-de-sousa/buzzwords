---
status: done
depends: SPEC-007
supersedes: SPEC-007 (AC1, AC6)
---
# SPEC-008: Notification target minute precision

## Why

SPEC-007 restricted `targets` to on-the-hour values because the workflow only ran hourly. The user wants a target like `03:13`. GitHub Actions' scheduled trigger has a 5-minute minimum interval, so exact-minute targets aren't reachable, but 5-minute resolution is.

## Acceptance criteria

- [x] AC1: The system shall accept `targets` entries at 5-minute resolution (`HH:MM` where `MM` is a multiple of 5: `00`, `05`, `10`, ... `55`), superseding SPEC-007 AC1's `HH:00`-only restriction.
- [x] AC2: If a `targets` entry's minutes are not a multiple of 5, then the system shall reject it with an error naming the cause, before attempting any send (extends SPEC-007 AC4's validation; no rounding or coercion).
- [x] AC3: The scheduled GitHub Actions workflow shall run every 5 minutes, all year, so that changing `targets` in `notify.config.json` continues to take effect without editing the workflow file (supersedes SPEC-007 AC6's hourly schedule). (Infrastructure, no unit test: manual check in the PR, as for SPEC-004 AC1's cron.)

## Out of scope

- Sub-minute or exact-minute delivery: GitHub's scheduled runs can start several minutes late, independent of the trigger frequency (already out of scope per SPEC-004).
- Any change to `count`, `bulletCount`, or per-slot settings.

## Open questions

_None._

## Decisions

- 5-minute resolution chosen because it's GitHub Actions' minimum scheduled-trigger interval; finer isn't achievable regardless of config format (agent, technical constraint).
- Misaligned targets (not a multiple of 5) are rejected at config-parse time with a descriptive error, consistent with SPEC-007 AC4's existing validation style, rather than silently rounded or silently never firing (user, 2026-09-27).

## Plan

- [x] Acceptance tests: a 5-minute-aligned non-`:00` target parses (AC1); a non-5-minute-aligned target throws (AC2); updated the now-outdated SPEC-007 AC4 test that asserted `"08:30"` must throw (it's valid under AC1).
- [x] `scripts/notify.mjs`: `HOUR_ON_THE_HOUR` renamed `FIVE_MINUTE_ALIGNED`, regex widened from `:00` to any `:[0-5][05]`.
- [x] `.github/workflows/notify.yml`: cron moved from `0 * * * *` to `*/5 * * * *`.
- [ ] Manual check (documented in the PR, not unit tested): the workflow fires every 5 minutes and only sends at the configured local times, same class of check as SPEC-004 AC1 and SPEC-007 AC6.
