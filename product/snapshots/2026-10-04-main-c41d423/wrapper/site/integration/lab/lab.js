(function () {
  'use strict';
  var S = window.Sponge;
  var A = window.StreetLabAdapter;
  if (!S || !A) return;
  var stages = ['design', 'test', 'see'];

  function currentStage() {
    var h = (window.location.hash || '').slice(1);
    return stages.indexOf(h) >= 0 ? h : 'design';
  }
  function showStage(stage) {
    stages.forEach(function (s) {
      var tab = document.getElementById('tab-' + s);
      var panel = document.getElementById('panel-' + s);
      tab.setAttribute('aria-selected', String(s === stage));
      tab.tabIndex = s === stage ? 0 : -1;
      panel.hidden = s !== stage;
    });
  }
  document.querySelectorAll('[role="tab"]').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var stage = tab.getAttribute('data-stage');
      if (window.location.hash !== '#' + stage) window.history.replaceState(null, '', '#' + stage);
      showStage(stage);
      S.refreshStepper();
    });
    tab.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var i = stages.indexOf(tab.getAttribute('data-stage'));
      var next = document.getElementById('tab-' + stages[(i + (e.key === 'ArrowRight' ? 1 : 2)) % 3]);
      next.focus();
      next.click();
    });
  });
  window.addEventListener('hashchange', function () { showStage(currentStage()); });
  showStage(currentStage());

  var frame = document.getElementById('lab-frame');
  var full = document.getElementById('lab-full');
  var note = document.getElementById('handoff-note');
  document.getElementById('to-decide').href = S.withCandidate('decide/');

  function load(candidate) {
    var url = A.streetLabUrl(S.root, candidate);
    frame.src = url;
    full.href = url;
    if (candidate) {
      note.className = 'notice green';
      note.innerHTML = 'Carrying <b>' + S.esc(candidate.name) + '</b> into the lab: its name, evidence leads and open questions. ' +
        'The street below is still the synthetic example. No geometry, soil or drainage value is taken from the candidate. ' +
        '<a href="' + S.esc(S.withCandidate('understand/')) + '">Review the candidate</a>';
    }
  }
  var id = S.candidateId();
  if (!id) { load(null); return; }
  S.loadCandidates().then(function (data) { load(S.findCandidate(data, id)); }).catch(function () { load(null); });
})();
