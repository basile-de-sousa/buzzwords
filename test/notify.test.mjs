// Acceptance tests for SPEC-004 (random buzzword notifications).
//
// AC1 (cron timing) and the real ntfy HTTP call are exercised manually (see the PR):
// they need a live scheduler / network to mean anything. The `isNotificationTime`
// helper below is the pure DST-aware logic that decides whether "now" is a target
// local time, so it IS unit tested here even though the cron schedule itself is not.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadFiches } from '../scripts/lib/fiches.mjs';
import {
  isNotificationTime,
  pickRandomFiche,
  pickRandomFiches,
  buildTitle,
  buildMessage,
  buildFicheUrl,
  parseNotifyConfig,
  notify,
  SITE_BASE_URL,
} from '../scripts/notify.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const fiches = loadFiches(join(here, 'fixtures', 'notify'));
const esb = fiches.find((f) => f.slug === 'enterprise-service-bus');
const urbanisation = fiches.find((f) => f.slug === 'urbanisation-si');

// --- AC1: local-time gate, including the DST shift (Europe/Paris) ---

test('SPEC-004 AC1: matches 08:00/13:00/19:00 Europe/Paris in winter (CET, UTC+1)', () => {
  assert.equal(isNotificationTime(new Date('2026-01-15T07:00:00Z')), true); // 08:00 local
  assert.equal(isNotificationTime(new Date('2026-01-15T12:00:00Z')), true); // 13:00 local
  assert.equal(isNotificationTime(new Date('2026-01-15T18:00:00Z')), true); // 19:00 local
});

test('SPEC-004 AC1: matches 08:00/13:00/19:00 Europe/Paris in summer (CEST, UTC+2)', () => {
  assert.equal(isNotificationTime(new Date('2026-07-15T06:00:00Z')), true); // 08:00 local
  assert.equal(isNotificationTime(new Date('2026-07-15T11:00:00Z')), true); // 13:00 local
  assert.equal(isNotificationTime(new Date('2026-07-15T17:00:00Z')), true); // 19:00 local
});

test('SPEC-004 AC1: does not match any other local time', () => {
  assert.equal(isNotificationTime(new Date('2026-01-15T07:00:00Z')), true); // sanity: winter 08:00 still true
  assert.equal(isNotificationTime(new Date('2026-01-15T08:00:00Z')), false); // 09:00 local, winter
  assert.equal(isNotificationTime(new Date('2026-07-15T06:00:00Z')), true); // sanity: summer 08:00 still true
  assert.equal(isNotificationTime(new Date('2026-07-15T07:00:00Z')), false); // 09:00 local, summer
  assert.equal(isNotificationTime(new Date('2026-01-15T00:00:00Z')), false); // 01:00 local
});

test('SPEC-004 AC1: the same UTC instant that matches in winter does not match in summer and vice versa', () => {
  // 07:00 UTC is 08:00 local in winter (CET) but 09:00 local in summer (CEST).
  assert.equal(isNotificationTime(new Date('2026-01-15T07:00:00Z')), true);
  assert.equal(isNotificationTime(new Date('2026-07-15T07:00:00Z')), false);
});

// --- AC2: uniformly random pick among buzzwords/*.md ---

test('SPEC-004 AC2: picks a fiche among the given list using the injected RNG', () => {
  assert.equal(pickRandomFiche(fiches, () => 0), fiches[0]);
  assert.equal(pickRandomFiche(fiches, () => 0.999999), fiches[fiches.length - 1]);
});

test('SPEC-004 AC2: every fiche is reachable (uniform over the index range)', () => {
  const hits = new Set();
  for (let i = 0; i < fiches.length; i += 1) {
    hits.add(pickRandomFiche(fiches, () => i / fiches.length));
  }
  assert.equal(hits.size, fiches.length);
});

// --- AC3: title = term (+ acronym), message = first bullet as plain text ---

test('SPEC-004 AC3: title is "term (ACRONYM)" when an acronym is present', () => {
  assert.equal(buildTitle(esb), 'Enterprise Service Bus (ESB)');
});

test('SPEC-004 AC3: title is just the term when there is no acronym', () => {
  assert.equal(buildTitle(urbanisation), 'Urbanisation SI');
});

test('SPEC-004 AC3: message is the first explanation bullet, Markdown stripped to plain text', () => {
  assert.equal(
    buildMessage(esb),
    "Conceptuellement : un bus d'intégration qui fait transiter les messages entre applications, avec un lien vers la doc.",
  );
});

test('SPEC-004 AC3: message picks the first bullet even when the body opens with a non-bullet line', () => {
  assert.equal(buildMessage(urbanisation), 'Sert à : limiter les dépendances et faciliter les évolutions.');
});

// --- AC4: click-through URL to the fiche's page on the published site ---

test('SPEC-004 AC4: builds a URL to the fiche page on the published site', () => {
  assert.equal(buildFicheUrl(esb, SITE_BASE_URL), 'https://basile-de-sousa.github.io/buzzwords/enterprise-service-bus/');
});

test('SPEC-004 AC4: tolerates a base URL with a trailing slash', () => {
  assert.equal(buildFicheUrl(esb, 'https://example.test/site/'), 'https://example.test/site/enterprise-service-bus/');
});

// --- AC5: fail loudly on misconfiguration/rejection; succeed silently on an empty catalog ---

test('SPEC-004 AC5: ends successfully without sending when buzzwords/ has no fiche', async () => {
  let called = false;
  const result = await notify({
    fiches: [],
    now: new Date('2026-01-15T07:00:00Z'),
    topic: 'some-topic',
    baseUrl: SITE_BASE_URL,
    fetchImpl: async () => {
      called = true;
      return { ok: true };
    },
  });
  assert.equal(result.sent, false);
  assert.equal(called, false);
});

test('SPEC-004 AC5: does nothing outside a target local time, without inspecting the topic', async () => {
  const result = await notify({
    fiches,
    now: new Date('2026-01-15T09:00:00Z'), // not a target time
    topic: undefined,
    baseUrl: SITE_BASE_URL,
    fetchImpl: async () => ({ ok: true }),
  });
  assert.equal(result.sent, false);
});

test('SPEC-004 AC5: fails with a clear error when NTFY_TOPIC is missing', async () => {
  await assert.rejects(
    () =>
      notify({
        fiches,
        now: new Date('2026-01-15T07:00:00Z'),
        topic: undefined,
        baseUrl: SITE_BASE_URL,
        fetchImpl: async () => ({ ok: true }),
      }),
    /NTFY_TOPIC/,
  );
});

test('SPEC-004 AC5: fails with a clear error naming the cause when ntfy rejects the request', async () => {
  await assert.rejects(
    () =>
      notify({
        fiches,
        now: new Date('2026-01-15T07:00:00Z'),
        topic: 'some-topic',
        baseUrl: SITE_BASE_URL,
        fetchImpl: async () => ({ ok: false, status: 403, statusText: 'Forbidden', text: async () => 'topic reserved' }),
      }),
    /403/,
  );
});

test('SPEC-004 AC5: sends exactly one notification at a target time when everything is configured', async () => {
  let calls = 0;
  let sentBody;
  const result = await notify({
    fiches,
    now: new Date('2026-01-15T07:00:00Z'),
    topic: 'some-topic',
    baseUrl: SITE_BASE_URL,
    random: () => 0,
    fetchImpl: async (url, init) => {
      calls += 1;
      sentBody = JSON.parse(init.body);
      return { ok: true };
    },
  });
  assert.equal(calls, 1);
  assert.equal(result.sent, true);
  assert.equal(sentBody.topic, 'some-topic');
  assert.equal(sentBody.title, buildTitle(fiches[0]));
});

// --- SPEC-007 AC1: settings read from notify.config.json, defaults when absent ---

test('SPEC-007 AC1: an absent config file yields SPEC-004\'s original defaults', () => {
  const config = parseNotifyConfig(undefined);
  assert.deepEqual(config, {
    timeZone: 'Europe/Paris',
    targets: ['08:00', '13:00', '19:00'],
    count: 1,
    bulletCount: 1,
  });
});

test('SPEC-007 AC1: valid JSON overrides only the fields it sets', () => {
  const config = parseNotifyConfig(JSON.stringify({ count: 3 }));
  assert.equal(config.count, 3);
  assert.equal(config.timeZone, 'Europe/Paris');
  assert.deepEqual(config.targets, ['08:00', '13:00', '19:00']);
  assert.equal(config.bulletCount, 1);
});

// --- SPEC-007 AC2: count distinct fiches per run, capped at the number available ---

test('SPEC-007 AC2: pickRandomFiches returns `count` distinct fiches', () => {
  let i = 0;
  const draws = [0, 0]; // always take index 0 of the shrinking pool: still 2 distinct fiches
  const random = () => draws[i++];
  const picked = pickRandomFiches(fiches, 2, random);
  assert.equal(picked.length, 2);
  assert.notEqual(picked[0], picked[1]);
});

test('SPEC-007 AC2: pickRandomFiches caps at the number of fiches available', () => {
  const picked = pickRandomFiches(fiches, fiches.length + 5, () => 0);
  assert.equal(picked.length, fiches.length);
  assert.equal(new Set(picked).size, fiches.length);
});

test('SPEC-007 AC2: notify sends one notification per distinct fiche, up to `count`', async () => {
  let calls = 0;
  const titles = [];
  const result = await notify({
    fiches,
    now: new Date('2026-01-15T07:00:00Z'),
    topic: 'some-topic',
    baseUrl: SITE_BASE_URL,
    count: 2,
    random: () => 0,
    fetchImpl: async (url, init) => {
      calls += 1;
      titles.push(JSON.parse(init.body).title);
      return { ok: true };
    },
  });
  assert.equal(calls, 2);
  assert.equal(result.sent, true);
  assert.equal(new Set(titles).size, 2);
});

test('SPEC-007 AC2: notify caps at the number of available fiches when `count` exceeds it', async () => {
  let calls = 0;
  const result = await notify({
    fiches,
    now: new Date('2026-01-15T07:00:00Z'),
    topic: 'some-topic',
    baseUrl: SITE_BASE_URL,
    count: fiches.length + 5,
    random: () => 0,
    fetchImpl: async () => {
      calls += 1;
      return { ok: true };
    },
  });
  assert.equal(calls, fiches.length);
  assert.equal(result.sent, true);
});

// --- SPEC-007 AC3: bulletCount controls how much of the definition is shown ---

test('SPEC-007 AC3: bulletCount 0 means title only, no message body', () => {
  assert.equal(buildMessage(esb, 0), '');
});

test('SPEC-007 AC3: bulletCount 2 joins the first two bullets with a blank line', () => {
  assert.equal(
    buildMessage(esb, 2),
    "Conceptuellement : un bus d'intégration qui fait transiter les messages entre applications, avec un lien vers la doc.\n\nConcrètement : routage, transformation, orchestration.",
  );
});

test('SPEC-007 AC3: bulletCount "all" includes every bullet', () => {
  assert.equal(
    buildMessage(esb, 'all'),
    "Conceptuellement : un bus d'intégration qui fait transiter les messages entre applications, avec un lien vers la doc.\n\nConcrètement : routage, transformation, orchestration.\n\nEx : MuleSoft, IBM App Connect.",
  );
});

test('SPEC-007 AC3: default bulletCount is still 1 (SPEC-004 AC3 behavior unchanged)', () => {
  assert.equal(
    buildMessage(esb),
    "Conceptuellement : un bus d'intégration qui fait transiter les messages entre applications, avec un lien vers la doc.",
  );
});

// --- SPEC-007 AC4: invalid config fails loudly, before any send ---

test('SPEC-007 AC4: invalid JSON throws a descriptive error', () => {
  assert.throws(() => parseNotifyConfig('{not json'), /not valid JSON/);
});

test('SPEC-007 AC4: a non-positive count throws a descriptive error', () => {
  assert.throws(() => parseNotifyConfig(JSON.stringify({ count: 0 })), /"count"/);
});

test('SPEC-007 AC4: an invalid bulletCount throws a descriptive error', () => {
  assert.throws(() => parseNotifyConfig(JSON.stringify({ bulletCount: -1 })), /"bulletCount"/);
  assert.throws(() => parseNotifyConfig(JSON.stringify({ bulletCount: 'every' })), /"bulletCount"/);
});

test('SPEC-007 AC4: a target with a non-numeric or out-of-range time throws a descriptive error', () => {
  assert.throws(() => parseNotifyConfig(JSON.stringify({ targets: ['25:00'] })), /"targets"/);
  assert.throws(() => parseNotifyConfig(JSON.stringify({ targets: ['08:60'] })), /"targets"/);
});

// --- SPEC-008 AC1: targets accepted at 5-minute resolution, not just on the hour ---

test('SPEC-008 AC1: a target on a 5-minute mark other than :00 parses without error', () => {
  const config = parseNotifyConfig(JSON.stringify({ targets: ['08:05', '13:30', '19:55'] }));
  assert.deepEqual(config.targets, ['08:05', '13:30', '19:55']);
});

// --- SPEC-008 AC2: a target not aligned to 5 minutes is rejected, not rounded ---

test('SPEC-008 AC2: a target not on a 5-minute mark throws a descriptive error', () => {
  assert.throws(() => parseNotifyConfig(JSON.stringify({ targets: ['03:13'] })), /"targets"/);
});

// --- SPEC-007 AC5: a rejection on any send fails the run, even after another succeeded ---

test('SPEC-007 AC5: fails when the second of two sends is rejected by ntfy, even though the first succeeded', async () => {
  let calls = 0;
  await assert.rejects(
    () =>
      notify({
        fiches,
        now: new Date('2026-01-15T07:00:00Z'),
        topic: 'some-topic',
        baseUrl: SITE_BASE_URL,
        count: 2,
        random: () => 0,
        fetchImpl: async () => {
          calls += 1;
          return calls === 1
            ? { ok: true }
            : { ok: false, status: 500, statusText: 'Internal Server Error', text: async () => 'boom' };
        },
      }),
    /500/,
  );
  assert.equal(calls, 2);
});
