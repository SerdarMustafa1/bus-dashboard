import i18n from 'i18next';
import Backend from 'i18next-xhr-backend';
import { reactI18nextModule } from 'react-i18next';
import detector from 'i18next-browser-languagedetector';

const supportedLangs = [
  { short: 'en', name: 'English' },
  // {short:'et', name:"Eesti"},
  { short: 'fi', name: 'Suomi' },
];

i18n
  .use(detector)
  .use(Backend)
  .use(reactI18nextModule)
  .init({
    whitelist: supportedLangs.map((lng) => lng.short),
    fallbackLng: 'en',
    backend: {
      loadPath: '/assets/i18n/{{ns}}/{{lng}}.json',
    },
    ns: ['translations'],
    defaultNS: 'translations',
    keySeparator: false,
    interpolation: {
      escapeValue: false,
      formatSeparator: ',',
    },
    react: {
      wait: true,
    },
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      console.log('MISSING LANGUAGE KEY:', lng, ns, key, fallbackValue);
    },
  });

i18n.validLangs = supportedLangs;

export default i18n;
