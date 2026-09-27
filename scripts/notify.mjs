// Random buzzword notification via ntfy (SPEC-004, SPEC-007).
// Usage: node scripts/notify.mjs [srcDir=buzzwords]
//
// Invoked on an hourly schedule by .github/workflows/notify.yml (SPEC-007
// AC6); `isNotificationTime` below decides, from the actual local time and
// `notify.config.json`'s `targets`, whether this run should send anything
// (SPEC-004 AC1).
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

import { loadFiches } from './lib/fiches.mjs';

/** Published site base URL (SPEC-001 Decisions). */
export const SITE_BASE_URL = 'https://basile-de-sousa.github.io/buzzwords';

const DEFAULT_TARGETS = ['08:00', '13:00', '19:00'];

const CONFIG_PATH = 'notify.config.json';

/** Settings used when `notify.config.json` is absent (SPEC-004's original behavior, SPEC-007 AC1). */
export const DEFAULT_CONFIG = Object.freeze({
  timeZone: 'Europe/Paris',
  targets: DEFAULT_TARGETS,
  count: 1,
  bulletCount: 1,
});

const HOUR_ON_THE_HOUR = /^([01]\d|2[0-3]):00$/;

/**
 * Parses and validates `notify.config.json`'s content (SPEC-007 AC1, AC4).
 * `raw` is `undefined` when the file is absent, which yields `DEFAULT_CONFIG`.
 * Throws a descriptive `Error` on invalid JSON or an out-of-range field.
 * @param {string | undefined} raw
 */
export function parseNotifyConfig(raw) {
  if (raw === undefined) return DEFAULT_CONFIG;

  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    throw new Error(`${CONFIG_PATH} is not valid JSON: ${err.message}`);
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error(`${CONFIG_PATH} must be a JSON object`);
  }

  const config = { ...DEFAULT_CONFIG, ...data };

  if (!Number.isInteger(config.count) || config.count < 1) {
    throw new Error(`${CONFIG_PATH}: "count" must be a positive integer, got ${JSON.stringify(config.count)}`);
  }
  if (config.bulletCount !== 'all' && (!Number.isInteger(config.bulletCount) || config.bulletCount < 0)) {
    throw new Error(
      `${CONFIG_PATH}: "bulletCount" must be a non-negative integer or "all", got ${JSON.stringify(config.bulletCount)}`,
    );
  }
  if (!Array.isArray(config.targets) || !config.targets.length || !config.targets.every((t) => HOUR_ON_THE_HOUR.test(t))) {
    throw new Error(`${CONFIG_PATH}: "targets" must be a non-empty array of "HH:00" local times`);
  }
  if (typeof config.timeZone !== 'string' || !config.timeZone) {
    throw new Error(`${CONFIG_PATH}: "timeZone" must be a non-empty string`);
  }

  return config;
}

/** Reads `notify.config.json` from the current directory, or `undefined` if it doesn't exist. */
function readConfigRaw() {
  return existsSync(CONFIG_PATH) ? readFileSync(CONFIG_PATH, 'utf8') : undefined;
}

/**
 * Whether `date` falls on one of `targets` (default 08:00/13:00/19:00) in
 * `timeZone` (default Europe/Paris), DST included: the offset conversion is
 * delegated to `Intl`, so the same UTC instant can match in winter and not in
 * summer (or vice versa) as the clocks shift (AC1).
 * @param {Date} date
 */
export function isNotificationTime(date, { timeZone = 'Europe/Paris', targets = DEFAULT_TARGETS } = {}) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  return targets.includes(`${parts.hour}:${parts.minute}`);
}

/** Uniformly random fiche among `fiches` (SPEC-004 AC2). `random` is injectable for tests. */
export function pickRandomFiche(fiches, random = Math.random) {
  return fiches[Math.floor(random() * fiches.length)];
}

/**
 * `count` distinct fiches, drawn uniformly at random without replacement, capped at
 * the number of fiches available (SPEC-007 AC2). `random` is injectable for tests.
 */
export function pickRandomFiches(fiches, count, random = Math.random) {
  const pool = [...fiches];
  const picked = [];
  while (picked.length < count && pool.length) {
    const index = Math.floor(random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
}

/** Notification title: term, plus its acronym in parentheses when present (AC3). */
export function buildTitle(fiche) {
  return fiche.acronym ? `${fiche.term} (${fiche.acronym})` : fiche.term;
}

/**
 * The first `count` "- "/"* " bullet lines of a fiche body, raw Markdown, marker
 * stripped. `count` of `'all'` returns every bullet (SPEC-007 AC3).
 */
export function getBullets(body, count = 1) {
  const bullets = body
    .split('\n')
    .filter((l) => /^\s*[-*]\s+/.test(l))
    .map((l) => l.replace(/^\s*[-*]\s+/, '').trim());
  return count === 'all' ? bullets : bullets.slice(0, count);
}

/** Renders inline Markdown to plain text (bold/italics/code/links stripped, AC3). */
export function stripMarkdown(text) {
  const html = marked.parseInline(text);
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Notification message: the fiche's first `bulletCount` explanation bullets, as plain
 * text, blank-line separated (SPEC-004 AC3, SPEC-007 AC3). `bulletCount` of `0` yields
 * no message body; `'all'` includes every bullet.
 */
export function buildMessage(fiche, bulletCount = 1) {
  if (bulletCount === 0) return '';
  return getBullets(fiche.body, bulletCount)
    .map(stripMarkdown)
    .join('\n\n');
}

/** Click-through URL to the fiche's page on the published site (AC4). */
export function buildFicheUrl(fiche, baseUrl) {
  return `${baseUrl.replace(/\/$/, '')}/${fiche.slug}/`;
}

/**
 * Decides whether to send, and sends, `count` ntfy notifications for distinct
 * random fiches (SPEC-004 AC1-AC4, SPEC-007 AC1-AC3). Ends successfully without
 * sending outside a target local time or when `fiches` is empty; throws a
 * descriptive error when `topic` is missing or ntfy rejects any request, even
 * after another one in the same run already succeeded (SPEC-004 AC5, SPEC-007 AC5).
 * @returns {Promise<{ sent: boolean, reason?: string, notifications?: { fiche: object, title: string, message: string, url: string }[] }>}
 */
export async function notify({
  fiches,
  now = new Date(),
  topic,
  baseUrl = SITE_BASE_URL,
  timeZone,
  targets,
  count = 1,
  bulletCount = 1,
  random = Math.random,
  fetchImpl = fetch,
}) {
  if (!isNotificationTime(now, { timeZone, targets })) {
    return { sent: false, reason: 'not a target local time (08:00/13:00/19:00 Europe/Paris)' };
  }
  if (!fiches.length) {
    return { sent: false, reason: 'buzzwords/ has no fiche' };
  }
  if (!topic) {
    throw new Error('NTFY_TOPIC is not set: cannot send the notification');
  }

  const notifications = [];
  for (const fiche of pickRandomFiches(fiches, count, random)) {
    const title = buildTitle(fiche);
    const message = buildMessage(fiche, bulletCount);
    const url = buildFicheUrl(fiche, baseUrl);

    const response = await fetchImpl('https://ntfy.sh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, title, message, click: url }),
    });
    if (!response.ok) {
      const body = await (response.text ? response.text().catch(() => '') : '');
      throw new Error(
        `ntfy rejected the notification (HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ''})${body ? `: ${body}` : ''}`,
      );
    }

    notifications.push({ fiche, title, message, url });
  }

  return { sent: true, notifications };
}

async function main(srcDir = 'buzzwords') {
  const fiches = loadFiches(srcDir);
  const config = parseNotifyConfig(readConfigRaw());
  const result = await notify({ fiches, topic: process.env.NTFY_TOPIC, ...config });
  if (!result.sent) {
    console.log(`No notification sent: ${result.reason}`);
    return;
  }
  for (const { title, url } of result.notifications) {
    console.log(`Sent notification for "${title}" -> ${url}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [srcDir = 'buzzwords'] = process.argv.slice(2);
  main(srcDir).catch((err) => {
    console.error(`notify failed: ${err.message}`);
    process.exitCode = 1;
  });
}
