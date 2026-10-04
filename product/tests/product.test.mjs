import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(root, 'data/product-manifest.json'), 'utf8'));

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
