/* App orchestrator — rendering, event handling, screen transitions */

var _exploreAbort = false;
var _selectedCardEl = null;

/* ── Init ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  renderProgressDots();
  attachPersistentListeners();
  transitionToScreen('loading');
});

/* ── Persistent listeners (header/footer — attached once) ── */
function attachPersistentListeners() {
  var btnReset      = qs('#btn-reset');
  var btnSubmit     = qs('#btn-submit');
  var btnFullscreen = qs('#btn-fullscreen');

  if (btnReset)      btnReset.addEventListener('click', handleReset);
  if (btnSubmit)     btnSubmit.addEventListener('click', handleSubmit);
  if (btnFullscreen) btnFullscreen.addEventListener('click', handleFullscreen);
}

/* ── Screen transition ─────────────────────────────── */
function transitionToScreen(screenName) {
  if (GameState.isAnimating) return;
  GameState.isAnimating = true;
  _exploreAbort = true;

  var content = qs('#content-area');
  var out = animateScreenOut(content);
  var outDone = out && out.finished ? out.finished : Promise.resolve();

  outDone.then(function() {
    GameState.currentScreen = screenName;
    renderScreen(screenName);
    _exploreAbort = false;

    if (content) {
      content.style.opacity = '0';
      content.style.transform = 'translateY(18px)';
    }
    var inAnim = animateScreenIn(content);
    var inDone = inAnim && inAnim.finished ? inAnim.finished : Promise.resolve();
    inDone.then(function() {
      GameState.isAnimating = false;
      if (screenName === 'explore') startExploreSequence();
      if (screenName === 'loading') scheduleAutoAdvanceFromLoading();
    });
  });
}

/* ── Screen dispatcher ─────────────────────────────── */
function renderScreen(screenName) {
  var content = qs('#content-area');
  if (!content) return;

  switch (screenName) {
    case 'loading':   content.innerHTML = buildLoadingHTML();   break;
    case 'explore':   content.innerHTML = buildExploreHTML();   break;
    case 'practice':  content.innerHTML = buildPracticeHTML();  break;
    case 'correct':   content.innerHTML = buildCorrectHTML();   break;
    case 'wrong':     content.innerHTML = buildWrongHTML();     break;
    case 'complete':  content.innerHTML = buildCompleteHTML();  break;
  }

  renderProgressDots();
  syncSubmitButton();

  if (screenName === 'practice')  attachPracticeListeners();
  if (screenName === 'correct')   attachCorrectListeners();
  if (screenName === 'wrong')     attachWrongListeners();
  if (screenName === 'complete')  attachCompleteListeners();
}

/* ── HTML builders ─────────────────────────────────── */
function buildLoadingHTML() {
  return [
    '<div class="loading-screen">',
      '<div class="loading-logo">BOD<span>MAS</span></div>',
      '<div class="loading-tagline">Learn the order of operations!</div>',
      '<div class="loading-bar-track">',
        '<div class="loading-bar-fill" id="loading-bar"></div>',
      '</div>',
    '</div>'
  ].join('');
}

function buildExploreHTML() {
  return [
    '<div class="explore-screen">',
      '<div class="explore-label">Explore Mode — How BODMAS works</div>',
      '<div class="explore-expression-wrap">',
        '<div class="explore-expression" id="explore-expr"></div>',
      '</div>',
      '<div class="explore-annotation-wrap">',
        '<div class="explore-annotation" id="explore-anno" style="opacity:0"></div>',
      '</div>',
      '<div class="explore-step-counter" id="explore-step-counter"></div>',
      '<button class="btn-start-practice" id="btn-start-practice">',
        'Start Practice →',
      '</button>',
    '</div>'
  ].join('');
}

function buildPracticeHTML() {
  var q = practiceQuestions[GameState.currentQuestion];
  if (!q) return '<div style="padding:2rem;text-align:center">All done!</div>';

  var optCards = q.options.map(function(opt, i) {
    return [
      '<button class="option-card" role="radio" aria-checked="false"',
        ' data-index="' + i + '"',
        ' aria-label="Answer option: ' + opt + '">',
        opt,
      '</button>'
    ].join('');
  }).join('');

  return [
    '<div class="practice-screen">',
      '<div class="practice-q-label">Question ' + (GameState.currentQuestion + 1) + ' of ' + practiceQuestions.length + '</div>',
      '<div class="practice-expression">' + escapeText(q.expression) + '</div>',
      '<div class="options-grid" role="radiogroup" aria-label="Answer options" id="options-grid">',
        optCards,
      '</div>',
    '</div>'
  ].join('');
}

function buildCorrectHTML() {
  var q = practiceQuestions[GameState.currentQuestion];
  return [
    '<div class="feedback-screen" id="feedback-correct">',
      '<div class="feedback-icon feedback-icon--correct" aria-hidden="true">✓</div>',
      '<div class="feedback-heading">Correct! 🎉</div>',
      '<div class="feedback-rule">' + escapeText(q ? q.bodmasRule : '') + '</div>',
      '<button class="btn-next" id="btn-next">',
        GameState.currentQuestion >= practiceQuestions.length - 1 ? 'See Results 🏆' : 'Next Question →',
      '</button>',
    '</div>'
  ].join('');
}

function buildWrongHTML() {
  var q = practiceQuestions[GameState.currentQuestion];
  return [
    '<div class="feedback-screen" id="feedback-wrong">',
      '<div class="feedback-icon feedback-icon--wrong" aria-hidden="true">✕</div>',
      '<div class="feedback-heading">Oops! Try again 💪</div>',
      '<div class="feedback-hint">Hint: ' + escapeText(q ? q.hint : '') + '</div>',
      '<button class="btn-retry" id="btn-retry">Try Again</button>',
    '</div>'
  ].join('');
}

function buildCompleteHTML() {
  var earned = GameState.score >= 5 ? 3 : GameState.score >= 3 ? 2 : 1;
  var stars = '';
  for (var i = 0; i < 3; i++) {
    stars += '<span class="star" aria-hidden="true">' + (i < earned ? '⭐' : '☆') + '</span>';
  }
  return [
    '<div class="completion-screen" id="completion-screen">',
      '<div class="completion-heading">Amazing Work! 🎊</div>',
      '<div class="stars-row" id="stars-row" aria-label="' + earned + ' out of 3 stars earned">' + stars + '</div>',
      '<div class="completion-score">You scored <strong>' + GameState.score + '</strong> out of ' + practiceQuestions.length + '</div>',
      '<button class="btn-play-again" id="btn-play-again">Play Again</button>',
    '</div>'
  ].join('');
}

/* ── Listener attachment ───────────────────────────── */
function attachPracticeListeners() {
  var cards = qsa('.option-card');
  cards.forEach(function(card) {
    card.addEventListener('click', function() {
      handleOptionSelect(parseInt(card.getAttribute('data-index'), 10));
    });
  });
}

function attachCorrectListeners() {
  var btn = qs('#btn-next');
  if (btn) btn.addEventListener('click', handleNext);

  var screen = qs('#feedback-correct');
  if (screen) {
    setTimeout(function() {
      animateStarParticles(screen, 8);
    }, 200);
  }
}

function attachWrongListeners() {
  var btn = qs('#btn-retry');
  if (btn) btn.addEventListener('click', handleTryAgain);
}

function attachCompleteListeners() {
  var btn = qs('#btn-play-again');
  if (btn) btn.addEventListener('click', handlePlayAgain);

  var starsContainer = qs('#stars-row');
  var screen = qs('#completion-screen');
  if (starsContainer) animateCompletionStars(starsContainer, 3);
  if (screen) setTimeout(function() { animateConfettiBurst(screen, 30); }, 350);

  playComplete();
}

/* ── Event handlers ────────────────────────────────── */
function handleOptionSelect(index) {
  if (GameState.isSubmitted || GameState.isAnimating) return;
  GameState.selectedAnswer = index;

  var cards = qsa('.option-card');
  cards.forEach(function(card, i) {
    setClass(card, {
      'option-card--selected': i === index
    });
    card.setAttribute('aria-checked', i === index ? 'true' : 'false');
  });

  _selectedCardEl = cards[index] || null;
  syncSubmitButton();
}

function handleSubmit() {
  if (!GameState.canSubmit()) return;
  initAudio();

  var correct = GameState.selectedAnswer === practiceQuestions[GameState.currentQuestion].correctIndex;

  if (_selectedCardEl) {
    if (correct) {
      _selectedCardEl.classList.add('option-card--correct');
      animateCorrectCard(_selectedCardEl);
      playCorrect();
    } else {
      _selectedCardEl.classList.add('option-card--wrong');
      animateWrongCard(_selectedCardEl);
      playWrong();
    }
    disableAllCards();
  }

  GameState.isSubmitted = true;
  syncSubmitButton();

  var delay = 900;
  setTimeout(function() {
    GameState.recordAnswer();
    transitionToScreen(correct ? 'correct' : 'wrong');
  }, delay);
}

function handleNext() {
  GameState.advance();
  transitionToScreen(GameState.currentScreen);
}

function handleTryAgain() {
  GameState.selectedAnswer = null;
  GameState.isSubmitted    = false;
  _selectedCardEl          = null;
  transitionToScreen('practice');
}

function handleReset() {
  GameState.reset();
  _selectedCardEl = null;
  transitionToScreen('loading');
}

function handlePlayAgain() {
  GameState.reset();
  transitionToScreen('loading');
}

function handleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen && document.exitFullscreen();
  }
}

/* ── Explore sequence ──────────────────────────────── */
async function startExploreSequence() {
  _exploreAbort = false;
  var exprEl  = qs('#explore-expr');
  var annoEl  = qs('#explore-anno');
  var counter = qs('#explore-step-counter');

  if (!exprEl || !annoEl) return;

  for (var i = 0; i < exploreSteps.length; i++) {
    if (_exploreAbort || GameState.currentScreen !== 'explore') return;

    var step = exploreSteps[i];
    if (counter) counter.textContent = 'Step ' + (i + 1) + ' of ' + exploreSteps.length;

    exprEl.textContent = step.expression;
    annoEl.style.opacity = '0';

    if (step.highlightPart) {
      var highlightAnim = animateExploreHighlight(exprEl, step.highlightPart);
      if (highlightAnim && highlightAnim.finished) await highlightAnim.finished;
    }

    if (_exploreAbort || GameState.currentScreen !== 'explore') return;

    annoEl.textContent = step.annotation;
    animateExploreAnnotation(annoEl);

    await wait(1000);
    if (_exploreAbort || GameState.currentScreen !== 'explore') return;

    if (step.resolvedExpression) {
      var resolveAnim = animateExploreResolve(exprEl, step.resolvedExpression);
      if (resolveAnim && resolveAnim.finished) await resolveAnim.finished;
      await wait(700);
      if (_exploreAbort || GameState.currentScreen !== 'explore') return;
    }
  }

  if (_exploreAbort || GameState.currentScreen !== 'explore') return;

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
    startBtn.addEventListener('click', function() {
      transitionToScreen('practice');
    });
  }

  if (counter) counter.textContent = 'Ready to practice!';
}

/* ── Loading auto-advance ──────────────────────────── */
function scheduleAutoAdvanceFromLoading() {
  setTimeout(function() {
    if (GameState.currentScreen === 'loading') {
      transitionToScreen('explore');
    }
  }, 2200);
}

/* ── Progress dots ─────────────────────────────────── */
function renderProgressDots() {
  var container = qs('#progress-dots');
  if (!container) return;

  var mode = GameState.currentScreen;
  var isPractice = (mode === 'practice' || mode === 'correct' || mode === 'wrong');
  var total = practiceQuestions.length;
  var current = GameState.currentQuestion;

  container.innerHTML = '';
  for (var i = 0; i < total; i++) {
    var dot = document.createElement('div');
    dot.className = 'dot';
    if (isPractice || mode === 'complete') {
      if (i < current)       dot.classList.add('dot--filled');
      else if (i === current && mode !== 'complete') dot.classList.add('dot--current');
    }
    container.appendChild(dot);
  }

  var done = mode === 'complete' ? total : current;
  container.setAttribute('aria-valuenow', done);
  container.setAttribute('aria-valuetext', done + ' of ' + total);
}

/* ── Submit sync ───────────────────────────────────── */
function syncSubmitButton() {
  var btn = qs('#btn-submit');
  if (!btn) return;
  var can = GameState.canSubmit();
  btn.disabled = !can;
  btn.setAttribute('aria-disabled', can ? 'false' : 'true');
}

/* ── Helpers ───────────────────────────────────────── */
function disableAllCards() {
  qsa('.option-card').forEach(function(c) {
    c.setAttribute('disabled', 'true');
    c.classList.add('option-card--submitted');
  });
}

function escapeText(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
