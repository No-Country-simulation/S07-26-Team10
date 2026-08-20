"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { NextIntlClientProvider } from "next-intl";
import { messagesMap } from "@/languages";

export type Language = "es" | "en";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  reportsLanguage: Language;
  setReportsLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es");
  const [reportsLanguage, setReportsLanguageState] = useState<Language>("es");

  useEffect(() => {
    const savedLang =
      (localStorage.getItem("app_lang") as Language) ||
      (localStorage.getItem("app_content_lang") as Language);
    if (savedLang === "es" || savedLang === "en") {
      queueMicrotask(() => setLanguageState(savedLang));
    }
    const savedReportsLang = localStorage.getItem("app_reports_lang") as Language;
    if (savedReportsLang === "es" || savedReportsLang === "en") {
      queueMicrotask(() => setReportsLanguageState(savedReportsLang));
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_lang", lang);
    localStorage.setItem("app_content_lang", lang);
    document.cookie = `app_lang=${lang}; path=/; SameSite=Lax; max-age=31536000`;
    document.cookie = `app_content_lang=${lang}; path=/; SameSite=Lax; max-age=31536000`;
  };

  const setReportsLanguage = (lang: Language) => {
    setReportsLanguageState(lang);
    localStorage.setItem("app_reports_lang", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, reportsLanguage, setReportsLanguage }}>
      <NextIntlClientProvider
        key={language}
        locale={language}
        messages={messagesMap[language]}
        timeZone="UTC"
      >
        {children}
      </NextIntlClientProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
