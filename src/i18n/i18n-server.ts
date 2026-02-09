import i18n from 'i18next';
import { fr } from './fr';
import { en } from './en';

const resources = {
  fr: fr,
  en: en,
};

// Configuration i18n pour le serveur (sans React)
i18n.init({
  resources,
  lng: 'fr', // Par défaut en français côté serveur
  fallbackLng: 'fr',
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
