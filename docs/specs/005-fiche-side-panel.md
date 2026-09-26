---
status: ready
depends: SPEC-001, SPEC-002
---
# SPEC-005: Fiche side panel on the home page

## Why

Every click on a buzzword in the home list currently leaves the list behind (SPEC-001 AC1: a plain link to `/<slug>/`). Right before an interview, someone skimming several terms in a row loses their place and has to hit back and re-scroll (or re-type the search/tag filter from SPEC-002) after every fiche. Opening the fiche in a side panel over the still-visible list — with the URL updated so the panel is shareable and reachable with the back button — keeps browsing fast without giving up deep links or the no-JS fallback the site already relies on.

## Acceptance criteria

- [ ] AC1: When JavaScript is available and the user clicks a buzzword link in the home list, the system shall prevent the default navigation, open a side panel over the home page showing that fiche, and push the fiche's URL (`/<slug>/`) onto browser history without a full page reload.
- [ ] AC2: The system shall render the panel's fiche content (body, relations, "Cité par", dates) identical to the fiche's own full page, by reusing its already-built markup rather than duplicating it in the home page.
- [ ] AC3: The panel shall include a close control (a button, and the Escape key) that removes the panel, restores the home URL (`/`), and returns focus to the link that opened it, without a full page reload.
- [ ] AC4: The panel shall include an "expand" control that is a real navigation link to the fiche's full page (`/<slug>/`).
- [ ] AC5: When the user activates the browser's back or forward button and the resulting URL is the home path or a fiche already opened earlier this session, the system shall open or close the panel to match, without a full page reload.
- [ ] AC6: While the viewport is at or below the mobile breakpoint, the panel shall occupy the full screen, hiding the underlying home list until it is closed.
- [ ] AC7: If a fiche page is reached without the JS-enhanced home shell already active (JavaScript unavailable, or a direct or shared load of `/<slug>/`), then the system shall render only the plain full fiche page, with no panel and no home list — unchanged from current behavior.

## Out of scope

- Reproducing the panel-over-home experience on a fresh/shared load of `/<slug>/`: that URL keeps serving the plain full fiche page (AC7); confirmed with the user during exploration.
- Chaining panel-to-panel navigation: relation and backlink links rendered inside the panel (or on the full fiche page) navigate normally to the full page, they do not open a nested panel.
- Any change to the search/tag filter (SPEC-002) or to backlink computation (SPEC-003): the panel only displays content those already produce.
- Panel transition animation, beyond what's needed for AC6's mobile layout.
- Editing or acting on a fiche from the panel.

## Open questions

_None._

## Plan

<!-- filled by /spec run -->
