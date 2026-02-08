import { fr } from './fr';
import { en } from './en';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: fr,
  en: en,
};

// Charger la langue depuis localStorage ou utiliser 'fr' par défaut
const getStoredLanguage = (): string => {
  try {
    const stored = localStorage.getItem('i18nextLng');
    return stored && (stored === 'fr' || stored === 'en') ? stored : 'fr';
  } catch {
    return 'fr';
  }
};

const storedLanguage = getStoredLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: storedLanguage,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

// Sauvegarder la langue dans localStorage quand elle change
i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem('i18nextLng', lng);
  } catch (error) {
    console.error('Failed to save language preference:', error);
  }
});

export default i18n;

export const LANGUAGES: string[] = [
  'fr',
  'en',
];