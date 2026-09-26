// Load, validate and index buzzword fiches (`buzzwords/<slug>.md`).
// The parsed list is the single input of every page renderer, so later
// features (search index, tag filter) can reuse `loadFiches` as is.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { load as parseYaml } from 'js-yaml';
import { marked } from 'marked';

/** Relation operators, in display order. */
export const RELATIONS = [
  { key: 'in', symbol: '<', label: 'Fait partie de' },
  { key: 'contains', symbol: '>', label: 'Contient' },
  { key: 'near', symbol: '&', label: 'Proche de' },
  { key: 'same', symbol: '=', label: 'Équivalent à' },
  { key: 'not', symbol: '≠', label: 'À ne pas confondre avec' },
];

const REQUIRED = ['term', 'slug', 'created', 'updated'];
const FRONTMATTER = /^﻿?---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)([\s\S]*)$/;

export class FicheError extends Error {
  constructor(file, message) {
    super(`${file}: ${message}`);
    this.name = 'FicheError';
    this.file = file;
  }
}

function toText(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function toList(value) {
  if (value === undefined || value === null) return [];
  const list = Array.isArray(value) ? value : [value];
  return list.map(toText).filter(Boolean);
}

/**
 * Parse one fiche file. Throws a FicheError naming the file when it is invalid.
 * @param {string} path absolute or relative path to `<slug>.md`
 */
export function parseFiche(path) {
  const file = basename(path);
  const source = readFileSync(path, 'utf8');
  const match = source.match(FRONTMATTER);
  if (!match) throw new FicheError(file, 'missing YAML frontmatter');

  let data;
  try {
    data = parseYaml(match[1]) ?? {};
  } catch (err) {
    throw new FicheError(file, `invalid YAML frontmatter (${err.message})`);
  }
  if (typeof data !== 'object' || Array.isArray(data)) {
    throw new FicheError(file, 'frontmatter must be a YAML mapping');
  }

  const missing = REQUIRED.filter((key) => !toText(data[key]));
  if (missing.length) throw new FicheError(file, `missing required field(s): ${missing.join(', ')}`);

  const slug = toText(data.slug);
  const expected = file.replace(/\.md$/, '');
  if (slug !== expected) throw new FicheError(file, `slug "${slug}" differs from file name "${expected}"`);

  const rawRelations = data.relations && typeof data.relations === 'object' ? data.relations : {};
  const relations = Object.fromEntries(RELATIONS.map(({ key }) => [key, toList(rawRelations[key])]));

  const body = match[2].trim();
  return {
    file,
    slug,
    term: toText(data.term),
    acronym: toText(data.acronym),
    aliases: toList(data.aliases),
    tags: toList(data.tags),
    relations,
    created: toText(data.created),
    updated: toText(data.updated),
    body,
    bodyHtml: marked.parse(body),
  };
}

/** Sort fiches alphabetically by term (French collation, case and accents ignored). */
export function sortByTerm(fiches) {
  return [...fiches].sort(
    (a, b) => a.term.localeCompare(b.term, 'fr', { sensitivity: 'base' }) || a.slug.localeCompare(b.slug),
  );
}

/**
 * Load every `*.md` fiche of `srcDir`, sorted by term. A missing folder yields an empty list.
 * @param {string} srcDir
 */
export function loadFiches(srcDir) {
  if (!existsSync(srcDir)) return [];
  const files = readdirSync(srcDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name)
    .sort();
  return sortByTerm(files.map((name) => parseFiche(join(srcDir, name))));
}

const key = (name) => name.trim().toLocaleLowerCase('fr');

/**
 * Build a resolver that maps a relation name to the fiche it refers to, matching
 * term, acronym or alias case-insensitively. Another fiche is preferred over
 * `from` itself, which is returned only when it is the sole match.
 * @returns {(name: string, from?: object) => object | null}
 */
export function relationResolver(fiches) {
  const index = new Map();
  for (const fiche of fiches) {
    for (const name of [fiche.term, fiche.acronym, ...fiche.aliases].filter(Boolean)) {
      const k = key(name);
      if (!index.has(k)) index.set(k, []);
      if (!index.get(k).includes(fiche)) index.get(k).push(fiche);
    }
  }
  return (name, from) => {
    const matches = index.get(key(name)) ?? [];
    return matches.find((fiche) => fiche !== from) ?? matches[0] ?? null;
  };
}

// Inverse of each relation operator (SPEC-003 AC1): `<` and `>` swap, the rest are symmetric.
const INVERSE_RELATION = { in: 'contains', contains: 'in', near: 'near', same: 'same', not: 'not' };

const backlinkLabel = (fiche) => fiche.acronym || fiche.term;

/**
 * Build a resolver for the fiches citing another one ("Cité par", SPEC-003): for a
 * fiche B, returns the fiches whose relations resolve to B, grouped by the inverse
 * operator (AC1), a fiche B already relates to itself left out (AC2), sorted like
 * "Buzzwords liés" (RELATIONS order, then alphabetically by label, AC3). Groups with
 * no entry are left out (AC4). Computed in memory only, from the already loaded
 * fiches; no fiche file is read or written again (AC5).
 * @returns {(fiche: object) => Record<string, object[]>}
 */
export function backlinkResolver(fiches, resolveRelation) {
  const citersByTargetAndKey = new Map(
    fiches.map((fiche) => [fiche.slug, Object.fromEntries(RELATIONS.map(({ key }) => [key, new Map()]))]),
  );
  const ownTargets = new Map(fiches.map((fiche) => [fiche.slug, new Set()]));

  for (const fiche of fiches) {
    for (const { key } of RELATIONS) {
      for (const name of fiche.relations[key]) {
        const target = resolveRelation(name, fiche);
        if (!target || target === fiche) continue;
        ownTargets.get(fiche.slug).add(target.slug);
        citersByTargetAndKey.get(target.slug)[INVERSE_RELATION[key]].set(fiche.slug, fiche);
      }
    }
  }

  return (fiche) => {
    const alreadyRelated = ownTargets.get(fiche.slug) ?? new Set();
    const groupsByKey = citersByTargetAndKey.get(fiche.slug) ?? {};
    const result = {};
    for (const { key } of RELATIONS) {
      const citers = [...groupsByKey[key].values()].filter((citer) => !alreadyRelated.has(citer.slug));
      if (!citers.length) continue;
      result[key] = citers.sort(
        (a, b) =>
          backlinkLabel(a).localeCompare(backlinkLabel(b), 'fr', { sensitivity: 'base' }) ||
          a.slug.localeCompare(b.slug),
      );
    }
    return result;
  };
}

export { backlinkLabel };
