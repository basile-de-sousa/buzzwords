---
status: ready
depends: SPEC-004
supersedes: SPEC-004 (AC1, AC2)
---
# SPEC-007: Two notifications per scheduled run

## Why

One notification per scheduled slot (SPEC-004) works, but the user wants more exposure per slot: two different buzzwords pushed at the same time instead of one.

## Acceptance criteria

- [ ] AC1: When the scheduled workflow runs at a target local time (08:00, 13:00 or 19:00 Europe/Paris) and `buzzwords/` holds 2 or more fiches, the system shall send two notifications, each for a distinct fiche chosen uniformly at random without replacement.
- [ ] AC2: When the scheduled workflow runs at a target local time and `buzzwords/` holds exactly 1 fiche, the system shall send exactly one notification for it (no duplicate).
- [ ] AC3: Each notification shall follow SPEC-004 AC3-AC4's title/message/click-through format, computed independently per fiche.
- [ ] AC4: If `buzzwords/` holds no fiche or `NTFY_TOPIC` is missing, then the workflow shall behave as SPEC-004 AC5 (end successfully without sending / fail with an error naming the cause) before attempting any send.
- [ ] AC5: If ntfy rejects one of the two send requests, then the workflow shall fail with an error naming the cause, whether or not the other request already succeeded.

## Out of scope

- Avoiding repeats across different scheduled runs (only "distinct within the same run" is required).
- Configurable notification count (always 1 or 2, never more).

## Open questions

_None._

## Decisions

- Fewer than 2 fiches: fall back to sending 1 notification (0 fiches still sends nothing, per SPEC-004 AC5) (user, 2026-09-27).
- Two distinct random fiches per run, not the same fiche sent twice (user, 2026-09-27).
- Partial failure (one send OK, the other rejected by ntfy): the run still fails loudly (AC5), consistent with SPEC-004's fail-loud approach to ntfy errors.
