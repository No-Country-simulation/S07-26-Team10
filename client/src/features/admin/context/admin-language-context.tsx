"use client";

import React from "react";
import { NextIntlClientProvider } from "next-intl";
import { messagesMap } from "@/languages";
import {
  useAdminLanguageStore,
  type AdminLanguage,
  type Language,
} from "../store/admin-language-store";

export type { AdminLanguage, Language };

export function AdminLanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const language = useAdminLanguageStore((state) => state.language);

  return (
    <NextIntlClientProvider
      locale={language}
      messages={messagesMap[language]}
      timeZone="UTC"
    >
      {children}
    </NextIntlClientProvider>
  );
}

export function useAdminLanguage() {
  const language = useAdminLanguageStore((state) => state.language);
  const setLanguage = useAdminLanguageStore((state) => state.setLanguage);
  const reportsLanguage = useAdminLanguageStore((state) => state.reportsLanguage);
  const setReportsLanguage = useAdminLanguageStore(
    (state) => state.setReportsLanguage,
  );

  return {
    language,
    setLanguage,
    reportsLanguage,
    setReportsLanguage,
  };
}

export const useLanguage = useAdminLanguage;
export const LanguageProvider = AdminLanguageProvider;
