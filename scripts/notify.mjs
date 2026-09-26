// Random buzzword notification via ntfy (SPEC-004).
// Usage: node scripts/notify.mjs [srcDir=buzzwords]
//
// Invoked on a schedule by .github/workflows/notify.yml, which fires several
// times a day (covering both Europe/Paris UTC offsets); `isNotificationTime`
// below decides, from the actual local time, whether this run should send
// anything (AC1).
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

import { loadFiches } from './lib/fiches.mjs';

/** Published site base URL (SPEC-001 Decisions). */
export const SITE_BASE_URL = 'https://basile-de-sousa.github.io/buzzwords';

const DEFAULT_TARGETS = ['08:00', '13:00', '19:00'];

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

/** Uniformly random fiche among `fiches` (AC2). `random` is injectable for tests. */
export function pickRandomFiche(fiches, random = Math.random) {
  return fiches[Math.floor(random() * fiches.length)];
}

/** Notification title: term, plus its acronym in parentheses when present (AC3). */
export function buildTitle(fiche) {
  return fiche.acronym ? `${fiche.term} (${fiche.acronym})` : fiche.term;
}

/** First "- " (or "* ") bullet line of a fiche body, raw Markdown, or '' if none. */
export function firstBullet(body) {
  const line = body.split('\n').find((l) => /^\s*[-*]\s+/.test(l));
  return line ? line.replace(/^\s*[-*]\s+/, '').trim() : '';
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

/** Notification message: the fiche's first explanation bullet, as plain text (AC3). */
export function buildMessage(fiche) {
  return stripMarkdown(firstBullet(fiche.body));
}

/** Click-through URL to the fiche's page on the published site (AC4). */
export function buildFicheUrl(fiche, baseUrl) {
  return `${baseUrl.replace(/\/$/, '')}/${fiche.slug}/`;
}

/**
 * Decides whether to send, and sends, one ntfy notification for a uniformly
 * random fiche (AC1-AC4). Ends successfully without sending outside a target
 * local time or when `fiches` is empty; throws a descriptive error when
 * `topic` is missing or ntfy rejects the request (AC5).
 * @returns {Promise<{ sent: boolean, reason?: string, fiche?: object, title?: string, message?: string, url?: string }>}
 */
export async function notify({
  fiches,
  now = new Date(),
  topic,
  baseUrl = SITE_BASE_URL,
  timeZone,
  targets,
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

  const fiche = pickRandomFiche(fiches, random);
  const title = buildTitle(fiche);
  const message = buildMessage(fiche);
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

  return { sent: true, fiche, title, message, url };
}

async function main(srcDir = 'buzzwords') {
  const fiches = loadFiches(srcDir);
  const result = await notify({ fiches, topic: process.env.NTFY_TOPIC });
  if (!result.sent) {
    console.log(`No notification sent: ${result.reason}`);
    return;
  }
  console.log(`Sent notification for "${result.title}" -> ${result.url}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [srcDir = 'buzzwords'] = process.argv.slice(2);
  main(srcDir).catch((err) => {
    console.error(`notify failed: ${err.message}`);
    process.exitCode = 1;
  });
}
