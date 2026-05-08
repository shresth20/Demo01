/* Anime.js animation functions — accept DOM elements, return anime instances */

var animeAvailable = (typeof anime !== 'undefined');

function animeFallback() { return { finished: Promise.resolve() }; }

function animateScreenIn(el) {
  if (!el) return animeFallback();
  if (!animeAvailable) {
    el.style.opacity = '1';
    el.style.transform = '';
    return animeFallback();
  }
  return anime({
    targets: el,
    opacity: [0, 1],
    translateY: [18, 0],
    duration: 380,
    easing: 'easeOutQuad'
  });
}

function animateScreenOut(el) {
  if (!el || !animeAvailable) return animeFallback();
  return anime({
    targets: el,
    opacity: [1, 0],
    translateY: [0, -10],
    duration: 200,
    easing: 'easeInQuad'
  });
}

function startDecorativeFloats() {
  if (!animeAvailable) return;
  var decos = qsa('.deco');
  decos.forEach(function(el) {
    var dur    = 2200 + Math.random() * 1400;
    var yAmt   = 6 + Math.random() * 6;
    var rotAmt = 3 + Math.random() * 4;
    var delay  = Math.random() * 1200;
    anime({
      targets: el,
      translateY: [-yAmt, yAmt],
      rotate: [-rotAmt, rotAmt],
      duration: dur,
      delay: delay,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine'
    });
  });
}

function animateExploreHighlight(exprEl, highlightText) {
  if (!exprEl || !highlightText) return animeFallback();
  var text = exprEl.textContent;
  var idx = text.indexOf(highlightText);
  if (idx === -1) return animeFallback();

  var before = document.createTextNode(text.slice(0, idx));
  var span   = document.createElement('span');
  span.className = 'step-highlight';
  span.textContent = highlightText;
  var after  = document.createTextNode(text.slice(idx + highlightText.length));

  exprEl.textContent = '';
  exprEl.appendChild(before);
  exprEl.appendChild(span);
  exprEl.appendChild(after);

  if (!animeAvailable) return animeFallback();
  return anime({
    targets: span,
    scale: [1, 1.08, 1],
    duration: 500,
    easing: 'easeOutBack'
  });
}

function animateExploreResolve(exprEl, newText) {
  if (!exprEl) return animeFallback();
  if (!animeAvailable) {
    exprEl.textContent = newText;
    return animeFallback();
  }
  var tl = anime.timeline({ easing: 'easeOutQuad' });
  tl.add({
    targets: exprEl,
    opacity: [1, 0],
    translateY: [0, -8],
    duration: 220
  }).add({
    targets: exprEl,
    duration: 1,
    complete: function() {
      exprEl.textContent = newText;
    }
  }).add({
    targets: exprEl,
    opacity: [0, 1],
    translateY: [8, 0],
    duration: 320
  });
  return tl;
}

function animateExploreAnnotation(annoEl) {
  if (!annoEl) return animeFallback();
  if (!animeAvailable) return animeFallback();
  return anime({
    targets: annoEl,
    opacity: [0, 1],
    translateY: [12, 0],
    duration: 340,
    easing: 'easeOutQuad'
  });
}

function animateCorrectCard(cardEl) {
  if (!cardEl) return;
  if (animeAvailable) {
    anime({
      targets: cardEl,
      scale: [1, 1.07, 1],
      duration: 480,
      easing: 'easeOutBack'
    });
  }
  cardEl.classList.add('card-correct-pulse');
}

function animateWrongCard(cardEl) {
  if (!cardEl) return;
  if (animeAvailable) {
    anime({
      targets: cardEl,
      translateX: [0, -9, 9, -7, 7, -4, 4, 0],
      duration: 500,
      easing: 'easeOutQuad'
    });
  } else {
    cardEl.classList.add('card-shake');
    setTimeout(function() { cardEl.classList.remove('card-shake'); }, 600);
  }
}

function animateStarParticles(container, count) {
  if (!container) return;
  count = count || 6;
  var emojis = ['⭐','✨','🌟','💫'];
  for (var i = 0; i < count; i++) {
    (function() {
      var el = document.createElement('div');
      el.className = 'star-particle';
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      var startX = 30 + Math.random() * 40;
      var startY = 30 + Math.random() * 40;
      el.style.left = startX + '%';
      el.style.top  = startY + '%';
      el.style.opacity = '0';
      container.appendChild(el);
      if (!animeAvailable) { el.remove(); return; }
      var spreadX = (Math.random() - 0.5) * 100;
      var spreadY = -40 - Math.random() * 60;
      anime({
        targets: el,
        translateX: [0, spreadX],
        translateY: [0, spreadY],
        scale: [0, 1.2, 0],
        opacity: [0, 1, 0],
        duration: 700 + Math.random() * 400,
        delay: Math.random() * 200,
        easing: 'easeOutCubic',
        complete: function() { el.remove(); }
      });
    })();
  }
}

function animateCompletionStars(container, count) {
  if (!container || !animeAvailable) {
    var stars = qsa('.star', container);
    stars.forEach(function(s) {
      s.style.opacity = '1';
      s.style.transform = 'scale(1)';
    });
    return;
  }
  var stars = qsa('.star', container);
  anime({
    targets: stars,
    scale: [0, 1.25, 1],
    opacity: [0, 1],
    rotate: [-15, 5, 0],
    duration: 550,
    delay: anime.stagger(130),
    easing: 'easeOutBack'
  });
}

function animateConfettiBurst(container, count) {
  if (!container) return;
  count = count || 28;
  for (var i = 0; i < count; i++) {
    (function() {
      var el = createConfettiParticle(container);
      if (!animeAvailable) { el.style.opacity = '0'; return; }
      var targetX = (Math.random() - 0.5) * 260;
      var targetY = 80 + Math.random() * 160;
      anime({
        targets: el,
        translateX: [0, targetX],
        translateY: [0, targetY],
        rotate: [0, Math.random() * 720 * (Math.random() > 0.5 ? 1 : -1)],
        opacity: [1, 0],
        duration: 900 + Math.random() * 600,
        delay: Math.random() * 300,
        easing: 'easeOutCubic',
        complete: function() { el.remove(); }
      });
    })();
  }
}

function animateLoadingBar(fillEl) {
  if (!fillEl || !animeAvailable) return;
  anime({
    targets: fillEl,
    width: ['0%', '100%'],
    duration: 1800,
    easing: 'easeOutQuad'
  });
}
