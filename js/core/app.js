/* App orchestrator — rendering, event handling, screen transitions */

var _exploreAbort = false;
var _selectedCardEl = null;
var _htpShownOnce = false;
var _feedbackTimeout = null;
var _feedbackIsCorrect = null;

/* ── Init ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  I18n.load(function(lang) {
    document.documentElement.lang = lang;
    applyStaticTranslations();
    renderProgressDots();
    attachPersistentListeners();
    transitionToScreen('loading');
  });
});

/* ── Apply translations to all static DOM elements ─── */
function applyStaticTranslations() {
  /* How to Play modal */
  _setText('#htp-title',    I18n.t('bodmasHtpTitle'));
  _setText('#htp-subtitle', I18n.t('bodmasHtpSubtitle'));
  _setHTML('#htp-step-1',   I18n.t('bodmasHtpStep1'));
  _setHTML('#htp-step-2',   I18n.t('bodmasHtpStep2'));
  _setHTML('#htp-step-3',   I18n.t('bodmasHtpStep3'));
  _setHTML('#htp-step-4',   I18n.t('bodmasHtpStep4'));
  _setText('#htp-step-5',   I18n.t('bodmasHtpStep5'));
  _setHTML('#htp-step-6',   I18n.t('bodmasHtpStep6'));

  /* Language modal */
  _setText('#lang-title',    I18n.t('langPopupTitle'));
  _setText('#lang-subtitle', I18n.t('langPopupSubtitle'));
  _setText('#btn-lang-cancel', I18n.t('cancelButton'));
  _setText('#btn-lang-apply',  I18n.t('applyButton'));
  _setText('#lang-confirm-title', I18n.t('langSelectedTitle'));

  /* Summary modal static labels */
  _setText('#summary-accuracy-label', I18n.t('bodmasAccuracy'));
  _setText('#btn-summary-play', I18n.t('playAgainButton') || I18n.t('bodmasWellDone') || 'Play Again');

  /* Footer submit button */
  _setText('#btn-submit', I18n.t('bodmasSubmit'));

  /* Header icon-button tooltips */
  _setTooltip('#btn-reset',      I18n.t('btnResetTitle'));
  _setTooltip('#btn-info',       I18n.t('btnInfoTitle'));
  _setTooltip('#btn-globe',      I18n.t('btnGlobeTitle'));
  var fsBtn = qs('#btn-fullscreen');
  if (fsBtn) {
    var fsKey = document.fullscreenElement ? 'btnFullscreenExit' : 'btnFullscreenEnter';
    fsBtn.title = I18n.t(fsKey);
    fsBtn.setAttribute('aria-label', I18n.t(fsKey));
  }
}

function _setText(sel, text) {
  var el = qs(sel);
  if (el && typeof text === 'string') el.textContent = text;
}

function _setHTML(sel, html) {
  var el = qs(sel);
  if (el && typeof html === 'string') el.innerHTML = html;
}

function _setTooltip(sel, text) {
  var el = qs(sel);
  if (el && typeof text === 'string') {
    el.title = text;
    el.setAttribute('aria-label', text);
  }
}

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
    if (!btn) return;
    var img = btn.querySelector('img');
    var isFs = !!document.fullscreenElement;
    if (img) img.src = isFs ? 'assets/icons/Exit_Fullscreen_icon.svg' : 'assets/icons/Fullscreen_icon.svg';
    var fsKey = isFs ? 'btnFullscreenExit' : 'btnFullscreenEnter';
    btn.title = I18n.t(fsKey);
    btn.setAttribute('aria-label', I18n.t(fsKey));
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

  content.innerHTML = ContentRenderer.render(screenName, GameState);

  renderProgressDots();
  syncSubmitButton();

  if (screenName === 'practice')  attachPracticeListeners();
  if (screenName === 'complete')  attachCompleteListeners();
}

/* ── HTML builders ─────────────────────────────────── */
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

  var correct = ContentValidators.isAnswerCorrect(GameState.currentQuestion, GameState.selectedAnswer);

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

  GameState.recordAnswer();
  showInlineFeedback(correct);
}

function handleReset() {
  if (GameState.currentScreen !== 'practice') return;

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

  _feedbackIsCorrect = isCorrect;

  if (isCorrect) {
    toast.className = 'feedback-toast';
    toast.textContent = ContentValidators.getFeedbackMessage(GameState.currentQuestion, true);
    gif.src = 'assets/GIFs/correct.gif';
    gif.alt = 'Correct';
    gif.className = 'feedback-char-gif feedback-char-gif--correct';
  } else {
    toast.className = 'feedback-toast feedback-toast--wrong';
    toast.textContent = ContentValidators.getFeedbackMessage(GameState.currentQuestion, false);
    gif.src = 'assets/GIFs/incorrect.gif';
    gif.alt = 'Incorrect';
    gif.className = 'feedback-char-gif';
  }
  overlay.hidden = false;

  var isLastQuestion = GameState.currentQuestion === ContentPages.getPracticeQuestionCount() - 1;
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
  if (_feedbackTimeout)     { clearTimeout(_feedbackTimeout);     _feedbackTimeout = null; }
  var overlay = qs('#feedback-overlay');
  if (overlay) overlay.hidden = true;
  _feedbackIsCorrect = null;
}

/* ── Explore sequence ──────────────────────────────── */
async function startExploreSequence() {
  _exploreAbort = false;
  await runExploreSequence({
    isCancelled: function() {
      return _exploreAbort || GameState.currentScreen !== 'explore';
    },
    onStartPractice: function() {
      transitionToScreen('practice');
    }
  });
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
        openHowToPlay();
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
  var total = ContentPages.getPracticeQuestionCount();
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
  var selectView  = qs('#lang-select-view');
  var confirmView = qs('#lang-confirm-view');
  if (selectView)  selectView.hidden  = false;
  if (confirmView) confirmView.hidden = true;

  var trigger     = qs('#lang-trigger');
  var list        = qs('#lang-list');
  var currentText = qs('#lang-current-text');
  var cancelBtn   = qs('#btn-lang-cancel');
  var applyBtn    = qs('#btn-lang-apply');

  /* Populate dropdown from I18n supported languages (all 5, native names) */
  var supported = I18n.getSupportedLanguages();
  if (list) {
    list.innerHTML = '';
    var activeLang = I18n.getLang();
    Object.keys(supported).forEach(function(code) {
      var nativeName = supported[code];
      var li = document.createElement('li');
      li.className = 'lang-option' + (code === activeLang ? ' lang-option--selected' : '');
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', code === activeLang ? 'true' : 'false');
      li.setAttribute('data-lang', code);
      li.setAttribute('data-label', nativeName);
      li.textContent = nativeName;
      list.appendChild(li);
    });
  }

  var _pendingLang      = I18n.getLang();
  var _pendingLabel     = supported[_pendingLang] || _pendingLang;
  var _originalLang     = _pendingLang;

  if (currentText) currentText.textContent = _pendingLabel;
  if (!trigger || !list) return;

  list.hidden = true;
  trigger.setAttribute('aria-expanded', 'false');

  function _syncApplyBtn() {
    if (!applyBtn) return;
    var changed = _pendingLang !== _originalLang;
    applyBtn.disabled = !changed;
    applyBtn.setAttribute('aria-disabled', changed ? 'false' : 'true');
  }
  _syncApplyBtn();

  trigger.onclick = function() {
    var open = list.hidden;
    if (open) {
      var rect       = trigger.getBoundingClientRect();
      var spaceBelow = window.innerHeight - rect.bottom - 12;
      var spaceAbove = rect.top - 12;
      var maxH       = 210;
      if (spaceBelow < maxH && spaceAbove > spaceBelow) {
        list.classList.add('lang-list--upward');
        list.style.maxHeight = Math.min(maxH, spaceAbove) + 'px';
      } else {
        list.classList.remove('lang-list--upward');
        list.style.maxHeight = Math.min(maxH, spaceBelow) + 'px';
      }
    }
    list.hidden = !open;
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  list.onclick = function(e) {
    var opt = e.target.closest('.lang-option');
    if (!opt) return;
    _pendingLang  = opt.getAttribute('data-lang');
    _pendingLabel = opt.getAttribute('data-label');
    if (currentText) currentText.textContent = _pendingLabel;
    qsa('.lang-option', list).forEach(function(o) {
      o.classList.remove('lang-option--selected');
      o.setAttribute('aria-selected', 'false');
    });
    opt.classList.add('lang-option--selected');
    opt.setAttribute('aria-selected', 'true');
    list.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    _syncApplyBtn();
  };

  if (cancelBtn) cancelBtn.onclick = function() {
    closeLangModal();
  };

  if (applyBtn) applyBtn.onclick = function() {
    _applyLanguage(_pendingLang, _pendingLabel);
  };
}

function _applyLanguage(langCode, langLabel) {
  /* Commit the new language */
  I18n.setLang(langCode);

  /* Show the confirmation view */
  var selectView  = qs('#lang-select-view');
  var confirmView = qs('#lang-confirm-view');
  var confirmTitle = qs('#lang-confirm-title');

  if (confirmTitle) confirmTitle.textContent = I18n.t('langSelectedTitle');

  var msgEl = qs('#lang-confirm-msg');
  if (msgEl) {
    var msgTemplate = I18n.t('langSelectedMessageStart');
    var parts = msgTemplate.split('{language}');
    var before = parts[0] || '';
    var after  = parts.length > 1 ? parts[1] : '';
    msgEl.innerHTML =
      escapeText(before) +
      '<strong class="lang-highlight">' + escapeText(langLabel) + '</strong>' +
      escapeText(after) +
      '<br><span>' + escapeText(I18n.t('langSelectedMessageEnd')) + '</span>';
  }

  if (selectView)   selectView.hidden  = true;
  if (confirmView)  confirmView.hidden = false;

  /* After modal closes: apply all translations + re-render current screen */
  setTimeout(function() {
    closeLangModal();
    _exploreAbort = true;   // stop any running explore sequence
    /* Reset pending selection so stale _selectedCardEl doesn't linger */
    GameState.selectedAnswer = null;
    GameState.isSubmitted    = false;
    _selectedCardEl          = null;
    applyStaticTranslations();
    renderScreen(GameState.currentScreen);
    if (GameState.currentScreen === 'explore') {
      _exploreAbort = false;
      startExploreSequence();
    }
  }, 1800);
}

function handleLangKeydown(e) {
  if (e.key === 'Escape') closeLangModal();
}

/* ── Summary modal ── */
function openSummaryModal() {
  var modal = qs('#summary-modal');
  if (!modal) return;

  var score = GameState.score;
  var summary = ContentValidators.getSummaryResult(score, GameState.wrongCount);
  var pct = summary.accuracy;
  var earned = summary.stars;

  var titleEl = qs('#summary-title');
  if (titleEl) {
    titleEl.textContent = I18n.t(summary.titleKey);
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

  var accEl = qs('#summary-accuracy-label');
  if (accEl) accEl.textContent = I18n.t('bodmasAccuracy');

  var playBtn = qs('#btn-summary-play');
  if (playBtn) {
    playBtn.textContent = I18n.t('playAgainButton') || 'Play Again';
    playBtn.onclick = function() {
      closeSummaryModal();
      handlePlayAgain();
    };
  }

  modal.classList.add('modal--open');
  modal.setAttribute('aria-hidden', 'false');

  // Notify parent window (e.g. LMS iframe host) that the game is complete
  try {
    window.parent.postMessage({
      type:      'GAME_COMPLETE',
      score:     score,
      total:     ContentPages.getPracticeQuestionCount(),
      correct:   score,
      wrong:     GameState.wrongCount,
      accuracy:  pct,
      stars:     earned
    }, '*');
  } catch (e) { /* cross-origin parent may block access — silently ignore */ }
}

function closeSummaryModal() {
  var modal = qs('#summary-modal');
  if (!modal) return;
  modal.classList.remove('modal--open');
  modal.setAttribute('aria-hidden', 'true');
}
