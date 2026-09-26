// HTML templates for the catalog. All links are relative so the site works
// under the GitHub Pages project path (`/buzzwords/`) as well as at a root.
import { RELATIONS } from './fiches.mjs';

export const SITE_TITLE = 'Buzzwords';

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function layout({ title, root, main }) {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" href="${root}style.css">
</head>
<body>
<header class="site-header"><a class="site-title" href="${root || './'}">${SITE_TITLE}</a></header>
<main>
${main}
</main>
</body>
</html>
`;
}

const acronymHtml = (fiche) => (fiche.acronym ? ` <abbr class="acronym">${escapeHtml(fiche.acronym)}</abbr>` : '');

/** Home page: every fiche, already sorted by term. */
export function renderHome(fiches) {
  const count = fiches.length;
  const list = count
    ? `<ul class="fiche-list">
${fiches.map((f) => `<li><a href="./${f.slug}/">${escapeHtml(f.term)}</a>${acronymHtml(f)}</li>`).join('\n')}
</ul>`
    : '<p class="empty">Aucune fiche pour l’instant.</p>';
  return layout({
    title: SITE_TITLE,
    root: './',
    main: `<h1>${SITE_TITLE}</h1>
<p class="lead">Glossaire personnel de stratégie IT et d’architecture SI — ${count} fiche${count > 1 ? 's' : ''}.</p>
${list}`,
  });
}

function renderRelation(name, fiche, resolve) {
  const target = resolve(name, fiche);
  if (target && target !== fiche) {
    return `<li><a href="../${target.slug}/">${escapeHtml(name)}</a></li>`;
  }
  if (target === fiche) return `<li><span class="self">${escapeHtml(name)}</span></li>`;
  return `<li><span class="missing">${escapeHtml(name)}</span> <small class="no-fiche">(pas encore de fiche)</small></li>`;
}

function renderRelations(fiche, resolve) {
  const groups = RELATIONS.filter(({ key }) => fiche.relations[key].length).map(
    ({ key, symbol, label }) => `<section class="relation-group" data-relation="${key}">
<h3><span class="op">${escapeHtml(symbol)}</span> ${escapeHtml(label)}</h3>
<ul>
${fiche.relations[key].map((name) => renderRelation(name, fiche, resolve)).join('\n')}
</ul>
</section>`,
  );
  if (!groups.length) return '';
  return `<div class="relations">
<h2>Buzzwords liés</h2>
${groups.join('\n')}
</div>`;
}

/** One fiche page, served at `<slug>/`. */
export function renderFiche(fiche, resolve) {
  const aliases = fiche.aliases.length
    ? `<p class="aliases">Aussi appelé : ${fiche.aliases.map(escapeHtml).join(', ')}</p>`
    : '';
  const tags = fiche.tags.length
    ? `<ul class="tags">${fiche.tags.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`
    : '';
  return layout({
    title: `${fiche.term}${fiche.acronym ? ` (${fiche.acronym})` : ''} · ${SITE_TITLE}`,
    root: '../',
    main: `<p class="back"><a href="../">← Tous les buzzwords</a></p>
<article class="fiche">
<h1>${escapeHtml(fiche.term)}${acronymHtml(fiche)}</h1>
${aliases}
${tags}
<div class="body">
${fiche.bodyHtml}
</div>
${renderRelations(fiche, resolve)}
<p class="dates">Créée le ${escapeHtml(fiche.created)} · mise à jour le ${escapeHtml(fiche.updated)}</p>
</article>`,
  });
}

export const STYLESHEET = `:root {
  color-scheme: light dark;
  --bg: #fdfdfc;
  --fg: #1d1d1f;
  --muted: #6b6b70;
  --accent: #0b5cad;
  --border: #e2e2e5;
  --chip: #f0f0f3;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #161618;
    --fg: #ececf0;
    --muted: #a0a0a8;
    --accent: #6fb1ff;
    --border: #2e2e33;
    --chip: #26262b;
  }
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--fg);
  font: 17px/1.55 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
main, .site-header { max-width: 42rem; margin: 0 auto; padding: 0 16px; }
.site-header { padding-top: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
.site-title { font-weight: 700; color: var(--fg); text-decoration: none; }
a { color: var(--accent); }
h1 { font-size: 1.7rem; line-height: 1.2; margin: 1.2rem 0 0.4rem; }
h2 { font-size: 1.15rem; margin-top: 2rem; }
h3 { font-size: 1rem; margin: 1rem 0 0.3rem; }
.lead, .aliases, .dates, .back, .no-fiche { color: var(--muted); }
.dates { font-size: 0.85rem; margin-top: 2rem; }
.acronym { font-size: 0.8em; font-weight: 600; color: var(--muted); text-decoration: none; }
.fiche-list { list-style: none; padding: 0; }
.fiche-list li { padding: 10px 0; border-bottom: 1px solid var(--border); }
.fiche-list a { font-weight: 600; text-decoration: none; }
.tags { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
.tags li { background: var(--chip); border-radius: 999px; padding: 2px 10px; font-size: 0.85rem; }
.op { display: inline-block; min-width: 1.6em; text-align: center; font-family: ui-monospace, monospace; }
.relation-group ul { margin: 0; padding-left: 2rem; }
.body { overflow-wrap: anywhere; }
.body pre { overflow-x: auto; }
`;
