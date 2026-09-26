---
status: in-progress
depends: SPEC-001
---
# SPEC-004: Random buzzword notifications

## Why

The goal is to learn buzzwords passively, from the phone's lock screen (Google Pixel 9). Lock-screen widget support varies by Android version and vendor, while notifications show on every Android lock screen. A scheduled GitHub Actions workflow that picks a random fiche and pushes it through ntfy (free service, Android app) needs no app to build, no server and no change to the site or the `/buzzword` skill.

## Acceptance criteria

- [ ] AC1: When the scheduled workflow runs at 08:00, 13:00 or 19:00 Europe/Paris local time (daylight saving time included), the system shall send exactly one notification to the ntfy topic stored in the `NTFY_TOPIC` repository secret; at any other local time it shall send nothing.
- [ ] AC2: The system shall pick the fiche uniformly at random among `buzzwords/*.md`.
- [ ] AC3: The system shall use the fiche's term, followed by its acronym in parentheses when present, as the notification title, and the first explanation bullet of its body, as plain text without Markdown, as the notification message.
- [ ] AC4: When the notification is tapped, the system shall open the fiche's page on the published site.
- [ ] AC5: If `NTFY_TOPIC` is missing or ntfy rejects the request, then the workflow shall fail with an error naming the cause; if `buzzwords/` holds no fiche, then it shall end successfully without sending.

## Out of scope

- Exact delivery minute: GitHub scheduled runs can start several minutes late.
- Avoiding repeats or spaced-repetition logic.
- Lock-screen widgets and any native Android app.
- Changes to the site or to the `/buzzword` skill.

## Open questions

_None._

## Decisions

- Schedule 08:00, 13:00, 19:00 Europe/Paris; notification shows term plus short definition (user, 2026-09-26).

## Setup (user, once)

1. Install ntfy on the phone and subscribe to a hard-to-guess topic name (the name acts as the password).
2. Add that name as the `NTFY_TOPIC` secret in the repository settings (Secrets and variables → Actions).

## Plan
