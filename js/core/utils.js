/* Utility helpers — no DOM side-effects, no global state */

function qs(selector, root) {
  return (root || document).querySelector(selector);
}

function qsa(selector, root) {
  return Array.from((root || document).querySelectorAll(selector));
}

function setClass(el, classMap) {
  if (!el) return;
  Object.entries(classMap).forEach(function(entry) {
    var cls = entry[0], add = entry[1];
    if (add) el.classList.add(cls);
    else el.classList.remove(cls);
  });
}

function wait(ms) {
  return new Promise(function(resolve) { setTimeout(resolve, ms); });
}

function escapeText(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
