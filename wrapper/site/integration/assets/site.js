/* SpongeSquad shared page behaviour.
   - draws header, journey stepper and footer from window.SPONGE_ROUTES (generated from integration/routes.json)
   - keeps the selected candidate (?candidate=ID, remembered for this browser tab)
   - if a shell page is opened inside an embedded app's iframe, it replaces the whole tab instead of nesting */
(function () {
  'use strict';
  if (window.top !== window.self) {
    try { window.top.location.replace(window.location.href); return; } catch (error) { /* cross-origin: stay */ }
  }

  var html = document.documentElement;
  var root = html.getAttribute('data-root') || './';
  var section = html.getAttribute('data-section') || '';
  var routes = window.SPONGE_ROUTES || { stages: [], sections: [], workstreams: [] };
  var STORE = 'spongesquad.candidate';

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function storage(action, value) {
    try {
      if (action === 'get') return window.sessionStorage.getItem(STORE);
      if (action === 'set') window.sessionStorage.setItem(STORE, value);
      if (action === 'clear') window.sessionStorage.removeItem(STORE);
    } catch (error) { /* storage blocked: URL parameter still works */ }
    return null;
  }
  function candidateId() {
    var fromUrl = new URLSearchParams(window.location.search).get('candidate');
    if (fromUrl && /^[A-Za-z0-9_-]{1,40}$/.test(fromUrl)) { storage('set', fromUrl); return fromUrl; }
    var stored = storage('get');
    return stored && /^[A-Za-z0-9_-]{1,40}$/.test(stored) ? stored : null;
  }
  function withCandidate(path, id) {
    var target = id === undefined ? candidateId() : id;
    if (!target) return root + path;
    var hashAt = path.indexOf('#');
    var base = hashAt >= 0 ? path.slice(0, hashAt) : path;
    var hash = hashAt >= 0 ? path.slice(hashAt) : '';
    return root + base + (base.indexOf('?') >= 0 ? '&' : '?') + 'candidate=' + encodeURIComponent(target) + hash;
  }
  var candidatesPromise = null;
  function loadCandidates() {
    if (!candidatesPromise) {
      candidatesPromise = fetch(root + 'assets/candidates.json').then(function (r) {
        if (!r.ok) throw new Error('candidates.json ' + r.status);
        return r.json();
      });
    }
    return candidatesPromise;
  }
  function findCandidate(data, id) {
    var all = (data.areas || []).concat(data.explorationPins || []);
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }

  function currentStage() {
    if (section === 'lab') {
      var h = (window.location.hash || '#design').slice(1);
      return ['design', 'test', 'see'].indexOf(h) >= 0 ? h : 'design';
    }
    return section;
  }

  function renderHeader() {
    var slot = document.getElementById('site-header');
    if (!slot) return;
    var stage = currentStage();
    var nav = [{ id: 'home', label: 'Overview', path: '' }]
      .concat([{ id: 'journey', label: 'Demo journey', path: 'find/' }])
      .concat(routes.sections)
      .concat([{ id: 'workstreams', label: 'Workstreams', path: 'team/#workstreams' }]);
    var journeyIds = routes.stages.map(function (s) { return s.id; }).concat(['lab']);
    var navHtml = nav.map(function (item) {
      var active = item.id === section || (item.id === 'journey' && journeyIds.indexOf(section) >= 0) || (item.id === 'workstreams' && section === 'workstream');
      return '<a href="' + esc(root + item.path) + '"' + (active ? ' aria-current="page"' : '') + '>' + esc(item.label) + '</a>';
    }).join('');
    var steps = routes.stages.map(function (s, i) {
      var current = s.id === stage;
      return (i ? '<i aria-hidden="true">→</i>' : '') + '<a data-stage="' + esc(s.id) + '" href="' + esc(withCandidate(s.path)) + '"' + (current ? ' aria-current="step"' : '') + '><span>' + (i + 1) + '</span>' + esc(s.label) + '</a>';
    }).join('');
    slot.outerHTML =
      '<a class="skip" href="#main">Skip to content</a>' +
      '<header class="site-header">' +
      '<div class="header-row"><a class="brand" href="' + esc(root) + '"><span class="brand-mark" aria-hidden="true">SQ</span><span><b>SpongeSquad</b><small>BASEL · HACK AM RHEIN 2026</small></span></a>' +
      '<nav class="main-nav" aria-label="Site">' + navHtml + '</nav></div>' +
      '<div class="journey-bar"><div class="journey-row"><nav class="stepper" aria-label="Demo journey">' + steps + '</nav><span class="candidate-chip" id="candidate-chip" hidden></span></div></div>' +
      '</header>';
    updateCandidateChip();
  }

  function updateCandidateChip() {
    var chip = document.getElementById('candidate-chip');
    var id = candidateId();
    if (!chip) return;
    if (!id) { chip.hidden = true; return; }
    loadCandidates().then(function (data) {
      var c = findCandidate(data, id);
      if (!c) { chip.hidden = true; return; }
      chip.hidden = false;
      chip.innerHTML = 'Candidate: <b>' + esc(c.name) + '</b><a href="' + esc(root + 'understand/') + '">change</a>';
      chip.title = c.name + ' · illustrative candidate from the site-scoping tool';
    }).catch(function () { chip.hidden = true; });
  }

  function refreshStepper() {
    var stage = currentStage();
    document.querySelectorAll('.stepper a[data-stage]').forEach(function (a) {
      var s = routes.stages.filter(function (x) { return x.id === a.getAttribute('data-stage'); })[0];
      if (s) a.setAttribute('href', withCandidate(s.path));
      if (a.getAttribute('data-stage') === stage) a.setAttribute('aria-current', 'step');
      else a.removeAttribute('aria-current');
    });
    var current = document.querySelector('.stepper a[aria-current="step"]');
    if (current && current.scrollIntoView) current.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  function renderFooter() {
    var slot = document.getElementById('site-footer');
    if (!slot) return;
    slot.outerHTML = '<footer class="site-footer"><div class="wrap">' +
      '<span>SpongeSquad · Hack am Rhein 2026 · Basel-Stadt</span>' +
      '<span>Prototype for discussion. Candidate values and the example street are illustrative, not measurements. ' +
      '<a href="' + esc(root + 'research/') + '">Sources &amp; limitations</a> · <a href="' + esc(root + 'team/') + '">Team</a></span>' +
      '</div></footer>';
  }

  window.Sponge = {
    root: root,
    routes: routes,
    esc: esc,
    candidateId: candidateId,
    setCandidate: function (id) {
      if (id) storage('set', id); else storage('clear');
      var url = new URL(window.location.href);
      if (id) url.searchParams.set('candidate', id); else url.searchParams.delete('candidate');
      window.history.replaceState(null, '', url.toString());
      refreshStepper();
      updateCandidateChip();
    },
    withCandidate: withCandidate,
    loadCandidates: loadCandidates,
    findCandidate: findCandidate,
    refreshStepper: refreshStepper
  };

  renderHeader();
  renderFooter();
  refreshStepper();
  window.addEventListener('hashchange', refreshStepper);
})();
