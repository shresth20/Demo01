/* Web Audio API tones — no external files, works offline */

var _audioCtx = null;

function initAudio() {
  if (_audioCtx) return;
  try {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    _audioCtx = null;
  }
}

function _playTone(freq, type, duration, gainVal) {
  if (!_audioCtx) return;
  try {
    var osc  = _audioCtx.createOscillator();
    var gain = _audioCtx.createGain();
    osc.connect(gain);
    gain.connect(_audioCtx.destination);
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(gainVal || 0.18, _audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + duration);
    osc.start(_audioCtx.currentTime);
    osc.stop(_audioCtx.currentTime + duration);
  } catch (e) {}
}

function playCorrect() {
  _playTone(523, 'triangle', 0.28, 0.2);
  setTimeout(function() { _playTone(659, 'triangle', 0.25, 0.18); }, 90);
}

function playWrong() {
  _playTone(220, 'sawtooth', 0.22, 0.12);
}

function playComplete() {
  var notes = [262, 330, 392, 523];
  notes.forEach(function(freq, i) {
    setTimeout(function() { _playTone(freq, 'triangle', 0.22, 0.18); }, i * 110);
  });
}
