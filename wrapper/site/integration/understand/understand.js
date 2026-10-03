(function () {
  'use strict';
  var S = window.Sponge;
  if (!S) return;
  var esc = S.esc;
  var detail = document.getElementById('cand-detail');
  var title = document.getElementById('cand-title');
  var sub = document.getElementById('cand-sub');
  var pickerWrap = document.getElementById('cand-picker-wrap');

  function list(items, empty) {
    if (!items || !items.length) return '<p class="tiny">' + esc(empty) + '</p>';
    return '<ul>' + items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
  }

  function render(data) {
    var id = S.candidateId();
    var c = id ? S.findCandidate(data, id) : null;
    var isPin = c && data.explorationPins.some(function (p) { return p.id === c.id; });
    document.getElementById('to-lab').href = S.withCandidate('lab/#design');
    document.getElementById('to-decide').href = S.withCandidate('decide/');
    if (!c) {
      title.textContent = 'Choose a place';
      sub.textContent = 'Pick a discussion area or exploration pin from the site-scoping tool.';
      detail.innerHTML = '';
      pickerWrap.open = true;
      return;
    }
    pickerWrap.open = false;
    title.textContent = c.name;
    sub.innerHTML = esc(c.district) + ' · ' + (isPin ? 'exploration pin' : 'discussion area') +
      ' · <span class="label illustrative">illustrative candidate</span>';
    detail.innerHTML =
      '<div class="grid-2">' +
        '<article class="panel"><p class="eyebrow">Screening hypothesis</p>' +
          '<p>' + esc(c.profile || 'No profile recorded.') + '</p>' +
          (c.problematics && c.problematics.length ? '<p class="small"><b>Possible problems named</b></p>' + list(c.problematics) : '') +
          '<p class="tiny">Written in the site-scoping fixture. It is a hypothesis to test, not a finding.</p></article>' +
        '<article class="panel"><p class="eyebrow">Identity only</p>' +
          '<dl class="kv"><dt>Candidate id</dt><dd><code>' + esc(c.id) + '</code></dd>' +
          '<dt>District</dt><dd>' + esc(c.district) + '</dd>' +
          '<dt>Point</dt><dd>' + esc(c.coordinates[1].toFixed(3)) + ' N, ' + esc(c.coordinates[0].toFixed(3)) + ' E <span class="tiny">approximate pin, no boundary</span></dd>' +
          '<dt>Evidence quality</dt><dd>' + Math.round(c.indicators.evidenceQuality * 100) + ' % <span class="tiny">provisional, set by hand in the fixture</span></dd></dl>' +
          '<p class="tiny" style="margin-top:12px">The fixture also holds heat, canopy, sealing and runoff scores. They are placeholders, so this page does not repeat them. See them in the map with their caveats.</p></article>' +
      '</div>' +
      '<div class="grid-3">' +
        '<article class="panel"><span class="label source">Evidence leads</span><h3 style="margin-top:10px">Sources to verify</h3>' + list(c.indicators.sources, 'None recorded.') + '</article>' +
        '<article class="panel"><span class="label missing">Unknown</span><h3 style="margin-top:10px">Missing data and constraints</h3>' + list(c.indicators.missingData.concat(c.constraints), 'None recorded.') + '</article>' +
        '<article class="panel"><span class="label illustrative">Concepts</span><h3 style="margin-top:10px">Directions to investigate</h3>' + list(c.directions, 'None recorded.') +
          '<p class="tiny">Options to investigate, not engineering recommendations.</p></article>' +
      '</div>' +
      (isPin ? '<p class="notice rust">This is an exploration pin. Its location and values were generated to test map interaction. Treat it as a placeholder.</p>' : '');
  }

  S.loadCandidates().then(function (data) {
    render(data);
    document.addEventListener('candidatechange', function () { render(data); });
  }).catch(function () {
    detail.innerHTML = '<p class="notice rust">Candidate data unavailable. Build the site with <code>npm start</code>.</p>';
  });
})();
