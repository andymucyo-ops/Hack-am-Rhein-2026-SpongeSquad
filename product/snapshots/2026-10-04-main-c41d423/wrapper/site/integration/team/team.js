/* Renders the historical weekend plan (team/observatory/data/weekend.json, imported verbatim).
   "Now" is computed from Basel time in the browser; the file's stored status values are ignored. */
(function () {
  'use strict';
  var S = window.Sponge;
  if (!S) return;
  var esc = S.esc;
  var tabs = document.getElementById('day-tabs');
  var slots = document.getElementById('day-slots');

  function baselParts() {
    var parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
    var get = function (t) { return parts.filter(function (p) { return p.type === t; })[0].value; };
    return { date: get('year') + '-' + get('month') + '-' + get('day'), minutes: Number(get('hour')) * 60 + Number(get('minute')) };
  }
  function mins(t) { var p = t.split(':'); return Number(p[0]) * 60 + Number(p[1]); }

  function renderDay(day) {
    var now = baselParts();
    slots.innerHTML = day.items.map(function (item) {
      var isNow = day.date === now.date && now.minutes >= mins(item.start) && now.minutes < mins(item.end);
      var past = day.date < now.date || (day.date === now.date && now.minutes >= mins(item.end));
      var kind = item.kind === 'official' || item.kind === 'deadline' ? 'source' : 'neutral';
      return '<div class="slot' + (isNow ? ' now' : '') + (past ? ' past' : '') + '">' +
        '<span class="t">' + esc(item.start) + '–' + esc(item.end) + '</span>' +
        '<div><b>' + esc(item.title) + '</b>' + (item.note ? '<p>' + esc(item.note) + '</p>' : '') + (item.source ? '<p>' + esc(item.source) + '</p>' : '') + '</div>' +
        '<span class="label ' + (isNow ? 'works' : kind) + '">' + (isNow ? 'Now' : esc(item.kind)) + '</span></div>';
    }).join('');
  }

  fetch(S.root + 'team/weekend.json').then(function (r) {
    if (!r.ok) throw new Error(String(r.status));
    return r.json();
  }).then(function (plan) {
    var today = baselParts().date;
    var start = Math.max(0, plan.days.map(function (d) { return d.date; }).indexOf(today));
    tabs.innerHTML = plan.days.map(function (d, i) {
      return '<button type="button" role="tab" aria-selected="' + (i === start) + '" data-i="' + i + '">' + esc(d.label) + '</button>';
    }).join('');
    tabs.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        tabs.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
        renderDay(plan.days[Number(b.getAttribute('data-i'))]);
      });
    });
    renderDay(plan.days[start]);
    document.getElementById('gates').innerHTML = plan.working_gates.map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('');
  }).catch(function () {
    slots.innerHTML = '<p class="notice rust">The weekend plan could not be loaded.</p>';
  });
})();
