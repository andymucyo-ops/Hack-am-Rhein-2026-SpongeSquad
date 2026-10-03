(function () {
  'use strict';
  var S = window.Sponge;
  if (!S) return;
  var id = S.candidateId();
  if (!id) return;
  S.loadCandidates().then(function (data) {
    var c = S.findCandidate(data, id);
    if (!c) return;
    var esc = S.esc;
    var list = function (items) {
      return items && items.length ? '<ul class="small">' + items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '<p class="tiny">None recorded.</p>';
    };
    document.getElementById('decide-cand-title').textContent = c.name;
    document.getElementById('decide-cand').innerHTML =
      '<article class="panel"><span class="label missing">Missing data</span><h3 style="margin-top:10px">Recorded in the site-scoping fixture</h3>' + list(c.indicators.missingData) + '</article>' +
      '<article class="panel"><span class="label missing">Constraints</span><h3 style="margin-top:10px">To check before any proposal</h3>' + list(c.constraints) +
      '<p class="tiny">Ownership of this place is unknown. The candidate is a map pin without a boundary. <a href="' + esc(S.withCandidate('understand/')) + '">Review the candidate</a></p></article>';
    document.getElementById('candidate-section').hidden = false;
  });
})();
