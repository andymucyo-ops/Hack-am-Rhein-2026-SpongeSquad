/* Candidate picker for [data-candidate-picker].
   data-next="understand/"  navigate there after choosing; omit to stay on the page and fire 'candidatechange'.
   Reads Andy's map shortlist read-only from this browser (localStorage key 'site-shortlist',
   written by basel-site-scoping-tool on the same origin). Nothing is written back. */
(function () {
  'use strict';
  var S = window.Sponge;
  if (!S) return;

  function shortlistIds() {
    try {
      var entries = JSON.parse(window.localStorage.getItem('site-shortlist') || '[]');
      return Array.isArray(entries) ? entries.map(function (e) { return e && e.areaId; }).filter(Boolean) : [];
    } catch (error) { return []; }
  }

  document.querySelectorAll('[data-candidate-picker]').forEach(function (el) {
    var next = el.getAttribute('data-next');
    S.loadCandidates().then(function (data) {
      var current = S.candidateId();
      var saved = shortlistIds().map(function (id) { return S.findCandidate(data, id); }).filter(Boolean);
      var chip = function (c) {
        var pressed = c.id === current ? ' aria-pressed="true" style="border-color:#227653;color:#1c654b"' : '';
        return '<button type="button" data-id="' + S.esc(c.id) + '"' + pressed + '>' + S.esc(c.name) + ' <span class="tiny">' + S.esc(c.district) + '</span></button>';
      };
      var html = '';
      if (saved.length) {
        html += '<p class="small"><b>Shortlisted in the map</b> <span class="tiny">read from this browser</span></p><div class="chips" style="margin-bottom:16px">' + saved.map(chip).join('') + '</div>';
      }
      html += '<p class="small"><b>Discussion areas</b> <span class="label illustrative">illustrative</span></p><div class="chips">' + data.areas.map(chip).join('') + '</div>';
      html += '<div class="picker" style="margin-top:16px"><label class="small" for="pin-select"><b>Exploration pins</b></label>' +
        '<select id="pin-select"><option value="">Choose one of ' + data.explorationPins.length + ' placeholder pins…</option>' +
        data.explorationPins.map(function (c) { return '<option value="' + S.esc(c.id) + '"' + (c.id === current ? ' selected' : '') + '>' + S.esc(c.name) + '</option>'; }).join('') +
        '</select></div>' +
        '<p class="tiny" style="margin-top:12px">Exploration pins are placeholders generated to test map interaction. They carry no site evidence.</p>';
      el.innerHTML = html;

      function choose(id) {
        if (!id) return;
        S.setCandidate(id);
        if (next) window.location.href = S.withCandidate(next, id);
        else document.dispatchEvent(new CustomEvent('candidatechange', { detail: { id: id } }));
      }
      el.querySelectorAll('button[data-id]').forEach(function (b) {
        b.addEventListener('click', function () { choose(b.getAttribute('data-id')); });
      });
      el.querySelector('#pin-select').addEventListener('change', function (e) { choose(e.target.value); });
    }).catch(function () {
      el.innerHTML = '<p class="notice rust">Candidate list unavailable. Run the site through <code>npm start</code> so the build can export the site-scoping fixture.</p>';
    });
  });
})();
