/**
 * print-mode.js — enter/exit "print mode" for slide capture
 *
 * Ported from legacy source. The ALWAYS_HIDE / FULL_HIDE element IDs
 * refer to a chrome (toolbar/sidebar/status-bar) that OmniDeck's minimal
 * shell doesn't have; those branches simply no-op via getElementById null
 * checks. The .reveal sizing override is what matters for PDF capture.
 */
(function () {
  'use strict';

  const ALWAYS_HIDE = ['welcome-screen', 'grid-overlay'];
  const FULL_HIDE = ['toolbar', 'tab-bar', 'status-bar', 'toast'];

  function enter(options) {
    const opts = options || {};
    const width = opts.width || 1280;
    const height = opts.height || 720;
    const full = !!opts.full;

    const hideIds = full ? ALWAYS_HIDE.concat(FULL_HIDE) : ALWAYS_HIDE;
    const saved = {};

    for (const id of hideIds) {
      const el = document.getElementById(id);
      if (el) { saved[id] = el.style.cssText; el.style.display = 'none'; }
    }
    const decorations = document.querySelectorAll('.sd-slide-number, .sd-progress, #omnideck-toolbar');
    decorations.forEach((el) => { el.style.display = 'none'; });

    const slideArea = document.getElementById('slide-area');
    saved.slideArea = slideArea && slideArea.style.cssText;
    if (slideArea) {
      slideArea.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;padding:0;';
    }

    document.body.style.setProperty('--chrome-height', '0px');

    const reveal = document.querySelector('.reveal');
    saved.reveal = reveal && reveal.style.cssText;
    if (reveal) {
      reveal.style.cssText =
        'width:' + width + 'px !important;' +
        'height:' + height + 'px !important;' +
        'max-width:none;max-height:none;box-shadow:none;margin:0;';
    }

    if (window.Reveal && typeof window.Reveal.layout === 'function') {
      window.Reveal.layout();
    }

    return function exit() {
      for (const id of hideIds) {
        const el = document.getElementById(id);
        if (el) el.style.cssText = saved[id] || '';
      }
      decorations.forEach((el) => { el.style.display = ''; });
      if (slideArea) slideArea.style.cssText = saved.slideArea || '';
      if (reveal) reveal.style.cssText = saved.reveal || '';
      document.body.style.removeProperty('--chrome-height');
      if (window.Reveal && typeof window.Reveal.layout === 'function') {
        window.Reveal.layout();
      }
    };
  }

  window.OmniDeckPrintMode = { enter };
})();
