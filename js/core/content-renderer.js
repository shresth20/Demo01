var ContentRenderer = (function() {
  function render(screenName, state) {
    if (typeof ContentPages === 'undefined' || typeof ContentPages.buildScreen !== 'function') return '';
    return ContentPages.buildScreen(screenName, state);
  }

  return {
    render: render
  };
})();
