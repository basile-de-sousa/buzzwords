// Acceptance tests for SPEC-001 (buzzword catalog site).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import { build } from '../scripts/build.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, 'fixtures');
const buildScript = join(here, '..', 'scripts', 'build.mjs');

function tempOut(t) {
  const dir = mkdtempSync(join(tmpdir(), 'buzzwords-test-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function readOut(outDir, ...parts) {
  const path = join(outDir, ...parts);
  assert.ok(existsSync(path), `expected output file ${path} to exist`);
  return readFileSync(path, 'utf8');
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

// The relation group markup for one operator: <section data-relation="op">…</section>.
function relationGroup(html, op) {
  const m = html.match(new RegExp(`<section[^>]*data-relation="${op}"[^>]*>([\\s\\S]*?)</section>`));
  return m ? m[1] : null;
}

// The <li> element whose content contains `needle`.
function listItem(html, needle) {
  const items = html.match(/<li[^>]*>[\s\S]*?<\/li>/g) ?? [];
  return items.find((li) => text(li).includes(needle)) ?? null;
}

test('SPEC-001 AC1: home page lists every fiche sorted by term, with acronym and link', async (t) => {
  const outDir = tempOut(t);
  await build({ srcDir: join(fixtures, 'valid'), outDir });
  const html = readOut(outDir, 'index.html');

  assert.match(html, /<html[^>]*lang="fr"/);

  // Links to fiche pages are relative (GitHub Pages project path) and ordered by term,
  // not by file name: API Gateway, Enterprise Service Bus, Service-Oriented Architecture.
  const hrefs = [...html.matchAll(/href="\.\/([a-z0-9-]+)\/"/g)].map((m) => m[1]);
  assert.deepEqual(hrefs, ['api-gateway', 'enterprise-service-bus', 'architecture-soa']);

  const esb = listItem(html, 'Enterprise Service Bus');
  assert.ok(esb, 'home page has an item for Enterprise Service Bus');
  assert.ok(text(esb).includes('ESB'), 'acronym is shown next to its term');
  assert.match(esb, /href="\.\/enterprise-service-bus\/"/);

  const soa = listItem(html, 'Service-Oriented Architecture');
  assert.ok(soa && text(soa).includes('SOA'), 'acronym SOA is shown');

  const gw = listItem(html, 'API Gateway');
  assert.ok(gw, 'fiche without acronym is listed');
  assert.ok(!text(gw).includes('()'), 'no empty acronym placeholder');
});

test('SPEC-001 AC2: one page per fiche with rendered body and relations grouped by operator', async (t) => {
  const outDir = tempOut(t);
  await build({ srcDir: join(fixtures, 'valid'), outDir });

  for (const slug of ['api-gateway', 'enterprise-service-bus', 'architecture-soa']) {
    readOut(outDir, slug, 'index.html');
  }
  const html = readOut(outDir, 'enterprise-service-bus', 'index.html');

  assert.match(html, /<html[^>]*lang="fr"/);
  assert.ok(text(html).includes('Enterprise Service Bus'));
  assert.match(html, /href="\.\.\/"/, 'relative link back to the home page');

  // Markdown body rendered to HTML.
  assert.match(html, /<strong>bus d(?:'|&#39;|’)intégration<\/strong>/);
  assert.match(html, /<li>routage<\/li>/);
  assert.ok(!html.includes('**bus'), 'raw Markdown is not left in the page');

  // Relations grouped by operator, in operator order, empty groups omitted.
  const expected = { in: ['<', 'EAI', 'SOA'], near: ['&', 'api gateway'], same: ['=', 'Service Bus'], not: ['≠', 'ETL <v1> & co'] };
  for (const [op, needles] of Object.entries(expected)) {
    const group = relationGroup(html, op);
    assert.ok(group !== null, `relation group "${op}" is rendered`);
    for (const needle of needles) {
      assert.ok(text(group).includes(needle), `group "${op}" shows "${needle}"`);
    }
  }
  assert.equal(relationGroup(html, 'contains'), null, 'empty relation group is not rendered');
  const order = ['in', 'near', 'same', 'not'].map((op) => html.indexOf(`data-relation="${op}"`));
  assert.deepEqual([...order].sort((a, b) => a - b), order, 'groups follow operator order');

  // The ">" operator appears on a fiche that has "contains" relations.
  const soa = readOut(outDir, 'architecture-soa', 'index.html');
  const contains = relationGroup(soa, 'contains');
  assert.ok(contains !== null && text(contains).includes('>'), 'group "contains" shows ">"');

  // Relation text is HTML-escaped.
  assert.ok(!html.includes('<v1>'), 'relation text is escaped');
});

test('SPEC-001 AC3: relations link to matching fiches (case-insensitive), else "pas encore de fiche"', async (t) => {
  const outDir = tempOut(t);
  await build({ srcDir: join(fixtures, 'valid'), outDir });
  const esb = readOut(outDir, 'enterprise-service-bus', 'index.html');
  const soa = readOut(outDir, 'architecture-soa', 'index.html');

  // Match on acronym (SOA -> architecture-soa).
  const soaItem = listItem(relationGroup(esb, 'in') ?? '', 'SOA');
  assert.ok(soaItem, 'relation SOA is listed');
  assert.match(soaItem, /<a[^>]*href="\.\.\/architecture-soa\/"/);
  assert.ok(!text(soaItem).includes('pas encore de fiche'));

  // Match on term, case-insensitive (api gateway -> API Gateway).
  const gwItem = listItem(relationGroup(esb, 'near') ?? '', 'api gateway');
  assert.ok(gwItem, 'relation api gateway is listed');
  assert.match(gwItem, /<a[^>]*href="\.\.\/api-gateway\/"/);

  // Match on acronym, case-insensitive (esb -> ESB).
  const esbItem = listItem(relationGroup(soa, 'contains') ?? '', 'esb');
  assert.ok(esbItem, 'relation esb is listed');
  assert.match(esbItem, /<a[^>]*href="\.\.\/enterprise-service-bus\/"/);

  // Match on alias, case-insensitive (integration bus -> Integration Bus).
  const aliasItem = listItem(relationGroup(soa, 'near') ?? '', 'integration bus');
  assert.ok(aliasItem, 'relation integration bus is listed');
  assert.match(aliasItem, /<a[^>]*href="\.\.\/enterprise-service-bus\/"/);

  // No match: plain text marked "pas encore de fiche".
  for (const [op, name] of [['in', 'EAI'], ['same', 'Service Bus'], ['not', 'ETL <v1> & co']]) {
    const item = listItem(relationGroup(esb, op) ?? '', name);
    assert.ok(item, `relation ${name} is listed`);
    assert.ok(!/<a\b/.test(item), `relation ${name} is not a link`);
    assert.ok(text(item).includes('pas encore de fiche'), `relation ${name} is marked "pas encore de fiche"`);
  }
});

test('SPEC-001 AC4: invalid fiche makes the build fail with an error naming the file', async (t) => {
  const cases = [
    'invalid-missing-term',
    'invalid-missing-slug',
    'invalid-missing-created',
    'invalid-missing-updated',
    'invalid-slug-mismatch',
  ];
  for (const name of cases) {
    const srcDir = join(fixtures, name);

    const outDir = tempOut(t);
    await assert.rejects(
      build({ srcDir, outDir }),
      (err) => {
        assert.ok(err instanceof Error, `${name}: rejects with an Error`);
        assert.ok(err.message.includes('broken-fiche.md'), `${name}: error names the file, got "${err.message}"`);
        return true;
      },
      `${name}: build rejects`,
    );

    // The CLI exits non-zero and names the file.
    const cliOut = tempOut(t);
    const res = spawnSync(process.execPath, [buildScript, srcDir, cliOut], { encoding: 'utf8' });
    assert.notEqual(res.status, 0, `${name}: CLI exits non-zero`);
    assert.ok(res.stderr.includes('broken-fiche.md'), `${name}: CLI stderr names the file, got "${res.stderr}"`);
  }
});

test('missing source folder builds a home page with an empty list', async (t) => {
  const outDir = tempOut(t);
  await build({ srcDir: join(fixtures, 'does-not-exist'), outDir });
  const html = readOut(outDir, 'index.html');
  assert.match(html, /<html[^>]*lang="fr"/);
  assert.equal([...html.matchAll(/href="\.\/([a-z0-9-]+)\/"/g)].length, 0);
});
