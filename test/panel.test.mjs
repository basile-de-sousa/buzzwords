// Acceptance tests for SPEC-005 (fiche side panel on the home page).
// The routing/DOM logic is a pure-ish module (`scripts/lib/panel-client.mjs`) shipped
// to the site as `panel.js`; UI behaviors are checked with jsdom against the built site.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

import { build } from '../scripts/build.mjs';
import { extractFicheArticle, slugFromPath, init } from '../scripts/lib/panel-client.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = join(here, 'fixtures', 'search'); // reuse SPEC-002's fixtures: 4 fiches, no relations needed here
const ALL = ['api-gateway', 'enterprise-service-bus', 'event-driven-architecture', 'schema-directeur'];

async function buildSite(t) {
  const outDir = mkdtempSync(join(tmpdir(), 'buzzwords-panel-'));
  t.after(() => rmSync(outDir, { recursive: true, force: true }));
  await build({ srcDir, outDir });
  return outDir;
}

function readOut(outDir, ...parts) {
  const path = join(outDir, ...parts);
  assert.ok(existsSync(path), `expected output file ${path} to exist`);
  return readFileSync(path, 'utf8');
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

// A `fetch` backed by the files this build actually produced, with a call count per slug.
function makeFetch(outDir) {
  const calls = new Map();
  const fetchImpl = async (href) => {
    const slug = new URL(href, 'https://example.com/').pathname.replace(/^\/|\/$/g, '');
    calls.set(slug, (calls.get(slug) ?? 0) + 1);
    const path = join(outDir, slug, 'index.html');
    if (!existsSync(path)) return { ok: false, status: 404, text: async () => '' };
    return { ok: true, status: 200, text: async () => readFileSync(path, 'utf8') };
  };
  return { fetchImpl, calls };
}

// Built home page loaded in jsdom at the site root, with the panel script wired to its document.
async function homePage(t, { fetchImpl } = {}) {
  const outDir = await buildSite(t);
  const fetchMock = fetchImpl ? { fetchImpl, calls: new Map() } : makeFetch(outDir);
  const dom = new JSDOM(readOut(outDir, 'index.html'), { url: 'https://example.com/' });
  t.after(() => dom.window.close());
  const { document, window } = dom.window;
  init(window, { fetchImpl: fetchMock.fetchImpl });

  const panel = document.getElementById('fiche-panel');
  const content = panel?.querySelector('.panel-content');
  const closeBtn = panel?.querySelector('.panel-close');
  const expandLink = panel?.querySelector('.panel-expand');

  const linkFor = (slug) => document.querySelector(`.fiche-list li[data-slug="${slug}"] a`);
  const click = async (slug) => {
    const link = linkFor(slug);
    assert.ok(link, `link for "${slug}" exists`);
    const event = new window.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    link.dispatchEvent(event);
    await flush();
    return { link, event };
  };

  return { dom, window, document, outDir, panel, content, closeBtn, expandLink, linkFor, click, calls: fetchMock.calls };
}

test('extractFicheArticle: pulls the <article class="fiche"> element out of a fetched page', () => {
  const html = `<main><p class="back"><a href="../">back</a></p>
<article class="fiche">
<h1>Event-Driven Architecture</h1>
<div class="body"><p>Hi</p></div>
</article>
</main>`;
  const article = extractFicheArticle(html);
  assert.match(article, /^<article class="fiche">/);
  assert.match(article, /<h1>Event-Driven Architecture<\/h1>/);
  assert.doesNotMatch(article, /class="back"/, 'the back link, outside the article, is not included');

  assert.equal(extractFicheArticle('<main><p>no article here</p></main>'), null);
});

test('slugFromPath: the slug under the home path, or null for the home path itself', () => {
  assert.equal(slugFromPath('/api-gateway/', '/'), 'api-gateway');
  assert.equal(slugFromPath('/', '/'), null, 'home path itself has no slug');
  assert.equal(slugFromPath('/buzzwords/api-gateway/', '/buzzwords/'), 'api-gateway', 'under a project path');
  assert.equal(slugFromPath('/buzzwords/api-gateway/', '/buzzwords'), 'api-gateway', 'home path without a trailing slash');
  assert.equal(slugFromPath('/buzzwords/', '/buzzwords/'), null);
  assert.equal(slugFromPath('/elsewhere/', '/buzzwords/'), null, 'outside the home path');
});

test('SPEC-005 AC1: clicking a fiche link opens the panel and pushes the fiche URL, without a full reload', async (t) => {
  const page = await homePage(t);
  assert.equal(page.panel.hidden, true, 'panel starts closed');

  const { event } = await page.click('event-driven-architecture');
  assert.equal(event.defaultPrevented, true, 'default navigation was prevented');
  assert.equal(page.panel.hidden, false, 'panel is open');
  assert.equal(page.window.location.pathname, '/event-driven-architecture/', 'URL pushed to the fiche path');
  assert.match(page.content.textContent, /Event-Driven Architecture/, 'panel shows the fiche');
});

test('SPEC-005 AC2: the panel content is the fiche’s own full-page markup, not a duplicate', async (t) => {
  const page = await homePage(t);
  await page.click('enterprise-service-bus');

  const fullPage = readOut(page.outDir, 'enterprise-service-bus', 'index.html');
  const article = extractFicheArticle(fullPage);
  assert.ok(article, 'the fiche page has an <article class="fiche">');

  // Compare through the DOM on both sides: a raw-string comparison would fail on
  // harmless entity-encoding differences (e.g. `&#39;`) that parsing normalizes away.
  const reference = new JSDOM(`<div>${article}</div>`);
  t.after(() => reference.window.close());
  assert.equal(page.content.innerHTML.trim(), reference.window.document.body.firstElementChild.innerHTML.trim());
});

test('SPEC-005 AC3: the close control and Escape close the panel, restore the home URL and return focus', async (t) => {
  const page = await homePage(t);
  const { link } = await page.click('api-gateway');

  page.closeBtn.click();
  assert.equal(page.panel.hidden, true, 'close button closes the panel');
  assert.equal(page.window.location.pathname, '/', 'URL restored to the home path');
  assert.equal(page.document.activeElement, link, 'focus returned to the link that opened the panel');

  await page.click('api-gateway');
  page.document.dispatchEvent(new page.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(page.panel.hidden, true, 'Escape closes the panel');
  assert.equal(page.window.location.pathname, '/');
});

test('SPEC-005: clicking the backdrop outside the panel card closes it (Notion-style peek)', async (t) => {
  const page = await homePage(t);
  await page.click('api-gateway');

  // A click that lands on the card itself (not the backdrop) does not close the panel.
  page.panel.querySelector('.panel-card').dispatchEvent(new page.window.MouseEvent('click', { bubbles: true }));
  assert.equal(page.panel.hidden, false, 'clicking inside the card leaves the panel open');

  page.panel.dispatchEvent(new page.window.MouseEvent('click', { bubbles: true }));
  assert.equal(page.panel.hidden, true, 'clicking the backdrop closes the panel');
  assert.equal(page.window.location.pathname, '/');
});

test('SPEC-005 AC4: the expand control is a real link to the full fiche page, not intercepted', async (t) => {
  const page = await homePage(t);
  await page.click('schema-directeur');

  assert.equal(page.expandLink.hidden, false);
  assert.equal(new URL(page.expandLink.href).pathname, '/schema-directeur/');

  const event = new page.window.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
  page.expandLink.dispatchEvent(event);
  assert.equal(event.defaultPrevented, false, 'no handler intercepts the expand link: it navigates like a normal <a>');
});

test('SPEC-005 AC5: the browser back/forward buttons open or close the panel to match the URL', async (t) => {
  const page = await homePage(t);
  await page.click('api-gateway');
  assert.equal(page.calls.get('api-gateway'), 1);

  // Simulate the browser navigating back to the home path (no fetch is involved in a real back-navigation).
  page.dom.reconfigure({ url: 'https://example.com/' });
  page.window.dispatchEvent(new page.window.Event('popstate'));
  assert.equal(page.panel.hidden, true, 'back to the home path closes the panel');

  // And forward again, back to the fiche: reopens from cache, no re-fetch.
  page.dom.reconfigure({ url: 'https://example.com/api-gateway/' });
  page.window.dispatchEvent(new page.window.Event('popstate'));
  assert.equal(page.panel.hidden, false, 'forward to the fiche path reopens the panel');
  assert.match(page.content.textContent, /API Gateway/i);
  assert.equal(page.calls.get('api-gateway'), 1, 'the cached fiche is not re-fetched');
});

test('SPEC-005 AC6: the stylesheet gives the panel the full screen at the mobile breakpoint', async (t) => {
  const outDir = await buildSite(t);
  const css = readOut(outDir, 'style.css');
  const media = css.match(/@media[^{]*\{[\s\S]*?\.panel-card[\s\S]*?\}\s*\}/);
  assert.ok(media, 'style.css has a mobile media query sizing .panel-card to the full screen');
  assert.match(media[0], /width:\s*100%/);
  // Manual check (visual, not covered by this test): resize a browser below the
  // breakpoint with the panel open and confirm it covers the screen edge to edge.
});

test('SPEC-005 AC7: without the JS-enhanced home shell, a fiche URL renders only the plain full fiche page', async (t) => {
  const outDir = await buildSite(t);
  const fichePage = readOut(outDir, 'api-gateway', 'index.html');
  assert.doesNotMatch(fichePage, /fiche-panel/, 'the fiche page itself has no panel markup');
  assert.doesNotMatch(fichePage, /panel\.js/, 'the fiche page does not load the panel script');

  // Home page before panel.js runs: the list is still plain links, unaffected by the panel markup.
  const dom = new JSDOM(readOut(outDir, 'index.html'), { url: 'https://example.com/' });
  t.after(() => dom.window.close());
  const { document } = dom.window;
  const panel = document.getElementById('fiche-panel');
  assert.equal(panel?.hidden, true, 'panel markup is present but hidden before any script runs');
  const link = document.querySelector('.fiche-list li[data-slug="api-gateway"] a');
  assert.equal(link.getAttribute('href'), './api-gateway/', 'the link is a plain, real href');
});

test('SPEC-005: fiches without JavaScript stay reachable (regression, SPEC-002)', async (t) => {
  const outDir = await buildSite(t);
  const dom = new JSDOM(readOut(outDir, 'index.html'));
  t.after(() => dom.window.close());
  const items = [...dom.window.document.querySelectorAll('.fiche-list li[data-slug]')];
  assert.deepEqual(items.map((li) => li.dataset.slug).sort(), ALL);
  assert.ok(items.every((li) => !li.hidden));
});
