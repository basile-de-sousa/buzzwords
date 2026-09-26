---
status: ready
depends: SPEC-005
supersedes: SPEC-005 (AC1)
---
# SPEC-006: Push layout and resizable width for the fiche panel

## Why

SPEC-005's panel is a Notion-style peek: a dimmed backdrop with the panel floating over the home list. That overlap makes the list unreadable while the panel is open and gives no control over how much room the fiche gets versus the list. Pushing the list aside instead — and letting the width be dragged to taste — keeps both usable side by side and lets each user settle on a split that fits their screen.

## Acceptance criteria

- [ ] AC1: When the panel opens above the mobile breakpoint, the system shall shrink the home list's width to make room for the panel so the two sit side by side, with no overlay and no dimmed backdrop over the list (supersedes SPEC-005 AC1's panel "over the home page").
- [ ] AC2: When the panel closes, the system shall restore the home list to its full-width layout.
- [ ] AC3: At or below the mobile breakpoint, the panel shall keep occupying the full screen over the list, unchanged from SPEC-005 AC6 — pushing does not apply since there is no room to push into.
- [ ] AC4: The panel shall include a draggable handle on its left edge that resizes it by dragging, constrained between a minimum and a maximum width, with the home list reflowing live as it drags (no snap after release).
- [ ] AC5: The system shall persist the panel's width in the browser (`localStorage`) and apply it the next time a panel opens, including on a later visit.
- [ ] AC6: The handle shall also be operable from the keyboard (focusable, Left/Right arrow keys adjust the width by a step) with the current width exposed to assistive technology.

## Out of scope

- Dragging the handle to close the panel (closing stays button/Escape/backdrop-less — actually there is no backdrop once pushed; closing is the button or Escape only, per SPEC-005 AC3).
- Resizing on mobile: the mobile breakpoint keeps the full-screen panel from SPEC-005 AC6, unaffected by width or the handle.
- Remembering a different width per fiche, or per device/viewport size: one shared width preference.
- Touch/pointer resize gestures beyond mouse drag and keyboard (e.g. a mobile "resize" affordance): out of scope since mobile stays full screen.

## Open questions

_None._

## Plan

<!-- filled by /spec run -->
