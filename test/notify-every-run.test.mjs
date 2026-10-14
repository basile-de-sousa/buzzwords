// Acceptance tests for SPEC-010 (send a notification on every scheduled run).
// AC4 (re-enabling the workflow) is a repository setting, checked manually (see the PR).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as loadYaml } from 'js-yaml';

import { loadFiches } from '../scripts/lib/fiches.mjs';
import { notify, parseNotifyConfig, SITE_BASE_URL } from '../scripts/notify.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const fiches = loadFiches(join(here, 'fixtures', 'notify'));

test('SPEC-010 AC1: sends at any local time, with no time check', async () => {
  const sent = [];
  for (const now of ['2026-01-15T02:17:00Z', '2026-07-15T14:43:00Z']) {
    const result = await notify({
      fiches,
      now: new Date(now),
      topic: 'some-topic',
      baseUrl: SITE_BASE_URL,
      random: () => 0,
      fetchImpl: async (_url, init) => {
        sent.push(JSON.parse(init.body));
        return { ok: true };
      },
    });
    assert.equal(result.sent, true, `expected a send at ${now}`);
  }
  assert.equal(sent.length, 2);
});

test('SPEC-010 AC2: workflow runs three times a day on a fixed cron, and on manual dispatch', () => {
  const workflow = loadYaml(readFileSync(join(root, '.github', 'workflows', 'notify.yml'), 'utf8'));
  assert.deepEqual(
    workflow.on.schedule.map((s) => s.cron),
    ['0 6,11,17 * * *'],
  );
  assert.ok('workflow_dispatch' in workflow.on);
});

test('SPEC-010 AC3: config parsing no longer reads or validates `targets`', () => {
  const config = parseNotifyConfig(JSON.stringify({ count: 2, bulletCount: 1, targets: ['not-a-time'] }));
  assert.equal(config.count, 2);
  assert.equal(config.bulletCount, 1);
  assert.equal('targets' in config, false);
  assert.equal('targets' in parseNotifyConfig(undefined), false);
});

test('SPEC-010 AC3: notify.config.json holds only count and bulletCount', () => {
  const config = JSON.parse(readFileSync(join(root, 'notify.config.json'), 'utf8'));
  assert.deepEqual(Object.keys(config).sort(), ['bulletCount', 'count']);
});
