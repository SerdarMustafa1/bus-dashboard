const langs = {
  en: require('./translations/en'),
  et: require('./translations/et'),
  fi: require('./translations/fi'),
};

const fallback = 'en';
const base = 'en';
const whitelist = Object.keys(langs);

const checkTrans = (lang, key) =>
  whitelist.includes(lang) && Object.keys(langs[lang]).includes(key);

module.exports = (key, lang) => {
  if (!key) return '';
  if (lang) {
    if (checkTrans(lang, key)) return langs[lang][key];
    else if (checkTrans(fallback, key)) return langs[fallback][key];
  } else {
    if (checkTrans(base, key)) return langs[base][key];
    else if (checkTrans(fallback, key)) return langs[fallback][key];
  }
  return key;
};
