/* i18n singleton — loads locales.json, merges BODMAS_LOCALES, persists to localStorage */
var I18n = (function() {
  var _data   = null;
  var _lang   = 'en';
  var STORAGE_KEY = 'bodmas_lang';

  /* Load locales.json then merge BODMAS_LOCALES into each language section */
  function load(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'locales.json', true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState !== 4) return;
      var ok = (xhr.status === 200 || xhr.status === 0);
      if (!ok) {
        // Fallback: use only BODMAS_LOCALES so game still works
        _data = { defaultLanguage: 'en', supportedLanguages: {}, languageLabels: {} };
      } else {
        try {
          _data = JSON.parse(xhr.responseText);
        } catch(e) {
          _data = { defaultLanguage: 'en', supportedLanguages: {}, languageLabels: {} };
        }
      }
      _mergeBodymasLocales();
      _lang = _data.defaultLanguage || 'en';
      callback(_lang);
    };
    try { xhr.send(); } catch(e) {
      _data = { defaultLanguage: 'en', supportedLanguages: {}, languageLabels: {} };
      _mergeBodymasLocales();
      callback('en');
    }
  }

  function _mergeBodymasLocales() {
    if (typeof BODMAS_LOCALES === 'undefined') return;
    Object.keys(BODMAS_LOCALES).forEach(function(lang) {
      if (!_data[lang]) _data[lang] = {};
      var src = BODMAS_LOCALES[lang];
      Object.keys(src).forEach(function(k) {
        _data[lang][k] = src[k];
      });
    });
    /* Ensure supportedLanguages is populated from BODMAS_LOCALES if empty */
    if (!_data.supportedLanguages || Object.keys(_data.supportedLanguages).length === 0) {
      _data.supportedLanguages = { en: 'English', hi: 'हिन्दी', mr: 'मराठी', te: 'తెలుగు', gu: 'ગુજરાતી' };
    }
  }

  function setLang(code) {
    if (!_data || !_data[code]) return;
    _lang = code;
    document.documentElement.lang = code;
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

  function _safeGetStorage(key) {
    try { return localStorage.getItem(key); } catch(e) { return null; }
  }

  function _safeSetStorage(key, val) {
    try { localStorage.setItem(key, val); } catch(e) {}
  }

  return { load: load, setLang: setLang, getLang: getLang, t: t, tRandom: tRandom, getSupportedLanguages: getSupportedLanguages };
})();
