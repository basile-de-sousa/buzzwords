---
status: done
depends: SPEC-001, SPEC-002
---
# SPEC-005: Fiche side panel on the home page

## Why

Every click on a buzzword in the home list currently leaves the list behind (SPEC-001 AC1: a plain link to `/<slug>/`). Right before an interview, someone skimming several terms in a row loses their place and has to hit back and re-scroll (or re-type the search/tag filter from SPEC-002) after every fiche. Opening the fiche in a side panel over the still-visible list — with the URL updated so the panel is shareable and reachable with the back button — keeps browsing fast without giving up deep links or the no-JS fallback the site already relies on.

## Acceptance criteria

- [x] AC1: When JavaScript is available and the user clicks a buzzword link in the home list, the system shall prevent the default navigation, open a side panel over the home page showing that fiche, and push the fiche's URL (`/<slug>/`) onto browser history without a full page reload.
- [x] AC2: The system shall render the panel's fiche content (body, relations, "Cité par", dates) identical to the fiche's own full page, by reusing its already-built markup rather than duplicating it in the home page.
- [x] AC3: The panel shall include a close control (a button, and the Escape key) that removes the panel, restores the home URL (`/`), and returns focus to the link that opened it, without a full page reload.
- [x] AC4: The panel shall include an "expand" control that is a real navigation link to the fiche's full page (`/<slug>/`).
- [x] AC5: When the user activates the browser's back or forward button and the resulting URL is the home path or a fiche already opened earlier this session, the system shall open or close the panel to match, without a full page reload.
- [x] AC6: While the viewport is at or below the mobile breakpoint, the panel shall occupy the full screen, hiding the underlying home list until it is closed.
- [x] AC7: If a fiche page is reached without the JS-enhanced home shell already active (JavaScript unavailable, or a direct or shared load of `/<slug>/`), then the system shall render only the plain full fiche page, with no panel and no home list — unchanged from current behavior.

## Out of scope

- Reproducing the panel-over-home experience on a fresh/shared load of `/<slug>/`: that URL keeps serving the plain full fiche page (AC7); confirmed with the user during exploration.
- Chaining panel-to-panel navigation: relation and backlink links rendered inside the panel (or on the full fiche page) navigate normally to the full page, they do not open a nested panel.
- Any change to the search/tag filter (SPEC-002) or to backlink computation (SPEC-003): the panel only displays content those already produce.
- Panel transition animation, beyond what's needed for AC6's mobile layout.
- Editing or acting on a fiche from the panel.

## Open questions

_None._

## Plan

- [x] `scripts/lib/panel-client.mjs`: new pure-ish module (`extractFicheArticle`, `slugFromPath`, `init`) shipped as-is to `panel.js`, kept separate from `search.js` so SPEC-002 AC5's "no runtime request" assertion for search stays true. Click on a home-list link is intercepted, fetches the fiche's own already-built page, extracts its `<article class="fiche">` and shows it in the panel (AC1, AC2); on fetch failure it falls back to a real navigation. Close (button or Escape) pushes the home URL and hides the panel (AC3); the expand link is a plain `<a>` outside the intercepted list, so it is never prevented (AC4). A single `popstate` listener shows a cached fiche or hides the panel to match the URL, covering physical back/forward (AC5).
- [x] `scripts/lib/render.mjs`: hidden panel markup (`#fiche-panel`, `.panel-close`, `.panel-expand`, `.panel-content`) added to the home page alongside the search controls, plus a `<script type="module" src="./panel.js">`; panel CSS including a `max-width: 640px` media query giving the panel the full screen on mobile (AC6).
- [x] `scripts/build.mjs`: copy `panel-client.mjs` to `panel.js` next to `search.js`. No change to `renderFiche`, so the fiche page itself is untouched (AC7).
- [x] `test/panel.test.mjs`: one acceptance test per criterion against jsdom and the real build output (a mocked `fetch` reads the files the build actually produced, so AC2 is checked against real content, not a stub); plus unit tests for the two pure functions and a regression test that the no-JS fallback (SPEC-002) still holds.
- [x] `npm test` (43 passing) and `npm run build` both pass.

## Assumptions

- Mobile breakpoint set at `max-width: 640px` (no prior breakpoint existed in the stylesheet to match).
- Close/Escape push a fresh history entry to the home path rather than calling `history.back()`: back()'s URL update is not guaranteed synchronous, or even implemented, in every environment (confirmed missing in jsdom), and every panel is opened from the home path, so the two are equivalent in this app.
- The panel also toggles a `body.panel-open` class (`overflow: hidden`) so the mobile full-screen panel doesn't leave the home list scrollable underneath.
