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

