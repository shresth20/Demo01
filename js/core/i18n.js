/* i18n singleton - loads core and content locale JSON */
var I18n = (function() {
  var _data   = null;
  var _lang   = 'en';
  var _LS_KEY = 'game_lang';

  function _emptyCoreData() {
    return { defaultLanguage: 'en', supportedLanguages: {}, languageLabels: {} };
  }

  function _getUrlLang() {
    try {
      return new URLSearchParams(window.location.search).get('lang') || '';
    } catch(e) { return ''; }
  }

  function _setUrlLang(code) {
    try {
      var params = new URLSearchParams(window.location.search);
      params.set('lang', code);
      history.replaceState(null, '', window.location.pathname + '?' + params.toString());
    } catch(e) {}
  }

  function _isSupportedLang(code) {
    return !!(_data && code && _data[code]);
  }

  function _getStoredLang() {
    try { return localStorage.getItem(_LS_KEY) || ''; } catch(e) { return ''; }
  }

  function _setStoredLang(code) {
    try { localStorage.setItem(_LS_KEY, code); } catch(e) {}
  }

  function _resolveInitialLang(defaultLang) {
    var urlLang = _getUrlLang();
    if (_isSupportedLang(urlLang)) {
      _setStoredLang(urlLang);
      return urlLang;
    }

    var storedLang = _getStoredLang();
    if (_isSupportedLang(storedLang)) return storedLang;

    return _isSupportedLang(defaultLang) ? defaultLang : 'en';
  }

  function _loadJson(path, fallback, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', path, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState !== 4) return;
      var ok = (xhr.status === 200 || xhr.status === 0);
      if (!ok) {
        callback(fallback);
        return;
      }
      try {
        callback(JSON.parse(xhr.responseText));
      } catch(e) {
        callback(fallback);
      }
    };
    try { xhr.send(); } catch(e) {
      callback(fallback);
    }
  }

  /* Load core locale metadata, then merge game/content strings. */
  function load(callback) {
    _loadJson('locales/core.json', _emptyCoreData(), function(coreData) {
      _data = coreData || _emptyCoreData();
      _loadJson('locales/content.json', {}, function(contentData) {
        _mergeContentLocales(contentData || {});
        var resolved = _resolveInitialLang(_data.defaultLanguage);
        _lang = (_data[resolved]) ? resolved : (_data.defaultLanguage || 'en');
        _setUrlLang(_lang);
        callback(_lang);
      });
    });
  }

  function _mergeContentLocales(contentLocales) {
    Object.keys(contentLocales).forEach(function(lang) {
      if (!_data[lang]) _data[lang] = {};
      var src = contentLocales[lang];
      if (!src || typeof src !== 'object' || Array.isArray(src)) return;
      Object.keys(src).forEach(function(k) {
        _data[lang][k] = src[k];
      });
    });
    /* Ensure supportedLanguages is populated if the core locale file is empty. */
    if (!_data.supportedLanguages || Object.keys(_data.supportedLanguages).length === 0) {
      _data.supportedLanguages = { en: 'English', hi: 'हिन्दी', mr: 'मराठी', te: 'తెలుగు', gu: 'ગુજરાતી', od: 'ଓଡ଼ିଆ' };
    }
  }

  function setLang(code) {
    if (!_data || !_data[code]) return;
    _lang = code;
    document.documentElement.lang = code;
    _setStoredLang(code);
    _setUrlLang(code);
  }

  function getLang() { return _lang; }

  function t(key, replacements) {
    if (!_data) return key;
    var dict  = _data[_lang] || {};
    var enDict = _data['en'] || {};
    var val = (key in dict) ? dict[key] : ((key in enDict) ? enDict[key] : key);
    if (Array.isArray(val)) return val;
    if (typeof val !== 'string') return key;
    if (replacements) {
      Object.keys(replacements).forEach(function(k) {
        val = val.replace(new RegExp('\\{' + k + '\\}', 'g'), String(replacements[k]));
      });
    }
    return val;
  }

  function tRandom(key) {
    var val = t(key);
    if (Array.isArray(val) && val.length > 0) {
      return val[Math.floor(Math.random() * val.length)];
    }
    return typeof val === 'string' ? val : key;
  }

  /* Returns { en: 'English', hi: 'हिन्दी', … } — each lang's own native name */
  function getSupportedLanguages() {
    return (_data && _data.supportedLanguages) ? _data.supportedLanguages : {};
  }

  return { load: load, setLang: setLang, getLang: getLang, t: t, tRandom: tRandom, getSupportedLanguages: getSupportedLanguages };
})();
