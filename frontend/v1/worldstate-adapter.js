import { AdaptiveInterfaceOrchestrator } from '../../wrapper/experiments/adaptive-interface/runtime/orchestrator.js';
import { createMockPlaceProvider } from '../../wrapper/experiments/adaptive-interface/modules/mock-place-provider.js';
import { createMockInterventionProvider } from '../../wrapper/experiments/adaptive-interface/modules/mock-intervention-provider.js';
import { toStreetSlice } from '../../wrapper/experiments/adaptive-interface/modules/street-slice-adapter.js';

const BASE = new URL('../../wrapper/experiments/adaptive-interface/', import.meta.url);

const json = async path => {
  const response = await fetch(new URL(path, BASE));
  if (!response.ok) throw new Error(`WorldState data failed to load: ${path} (${response.status})`);
  return response.json();
};

// This is deliberately small and explicit. A visual option is connected only when the
// canonical catalogue has a semantically equivalent executable intervention.
export const WORLDSTATE_MAPPINGS = Object.freeze({
  apartments: Object.freeze({
    unchanged: null,
    'green roof': Object.freeze({ interventionId: 'green-roof', targetId: 'building-north', params: { roof_system: 'extensive' }, fidelity: 'exact', label: 'Green roof' }),
    'green-blue roof': Object.freeze({ fidelity: 'concept', label: 'Blue-green roof', reason: 'The catalogue has no blue-roof storage recipe yet.' })
  }),
  sidewalk: Object.freeze({
    unchanged: null,
    'street tree + permeatable pavement + bioswale (vegetated drainage strip)': Object.freeze({ interventionId: 'tree-trench', targetId: 'sidewalk-north', params: { area_m2: 10 }, fidelity: 'partial', label: 'Tree trench projection', reason: 'The state model represents the connected tree trench; the combined paving and bioswale artwork is broader.' })
  }),
  street: Object.freeze({
    unchanged: null,
    'permeable asphalt': Object.freeze({ fidelity: 'concept', label: 'Permeable asphalt', reason: 'The catalogue has no executable road-surface recipe yet.' }),
    'permeable paving blocks': Object.freeze({ fidelity: 'concept', label: 'Permeable paving blocks', reason: 'The catalogue has no executable road-surface recipe yet.' })
  }),
  'parking lot': Object.freeze({
    unchanged: null,
    'constructed wetland': Object.freeze({ fidelity: 'concept', label: 'Constructed wetland', reason: 'The catalogue has no wetland recipe yet.' }),
    'retention pools': Object.freeze({ fidelity: 'concept', label: 'Retention ponds', reason: 'The catalogue has no retention-pond recipe yet.' }),
    'floodable park': Object.freeze({ fidelity: 'concept', label: 'Floodable park', reason: 'The catalogue has no floodable-park recipe yet.' }),
    'native vegetation': Object.freeze({ interventionId: 'depave', targetId: 'parking-north', params: { area_m2: 20 }, fidelity: 'partial', label: 'Depaved planting projection', reason: 'WorldState models a 20 m² depaved planting bed, not the full visual habitat.' })
  })
});

const SCENARIO_BY_WEATHER = Object.freeze({ rainstorm: 'heavy-rain', heatwave: 'hot-day' });
const EFFECT_BY_WEATHER = Object.freeze({ rainstorm: 'sewer_load_tendency', heatwave: 'surface_heating_tendency' });

export function mappingFor(section, option) {
  return WORLDSTATE_MAPPINGS[section]?.[option] ?? null;
}

export async function loadWorldStateData() {
  const [place, catalogue, surfaces, scenarios, routingAssumptions] = await Promise.all([
    json('examples/demo-place.json'),
    json('catalogues/intervention-knowledge.json'),
    json('catalogues/surfaces.json'),
    json('catalogues/scenarios.json'),
    json('examples/demo-routing.json')
  ]);
  return { place, catalogue, surfaces, scenarios, routingAssumptions };
}

export async function createWorldStateBridge(data = null) {
  data ??= await loadWorldStateData();
  let latest = null;
  const renderer = { render(view) { latest = view; } };
  const app = new AdaptiveInterfaceOrchestrator({
    placeProvider: createMockPlaceProvider(data.place),
    interventionProvider: createMockInterventionProvider(data.catalogue),
    renderer,
    surfaces: data.surfaces,
    scenarios: data.scenarios,
    routingAssumptions: data.routingAssumptions,
    scenarioId: 'heavy-rain'
  });
  await app.load({ lon: 7.5741, lat: 47.5735, radius_m: 50, from: 'Simon frontend v1' });
  if (latest.status !== 'ready') throw new Error(latest.errors.join('; ') || 'WorldState did not become ready.');

  return {
    update({ selected, weather }) {
      app.resetScenario();
      const scenarioId = SCENARIO_BY_WEATHER[weather] ?? null;
      if (scenarioId) app.setScenario(scenarioId);

      const applied = [];
      const concepts = [];
      for (const [section, optionId] of Object.entries(selected)) {
        const mapping = mappingFor(section, optionId);
        if (!mapping) continue;
        if (!mapping.interventionId) {
          concepts.push({ section, option: optionId, label: mapping.label, reason: mapping.reason });
          continue;
        }
        const next = app.applyIntervention(mapping.interventionId, { targetId: mapping.targetId, params: mapping.params });
        if (next.errors.length) {
          concepts.push({ section, option: optionId, label: mapping.label, reason: next.errors.join('; ') });
          continue;
        }
        applied.push({ section, option: optionId, interventionId: mapping.interventionId, targetId: mapping.targetId, fidelity: mapping.fidelity, label: mapping.label, reason: mapping.reason ?? null });
      }

      const view = latest;
      const effectId = EFFECT_BY_WEATHER[weather] ?? null;
      const effect = effectId && view.adaptive?.effectDelta?.changes?.[effectId] || null;
      const result = {
        contract: 'simon-worldstate-bridge/0.1',
        worldStateContract: view.contract,
        visualContract: 'simon-street-visual/0.1',
        scenarioId,
        weather,
        effect: effect ? { id: effectId, label: effect.label, before: effect.before, after: effect.after, assessment: effect.assessment } : null,
        applied,
        concepts,
        unknownCount: view.adaptive?.unknowns?.length ?? 0,
        slice: toStreetSlice(view.adaptive)
      };
      globalThis.window?.parent?.postMessage?.({ type: 'spongesquad:worldstate', payload: { ...result, slice: undefined } }, globalThis.window.location.origin);
      return result;
    }
  };
}
