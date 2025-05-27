import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';

import esTranslation from './locales/es/translation.json';
import enTranslation from './locales/en/translation.json';

const resources = {
    es: {
        translation: esTranslation
    },
    en: {
        translation: enTranslation
    }
};

i18n
    .use(LanguageDetector) // detecta idioma del navegador o de localStorage
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        fallbackLng: 'en',
        supportedLngs: ['es', 'en'],
        nonExplicitSupportedLngs: true,
        interpolation: { escapeValue: false },
        debug: process.env.NODE_ENV === 'development',
    });

export default i18n;