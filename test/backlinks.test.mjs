// Acceptance tests for SPEC-003 (backlinks on fiche pages).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { build } from '../scripts/build.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = join(here, 'fixtures', 'backlinks');

function tempOut(t) {
  const dir = mkdtempSync(join(tmpdir(), 'buzzwords-backlinks-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function readOut(outDir, ...parts) {
  const path = join(outDir, ...parts);
  assert.ok(existsSync(path), `expected output file ${path} to exist`);
  return readFileSync(path, 'utf8');
}

async function buildSite(t) {
  const outDir = tempOut(t);
  await build({ srcDir, outDir });
  return outDir;
}

// Visible text of an HTML fragment: tags stripped, basic entities decoded.
function text(html) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

// The "Cité par" container, scoped away from the fiche's own "Buzzwords liés" groups
// (which may reuse the same operator, e.g. both a "near" relation and a "near" backlink).
function backlinksDiv(html) {
  const m = html.match(/<div class="backlinks">([\s\S]*?)<\/div>/);
  return m ? m[1] : null;
}

// The relation-group markup for one operator, scoped to a given container fragment.
function relationGroup(fragment, op) {
  if (fragment === null) return null;
  const m = fragment.match(new RegExp(`<section[^>]*data-relation="${op}"[^>]*>([\\s\\S]*?)</section>`));
  return m ? m[1] : null;
}

// The <li> element whose content contains `needle`.
function listItem(html, needle) {
  const items = (html ?? '').match(/<li[^>]*>[\s\S]*?<\/li>/g) ?? [];
  return items.find((li) => text(li).includes(needle)) ?? null;
}

// Order in which entries (<li> text) appear inside a fragment.
function itemOrder(fragment) {
  const items = (fragment ?? '').match(/<li[^>]*>[\s\S]*?<\/li>/g) ?? [];
  return items.map((li) => text(li));
}

test('SPEC-003 AC1: a relation of A resolving to B is listed under "Cité par" on B, inverse operator, acronym label', async (t) => {
  const outDir = await buildSite(t);
  const hub = readOut(outDir, 'integration-hub', 'index.html');
  const backlinks = backlinksDiv(hub);
  assert.ok(backlinks, 'fiche page has a "Cité par" section');
  assert.ok(text(hub).includes('Cité par'));

  // Order Service declares `in: [Integration Hub]` (< , "Fait partie de"):
  // the inverse is `>` ("Contient"), so Order Service is listed under "contains".
  const contains = relationGroup(backlinks, 'contains');
  assert.ok(contains, 'backlink group "contains" is rendered (inverse of "in")');
  const orderItem = listItem(contains, 'Order Service');
  assert.ok(orderItem, 'Order Service is listed');
  assert.match(orderItem, /<a[^>]*href="\.\.\/order-service\/"/);

  // Platform Suite (acronym PFS) declares `contains: [Integration Hub]` (>, "Contient"):
  // the inverse is `<` ("Fait partie de"), so Platform Suite is listed under "in",
  // labelled with its acronym rather than its term.
  const inGroup = relationGroup(backlinks, 'in');
  assert.ok(inGroup, 'backlink group "in" is rendered (inverse of "contains")');
  const pfsItem = listItem(inGroup, 'PFS');
  assert.ok(pfsItem, 'Platform Suite is listed under its acronym PFS');
  assert.match(pfsItem, /<a[^>]*href="\.\.\/platform-suite\/"/);
  assert.ok(!text(pfsItem).includes('Platform Suite'), 'label is the acronym, not the term');

  // Event Bus declares `near: [Integration Hub]` (&): unchanged under inversion.
  const nearGroup = relationGroup(backlinks, 'near');
  assert.ok(nearGroup, 'backlink group "near" is rendered');
  assert.ok(listItem(nearGroup, 'Event Bus'));

  // Message Broker declares `same: [Integration Hub]` (=): unchanged under inversion.
  const sameGroup = relationGroup(backlinks, 'same');
  assert.ok(sameGroup, 'backlink group "same" is rendered');
  assert.ok(listItem(sameGroup, 'Message Broker'));

  // Monolith declares `not: [Integration Hub]` (≠): unchanged under inversion.
  const notGroup = relationGroup(backlinks, 'not');
  assert.ok(notGroup, 'backlink group "not" is rendered');
  assert.ok(listItem(notGroup, 'Monolith'));
});

test('SPEC-003 AC2: a fiche already related to from B\'s own relations is not listed in "Cité par"', async (t) => {
  const outDir = await buildSite(t);
  const hub = readOut(outDir, 'integration-hub', 'index.html');
  const backlinks = backlinksDiv(hub);

  // Cited And Related declares `in: [Integration Hub]`, which would land it in the
  // "contains" backlink group — but Integration Hub itself declares
  // `near: [Cited And Related]`, so it must be excluded entirely.
  const contains = relationGroup(backlinks, 'contains');
  assert.ok(!listItem(contains, 'Cited And Related'), 'Cited And Related is not listed (already related to)');

  // Its own "Buzzwords liés" near group still shows the direct relation.
  assert.ok(text(hub).includes('Cited And Related'), 'the direct relation itself is still rendered');

  // Sibling entries in the same "contains" group are unaffected.
  assert.ok(listItem(contains, 'Order Service'));
  assert.ok(listItem(contains, 'Billing Service'));
});

test('SPEC-003 AC3: "Cité par" groups follow the "Buzzwords liés" operator order and are sorted alphabetically by label', async (t) => {
  const outDir = await buildSite(t);
  const hub = readOut(outDir, 'integration-hub', 'index.html');
  const backlinks = backlinksDiv(hub);

  // Group order matches RELATIONS order: in, contains, near, same, not.
  const order = ['in', 'contains', 'near', 'same', 'not'].map((op) => backlinks.indexOf(`data-relation="${op}"`));
  assert.ok(order.every((i) => i >= 0), 'every expected group is present');
  assert.deepEqual([...order].sort((a, b) => a - b), order, 'groups follow operator order');

  // "in" group: Customer Portal (term) sorts before PFS (acronym of Platform Suite).
  const inGroup = relationGroup(backlinks, 'in');
  assert.deepEqual(itemOrder(inGroup), ['Customer Portal', 'PFS']);

  // "contains" group: Billing Service sorts before Order Service.
  const contains = relationGroup(backlinks, 'contains');
  assert.deepEqual(itemOrder(contains), ['Billing Service', 'Order Service']);

  // "same" group: Duplicate Citer cites the hub twice (different case) but appears once,
  // sorting before Message Broker.
  const sameGroup = relationGroup(backlinks, 'same');
  assert.deepEqual(itemOrder(sameGroup), ['Duplicate Citer', 'Message Broker']);
});

test('SPEC-003 AC4: a fiche with no remaining citer has no "Cité par" section', async (t) => {
  const outDir = await buildSite(t);
  const standalone = readOut(outDir, 'standalone', 'index.html');
  assert.equal(backlinksDiv(standalone), null, 'no backlinks container is rendered');
  assert.ok(!text(standalone).includes('Cité par'), 'no "Cité par" heading is rendered');
});

test('SPEC-003 AC5: backlinks are computed at build time only, fiche files are never modified', async (t) => {
  const names = readdirSync(srcDir).filter((f) => f.endsWith('.md')).sort();
  const before = new Map(names.map((name) => [name, readFileSync(join(srcDir, name), 'utf8')]));

  await buildSite(t);

  const after = readdirSync(srcDir).filter((f) => f.endsWith('.md')).sort();
  assert.deepEqual(after, names, 'no fiche file was added or removed');
  for (const name of names) {
    assert.equal(readFileSync(join(srcDir, name), 'utf8'), before.get(name), `${name} is unchanged`);
  }
});
