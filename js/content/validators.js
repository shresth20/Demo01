var ContentValidators = (function() {
  function isAnswerCorrect(questionIndex, selectedAnswer) {
    var q = ContentPages.getPracticeQuestion(questionIndex);
    return !!q && selectedAnswer === q.correctIndex;
  }

  function getFeedbackMessage(questionIndex, isCorrect) {
    var q = ContentPages.getPracticeQuestion(questionIndex);
    if (isCorrect) {
      var rule = (q && q.id) ? I18n.t('bodmasRule_' + q.id) : (q && q.bodmasRule ? q.bodmasRule : 'Correct!');
      return I18n.t('bodmasCorrectPrefix') + rule;
    }

    var hint = (q && q.id) ? I18n.t('bodmasHint_' + q.id) : (q && q.hint ? q.hint : 'Try again!');
    return I18n.t('bodmasHintPrefix') + hint;
  }

  function getSummaryResult(score, wrongCount) {
    var total = score + wrongCount;
    var accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
    var stars = accuracy === 100 ? 3 : accuracy >= 80 ? 2 : accuracy >= 60 ? 1 : 0;
    var titleKey = stars === 3
      ? 'bodmasPro'
      : stars === 2
        ? 'bodmasWellDone'
        : stars === 1
          ? 'bodmasKeepPracticing'
          : 'bodmasTryAgain';

    return {
      accuracy: accuracy,
      stars: stars,
      titleKey: titleKey
    };
  }

  return {
    isAnswerCorrect: isAnswerCorrect,
    getFeedbackMessage: getFeedbackMessage,
    getSummaryResult: getSummaryResult
  };
})();
