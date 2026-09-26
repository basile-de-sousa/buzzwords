// Acceptance tests for SPEC-002 (search and tag filter).
// The filter logic is a pure module (`scripts/lib/search-client.mjs`) shipped to the
// site as `search.js`; UI behaviors are checked with jsdom against the built home page.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

import { build } from '../scripts/build.mjs';
import { filterFiches, toggleTag, init } from '../scripts/lib/search-client.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = join(here, 'fixtures', 'search');
const ALL = ['api-gateway', 'enterprise-service-bus', 'event-driven-architecture', 'schema-directeur'];

async function buildSite(t) {
  const outDir = mkdtempSync(join(tmpdir(), 'buzzwords-search-'));
  t.after(() => rmSync(outDir, { recursive: true, force: true }));
  await build({ srcDir, outDir });
  return outDir;
}

function readOut(outDir, ...parts) {
  const path = join(outDir, ...parts);
  assert.ok(existsSync(path), `expected output file ${path} to exist`);
  return readFileSync(path, 'utf8');
}

// The search index embedded in the built home page.
function indexOf(html) {
  const m = html.match(/<script[^>]*id="search-index"[^>]*>([\s\S]*?)<\/script>/);
  assert.ok(m, 'home page embeds a <script id="search-index"> element');
  return JSON.parse(m[1]);
}

const slugs = (entries) => entries.map((e) => e.slug).sort();

// Built home page loaded in jsdom, with the search script wired to its document.
async function homePage(t) {
  const outDir = await buildSite(t);
  const dom = new JSDOM(readOut(outDir, 'index.html'));
  t.after(() => dom.window.close());
  const { document } = dom.window;
  init(document);
  const input = document.querySelector('#search-input');
  const type = (value) => {
    input.value = value;
    input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  };
  const click = (tag) => {
    const button = document.querySelector(`button[data-tag="${tag}"]`);
    assert.ok(button, `tag button "${tag}" exists`);
    button.click();
    return button;
  };
  const visible = () =>
    [...document.querySelectorAll('.fiche-list li[data-slug]')]
      .filter((li) => !li.hidden)
      .map((li) => li.dataset.slug)
      .sort();
  const noMatch = document.querySelector('#no-match');
  return { document, input, type, click, visible, noMatch };
}

test('SPEC-002 AC1: search matches term, acronym, aliases and body, ignoring case and accents', async (t) => {
  const outDir = await buildSite(t);
  const index = indexOf(readOut(outDir, 'index.html'));
  const search = (query) => slugs(filterFiches(index, { query }));

  assert.deepEqual(search(''), ALL, 'empty query shows every fiche');
  assert.deepEqual(search('   '), ALL, 'blank query shows every fiche');
  assert.deepEqual(search('gateway'), ['api-gateway'], 'term');
  assert.deepEqual(search('esb'), ['enterprise-service-bus'], 'acronym, case-insensitive');
  assert.deepEqual(search('schema'), ['schema-directeur'], 'accented term, unaccented query');
  assert.deepEqual(search('ÉVÉNEMENTIELLE'), ['event-driven-architecture'], 'alias, upper case with accents');
  assert.deepEqual(search("bus d'integration"), ['enterprise-service-bus'], 'alias with apostrophe');
  assert.deepEqual(search('mediation'), ['enterprise-service-bus'], 'accented body word');
  assert.deepEqual(search('un bus qui'), ['enterprise-service-bus'], 'body is plain text, Markdown stripped');
  assert.deepEqual(search('Systeme D'), ['schema-directeur'], 'body, mixed case and accents');
  assert.deepEqual(search('zzz'), [], 'no match');

  // The index body is plain text: no Markdown or HTML markup.
  const eda = index.find((e) => e.slug === 'event-driven-architecture');
  assert.ok(eda, 'index has an entry per fiche');
  const blob = JSON.stringify(eda);
  for (const markup of ['*', '<em>', '](', 'https://']) {
    assert.ok(!blob.includes(markup), `index entry has no "${markup}"`);
  }

  // Typing in the home page field filters the list.
  const page = await homePage(t);
  assert.equal(page.input?.getAttribute('type'), 'search', 'home page has a search field');
  const label = page.document.querySelector('label[for="search-input"]');
  assert.ok(label && label.textContent.trim(), 'search field has a label');
  page.type('Événement');
  assert.deepEqual(page.visible(), ['event-driven-architecture']);
  page.type('');
  assert.deepEqual(page.visible(), ALL);
});

test('SPEC-002 AC2: selecting a tag filters by tag; selecting it again clears the filter', async (t) => {
  const outDir = await buildSite(t);
  const index = indexOf(readOut(outDir, 'index.html'));

  assert.deepEqual(slugs(filterFiches(index, { tag: 'integration' })), [
    'api-gateway',
    'enterprise-service-bus',
    'event-driven-architecture',
  ]);
  assert.deepEqual(slugs(filterFiches(index, { tag: 'strategie' })), ['schema-directeur']);
  assert.deepEqual(slugs(filterFiches(index, { tag: null })), ALL);

  assert.equal(toggleTag(null, 'api'), 'api', 'select a tag');
  assert.equal(toggleTag('api', 'api'), null, 'select it again clears');
  assert.equal(toggleTag('api', 'integration'), 'integration', 'select another tag switches');

  const page = await homePage(t);
  for (const tag of ['api', 'architecture', 'integration', 'middleware', 'strategie']) {
    assert.ok(page.document.querySelector(`button[data-tag="${tag}"]`), `button for tag "${tag}"`);
  }
  const button = page.click('api');
  assert.deepEqual(page.visible(), ['api-gateway']);
  assert.equal(button.getAttribute('aria-pressed'), 'true');
  page.click('middleware');
  assert.deepEqual(page.visible(), ['enterprise-service-bus']);
  assert.equal(button.getAttribute('aria-pressed'), 'false', 'only one tag is active');
  const again = page.click('middleware');
  assert.deepEqual(page.visible(), ALL, 'selecting the active tag again clears the filter');
  assert.equal(again.getAttribute('aria-pressed'), 'false');
});

test('SPEC-002 AC3: query and tag together show only fiches matching both', async (t) => {
  const outDir = await buildSite(t);
  const index = indexOf(readOut(outDir, 'index.html'));

  assert.deepEqual(slugs(filterFiches(index, { query: 'publi' })), ['event-driven-architecture', 'schema-directeur']);
  assert.deepEqual(slugs(filterFiches(index, { query: 'publi', tag: 'integration' })), ['event-driven-architecture']);
  assert.deepEqual(slugs(filterFiches(index, { query: 'PUBLI', tag: 'strategie' })), ['schema-directeur']);
  assert.deepEqual(slugs(filterFiches(index, { query: 'publi', tag: 'api' })), []);

  const page = await homePage(t);
  page.type('publi');
  page.click('integration');
  assert.deepEqual(page.visible(), ['event-driven-architecture']);
  page.click('integration');
  assert.deepEqual(page.visible(), ['event-driven-architecture', 'schema-directeur'], 'clearing the tag keeps the query');
});

test('SPEC-002 AC4: no match shows "Aucun buzzword ne correspond." instead of an empty list', async (t) => {
  const page = await homePage(t);
  assert.ok(page.noMatch, 'home page has a #no-match element');
  assert.equal(page.noMatch.hidden, true, 'message hidden while fiches match');

  page.type('zzzz');
  assert.deepEqual(page.visible(), []);
  assert.equal(page.noMatch.hidden, false, 'message shown when nothing matches');
  assert.equal(page.noMatch.textContent.trim(), 'Aucun buzzword ne correspond.');
  assert.equal(page.document.querySelector('.fiche-list').hidden, true, 'empty list is hidden');

  page.type('');
  assert.equal(page.noMatch.hidden, true, 'message hidden again once fiches match');
  assert.equal(page.document.querySelector('.fiche-list').hidden, false);

  page.type('publi');
  page.click('api');
  assert.equal(page.noMatch.hidden, false, 'query + tag without match shows the message');
});

test('SPEC-002 AC5: search index built from the fiches, no external request at runtime', async (t) => {
  const outDir = await buildSite(t);
  const html = readOut(outDir, 'index.html');
  const index = indexOf(html);

  assert.deepEqual(slugs(index), ALL, 'one index entry per fiche');
  const esb = index.find((e) => e.slug === 'enterprise-service-bus');
  assert.equal(esb.term, 'Enterprise Service Bus');
  assert.equal(esb.acronym, 'ESB');
  assert.deepEqual(esb.aliases, ["Bus d'intégration"]);
  assert.deepEqual(esb.tags, ['integration', 'middleware']);
  assert.match(esb.text, /orchestre la médiation/);

  // The script is shipped with the site and loaded by a relative path.
  const script = readOut(outDir, 'search.js');
  assert.match(html, /<script[^>]*src="\.\/search\.js"/);
  for (const [name, content] of [['index.html', html], ['search.js', script]]) {
    assert.ok(!/https?:\/\//.test(content), `${name} references no external URL`);
    assert.ok(!/src="\/\//.test(content) && !/href="\/\//.test(content), `${name} has no protocol-relative URL`);
  }
  assert.ok(!/\bfetch\s*\(|XMLHttpRequest|import\s*\(/.test(script), 'search.js makes no network request');
});

test('without JavaScript the full list is visible', async (t) => {
  const outDir = await buildSite(t);
  const dom = new JSDOM(readOut(outDir, 'index.html'));
  t.after(() => dom.window.close());
  const { document } = dom.window;
  const items = [...document.querySelectorAll('.fiche-list li[data-slug]')];
  assert.deepEqual(items.map((li) => li.dataset.slug).sort(), ALL);
  assert.ok(items.every((li) => !li.hidden), 'every fiche is visible before the script runs');
  assert.ok(!document.querySelector('.fiche-list').hidden);
  const noMatch = document.querySelector('#no-match');
  assert.ok(!noMatch || noMatch.hidden, 'empty-state message hidden without JavaScript');
});
