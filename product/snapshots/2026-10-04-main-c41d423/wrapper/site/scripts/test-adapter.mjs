// Contract test: every site-scoping candidate, passed through the website adapter,
// is accepted by the Street Lab's own validator, and no score or geometry travels.
// Run with: node --experimental-strip-types scripts/test-adapter.mjs
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { explorationAreas } = await import(pathToFileURL(join(root, 'basel-site-scoping-tool/src/data/areas.ts')).href);
const { parseSiteHandoff } = await import(pathToFileURL(join(root, 'wrapper/street-workspace/src/site-context.ts')).href);

const sandbox = { window: {}, TextEncoder, btoa };
vm.runInNewContext(readFileSync(join(root, 'integration/assets/street-lab-adapter.js'), 'utf8'), sandbox);
const adapter = sandbox.window.StreetLabAdapter;

const forbidden = ['heat', 'nightCooling', 'canopyDeficit', 'sealedSurface', 'runoff', 'coolingOpportunity', 'evidenceQuality', 'geometry', 'rect', 'zones'];
for (const area of explorationAreas) {
  const handoff = adapter.toHandoff(area);
  const url = adapter.streetLabUrl('../', area);
  const parsed = parseSiteHandoff(new URL(url, 'http://x/lab/').search);
  assert.ok(parsed, `Street Lab rejected the handoff for ${area.id}`);
  assert.equal(parsed.site.id, area.id);
  assert.equal(parsed.site.name, area.name);
  assert.deepEqual(parsed.site.indicators.missingData, area.indicators.missingData);
  assert.equal(parsed.provenance.classification, 'illustrative');
  const json = JSON.stringify(handoff);
  for (const key of forbidden) assert.ok(!json.includes(`"${key}"`), `${area.id}: handoff carries ${key}`);
}
assert.equal(parseSiteHandoff('?site=not-base64'), undefined);
console.log(`Adapter contract test passed: ${explorationAreas.length} candidates accepted by the Street Lab validator, no scores or geometry transferred.`);
