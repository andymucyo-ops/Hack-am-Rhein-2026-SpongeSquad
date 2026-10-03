/* Shows a standalone module inside the site so it keeps a return path.
   Only modules listed here can be opened: ?m=<key>. */
(function () {
  'use strict';
  var S = window.Sponge;
  if (!S) return;
  var MODULES = {
    'sponge-street': { path: 'wrapper/prototypes/sponge-street/', title: 'Sponge Street explainer · Achim · early prototype', note: 'Standalone explainer: seven intervention tracks, twelve guided states. Water shares and the heat indicator are scenario values, not measured Basel performance.' },
    'street-xray': { path: 'wrapper/street-xray/', title: 'Street X-Ray · evidence gate', note: 'One illustrative study point near the Klybeck candidate. The street segment, candidate strip and intervention are illustrative; known context, hypotheses and decisive unknowns are kept apart.' },
    'rain-walk': { path: 'wrapper/street-workspace/rain-walk/', title: 'Rain Walk · street evidence campaign', note: 'Demo campaign on a synthetic 120 m segment. Observations stay in this browser; review is by a local user, not an authority. No observation changes geometry or simulation.' },
    'data-charter': { path: 'wrapper/data-charter-map/', title: 'Data Charter map · Achim', note: 'City-wide evidence: published, inferred and missing layers for Basel. Inferred layers are not validated and may only explain or screen. Map layers need internet access.' }
  };
  var key = new URLSearchParams(window.location.search).get('m');
  var mod = MODULES[key];
  var title = document.getElementById('view-title');
  if (!mod) { title.textContent = 'Unknown module'; return; }
  var url = S.root + mod.path;
  document.title = mod.title + ' · SpongeSquad';
  title.innerHTML = '<b>' + S.esc(mod.title) + '</b> · <code>' + S.esc(mod.path) + '</code>';
  document.getElementById('view-frame').src = url;
  document.getElementById('view-frame').title = mod.title;
  document.getElementById('view-full').href = url;
  document.getElementById('view-note').textContent = mod.note;
  try {
    var ref = document.referrer && new URL(document.referrer);
    if (ref && ref.origin === window.location.origin && ref.pathname !== window.location.pathname) document.getElementById('view-back').href = ref.href;
  } catch (error) { /* keep the site root */ }
})();
