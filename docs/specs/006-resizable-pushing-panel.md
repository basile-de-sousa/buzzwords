---
status: done
depends: SPEC-005
supersedes: SPEC-005 (AC1)
---
# SPEC-006: Push layout and resizable width for the fiche panel

## Why

SPEC-005's panel is a Notion-style peek: a dimmed backdrop with the panel floating over the home list. That overlap makes the list unreadable while the panel is open and gives no control over how much room the fiche gets versus the list. Pushing the list aside instead — and letting the width be dragged to taste — keeps both usable side by side and lets each user settle on a split that fits their screen.

## Acceptance criteria

- [x] AC1: When the panel opens above the mobile breakpoint, the system shall shrink the home list's width to make room for the panel so the two sit side by side, with no overlay and no dimmed backdrop over the list (supersedes SPEC-005 AC1's panel "over the home page").
- [x] AC2: When the panel closes, the system shall restore the home list to its full-width layout.
- [x] AC3: At or below the mobile breakpoint, the panel shall keep occupying the full screen over the list, unchanged from SPEC-005 AC6 — pushing does not apply since there is no room to push into.
- [x] AC4: The panel shall include a draggable handle on its left edge that resizes it by dragging, constrained between a minimum and a maximum width, with the home list reflowing live as it drags (no snap after release).
- [x] AC5: The system shall persist the panel's width in the browser (`localStorage`) and apply it the next time a panel opens, including on a later visit.
- [x] AC6: The handle shall also be operable from the keyboard (focusable, Left/Right arrow keys adjust the width by a step) with the current width exposed to assistive technology.

## Out of scope

- Dragging the handle to close the panel (closing stays button/Escape/backdrop-less — actually there is no backdrop once pushed; closing is the button or Escape only, per SPEC-005 AC3).
- Resizing on mobile: the mobile breakpoint keeps the full-screen panel from SPEC-005 AC6, unaffected by width or the handle.
- Remembering a different width per fiche, or per device/viewport size: one shared width preference.
- Touch/pointer resize gestures beyond mouse drag and keyboard (e.g. a mobile "resize" affordance): out of scope since mobile stays full screen.

## Open questions

_None._

## Plan

- [x] `scripts/lib/panel-client.mjs`: replaced the overlay/backdrop from the SPEC-005 fix with a `--panel-width` CSS custom property on the root element, read by both `.fiche-panel`'s own `width` and `body.panel-open`'s `padding-right` — one value drives the panel's size and how much room it makes (AC1, AC2). Added `MIN_PANEL_WIDTH`, `maxPanelWidth`, `clampPanelWidth` (pure, viewport-relative bounds) and `readStoredWidth`/`persistWidth` (`localStorage`, injectable as `storage` for tests) (AC5). `.panel-handle` wires mouse drag (`mousedown`/`mousemove`/`mouseup` on `window`, live `setWidth` on every move, AC4) and keyboard (`ArrowLeft`/`ArrowRight`, `role="separator"` with `aria-valuemin/max/now`, AC6). Removed the click-outside-to-close listener: there is no backdrop left to click.
- [x] `scripts/lib/render.mjs`: dropped `.panel-card`; `.fiche-panel` is a flush, right-docked, full-height sidebar again (border + shadow, no dimmed backdrop) sized by `var(--panel-width)`; added the `.panel-handle` element and its hover/focus style. Mobile media query (unchanged 640px breakpoint) forces the panel to full width, hides the handle, and zeroes `padding-right` so pushing doesn't apply where there's no room (AC3).
- [x] `test/panel.test.mjs`: removed the now-inapplicable "click backdrop to close" test from the SPEC-005 fix; added one test per new AC plus unit tests for `clampPanelWidth` and `readStoredWidth`. Drag is simulated with plain `mousedown`/`mousemove`/`mouseup` (no Pointer Events, matching the "mouse drag and keyboard only" scope call); persistence is checked by sharing one fake `Storage` object across two separate `homePage()` calls to stand in for "a later visit".
- [x] `npm test` (50 passing) and `npm run build` both pass.

## Assumptions

- Resize bounds: minimum 280px; maximum is `min(720px, 80% of the viewport width)` — no prior bounds existed to match, and both are easy to retune later (`MIN_PANEL_WIDTH` / the ratio and cap in `panel-client.mjs`).
- Keyboard resize step: 24px per arrow press.
- `localStorage` key: `buzzwords:panel-width`. If storage is unavailable (private browsing, quota), the width just doesn't persist — no error surfaces to the user.
- Dropped the drag-resize handle and the push padding entirely at the existing 640px mobile breakpoint (SPEC-005's), rather than defining a new one for "medium" widths: at any width above it, the list simply reflows to whatever room the chosen panel width leaves.
