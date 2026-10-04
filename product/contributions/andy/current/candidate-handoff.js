(function () {
  'use strict';

  const handoff = {
    version: 1,
    site: {
      id: 'tellplatz',
      name: 'Tellplatz',
      district: 'Gundeldingen',
      coordinates: [7.5916187876683905, 47.56700787916864],
      indicators: {
        sources: [
          'https://planetarycomputer.microsoft.com/api/stac/v1',
          'https://www.epa.gov/heatislands/using-green-roofs-reduce-heat-islands',
          'https://www.epa.gov/heatislands/benefits-trees-and-vegetation'
        ],
        missingData: [
          'Site-level drainage destination and sewer context',
          'Local infiltration capacity and soil profile',
          'Underground utilities and ownership clearance',
          'Verified street geometry and intervention footprint'
        ]
      },
      constraints: [
        'The Tellplatz AOI identifies context only; it does not establish buildable geometry.',
        'The intervention effects are illustrative game estimates, not engineering performance values.'
      ],
      directions: [
        'Investigate permeable surfaces, tree rooting space and temporary stormwater storage.',
        'Request drainage, utility and ownership information before design.',
        'Test infiltration and confirm surface-temperature observations on site.'
      ]
    },
    provenance: {
      classification: 'illustrative',
      source: 'Tellplatz frontend and generated backend data',
      note: 'Coordinates identify the Tellplatz context only; no street geometry, soil, drainage or validated performance is transferred.'
    }
  };

  function emit(download = false) {
    window.dispatchEvent(new CustomEvent('spongesquad:candidate-site-context', { detail: handoff }));
    if (window.parent !== window) window.parent.postMessage({ type: 'spongesquad:candidate-site-context', payload: handoff }, window.location.origin);
    if (!download) return;
    const blob = new Blob([JSON.stringify(handoff, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tellplatz-candidate-site-context.v1.json';
    link.click();
    URL.revokeObjectURL(url);
    const button = document.querySelector('#exportCandidate');
    if (button) button.textContent = 'Tellplatz context sent';
  }

  window.TellplatzCandidateHandoff = Object.freeze(handoff);
  document.querySelector('#exportCandidate')?.addEventListener('click', () => emit(true));
  window.addEventListener('load', () => window.parent !== window && emit());
})();
