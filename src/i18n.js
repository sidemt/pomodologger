import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import en from "./lang/en.json"
import ja from "./lang/ja.json"

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: en,
  ja: ja
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(LanguageDetector)
  .init({
    resources,
    detection: {
      // order and from where user language should be detected
      order: ['localStorage', 'navigator']
    },
    fallbackLng: {
      'default': ['en']
    },
    whitelist: ['en', 'ja'],
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
