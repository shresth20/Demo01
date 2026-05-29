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

async function runExploreSequence(options) {
  options = options || {};
  var isCancelled = options.isCancelled || function() { return false; };
  var onStartPractice = options.onStartPractice || function() {};

  var exprEl  = qs('#explore-expr');
  var annoEl  = qs('#explore-anno');
  var counter = qs('#explore-step-counter');
  if (!exprEl || !annoEl) return;

  var steps = ContentPages.getExploreSteps();
  for (var i = 0; i < steps.length; i++) {
    if (isCancelled()) return;

    var step = steps[i];
    var annoText = I18n.t(ContentPages.getExploreAnnotationKey(i));
    if (counter) counter.textContent = I18n.t('bodmasStepOf', { current: i + 1, total: steps.length });

    exprEl.textContent = step.expression;
    annoEl.style.opacity = '0';

    if (step.highlightPart) {
      var highlightAnim = animateExploreHighlight(exprEl, step.highlightPart);
      if (highlightAnim && highlightAnim.finished) await highlightAnim.finished;
    }

    if (isCancelled()) return;

    annoEl.textContent = annoText;
    animateExploreAnnotation(annoEl);

    await wait(1000);
    if (isCancelled()) return;

    if (step.resolvedExpression) {
      var resolveAnim = animateExploreResolve(exprEl, step.resolvedExpression);
      if (resolveAnim && resolveAnim.finished) await resolveAnim.finished;
      await wait(700);
      if (isCancelled()) return;
    }
  }

  if (isCancelled()) return;

  var startBtn = qs('#btn-start-practice');
  if (startBtn) {
    startBtn.classList.add('visible');
    if (animeAvailable) {
      anime({
        targets: startBtn,
        opacity: [0, 1],
        translateY: [12, 0],
        duration: 480,
        easing: 'easeOutBack'
      });
    }
    startBtn.addEventListener('click', onStartPractice);
  }

  if (counter) counter.textContent = I18n.t('bodmasReadyLabel');
}

function launchConfetti() {
  var existing = document.querySelector('.celebration');
  if (existing) existing.remove();

  if (typeof window.matchMedia === 'function' && window.matchMedia('(orientation: portrait)').matches) {
    return;
  }

  var el = document.createElement('div');
  el.className = 'celebration';

  var total    = 150;
  var topCount = Math.floor(total * 0.35);

  for (var i = 0; i < total; i++) {
    var piece = document.createElement('div');
    piece.className = 'confetti';
    piece.style.left            = (Math.random() * 100) + 'vw';
    piece.style.backgroundColor = 'hsl(' + Math.floor(Math.random() * 360) + ', 100%, 50%)';
    piece.style.width           = (6 + Math.random() * 8) + 'px';
    piece.style.height          = (6 + Math.random() * 8) + 'px';

    if (i < topCount) {
      piece.style.top                     = (Math.random() * 8) + '%';
      piece.style.animationName           = 'confetti-stay';
      piece.style.animationDuration       = (4 + Math.random() * 3) + 's';
      piece.style.animationDelay          = (Math.random() * 2) + 's';
      piece.style.animationTimingFunction = 'ease-out';
      piece.style.animationFillMode       = 'forwards';
    } else {
      piece.style.animationDelay    = (Math.random() * 2) + 's';
      piece.style.animationDuration = (2 + Math.random() * 2) + 's';
    }
    el.appendChild(piece);
  }

  document.body.appendChild(el);
  setTimeout(function() { if (el.parentNode) el.remove(); }, 8000);
}
