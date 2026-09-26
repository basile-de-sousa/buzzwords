// Build-time search index for the home page (SPEC-002).
// Each entry holds the searchable fields of one fiche; the body is kept as
// plain text (Markdown and HTML stripped) so markup and link URLs never match.

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

/** Visible text of an HTML fragment: tags removed, entities decoded, whitespace collapsed. */
export function plainText(html) {
  return String(html)
    .replace(/<\/?(?:p|br|li|ul|ol|h[1-6]|div|pre|blockquote|table|tr|td|th|hr)\b[^>]*>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, name) => {
      if (name[0] === '#') {
        const code = name[1] === 'x' || name[1] === 'X' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : entity;
      }
      return ENTITIES[name.toLowerCase()] ?? entity;
    })
    .replace(/\s+/g, ' ')
    .trim();
}

/** One entry per fiche, in the given order. */
export function buildSearchIndex(fiches) {
  return fiches.map((fiche) => ({
    slug: fiche.slug,
    term: fiche.term,
    acronym: fiche.acronym,
    aliases: fiche.aliases,
    tags: fiche.tags,
    text: plainText(fiche.bodyHtml),
  }));
}

/** JSON safe to embed in a `<script type="application/json">` element. */
export function serializeIndex(index) {
  return JSON.stringify(index).replace(/</g, '\\u003c');
}
