import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(root, 'data/product-manifest.json'), 'utf8'));
const showcase = JSON.parse(readFileSync(join(root, 'data/showcase-manifest.json'), 'utf8'));

test('showcase follows the four-part five-minute presentation', () => {
  assert.equal(showcase.contract, 'spongesquad-showcase/v1');
  assert.deepEqual(showcase.chapters.map(({ id, seconds }) => [id, seconds]), [
    ['problem', 45], ['understanding', 45], ['demo', 165], ['vision', 45]
  ]);
  assert.equal(showcase.chapters.reduce((sum, chapter) => sum + chapter.seconds, 0), 300);
});

test('Simon is the centerpiece and all live modules stay bounded', () => {
  assert.equal(showcase.modules.length, 14);
  for (const id of ['heat', 'scoping', 'lab', 'atlas', 'charter-map', 'catalogue', 'decisions']) assert.ok(showcase.modules.some(module => module.id === id));
  assert.equal(showcase.modules[0].id, 'simon');
  const rainWalk = showcase.modules.find((module) => module.id === 'rainwalk');
  assert.equal(rainWalk.url, '../wrapper/street-workspace/rain-walk/index.html');
  const stageUrls = ['charter', 'case'].map((id) => showcase.modules.find((module) => module.id === id).url);
  assert.equal(new Set(stageUrls).size, 2, 'stage modules need distinct iframe URLs');
  for (const module of showcase.modules) {
    assert.ok(module.owner);
    assert.ok(module.purpose);
    assert.ok(module.boundary);
    assert.doesNotMatch(module.url, /^\//);
  }
});

test('product manifest exposes the bounded six-stage journey', () => {
  assert.equal(manifest.contract, 'spongesquad-product/v1');
  assert.deepEqual(manifest.stages.map((stage) => stage.id), [
    'find', 'classify', 'gate', 'observe', 'explore', 'decide'
  ]);
  assert.equal(manifest.case.decisionState, 'requires-investigation');
});

test('every stage preserves ownership, boundary and a relative module URL', () => {
  for (const stage of manifest.stages) {
    assert.ok(stage.owner, `${stage.id} needs an owner`);
    assert.ok(stage.boundary, `${stage.id} needs an evidence boundary`);
    assert.doesNotMatch(stage.url, /^\//, `${stage.id} must use a subpath-safe relative URL`);
    assert.doesNotMatch(stage.demoUrl, /^\//, `${stage.id} demo must use a subpath-safe relative URL`);
  }
});

test('integration freeze contains every contributor folder', () => {
  const snapshot = join(root, 'snapshots/2026-10-04-main-c41d423');
  for (const folder of ['data', 'frontend', 'explainer-videos-context', 'presentation-story', 'wrapper']) {
    assert.equal(existsSync(join(snapshot, folder)), true, `missing frozen ${folder}/`);
  }
  assert.equal(existsSync(join(snapshot, 'SNAPSHOT.md')), true);
  assert.equal(existsSync(join(snapshot, 'product')), false, 'snapshot must not recurse into the product workspace');
});

test('Andy has a documented replacement boundary', () => {
  const handoff = readFileSync(join(root, 'contributions/andy/README.md'), 'utf8');
  assert.match(handoff, /candidate-site-context\/v1/);
  assert.match(handoff, /identity-context-only/);
  assert.match(handoff, /Unknown values stay unknown/);
});

test('Andy contribution includes static backend data and Tellplatz handoff bridge', () => {
  const contribution = join(root, 'contributions/andy/current');
  const catalogue = JSON.parse(readFileSync(join(contribution, 'data/catalogue.json'), 'utf8'));
  const baseline = JSON.parse(readFileSync(join(contribution, 'data/baseline.json'), 'utf8'));
  const backend = join(root, '..', 'backend', 'data');
  assert.equal(catalogue.sections.length, 4);
  assert.equal(baseline.heatwave.source, 'Landsat-derived daytime land-surface temperature at Tellplatz');
  if (existsSync(join(backend, 'catalogue.json'))) {
    assert.deepEqual(catalogue, JSON.parse(readFileSync(join(backend, 'catalogue.json'), 'utf8')));
    assert.deepEqual(baseline, JSON.parse(readFileSync(join(backend, 'baseline.json'), 'utf8')));
  }
  assert.equal(existsSync(join(contribution, 'candidate-handoff.js')), true);
  assert.match(readFileSync(join(contribution, 'candidate-handoff.js'), 'utf8'), /candidate-site-context/);
});
