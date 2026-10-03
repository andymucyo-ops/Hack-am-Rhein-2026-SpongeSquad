// Builds the whole SpongeSquad website into dist/ as one static folder.
//
//   node scripts/build-integration.mjs            build every module, then the shell
//   node scripts/build-integration.mjs --shell-only   rebuild shell pages and docs, keep built modules
//
// Modules, stages and workstreams are configured in integration/routes.json.
// Every URL in the output is relative, so dist/ can be served from any subpath.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { spawnSync, execFileSync } from 'node:child_process';
import { dirname, join, posix, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { renderMarkdown, firstHeading, extractSection } from './lib/markdown.mjs';
import { parseCatalog } from './lib/catalog.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const shellOnly = process.argv.includes('--shell-only');
const routes = JSON.parse(readFileSync(join(root, 'integration/routes.json'), 'utf8'));

// Where "view source" links point. Update when the work lands on another branch.
const GROUP_REPO = 'https://github.com/andymucyo-ops/Hack-am-Rhein-2026-SpongeSquad';
const GROUP_BRANCH = 'main';
const repoPath = p => p.startsWith('wrapper/') ? p : 'wrapper/site/' + p;
const SOURCE_REPO = 'https://github.com/blackmath88/the-spongesuad-hackamrhein';
const SOURCE_COMMIT = '51273960e54f730328383931665f2d95da33107c';

const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const read = (p) => readFileSync(join(root, p), 'utf8');
const write = (p, content) => { mkdirSync(dirname(join(dist, p)), { recursive: true }); writeFileSync(join(dist, p), content); };
function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.status !== 0) {
    console.error(`\nFailed: ${command} ${args.join(' ')} (in ${relative(root, options.cwd || root) || '.'})`);
    process.exit(result.status ?? 1);
  }
}

// ---------------------------------------------------------------- modules
function buildModules() {
  for (const mod of routes.modules) {
    const source = join(root, mod.source);
    const output = join(dist, mod.output);
    console.log(`\n▸ ${mod.id}: ${mod.source} → dist/${mod.output}/`);
    if (mod.build === 'vite') {
      const bin = (pkg, file) => join(source, 'node_modules', pkg, file);
      if (!existsSync(bin('vite', 'bin/vite.js'))) {
        console.error(`Dependencies missing in ${mod.source}. Run: npm run setup`);
        process.exit(1);
      }
      const env = { ...process.env, ...(mod.env || {}) };
      if (mod.typecheck) run(process.execPath, [bin('typescript', 'bin/tsc'), '--noEmit'], { cwd: source, env });
      const flags = mod.treeshake === false ? ['--no-treeshake'] : [];
      run(process.execPath, [join(root, 'scripts/lib/vite-build.mjs'), output, ...flags], { cwd: source, env });
    } else if (mod.build === 'script') {
      run(process.execPath, [mod.script], { cwd: source });
      rmSync(output, { recursive: true, force: true });
      cpSync(join(source, mod.dist), output, { recursive: true });
    } else if (mod.build === 'copy') {
      rmSync(output, { recursive: true, force: true });
      mkdirSync(output, { recursive: true });
      for (const file of mod.files) cpSync(join(source, file), join(output, file), { recursive: true });
    } else {
      throw new Error(`Unknown build type for ${mod.id}`);
    }
  }
}

// ---------------------------------------------------------------- candidates (Andy's fixture, read-only)
function exportCandidates() {
  const fixture = 'basel-site-scoping-tool/src/data/areas.ts';
  const script = `const m = await import(${JSON.stringify(pathToFileURL(join(root, fixture)).href)});
    const pick = (a) => ({ id: a.id, name: a.name, district: a.district, coordinates: a.coordinates,
      indicators: { sources: a.indicators.sources, missingData: a.indicators.missingData, evidenceQuality: a.indicators.evidenceQuality },
      problematics: a.problematics, profile: a.profile, prototypePotential: a.prototypePotential, prototypeStory: a.prototypeStory,
      directions: a.directions, constraints: a.constraints });
    const named = new Set(m.areas.map((a) => a.id));
    process.stdout.write(JSON.stringify({ areas: m.areas.map(pick), explorationPins: m.explorationAreas.filter((a) => !named.has(a.id)).map(pick) }));`;
  const out = execFileSync(process.execPath, ['--experimental-strip-types', '--no-warnings', '--input-type=module', '-e', script], { cwd: root, encoding: 'utf8' });
  const data = JSON.parse(out);
  data.provenance = {
    source: fixture,
    classification: 'illustrative',
    note: "Read at build time from Andy's site-scoping fixture without modifying it. Locations and values are placeholders for discussion, not spatial analysis.",
  };
  write('assets/candidates.json', JSON.stringify(data, null, 1));
  console.log(`▸ candidates: ${data.areas.length} discussion areas, ${data.explorationPins.length} exploration pins`);
}

// ---------------------------------------------------------------- documents
const IMPORTED = {
  'research/source-repo/docs/': 'docs/',
  'research/source-repo/resources/': 'resources/',
  'team/observatory/source/OBSERVATORY_README.md': 'observatory/README.md',
  'team/observatory/source/DAY_PLAN.md': 'observatory/DAY_PLAN.md',
  'team/observatory/source/TASK_PLANNER.md': 'observatory/TASK_PLANNER.md',
  'team/observatory/data/weekend.json': 'observatory/data/weekend.json',
};
function sourceRepoPath(path) {
  for (const [dest, src] of Object.entries(IMPORTED)) {
    if (path === dest) return src;
    if (dest.endsWith('/') && path.startsWith(dest)) return src + path.slice(dest.length);
  }
  return null;
}

// slug, repo path, section (research|team), group (for listing)
const DOCS = [
  ['data-charter', 'wrapper/data-charter-map/docs/DATA-CHARTER.md', 'research', 'team'],
  ['gatekeepers', 'wrapper/data-charter-map/docs/GATEKEEPERS.md', 'research', 'team'],
  ['data-sources', 'wrapper/data-charter-map/docs/DATA-SOURCES.md', 'research', 'team'],
  ['gap-filling', 'wrapper/data-charter-map/docs/GAP-FILLING.md', 'research', 'team'],
  ['sponge-catalogue', 'wrapper/sponge-catalogue/docs/CATALOGUE.md', 'research', 'team'],
  ['data-gap-to-decision', 'wrapper/docs/TODO-DATA-GAP-TO-DECISION.md', 'research', 'todo'],
  ['library-index', 'research/source-repo/docs/README.md', 'research', 'library'],
  ['research-method', 'research/source-repo/docs/RESEARCH_METHOD.md', 'research', 'library'],
  ['data-and-sources', 'research/source-repo/docs/DATA_AND_SOURCES.md', 'research', 'library'],
  ['research-backlog', 'research/source-repo/docs/RESEARCH_BACKLOG.md', 'research', 'library'],
  ['challenge-landscape', 'research/source-repo/docs/CHALLENGE_LANDSCAPE.md', 'research', 'background'],
  ['technical-patterns', 'research/source-repo/docs/TECHNICAL_PATTERNS.md', 'research', 'background'],
  ['migration', 'research/MIGRATION.md', 'research', 'provenance'],
  ['product-vision', 'wrapper/docs/PRODUCT_VISION.md', 'team', 'architecture'],
  ['mvp', 'wrapper/docs/MVP.md', 'team', 'architecture'],
  ['architecture', 'wrapper/docs/ARCHITECTURE.md', 'team', 'architecture'],
  ['adr', 'wrapper/docs/adr/README.md', 'team', 'architecture'],
  ...readdirSync(join(root, 'wrapper/docs/adr')).filter((f) => /^\d{4}-.*\.md$/.test(f)).sort()
    .map((f) => [`adr-${f.slice(0, 4)}`, `wrapper/docs/adr/${f}`, 'team', 'adr']),
  ['workstreams', 'WORKSTREAMS.md', 'team', 'planning'],
  ['contributing', 'README.md', 'team', 'planning'],
  ['day-plan', 'team/observatory/source/DAY_PLAN.md', 'team', 'source-planning'],
  ['task-planner', 'team/observatory/source/TASK_PLANNER.md', 'team', 'source-planning'],
  ['observatory', 'team/observatory/source/OBSERVATORY_README.md', 'team', 'source-planning'],
].map(([slug, path, section, group]) => ({ slug, path, section, group, title: firstHeading(read(path)) || slug }));

const docByPath = new Map(DOCS.map((d) => [d.path, d]));
// Non-document targets that have a page on the site.
const PAGE_TARGETS = {
  'research/source-repo/resources/catalog.yml': 'research/#catalogue',
  'wrapper/street-workspace/README.md': 'lab/',
  'basel-site-scoping-tool/README.md': 'find/',
};

function linkResolver(fromPath, rootPrefix) {
  return (href) => {
    if (/^(https?:|mailto:|#)/i.test(href)) return href;
    const [pathPart, anchor = ''] = href.split('#');
    const target = posix.normalize(posix.join(posix.dirname(fromPath), pathPart)).replace(/\/$/, '');
    const hash = anchor ? `#${anchor}` : '';
    const doc = docByPath.get(target) || docByPath.get(`${target}/README.md`);
    if (doc) return `${rootPrefix}${doc.section}/${doc.slug}/${hash}`;
    if (PAGE_TARGETS[target]) return rootPrefix + PAGE_TARGETS[target];
    const imported = sourceRepoPath(target);
    if (!existsSync(join(root, target)) && imported === null && target.startsWith('..')) return href;
    const kind = existsSync(join(root, target)) && statSync(join(root, target)).isDirectory() ? 'tree' : 'blob';
    return `${GROUP_REPO}/${kind}/${GROUP_BRANCH}/${repoPath(target)}${hash}`;
  };
}

function page({ title, rootPrefix, section, description = '', body, scripts = [] }) {
  return `<!doctype html>
<html lang="en" data-root="${rootPrefix}" data-section="${section}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="${escapeHtml(description)}" />
  <title>${escapeHtml(title)} · SpongeSquad</title>
  <link rel="stylesheet" href="${rootPrefix}assets/site.css" />
  <script src="${rootPrefix}assets/routes.js" defer></script>
  <script src="${rootPrefix}assets/site.js" defer></script>
${scripts.map((s) => `  <script src="${rootPrefix}${s}" defer></script>`).join('\n')}
</head>
<body>
  <div id="site-header"></div>
  <main id="main">
${body}
  </main>
  <div id="site-footer"></div>
</body>
</html>
`;
}

function renderDocs() {
  for (const doc of DOCS) {
    const rootPrefix = '../../';
    const source = read(doc.path);
    const html = renderMarkdown(source, { link: linkResolver(doc.path, rootPrefix) });
    const imported = sourceRepoPath(doc.path);
    const origin = imported
      ? `<p><span class="label source">Imported</span></p><p>From <a href="${SOURCE_REPO}/blob/${SOURCE_COMMIT}/${imported}" rel="noreferrer">${escapeHtml(imported)}</a> in the team's separate research repository, commit <code>${SOURCE_COMMIT.slice(0, 7)}</code>, copied verbatim. Status labels such as VERIFIED and VERIFY are the original authors'.</p><p><a href="${rootPrefix}research/migration/">Migration manifest</a></p>`
      : `<p><span class="label neutral">Group repository</span></p><p>Rendered from <a href="${GROUP_REPO}/blob/${GROUP_BRANCH}/${repoPath(doc.path)}" rel="noreferrer">${escapeHtml(doc.path)}</a>.</p>`;
    const back = doc.section === 'team' ? `<a href="${rootPrefix}team/">← Team</a>` : `<a href="${rootPrefix}research/">← Sources &amp; Research</a>`;
    const body = `    <div class="wrap section plain">
      <div class="doc-layout">
        <article class="content">${html}</article>
        <aside class="doc-meta panel">
          <p class="eyebrow">Document</p>
          ${origin}
          <p class="tiny">This page is a rendering of a Markdown file. Edit the file, not the page.</p>
          <p>${back}</p>
        </aside>
      </div>
    </div>`;
    write(`${doc.section}/${doc.slug}/index.html`, page({ title: doc.title, rootPrefix, section: doc.section, body }));
  }
  console.log(`▸ documents: ${DOCS.length} pages`);
}

// ---------------------------------------------------------------- build-time includes for shell pages
const CATALOG_STATUS = {
  verified: ['source', 'Verified'],
  verified_source_not_basel_rule: ['illustrative', 'Verified source · not a Basel rule'],
  verify_license_and_quality: ['missing', 'Verify licence and quality'],
  verify_fit: ['missing', 'Verify fit'],
  known_reference: ['neutral', 'Known reference'],
};
const SPONGE_IDS = ['basel-sponge-example', 'bafu-sponge', 'bern-sponge-trees', 'zurich-sponge', 'lucerne-sponge', 'basel-open-data', 'opendatabs-github', 'swiss-stac'];

function catalogTable(entries) {
  return `<div class="table-wrap"><table><thead><tr><th>Resource</th><th>Kind</th><th>Status</th><th>Tags</th></tr></thead><tbody>${entries.map((r) => {
    const [cls, label] = CATALOG_STATUS[r.status] || ['neutral', r.status];
    return `<tr><td><a href="${escapeHtml(r.url)}" rel="noreferrer">${escapeHtml(r.title)}</a></td><td>${escapeHtml(String(r.kind).replace(/_/g, ' '))}</td><td><span class="label ${cls}">${escapeHtml(label)}</span></td><td class="tiny">${escapeHtml((r.tags || []).join(', '))}</td></tr>`;
  }).join('')}</tbody></table></div>`;
}

function docList(group, rootPrefix) {
  const docs = DOCS.filter((d) => d.group === group);
  return `<ul class="doc-list">${docs.map((d) => `<li><a href="${rootPrefix}${d.section}/${d.slug}/">${escapeHtml(d.title)}</a> <span class="tiny">${escapeHtml(d.path)}</span></li>`).join('')}</ul>`;
}

function expandIncludes(html, fromPath, rootPrefix) {
  const catalog = parseCatalog(read('research/source-repo/resources/catalog.yml'));
  return html.replace(/<!--@(\w+):?([^>]*?)-->/g, (_, kind, arg) => {
    if (kind === 'catalog') {
      const sponge = catalog.resources.filter((r) => SPONGE_IDS.includes(r.id));
      return catalogTable(arg.trim() === 'sponge' ? sponge : catalog.resources.filter((r) => !SPONGE_IDS.includes(r.id)));
    }
    if (kind === 'docs') return docList(arg.trim(), rootPrefix);
    if (kind === 'baseltoday' || kind === 'levers') {
      const cat = JSON.parse(read('wrapper/sponge-catalogue/data/catalogue.json'));
      const src = (ids = []) => ids.map((id) => `<a href="${escapeHtml(cat.sources[id].url)}" rel="noreferrer" title="${escapeHtml(cat.sources[id].label)}">source</a>`).join(', ');
      if (kind === 'levers') {
        return `<div class="grid-3">${cat.levers.map((l) => `<article class="panel"><span class="label illustrative">Team proposal</span><h3 style="margin-top:10px">${escapeHtml(l.name)}</h3><p class="small">${escapeHtml(l.text)}</p></article>`).join('')}</div>`;
      }
      const statusClass = { 'in-force': 'source', done: 'works', 'in-progress': 'works', announced: 'illustrative', 'none-found': 'missing' };
      const statusLabel = { 'in-force': 'In force', done: 'Done', 'in-progress': 'In progress', announced: 'Announced', 'none-found': 'Nothing found' };
      const owners = (o) => o.map((x) => ({ allmend: 'street space', private: 'private', 'public-building': 'public buildings' })[x] || x).join(', ');
      return `<div class="table-wrap"><table><thead><tr><th>Action</th><th>Ground</th><th>Basel today</th></tr></thead><tbody>${cat.actions.map((a) => `<tr><td><b>${escapeHtml(a.name)}</b></td><td class="tiny">${escapeHtml(owners(a.owner))}</td><td>${a.basel.map((b) => `<div style="margin-bottom:6px"><span class="label ${statusClass[b.status] || 'neutral'}">${escapeHtml(statusLabel[b.status] || b.status)}</span> ${escapeHtml(b.text)} ${src(b.sources)}</div>`).join('')}</td></tr>`).join('')}</tbody></table></div><p class="tiny" style="margin-top:10px">Source data: <code>wrapper/sponge-catalogue/data/catalogue.json</code>. <a href="${rootPrefix}research/sponge-catalogue/">Full catalogue with potential and evidence classes</a>.</p>`;
    }
    if (kind === 'md') {
      const [path, heading] = arg.trim().split('#');
      const md = heading ? extractSection(read(path), heading.replace(/_/g, ' ')) : read(path);
      return renderMarkdown(md.replace(/^#{1,6} .*\n/, ''), { link: linkResolver(path, rootPrefix) });
    }
    throw new Error(`Unknown include ${kind} in ${fromPath}`);
  });
}

// ---------------------------------------------------------------- shell
function copyShell() {
  const shell = join(root, 'integration');
  const skip = new Set(['README.md', 'routes.json']);
  const walk = (dir) => {
    for (const name of readdirSync(join(shell, dir))) {
      const rel = dir ? `${dir}/${name}` : name;
      if (skip.has(rel)) continue;
      if (statSync(join(shell, rel)).isDirectory()) { walk(rel); continue; }
      if (rel.endsWith('.html')) {
        const depth = rel.split('/').length - 1;
        const rootPrefix = depth ? '../'.repeat(depth) : './';
        write(rel, expandIncludes(read(`integration/${rel}`), `integration/${rel}`, rootPrefix));
      } else {
        write(rel, readFileSync(join(shell, rel)));
      }
    }
  };
  walk('');
  write('assets/routes.js', `/* Generated from integration/routes.json by scripts/build-integration.mjs. Do not edit. */\nwindow.SPONGE_ROUTES = ${JSON.stringify(routes, null, 1)};\n`);

  // Workstream template pages live in their own folders so owners can replace them.
  const moduleSources = new Set(routes.modules.map((m) => `${m.source}/`));
  for (const ws of routes.workstreams) {
    if (ws.page !== ws.folder || moduleSources.has(ws.folder)) continue;
    const file = `${ws.folder}index.html`;
    if (!existsSync(join(root, file))) throw new Error(`Workstream page missing: ${file}`);
    const depth = ws.folder.split('/').filter(Boolean).length;
    write(file, expandIncludes(read(file), file, '../'.repeat(depth)));
  }
  cpSync(join(root, 'team/observatory/data/weekend.json'), join(dist, 'team/weekend.json'));
}

function buildInfo() {
  let commit = 'unknown';
  try { commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(); } catch { /* not a git checkout */ }
  write('assets/build-info.json', JSON.stringify({ builtAt: new Date().toISOString(), commit }, null, 1));
}

if (!shellOnly) {
  rmSync(dist, { recursive: true, force: true });
  buildModules();
} else {
  const missing = routes.modules.filter((m) => !existsSync(join(dist, m.output, 'index.html')));
  if (missing.length) {
    console.error(`Modules not built yet: ${missing.map((m) => m.id).join(', ')}. Run npm run build first.`);
    process.exit(1);
  }
}
copyShell();
exportCandidates();
renderDocs();
buildInfo();
console.log(`\nWebsite built: ${relative(process.cwd(), dist) || 'dist'}/index.html`);
