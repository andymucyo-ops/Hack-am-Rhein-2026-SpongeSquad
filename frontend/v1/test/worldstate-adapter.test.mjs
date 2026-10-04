import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createWorldStateBridge, mappingFor } from '../worldstate-adapter.js';

const adaptive = new URL('../../../wrapper/experiments/adaptive-interface/', import.meta.url);
const readJson = async path => JSON.parse(await readFile(new URL(path, adaptive), 'utf8'));
const data = await (async () => {
  const [place, catalogue, surfaces, scenarios, routingAssumptions] = await Promise.all([
    readJson('examples/demo-place.json'),
    readJson('catalogues/intervention-knowledge.json'),
    readJson('catalogues/surfaces.json'),
    readJson('catalogues/scenarios.json'),
    readJson('examples/demo-routing.json')
  ]);
  return { place, catalogue, surfaces, scenarios, routingAssumptions };
})();

const baseline = {
  apartments: 'unchanged', sidewalk: 'unchanged', street: 'unchanged', 'parking lot': 'unchanged'
};

test('green roof is applied by the canonical WorldState runtime', async () => {
  const bridge = await createWorldStateBridge(data);
  const result = bridge.update({ selected: { ...baseline, apartments: 'green roof' }, weather: 'heatwave' });
  assert.equal(result.contract, 'simon-worldstate-bridge/0.1');
  assert.equal(result.scenarioId, 'hot-day');
  assert.deepEqual(result.applied.map(item => item.interventionId), ['green-roof']);
  assert.equal(result.effect.id, 'surface_heating_tendency');
  assert.equal(result.slice.segments.find(item => item.element_id === 'building-north').material, 'green-roof');
});

test('unsupported road artwork remains a concept and never mutates state', async () => {
  const bridge = await createWorldStateBridge(data);
  const result = bridge.update({ selected: { ...baseline, street: 'permeable asphalt' }, weather: 'rainstorm' });
  assert.equal(result.applied.length, 0);
  assert.equal(result.concepts.length, 1);
  assert.match(result.concepts[0].reason, /no executable road-surface recipe/i);
  assert.equal(result.slice.segments.find(item => item.element_id === 'road').surface_class.value, 'sealed');
});

test('combined and partial artwork declares its fidelity', () => {
  assert.equal(mappingFor('sidewalk', 'street tree + permeatable pavement + bioswale (vegetated drainage strip)').fidelity, 'partial');
  assert.equal(mappingFor('parking lot', 'native vegetation').interventionId, 'depave');
});
