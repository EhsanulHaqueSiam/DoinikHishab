import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import "@formatjs/intl-pluralrules/polyfill-force";
import "@formatjs/intl-pluralrules/locale-data/en";
import "@formatjs/intl-pluralrules/locale-data/bn";

import en from "./en.json";
import bn from "./bn.json";

const deviceLocale = getLocales()[0]?.languageCode ?? "en";
const defaultLanguage = deviceLocale === "bn" ? "bn" : "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    bn: { translation: bn },
  },
  lng: defaultLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  initImmediate: false,
});

export default i18n;
