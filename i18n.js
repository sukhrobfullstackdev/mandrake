const defaultLocale = 'en-US';
const locales = [
  'en-US',
  'af',
  'az',
  'bg',
  'ca',
  'cs',
  'cy',
  'cy-GB',
  'da',
  'de',
  'el',
  'es',
  'et',
  'fi',
  'fr',
  'hr',
  'hu',
  'id',
  'it',
  'ja',
  'ko',
  'mk-MK',
  'lt-LT',
  'lv-LV',
  'nl',
  'no',
  'pl',
  'pt',
  'ro',
  'ru',
  'sk',
  'sl-SI',
  'sr',
  'sv',
  'th',
  'tr',
  'vi',
  'zh-CN',
  'zh-TW',
];

module.exports = {
  locales,
  defaultLocale,
  pages: {
    '*': ['common'],
    'rgx:^/send/': ['send'],
    'rgx:^/confirm/': ['confirm'],
    'rgx:^/passport/': ['passport'],
  },
  loadLocaleFrom: (lang, ns) => {
    if (!locales.includes(lang)) {
      const baseLang = /\w+(?=-[^-]*$)/.exec(lang);
      if (baseLang && locales.includes(baseLang)) {
        lang = baseLang;
      } else {
        lang = defaultLocale;
      }
    }
    return import(`/public/locales/${lang}/${ns}.json`).then(m => m.default);
  },
};
