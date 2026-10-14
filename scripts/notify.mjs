// Random buzzword notification via ntfy (SPEC-004, SPEC-007, SPEC-010).
// Usage: node scripts/notify.mjs [srcDir=buzzwords]
//
// Invoked three times a day by .github/workflows/notify.yml; every run sends,
// with no local-time check (SPEC-010 AC1).
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

import { loadFiches } from './lib/fiches.mjs';

/** Published site base URL (SPEC-001 Decisions). */
export const SITE_BASE_URL = 'https://basile-de-sousa.github.io/buzzwords';

const CONFIG_PATH = 'notify.config.json';

/** Settings used when `notify.config.json` is absent (SPEC-004's original behavior, SPEC-007 AC1). */
export const DEFAULT_CONFIG = Object.freeze({
  count: 1,
  bulletCount: 1,
});

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

  // Only `count` and `bulletCount` are read; any other field (e.g. a legacy `targets`) is ignored (SPEC-010 AC3).
  const config = {
    count: data.count ?? DEFAULT_CONFIG.count,
    bulletCount: data.bulletCount ?? DEFAULT_CONFIG.bulletCount,
  };

  if (!Number.isInteger(config.count) || config.count < 1) {
    throw new Error(`${CONFIG_PATH}: "count" must be a positive integer, got ${JSON.stringify(config.count)}`);
  }
  if (config.bulletCount !== 'all' && (!Number.isInteger(config.bulletCount) || config.bulletCount < 0)) {
    throw new Error(
      `${CONFIG_PATH}: "bulletCount" must be a non-negative integer or "all", got ${JSON.stringify(config.bulletCount)}`,
    );
  }

  return config;
}

/** Reads `notify.config.json` from the current directory, or `undefined` if it doesn't exist. */
function readConfigRaw() {
  return existsSync(CONFIG_PATH) ? readFileSync(CONFIG_PATH, 'utf8') : undefined;
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
 * random fiches (SPEC-004 AC2-AC4, SPEC-007 AC1-AC3), on every run (SPEC-010 AC1).
 * Ends successfully without sending when `fiches` is empty; throws a
 * descriptive error when `topic` is missing or ntfy rejects any request, even
 * after another one in the same run already succeeded (SPEC-004 AC5, SPEC-007 AC5).
 * @returns {Promise<{ sent: boolean, reason?: string, notifications?: { fiche: object, title: string, message: string, url: string }[] }>}
 */
export async function notify({
  fiches,
  topic,
  baseUrl = SITE_BASE_URL,
  count = 1,
  bulletCount = 1,
  random = Math.random,
  fetchImpl = fetch,
}) {
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
