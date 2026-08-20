"use client";

import React from "react";
import { useLanguage } from "@/context/language-context";

interface LanguageContentWrapperProps {
  contentEs: React.ReactNode;
  contentEn: React.ReactNode;
}

export function LanguageContentWrapper({
  contentEs,
  contentEn,
}: LanguageContentWrapperProps) {
  const { language } = useLanguage();
  return <>{language === "en" ? contentEn : contentEs}</>;
}
