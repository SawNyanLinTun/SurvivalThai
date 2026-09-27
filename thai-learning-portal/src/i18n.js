import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import myTranslations from './locales/my.json';

const resources = {
  en: { translation: enTranslations },
  my: { translation: myTranslations },
};

const savedLanguage = localStorage.getItem('language') || 'my';

// Keep <html lang> in sync so CSS can tune typography per script
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'my',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
