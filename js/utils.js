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

var CONFETTI_COLORS = ['#F5B61A','#F97316','#22C55E','#3B82F6','#A855F7','#EF4444','#FBBF24'];

function createConfettiParticle(container) {
  var el = document.createElement('div');
  el.className = 'confetti-particle';
  var size = 6 + Math.random() * 8;
  var color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
  var startX = 20 + Math.random() * 60; // % from left
  el.style.cssText = [
    'width:' + size + 'px',
    'height:' + size + 'px',
    'background:' + color,
    'left:' + startX + '%',
    'top:10%',
    'border-radius:' + (Math.random() > 0.5 ? '50%' : '2px'),
  ].join(';');
  container.appendChild(el);
  return el;
}
