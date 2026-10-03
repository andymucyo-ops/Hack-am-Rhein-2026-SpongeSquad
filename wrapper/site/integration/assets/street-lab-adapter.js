/* Explicit adapter: site-scoping candidate → Street Lab handoff (candidate-site-context v1).

   Contract: integration/contracts/candidate-site-context.v1.schema.json
   Validated by: wrapper/street-workspace/src/site-context.ts (parseSiteHandoff)

   What travels: identity (id, name, district, coordinates), evidence leads, missing data,
   constraints and intervention directions, as text.
   What never travels: indicator scores, street geometry, soil, drainage or hydraulic values.
   The Street Lab keeps its synthetic example street with or without a candidate. */
(function () {
  'use strict';
  var MAX_TEXT = 240;
  var MAX_ITEMS = 20;

  function text(value) {
    var s = String(value == null ? '' : value).trim();
    return s.length > MAX_TEXT ? s.slice(0, MAX_TEXT - 1) + '…' : s;
  }
  function list(values) {
    return (values || []).map(text).filter(Boolean).slice(0, MAX_ITEMS);
  }

  function toHandoff(candidate) {
    return {
      version: 1,
      site: {
        id: text(candidate.id),
        name: text(candidate.name),
        district: text(candidate.district),
        coordinates: [Number(candidate.coordinates[0]), Number(candidate.coordinates[1])],
        indicators: {
          sources: list(candidate.indicators && candidate.indicators.sources),
          missingData: list(candidate.indicators && candidate.indicators.missingData)
        },
        constraints: list(candidate.constraints),
        directions: list(candidate.directions)
      },
      provenance: {
        classification: 'illustrative',
        source: 'Basel Site Scoping Tool via SpongeSquad website adapter',
        note: 'Candidate identity and evidence prompts only; no site geometry, scores or hydraulic parameters are transferred.'
      }
    };
  }

  function encodeBase64Url(value) {
    var bytes = new TextEncoder().encode(JSON.stringify(value));
    var binary = '';
    for (var i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  /* root: relative path to the site root, e.g. '../' */
  function streetLabUrl(root, candidate) {
    var url = root + 'wrapper/street-workspace/';
    return candidate ? url + '?site=' + encodeBase64Url(toHandoff(candidate)) : url;
  }

  window.StreetLabAdapter = { toHandoff: toHandoff, encode: encodeBase64Url, streetLabUrl: streetLabUrl };
})();
