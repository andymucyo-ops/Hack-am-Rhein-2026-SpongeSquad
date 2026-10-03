// Runs every module's own checks plus the website link check.
//   npm test   (expects a built dist/ for the link check; run npm run build first)
import { existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const node = process.execPath;
const [major, minor] = process.versions.node.split('.').map(Number);
// Street Lab's own script uses --test-isolation=none (Node ≥ 23.6). Older Node 22 names it --experimental-test-isolation.
const isolation = major > 23 || (major === 23 && minor >= 6) ? '--test-isolation=none' : '--experimental-test-isolation=none';
const checks = [
  ['Evidence atlas validation', node, ['scripts/validate-atlas.mjs'], 'wrapper/evidence-atlas'],
  ['Evidence solutions smoke', node, ['scripts/check.mjs'], 'wrapper/evidence-atlas'],
  ['Facts catalogue', node, ['scripts/facts-doc.mjs', '--check'], 'wrapper/evidence-atlas'],
  ['Adaptive preview tests', node, ['--test','tests/adaptive-interface.test.mjs','tests/state-engine.test.mjs'], 'wrapper/experiments/adaptive-interface'],
  ['Street Lab model and Rain Walk tests', node, ['--experimental-strip-types', '--no-warnings', '--test', isolation, ...readdirSync(join(root, 'wrapper/street-workspace/test')).filter((f) => f.endsWith('.test.ts')).map((f) => `test/${f}`)], 'wrapper/street-workspace'],
  ['Street Lab type-check', node, ['node_modules/typescript/bin/tsc', '--noEmit'], 'wrapper/street-workspace'],
  ['Site scoping type-check', node, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json', '--noEmit', '--incremental', 'false'], 'basel-site-scoping-tool'],
  ['Data Charter build', node, ['scripts/build.mjs'], 'wrapper/data-charter-map'],
  ['Data Charter smoke test', node, ['scripts/smoke.mjs'], 'wrapper/data-charter-map'],
  ['Sponge catalogue validation', node, ['scripts/build-doc.mjs', '--check'], 'wrapper/sponge-catalogue'],
  ['Street X-Ray smoke test', node, ['smoke.mjs'], 'wrapper/street-xray'],
  ['Street X-Ray engine profile check', node, ['scripts/build-profile.mjs', '--check'], 'wrapper/street-xray/engine'],
  ['Street X-Ray engine tests', node, ['--test', 'test/profile.test.mjs'], 'wrapper/street-xray/engine'],
  ['Sponge Street prototype smoke test', node, ['smoke.mjs'], 'wrapper/prototypes/sponge-street'],
  ['Candidate → Street Lab adapter contract', node, ['--experimental-strip-types', '--no-warnings', 'scripts/test-adapter.mjs'], '.'],
  ['Website link check', node, ['scripts/check-site.mjs'], '.'],
];
const failed = [];
for (const [label, cmd, args, cwd] of checks) {
  if (label === 'Website link check' && !existsSync(join(root, 'dist/index.html'))) { failed.push(`${label} (no dist/, run npm run build)`); continue; }
  console.log(`\n▸ ${label}`);
  const r = spawnSync(cmd, args, { cwd: join(root, cwd), stdio: 'inherit' });
  if (r.status !== 0) failed.push(label);
}
console.log(failed.length ? `\nFailed: ${failed.join(', ')}` : '\nAll checks passed.');
process.exit(failed.length ? 1 : 0);
