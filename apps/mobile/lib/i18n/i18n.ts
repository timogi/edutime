import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import translationDe from "./locales/de.json";
import translationEn from "./locales/en.json";
import translationFr from "./locales/fr.json";

const resources = {
  "de": { translation: translationDe },
  "en": { translation: translationEn },
  "fr": { translation: translationFr },
};

const initI18n = async () => {
  let savedLanguage = Localization.getLocales()[0].languageCode;

  if (!savedLanguage) {
    savedLanguage = "de";
  }

  i18n.use(initReactI18next).init({
    resources,
    lng: savedLanguage,
    fallbackLng: "de",
    interpolation: {
      escapeValue: false,
    },
  });
};

initI18n();

export default i18n;
