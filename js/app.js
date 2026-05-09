/* App orchestrator — rendering, event handling, screen transitions */

var _exploreAbort = false;
var _selectedCardEl = null;
var _htpShownOnce = false;
var _langSelected = 'en';
var _langSelectedLabel = 'English';
var _feedbackShowTimeout = null;
var _feedbackTimeout = null;
var _feedbackIsCorrect = null;

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
  var btnInfo       = qs('#btn-info');
  var btnGlobe      = qs('#btn-globe');
  var modalClose    = qs('#modal-close');
  var htpOverlay    = qs('#htp-modal');
  var langClose     = qs('#lang-close');
  var langOverlay   = qs('#lang-modal');

  if (btnReset)      btnReset.addEventListener('click', handleReset);
  if (btnSubmit)     btnSubmit.addEventListener('click', handleSubmit);
  if (btnFullscreen) btnFullscreen.addEventListener('click', handleFullscreen);
  if (btnInfo)       btnInfo.addEventListener('click', openHowToPlay);
  if (btnGlobe)      btnGlobe.addEventListener('click', openLangModal);
  if (modalClose)    modalClose.addEventListener('click', closeHowToPlay);
  if (htpOverlay)    htpOverlay.addEventListener('click', function(e) {
    if (e.target === htpOverlay) closeHowToPlay();
  });
  if (langClose)     langClose.addEventListener('click', closeLangModal);
  if (langOverlay)   langOverlay.addEventListener('click', function(e) {
    if (e.target === langOverlay) closeLangModal();
  });

  document.addEventListener('fullscreenchange', function() {
    var btn = qs('#btn-fullscreen');
    var img = btn && btn.querySelector('img');
    if (!img) return;
    img.src = document.fullscreenElement
      ? 'assets/icons/Exit_Fullscreen_icon.svg'
      : 'assets/icons/Fullscreen_icon.svg';
  });
}

/* ── Screen transition ─────────────────────────────── */
function transitionToScreen(screenName) {
  if (GameState.isAnimating) return;
  GameState.isAnimating = true;
  _exploreAbort = true;
  hideFeedback();

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
      if (screenName === 'loading') {
        var loaderOv = qs('#loader-overlay');
        if (loaderOv) loaderOv.classList.remove('loader--hidden');
        scheduleAutoAdvanceFromLoading();
      }
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
    case 'complete':  content.innerHTML = buildCompleteHTML();  break;
  }

  renderProgressDots();
  syncSubmitButton();

  if (screenName === 'practice')  attachPracticeListeners();
  if (screenName === 'complete')  attachCompleteListeners();
}

/* ── HTML builders ─────────────────────────────────── */
function buildLoadingHTML() {
  return '<div class="loading-screen"></div>';
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

function buildCompleteHTML() {
  return '<div></div>';
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

function attachCompleteListeners() {
  playComplete();
  setTimeout(openSummaryModal, 400);
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

  _feedbackShowTimeout = setTimeout(function() {
    _feedbackShowTimeout = null;
    GameState.recordAnswer();
    showInlineFeedback(correct);
  }, 600);
}

function handleReset() {
  if (GameState.currentScreen !== 'practice') return;

  // Undo the recorded answer if feedback is currently showing
  if (_feedbackIsCorrect !== null) {
    if (_feedbackIsCorrect) {
      GameState.score = Math.max(0, GameState.score - 1);
    } else {
      GameState.wrongCount = Math.max(0, GameState.wrongCount - 1);
    }
  }

  hideFeedback();
  GameState.selectedAnswer = null;
  GameState.isSubmitted    = false;
  _selectedCardEl          = null;
  transitionToScreen('practice');
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

/* ── Inline feedback ───────────────────────────────── */
function showInlineFeedback(isCorrect) {
  var overlay = qs('#feedback-overlay');
  var toast   = qs('#feedback-toast');
  var gif     = qs('#feedback-char-gif');
  if (!overlay || !toast || !gif) return;

  var q = practiceQuestions[GameState.currentQuestion];
  _feedbackIsCorrect = isCorrect;

  if (isCorrect) {
    toast.className = 'feedback-toast';
    toast.textContent = '🎉 ' + (q && q.bodmasRule ? q.bodmasRule : 'Correct!');
    gif.src = 'assets/GIFs/correct.gif';
    gif.alt = 'Correct';
    gif.className = 'feedback-char-gif feedback-char-gif--correct';
  } else {
    toast.className = 'feedback-toast feedback-toast--wrong';
    toast.textContent = '💪 Hint: ' + (q && q.hint ? q.hint : 'Not quite. Try again!');
    gif.src = 'assets/GIFs/incorrect.gif';
    gif.alt = 'Incorrect';
    gif.className = 'feedback-char-gif';
  }
  overlay.hidden = false;

  var isLastQuestion = GameState.currentQuestion === practiceQuestions.length - 1;
  if (isCorrect && isLastQuestion) launchConfetti();

  var delay = isCorrect ? 2500 : 2000;
  _feedbackTimeout = setTimeout(function() {
    _feedbackTimeout = null;
    _feedbackIsCorrect = null;
    overlay.hidden = true;
    if (isCorrect) {
      GameState.advance();
      if (GameState.currentScreen === 'complete') {
        renderProgressDots();
        playComplete();
        openSummaryModal();
      } else {
        transitionToScreen(GameState.currentScreen);
      }
    } else {
      GameState.selectedAnswer = null;
      GameState.isSubmitted    = false;
      _selectedCardEl          = null;
      transitionToScreen('practice');
    }
  }, delay);
}

function hideFeedback() {
  if (_feedbackShowTimeout) { clearTimeout(_feedbackShowTimeout); _feedbackShowTimeout = null; }
  if (_feedbackTimeout)     { clearTimeout(_feedbackTimeout);     _feedbackTimeout = null; }
  var overlay = qs('#feedback-overlay');
  if (overlay) overlay.hidden = true;
  _feedbackIsCorrect = null;
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
      var overlay = qs('#loader-overlay');
      if (overlay) overlay.classList.add('loader--hidden');
      transitionToScreen('explore');
      if (!_htpShownOnce) {
        _htpShownOnce = true;
        setTimeout(openHowToPlay, 500);
      }
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

/* ── How to Play modal ── */
function openHowToPlay() {
  var modal = qs('#htp-modal');
  if (!modal) return;
  modal.classList.add('modal--open');
  modal.setAttribute('aria-hidden', 'false');
  document.addEventListener('keydown', handleModalKeydown);
  var closeBtn = qs('#modal-close');
  if (closeBtn) setTimeout(function() { closeBtn.focus(); }, 50);
}

function closeHowToPlay() {
  var modal = qs('#htp-modal');
  if (!modal) return;
  modal.classList.remove('modal--open');
  modal.setAttribute('aria-hidden', 'true');
  document.removeEventListener('keydown', handleModalKeydown);
  var btnInfo = qs('#btn-info');
  if (btnInfo) btnInfo.focus();
}

function handleModalKeydown(e) {
  if (e.key === 'Escape') closeHowToPlay();
}

/* ── Language modal ── */
function openLangModal() {
  var modal = qs('#lang-modal');
  if (!modal) return;
  _showLangSelectView();
  modal.classList.add('modal--open');
  modal.setAttribute('aria-hidden', 'false');
  document.addEventListener('keydown', handleLangKeydown);
  var trigger = qs('#lang-trigger');
  if (trigger) setTimeout(function() { trigger.focus(); }, 50);
}

function closeLangModal() {
  var modal = qs('#lang-modal');
  if (!modal) return;
  var list = qs('#lang-list');
  if (list) list.hidden = true;
  var trigger = qs('#lang-trigger');
  if (trigger) trigger.setAttribute('aria-expanded', 'false');
  modal.classList.remove('modal--open');
  modal.setAttribute('aria-hidden', 'true');
  document.removeEventListener('keydown', handleLangKeydown);
  var btnGlobe = qs('#btn-globe');
  if (btnGlobe) btnGlobe.focus();
}

function _showLangSelectView() {
  var selectView = qs('#lang-select-view');
  var confirmView = qs('#lang-confirm-view');
  if (selectView)  selectView.hidden  = false;
  if (confirmView) confirmView.hidden = true;

  var trigger = qs('#lang-trigger');
  var list = qs('#lang-list');
  var currentText = qs('#lang-current-text');
  var cancelBtn = qs('#btn-lang-cancel');
  var applyBtn = qs('#btn-lang-apply');

  if (currentText) currentText.textContent = _langSelectedLabel;
  if (!trigger || !list) return;

  list.hidden = true;
  trigger.setAttribute('aria-expanded', 'false');

  // Mark the currently selected option
  qsa('.lang-option').forEach(function(opt) {
    var isActive = opt.getAttribute('data-lang') === _langSelected;
    opt.classList.toggle('lang-option--selected', isActive);
    opt.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  trigger.onclick = function() {
    var open = list.hidden;
    list.hidden = !open;
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  qsa('.lang-option').forEach(function(opt) {
    opt.onclick = function() {
      _langSelected = opt.getAttribute('data-lang');
      _langSelectedLabel = opt.getAttribute('data-label');
      if (currentText) currentText.textContent = _langSelectedLabel;
      qsa('.lang-option').forEach(function(o) {
        o.classList.remove('lang-option--selected');
        o.setAttribute('aria-selected', 'false');
      });
      opt.classList.add('lang-option--selected');
      opt.setAttribute('aria-selected', 'true');
      list.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    };
  });

  if (cancelBtn) cancelBtn.onclick = closeLangModal;
  if (applyBtn) applyBtn.onclick = _applyLanguage;
}

function _applyLanguage() {
  var selectView  = qs('#lang-select-view');
  var confirmView = qs('#lang-confirm-view');
  var confirmName = qs('#lang-confirm-name');
  if (confirmName) confirmName.textContent = _langSelectedLabel;
  if (selectView)  selectView.hidden  = true;
  if (confirmView) confirmView.hidden  = false;
  setTimeout(closeLangModal, 1800);
}

function handleLangKeydown(e) {
  if (e.key === 'Escape') closeLangModal();
}

/* ── Summary modal ── */
function openSummaryModal() {
  var modal = qs('#summary-modal');
  if (!modal) return;

  var score = GameState.score;
  var total = score + GameState.wrongCount;
  var pct = total > 0 ? Math.round((score / total) * 100) : 0;
  var earned = pct === 100 ? 3 : pct >= 80 ? 2 : pct >= 60 ? 1 : 0;

  var titleEl = qs('#summary-title');
  if (titleEl) {
    titleEl.textContent = earned === 3 ? 'BODMAS Pro!' : earned === 2 ? 'Well Done!' : earned === 1 ? 'Keep Practicing!' : 'Try Again!';
  }

  var starsEl = qs('#summary-stars');
  if (starsEl) {
    var html = '';
    for (var i = 0; i < 3; i++) {
      var cls = 'summary-star' + (i < earned ? '' : ' summary-star--unearned');
      html += '<img class="' + cls + '" src="assets/icons/star.svg" alt="' + (i < earned ? 'Earned star' : 'Unearned star') + '">';
    }
    starsEl.innerHTML = html;
  }

  var pctEl = qs('#summary-percent');
  if (pctEl) pctEl.textContent = pct + '%';

  var playBtn = qs('#btn-summary-play');
  if (playBtn) {
    playBtn.onclick = function() {
      closeSummaryModal();
      handlePlayAgain();
    };
  }

  modal.onclick = function(e) {
    if (e.target === modal) closeSummaryModal();
  };

  modal.classList.add('modal--open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeSummaryModal() {
  var modal = qs('#summary-modal');
  if (!modal) return;
  modal.classList.remove('modal--open');
  modal.setAttribute('aria-hidden', 'true');
}
