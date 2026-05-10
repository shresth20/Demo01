/* audio.js — file-based sounds, zero-delay preloaded */

var _audioCtx = null;
var _sounds   = {};

/* Preload all files immediately — browser fetches/decodes before first interaction */
(function() {
  try {
    var files = {
      click:   'assets/sounds/button-click.wav',
      correct: 'assets/sounds/correct-answer.mp3',
      wrong:   'assets/sounds/incorrect-answer.mp3'
    };
    Object.keys(files).forEach(function(k) {
      var a = new Audio(files[k]);
      a.preload = 'auto';
      a.load();
      _sounds[k] = a;
    });
  } catch(e) {}
})();

/* Single capture-phase listener — plays click sound on every button press */
document.addEventListener('click', function(e) {
  if (e.target.closest('button')) _playSound(_sounds.click);
}, true);

/* Called on first submit — creates AudioContext for playComplete tones */
function initAudio() {
  if (_audioCtx) return;
  try {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch(e) { _audioCtx = null; }
}

function _playSound(snd) {
  if (!snd) return;
  try {
    snd.currentTime = 0;
    snd.play().catch(function() {});
  } catch(e) {}
}

function _playTone(freq, type, duration, gainVal) {
  if (!_audioCtx) return;
  try {
    var osc  = _audioCtx.createOscillator();
    var gain = _audioCtx.createGain();
    osc.connect(gain);
    gain.connect(_audioCtx.destination);
    osc.type            = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(gainVal || 0.18, _audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + duration);
    osc.start(_audioCtx.currentTime);
    osc.stop(_audioCtx.currentTime + duration);
  } catch(e) {}
}

function playCorrect() { _playSound(_sounds.correct); }
function playWrong()   { _playSound(_sounds.wrong); }

function playComplete() {
  var notes = [262, 330, 392, 523];
  notes.forEach(function(freq, i) {
    setTimeout(function() { _playTone(freq, 'triangle', 0.22, 0.18); }, i * 110);
  });
}
