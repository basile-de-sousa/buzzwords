// Static site builder for the buzzword catalog (SPEC-001).
// Usage: node scripts/build.mjs [srcDir=buzzwords] [outDir=_site]
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadFiches, relationResolver } from './lib/fiches.mjs';
import { renderFiche, renderHome, STYLESHEET } from './lib/render.mjs';

export { loadFiches } from './lib/fiches.mjs';

// Refuse to wipe a folder that contains the sources or the working directory.
function assertSafeOutDir(srcDir, outDir) {
  const out = resolve(outDir);
  for (const guarded of [resolve(srcDir), process.cwd()]) {
    const rel = relative(out, guarded);
    if (rel === '' || (!rel.startsWith('..') && !isAbsolute(rel))) {
      throw new Error(`Refusing to use output folder "${outDir}": it contains "${guarded}"`);
    }
  }
}

/**
 * Build the site from the fiches of `srcDir` into `outDir` (recreated from scratch).
 * Validation runs before anything is written, so an invalid fiche leaves no partial site.
 * @returns {Promise<{ fiches: object[] }>} the parsed fiches, sorted by term
 */
export async function build({ srcDir = 'buzzwords', outDir = '_site' } = {}) {
  const fiches = loadFiches(srcDir);
  const resolveRelation = relationResolver(fiches);

  assertSafeOutDir(srcDir, outDir);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  writeFileSync(join(outDir, 'index.html'), renderHome(fiches));
  writeFileSync(join(outDir, 'style.css'), STYLESHEET);
  writeFileSync(join(outDir, '.nojekyll'), '');
  for (const fiche of fiches) {
    mkdirSync(join(outDir, fiche.slug), { recursive: true });
    writeFileSync(join(outDir, fiche.slug, 'index.html'), renderFiche(fiche, resolveRelation));
  }
  return { fiches };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [srcDir = 'buzzwords', outDir = '_site'] = process.argv.slice(2);
  build({ srcDir, outDir }).then(
    ({ fiches }) => console.log(`Built ${fiches.length} fiche(s) from ${srcDir}/ into ${outDir}/`),
    (err) => {
      console.error(`Build failed: ${err.message}`);
      process.exitCode = 1;
    },
  );
}
