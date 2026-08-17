"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { NextIntlClientProvider } from "next-intl";
import { messagesMap } from "@/languages";

export type AdminLanguage = "es" | "en";
export type Language = AdminLanguage;

type AdminLanguageContextType = {
  language: AdminLanguage;
  setLanguage: (lang: AdminLanguage) => void;
  reportsLanguage: AdminLanguage;
  setReportsLanguage: (lang: AdminLanguage) => void;
};

const AdminLanguageContext = createContext<AdminLanguageContextType | undefined>(
  undefined,
);

export function AdminLanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguageState] = useState<AdminLanguage>("es");
  const [reportsLanguage, setReportsLanguageState] = useState<AdminLanguage>("es");

  useEffect(() => {
    const savedLang = localStorage.getItem("app_lang") as AdminLanguage;
    if (savedLang === "es" || savedLang === "en") {
      queueMicrotask(() => setLanguageState(savedLang));
    }
    const savedReportsLang = localStorage.getItem(
      "app_reports_lang",
    ) as AdminLanguage;
    if (savedReportsLang === "es" || savedReportsLang === "en") {
      queueMicrotask(() => setReportsLanguageState(savedReportsLang));
    }
  }, []);

  const setLanguage = (lang: AdminLanguage) => {
    setLanguageState(lang);
    localStorage.setItem("app_lang", lang);
  };

  const setReportsLanguage = (lang: AdminLanguage) => {
    setReportsLanguageState(lang);
    localStorage.setItem("app_reports_lang", lang);
  };

  return (
    <AdminLanguageContext.Provider
      value={{
        language,
        setLanguage,
        reportsLanguage,
        setReportsLanguage,
      }}
    >
      <NextIntlClientProvider
        locale={language}
        messages={messagesMap[language]}
        timeZone="UTC"
      >
        {children}
      </NextIntlClientProvider>
    </AdminLanguageContext.Provider>
  );
}

export function useAdminLanguage() {
  const context = useContext(AdminLanguageContext);
  if (!context) {
    return {
      language: "es" as AdminLanguage,
      setLanguage: () => {},
      reportsLanguage: "es" as AdminLanguage,
      setReportsLanguage: () => {},
    };
  }
  return context;
}

export const useLanguage = useAdminLanguage;
export const LanguageProvider = AdminLanguageProvider;
