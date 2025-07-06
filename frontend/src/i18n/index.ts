import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: import.meta.env.DEV,

    // Supported languages
    supportedLngs: ["en", "es", "ru"],

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    // Language detection options
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
    },

    // Backend options for loading translations from files
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
      requestOptions: {
        cache: "no-cache",
      },
    },

    // React i18next options
    react: {
      useSuspense: false, // Disable suspense to avoid loading issues
      bindI18n: "languageChanged loaded",
      bindI18nStore: "added removed",
      transEmptyNodeValue: "",
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ["br", "strong", "i", "em", "span"],
    },

    // Namespace configuration
    ns: ["translation"],
    defaultNS: "translation",

    // Key separator (set to false to use nested keys)
    keySeparator: ".",

    // Nested separator
    nsSeparator: ":",

    // Pluralization
    pluralSeparator: "_",
    contextSeparator: "_",

    // Retry options
    load: "languageOnly",

    // Error handling
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      if (import.meta.env.DEV) {
        console.warn(`Missing translation key: ${key} for language: ${lng}`);
      }
    },

    // Formatting
    returnObjects: false,
    returnEmptyString: false,
    returnNull: false,

    // Performance
    initImmediate: false,

    // Clean code on key not found
    saveMissing: false,

    // Postprocessing
    postProcess: false,

    // Preload supported languages
    preload: ["en", "es", "ru"],
  });

// Export language helper functions
export const changeLanguage = (lng: string) => {
  return i18n.changeLanguage(lng);
};

export const getCurrentLanguage = () => {
  return i18n.language;
};

export const getSupportedLanguages = () => {
  return ["en", "es", "ru"];
};

export const getLanguageDisplayName = (lng: string) => {
  const displayNames: Record<string, string> = {
    en: "English",
    es: "Español",
    ru: "Русский",
  };
  return displayNames[lng] || lng;
};

// Language detection helper
export const detectLanguage = () => {
  const browserLanguage = navigator.language.split("-")[0];
  const supportedLanguages = getSupportedLanguages();

  if (supportedLanguages.includes(browserLanguage)) {
    return browserLanguage;
  }

  return "en"; // Default fallback
};

// Initialize with detected language if not set
if (!localStorage.getItem("i18nextLng")) {
  const detectedLang = detectLanguage();
  i18n.changeLanguage(detectedLang);
}

export default i18n;
