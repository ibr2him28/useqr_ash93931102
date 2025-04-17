import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';


const saveStage = window.localStorage.getItem('language');
let language = "en";
if (saveStage) {
    try {
        const parseValue = JSON.parse(saveStage);
        language = parseValue.name || "en";
    } catch (e) {
        console.error('Error parsing language from localStorage:', e);
    }
}

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        debug: true,
        lng: language,
        fallbackLng: language,
        backend: {
            loadPath: '/locales/{{lng}}/translation.json',
        },
        returnObjects: true,
    });

export default i18n;
