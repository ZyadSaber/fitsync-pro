import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "./messages/ar.json";
import en from "./messages/en.json";

export const LOCALES = ["ar", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ar";
/** Where the chosen language is persisted (localStorage + cookie). */
export const LOCALE_STORAGE_KEY = "fs_locale";

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/** Resolve the initial language from storage, falling back to the default. */
function readStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (isLocale(stored)) return stored;
  const cookie = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${LOCALE_STORAGE_KEY}=`))
    ?.split("=")[1];
  return isLocale(cookie) ? cookie : DEFAULT_LOCALE;
}

/** Reflect the active language on <html> (lang + rtl/ltr direction). */
function applyDocumentLocale(locale: string) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
}

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: readStoredLocale(),
  fallbackLng: DEFAULT_LOCALE,
  // Message files use ICU-style single-brace placeholders ({name}),
  // so match that instead of i18next's default double-brace.
  interpolation: { escapeValue: false, prefix: "{", suffix: "}" },
  keySeparator: ".",
});

// Persist the choice and keep <html> in sync whenever the language changes.
i18n.on("languageChanged", (lng) => {
  if (typeof window !== "undefined" && isLocale(lng)) {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, lng);
    document.cookie = `${LOCALE_STORAGE_KEY}=${lng};path=/;max-age=31536000;samesite=lax`;
  }
  applyDocumentLocale(lng);
});

applyDocumentLocale(i18n.language);

/** Programmatically switch language (persists + updates direction). */
export function setLocale(locale: Locale) {
  void i18n.changeLanguage(locale);
}

export default i18n;
export { default as getTranslations } from "./lib/getTranslations";