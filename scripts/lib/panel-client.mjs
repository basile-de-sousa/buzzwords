// Fiche side panel for the home page (SPEC-005, SPEC-006). Shipped as-is to the
// site as `panel.js` and imported by the tests in Node. `search.js` stays free of
// any network request (SPEC-002 AC5 asserts that directly), so this lives in its
// own module, loaded only on the home page alongside it.

/** The `<article class="fiche">…</article>` of a fetched fiche page, or null if not found. */
export function extractFicheArticle(html) {
  const match = /<article class="fiche">[\s\S]*<\/article>/.exec(html);
  return match ? match[0] : null;
}

/**
 * The slug for a page path under the home page, or null for the home path itself
 * or a path outside it. `homePath` is the home page's own path (with or without
 * a trailing slash), so this works whether the site is served at `/` or under a
 * GitHub Pages project path such as `/buzzwords/`.
 */
export function slugFromPath(pathname, homePath) {
  const home = homePath.endsWith('/') ? homePath : `${homePath}/`;
  if (!pathname.startsWith(home)) return null;
  const rest = pathname.slice(home.length).replace(/\/+$/, '');
  return rest || null;
}

export const MIN_PANEL_WIDTH = 280; // px
export const DEFAULT_PANEL_WIDTH = 448; // px, 28rem at the default root font size
const MAX_PANEL_WIDTH_ABS = 720; // px
const MAX_PANEL_WIDTH_RATIO = 0.8; // of the viewport
const RESIZE_STEP = 24; // px per keyboard arrow press
const STORAGE_KEY = 'buzzwords:panel-width';

/** The largest width the panel may take in a viewport of `viewportWidth`. */
export function maxPanelWidth(viewportWidth) {
  return Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH_ABS, viewportWidth * MAX_PANEL_WIDTH_RATIO));
}

/** `width` constrained to [`MIN_PANEL_WIDTH`, `maxPanelWidth(viewportWidth)`], rounded to a whole pixel. */
export function clampPanelWidth(width, viewportWidth) {
  return Math.min(maxPanelWidth(viewportWidth), Math.max(MIN_PANEL_WIDTH, Math.round(width)));
}

/** The width stored by an earlier session, or null if there is none (or it can't be read). */
export function readStoredWidth(storage) {
  try {
    const value = Number(storage.getItem(STORAGE_KEY));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

/**
 * Wire the home page: intercept clicks on fiche links, show the fetched fiche in a
 * side panel that pushes the list aside (desktop) or covers it (mobile, unchanged
 * from SPEC-005), keep the URL and browser history in sync, and let the panel's
 * width be dragged or keyboard-resized and remembered across sessions.
 * @param {Window} window
 * @param {{ fetchImpl?: typeof fetch, storage?: Storage }} [options]
 */
export function init(window, { fetchImpl = window.fetch?.bind(window), storage = window.localStorage } = {}) {
  const { document, history } = window;
  const list = document.querySelector('.fiche-list');
  const panel = document.getElementById('fiche-panel');
  const handle = panel?.querySelector('.panel-handle');
  const content = panel?.querySelector('.panel-content');
  const closeBtn = panel?.querySelector('.panel-close');
  const expandLink = panel?.querySelector('.panel-expand');
  if (!list || !panel || !handle || !content || !closeBtn || !expandLink || !fetchImpl) return;

  const homePath = window.location.pathname;
  const cache = new Map(); // slug -> article HTML
  let opener = null;

  function pathOf(href) {
    return new URL(href, window.location.href).pathname;
  }

  // The width is a CSS custom property on the root element: `.fiche-panel` reads it
  // for its own width, and `body.panel-open` reads it to push the list aside (AC1,
  // AC4), so setting it here keeps both in sync from a single value.
  function setWidth(width) {
    const clamped = clampPanelWidth(width, window.innerWidth);
    document.documentElement.style.setProperty('--panel-width', `${clamped}px`);
    handle.setAttribute('aria-valuemin', String(MIN_PANEL_WIDTH));
    handle.setAttribute('aria-valuemax', String(Math.round(maxPanelWidth(window.innerWidth))));
    handle.setAttribute('aria-valuenow', String(clamped));
    return clamped;
  }

  function persistWidth(width) {
    try {
      storage.setItem(STORAGE_KEY, String(width));
    } catch {
      // No storage available (private browsing, quota): the width just won't persist.
    }
  }

  setWidth(readStoredWidth(storage) ?? DEFAULT_PANEL_WIDTH);

  function show(slug, href, article) {
    content.innerHTML = article;
    expandLink.href = href;
    expandLink.hidden = false;
    panel.hidden = false;
    document.body.classList.add('panel-open');
    content.focus();
  }

  function hide() {
    if (panel.hidden) return;
    panel.hidden = true;
    document.body.classList.remove('panel-open');
    if (opener) {
      opener.focus();
      opener = null;
    }
  }

  async function fetchArticle(href) {
    const res = await fetchImpl(href);
    if (!res.ok) throw new Error(`fiche fetch failed: ${res.status}`);
    const article = extractFicheArticle(await res.text());
    if (!article) throw new Error('fiche fetch: no <article class="fiche">');
    return article;
  }

  async function open(slug, href) {
    let article = cache.get(slug);
    if (!article) {
      try {
        article = await fetchArticle(href);
      } catch {
        window.location.href = href; // no panel content: fall back to a real navigation
        return;
      }
      cache.set(slug, article);
    }
    history.pushState({ panelSlug: slug }, '', href);
    show(slug, href, article);
  }

  function close() {
    // A fresh pushState rather than history.back(): back()'s URL update is not
    // guaranteed synchronous (or even implemented) across environments, and every
    // panel is opened from the home path, so "close" and "go to the home path" agree.
    history.pushState(null, '', homePath);
    hide();
  }

  list.addEventListener('click', (event) => {
    const a = event.target.closest('a[href]');
    if (!a || !list.contains(a) || event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const slug = slugFromPath(pathOf(a.href), homePath);
    if (!slug) return;
    event.preventDefault();
    opener = a;
    open(slug, a.href);
  });

  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) close();
  });

  window.addEventListener('popstate', () => {
    const slug = slugFromPath(window.location.pathname, homePath);
    if (slug && cache.has(slug)) show(slug, window.location.pathname, cache.get(slug));
    else hide();
  });

  // Drag-resize (AC4): the handle sits on the panel's left edge, so moving the
  // pointer left widens the panel by exactly that many pixels.
  let dragStartX = 0;
  let dragStartWidth = DEFAULT_PANEL_WIDTH;

  function onPointerMove(event) {
    setWidth(dragStartWidth + (dragStartX - event.clientX));
  }
  function onPointerUp() {
    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('mouseup', onPointerUp);
    persistWidth(parseInt(document.documentElement.style.getPropertyValue('--panel-width'), 10));
  }
  handle.addEventListener('mousedown', (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    dragStartX = event.clientX;
    dragStartWidth = parseInt(document.documentElement.style.getPropertyValue('--panel-width'), 10) || DEFAULT_PANEL_WIDTH;
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
  });

  // Keyboard resize (AC6): Left widens, Right narrows, same as dragging the handle left/right.
  handle.addEventListener('keydown', (event) => {
    const current = parseInt(document.documentElement.style.getPropertyValue('--panel-width'), 10) || DEFAULT_PANEL_WIDTH;
    if (event.key === 'ArrowLeft') persistWidth(setWidth(current + RESIZE_STEP));
    else if (event.key === 'ArrowRight') persistWidth(setWidth(current - RESIZE_STEP));
    else return;
    event.preventDefault();
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined' && document.getElementById('fiche-panel')) {
  init(window);
}
