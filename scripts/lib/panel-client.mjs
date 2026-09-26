// Fiche side panel for the home page (SPEC-005). Shipped as-is to the site as
// `panel.js` and imported by the tests in Node. `search.js` stays free of any
// network request (SPEC-002 AC5 asserts that directly), so this lives in its
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

/**
 * Wire the home page: intercept clicks on fiche links, show the fetched fiche
 * in a side panel and keep the URL and browser history in sync.
 * @param {Window} window
 * @param {{ fetchImpl?: typeof fetch }} [options]
 */
export function init(window, { fetchImpl = window.fetch?.bind(window) } = {}) {
  const { document, history } = window;
  const list = document.querySelector('.fiche-list');
  const panel = document.getElementById('fiche-panel');
  const content = panel?.querySelector('.panel-content');
  const closeBtn = panel?.querySelector('.panel-close');
  const expandLink = panel?.querySelector('.panel-expand');
  if (!list || !panel || !content || !closeBtn || !expandLink || !fetchImpl) return;

  const homePath = window.location.pathname;
  const cache = new Map(); // slug -> article HTML
  let opener = null;

  function pathOf(href) {
    return new URL(href, window.location.href).pathname;
  }

  async function fetchArticle(href) {
    const res = await fetchImpl(href);
    if (!res.ok) throw new Error(`fiche fetch failed: ${res.status}`);
    const article = extractFicheArticle(await res.text());
    if (!article) throw new Error('fiche fetch: no <article class="fiche">');
    return article;
  }

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
}

if (typeof window !== 'undefined' && typeof document !== 'undefined' && document.getElementById('fiche-panel')) {
  init(window);
}
