/* GameState — singleton on global scope */

var GameState = {
  currentScreen:   'loading',
  currentQuestion: 0,
  score:           0,
  selectedAnswer:  null,
  isSubmitted:     false,
  isAnimating:     false,

  reset: function() {
    this.currentScreen   = 'loading';
    this.currentQuestion = 0;
    this.score           = 0;
    this.selectedAnswer  = null;
    this.isSubmitted     = false;
    this.isAnimating     = false;
  },

  canSubmit: function() {
    return this.selectedAnswer !== null && !this.isSubmitted && !this.isAnimating;
  },

  recordAnswer: function() {
    var q = practiceQuestions[this.currentQuestion];
    if (this.selectedAnswer === q.correctIndex) this.score += 1;
    this.isSubmitted = true;
  },

  advance: function() {
    this.currentQuestion += 1;
    this.selectedAnswer   = null;
    this.isSubmitted      = false;
    if (this.currentQuestion >= practiceQuestions.length) {
      this.currentScreen = 'complete';
    } else {
      this.currentScreen = 'practice';
    }
  }
};
