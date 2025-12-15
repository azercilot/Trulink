import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fa from './locales/fa.json';
import en from './locales/en.json';
import ar from './locales/ar.json';
import zh from './locales/zh.json';
import es from './locales/es.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import ru from './locales/ru.json';
import pt from './locales/pt.json';

const savedLanguage = localStorage.getItem('language') || 'fa';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fa: { translation: fa },
      en: { translation: en },
      ar: { translation: ar },
      zh: { translation: zh },
      es: { translation: es },
      de: { translation: de },
      fr: { translation: fr },
      ru: { translation: ru },
      pt: { translation: pt },
    },
    lng: savedLanguage,
    fallbackLng: 'fa',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
