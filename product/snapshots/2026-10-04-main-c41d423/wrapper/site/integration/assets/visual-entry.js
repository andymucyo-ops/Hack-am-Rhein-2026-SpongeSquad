/* A small presentation-only depth effect for the landing-page artefact.
   Simon's app remains isolated inside the iframe; no model state crosses this boundary. */
(function () {
  'use strict';
  var stage = document.querySelector('[data-visual-entry]');
  if (!stage) return;

  var frame = stage.querySelector('iframe');
  if (frame) frame.addEventListener('load', function () {
    var doc;
    try { doc = frame.contentDocument; } catch (error) { return; }
    if (!doc) return;
    var fit = function () {
      var height = Math.max(doc.documentElement.scrollHeight, doc.body ? doc.body.scrollHeight : 0);
      if (height) frame.style.height = Math.ceil(height) + 'px';
    };
    fit();
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(doc.documentElement);
  });

  if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  stage.addEventListener('pointermove', function (event) {
    var box = stage.getBoundingClientRect();
    var x = (event.clientX - box.left) / box.width - .5;
    var y = (event.clientY - box.top) / box.height - .5;
    stage.style.setProperty('--rx', (-y * 2.2).toFixed(2) + 'deg');
    stage.style.setProperty('--ry', (x * 2.8).toFixed(2) + 'deg');
  });
  stage.addEventListener('pointerleave', function () {
    stage.style.setProperty('--rx', '0deg');
    stage.style.setProperty('--ry', '0deg');
  });
})();
