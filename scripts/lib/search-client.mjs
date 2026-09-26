// Client-side search and tag filter for the home page (SPEC-002).
// Shipped as-is to the site as `search.js` (an ES module with no imports) and
// imported by the tests in Node. The index is embedded in the page at build
// time, so filtering never makes a network request.

/** Lower-case, accent-free, whitespace-collapsed form used for matching. */
export function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

const haystacks = new WeakMap();

function haystack(entry) {
  if (!haystacks.has(entry)) {
    const fields = [entry.term, entry.acronym, ...(entry.aliases ?? []), entry.text];
    haystacks.set(entry, fields.filter(Boolean).map(normalize));
  }
  return haystacks.get(entry);
}

/**
 * Entries matching both the query (substring of term, acronym, an alias or the
 * body text, ignoring case and accents) and the tag. An empty query or no tag
 * does not filter.
 * @param {object[]} index entries `{ slug, term, acronym, aliases, tags, text }`
 * @param {{ query?: string, tag?: string | null }} filter
 */
export function filterFiches(index, { query = '', tag = null } = {}) {
  const q = normalize(query);
  return index.filter(
    (entry) => (!tag || (entry.tags ?? []).includes(tag)) && (!q || haystack(entry).some((field) => field.includes(q))),
  );
}

/** Next active tag when `tag` is selected: selecting the active tag clears it. */
export function toggleTag(current, tag) {
  return current === tag ? null : tag;
}

/**
 * Wire the home page: read the embedded index, reveal the search controls and
 * filter the list on every input or tag selection.
 * @param {Document} document
 */
export function init(document) {
  const root = document.getElementById('search');
  const input = document.getElementById('search-input');
  const list = document.querySelector('.fiche-list');
  const noMatch = document.getElementById('no-match');
  const data = document.getElementById('search-index');
  if (!root || !input || !list || !data) return;

  let index;
  try {
    index = JSON.parse(data.textContent);
  } catch {
    return; // keep the plain list
  }
  const items = new Map([...list.querySelectorAll('li[data-slug]')].map((li) => [li.dataset.slug, li]));
  const buttons = [...root.querySelectorAll('button[data-tag]')];
  let activeTag = null;

  function update() {
    const shown = new Set(filterFiches(index, { query: input.value, tag: activeTag }).map((e) => e.slug));
    for (const [slug, li] of items) li.hidden = !shown.has(slug);
    const none = shown.size === 0;
    list.hidden = none;
    if (noMatch) noMatch.hidden = !none;
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.tag === activeTag));
    }
  }

  input.addEventListener('input', update);
  for (const button of buttons) {
    button.addEventListener('click', () => {
      activeTag = toggleTag(activeTag, button.dataset.tag);
      update();
    });
  }
  root.hidden = false;
  update();
}

if (typeof document !== 'undefined' && document.getElementById('search-index')) {
  init(document);
}
