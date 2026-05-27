"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ALEA_I18N } from "@/lib/data";

const I18nContext = createContext({ lang: "es", setLang: () => {}, t: (k) => k });

export function useI18n() {
  return useContext(I18nContext);
}

export function I18nProvider({ children, initialLang = "es" }) {
  const [lang, setLang] = useState(initialLang);

  // Hidratar desde localStorage tras el primer render.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("alea-lang");
      if (stored && stored !== lang) setLang(stored);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("alea-lang", lang);
    } catch {}
  }, [lang]);

  const t = useCallback(
    (k) => (ALEA_I18N[lang] && ALEA_I18N[lang][k]) || ALEA_I18N.es[k] || k,
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function LangToggle({ className }) {
  const { lang, setLang } = useI18n();
  return (
    <button
      type="button"
      className={`alea-lang-toggle ${className || ""}`}
      onClick={() => setLang(lang === "es" ? "en" : "es")}
      aria-label={`Switch to ${lang === "es" ? "English" : "Spanish"}`}
      title={`Switch to ${lang === "es" ? "EN" : "ES"}`}
    >
      <span className={lang === "es" ? "on" : ""}>ES</span>
      <span aria-hidden>·</span>
      <span className={lang === "en" ? "on" : ""}>EN</span>
    </button>
  );
}
