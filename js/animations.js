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
