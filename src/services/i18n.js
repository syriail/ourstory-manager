import i18next from "i18next"
import { initReactI18next } from "react-i18next"
import HttpApi from "i18next-http-backend"
import LanguageDetector from "i18next-browser-languagedetector"
i18next
  .use(initReactI18next)
  .use(HttpApi) // Registering the back-end plugin
  .use(LanguageDetector)
  .init({
    // Remove resources from here
    lng: "ar",
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    debug: process.env.NODE_ENV === "development",
  })
export default i18next
