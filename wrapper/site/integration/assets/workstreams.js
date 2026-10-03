/* Renders every [data-workstreams] container from integration/routes.json. */
(function () {
  'use strict';
  var S = window.Sponge;
  if (!S) return;
  var labels = {
    live: '<span class="label works">Live</span>',
    partial: '<span class="label illustrative">Partial</span>',
    placeholder: '<span class="label placeholder">Template page</span>'
  };
  document.querySelectorAll('[data-workstreams]').forEach(function (el) {
    el.innerHTML = S.routes.workstreams.map(function (w) {
      return '<a class="ws" href="' + S.esc(S.root + w.page) + '">' +
        '<small>' + S.esc(w.owner) + ' · ' + S.esc(w.folder) + '</small>' +
        (labels[w.status] || '') +
        '<b>' + S.esc(w.title) + '</b>' +
        '<p>' + S.esc(w.summary) + '</p></a>';
    }).join('');
  });
})();
