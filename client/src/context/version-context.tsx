"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { type Language } from "@/context/language-context";
import { getReportsAction } from "@/features/admin/actions/reports-actions";
import type { ReportItem } from "@/features/admin/schemas/report-schema";

export function parseReportSlug(
  input: string,
): { version: string; lang: Language } | null {
  if (!input) return null;
  const match = input.trim().match(/^(v[0-9.-]+)-(es|en)$/i);
  if (match) {
    return {
      version: match[1].toLowerCase(),
      lang: match[2].toLowerCase() as Language,
    };
  }
  return null;
}

type VersionContextType = {
  version: string;
  setVersion: (ver: string) => void;
  availableVersions: string[];
  contentLanguage: Language;
  setContentLanguage: (lang: Language) => void;
  availableContentLanguages: Language[];
  isContentLanguageLocked: boolean;
  reportsList: ReportItem[];
  refreshReports: () => Promise<void>;
  activeReport: ReportItem | null;
  activeReportId: string | null;
};

const VersionContext = createContext<VersionContextType | undefined>(undefined);

function compareVersionsDescending(a: string, b: string): number {
  const cleanA = a.replace(/^v/i, "");
  const cleanB = b.replace(/^v/i, "");
  const partsA = cleanA.split(/[\.-]/).map(Number);
  const partsB = cleanB.split(/[\.-]/).map(Number);
  const maxLen = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < maxLen; i++) {
    const numA = isNaN(partsA[i]) ? 0 : partsA[i];
    const numB = isNaN(partsB[i]) ? 0 : partsB[i];
    if (numA !== numB) return numB - numA;
  }
  return 0;
}

export function VersionProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersionState] = useState<string>("");
  const [contentLanguage, setContentLanguageState] = useState<Language>("es");
  const [availableVersions, setAvailableVersions] = useState<string[]>([]);
  const [versionLangsMap, setVersionLangsMap] = useState<
    Record<string, Language[]>
  >({});
  const [reportsList, setReportsList] = useState<ReportItem[]>([]);

  useEffect(() => {
    const savedContentLang = localStorage.getItem("app_content_lang") as Language;
    if (savedContentLang === "es" || savedContentLang === "en") {
      setContentLanguageState(savedContentLang);
    }
  }, []);

  const setContentLanguage = (lang: Language) => {
    setContentLanguageState(lang);
    localStorage.setItem("app_content_lang", lang);
  };

  const loadReportsAndSync = useCallback(async () => {
    try {
      const reports = await getReportsAction();
      setReportsList(reports);

      const vMap: Record<string, Set<Language>> = {};

      reports.forEach((r) => {
        const parsed = parseReportSlug(r.slug || r.title || "");
        if (parsed) {
          if (!vMap[parsed.version]) {
            vMap[parsed.version] = new Set();
          }
          vMap[parsed.version].add(parsed.lang);
        }
      });

      const uniqueVersions = Object.keys(vMap).sort(compareVersionsDescending);
      const langsMap: Record<string, Language[]> = {};
      Object.entries(vMap).forEach(([ver, langSet]) => {
        langsMap[ver] = Array.from(langSet);
      });

      setVersionLangsMap(langsMap);
      setAvailableVersions(uniqueVersions);

      // Default to the most recent version if no saved choice or if invalid
      const savedVer = localStorage.getItem("app_version");
      const activeVer =
        savedVer && uniqueVersions.includes(savedVer)
          ? savedVer
          : uniqueVersions[0] || "";

      if (activeVer) {
        setVersionState(activeVer);
        const langs = langsMap[activeVer] || [];
        if (langs.length === 1) {
          setContentLanguageState(langs[0]);
        }
      }
    } catch (err) {
      console.error("Error syncing version context with reports action:", err);
    }
  }, []);

  useEffect(() => {
    loadReportsAndSync();
  }, [loadReportsAndSync]);

  const setVersion = (ver: string) => {
    setVersionState(ver);
    localStorage.setItem("app_version", ver);

    const langs = versionLangsMap[ver] || [];
    if (langs.length === 1) {
      setContentLanguageState(langs[0]);
    }
  };

  const availableContentLanguages = version ? versionLangsMap[version] || ["es", "en"] : ["es", "en"];
  const isContentLanguageLocked = availableContentLanguages.length === 1;

  // Automatically find active report based on active version and content language
  const activeReport =
    reportsList.find((r) => {
      const p = parseReportSlug(r.slug || r.title || "");
      if (p) {
        return p.version === version && p.lang === contentLanguage;
      }
      const slugStr = (r.slug || r.title || "").toLowerCase();
      return (
        slugStr.includes(version.toLowerCase()) &&
        slugStr.includes(`-${contentLanguage}`)
      );
    }) || null;

  const activeReportId = activeReport?.id || null;

  return (
    <VersionContext.Provider
      value={{
        version,
        setVersion,
        availableVersions,
        contentLanguage,
        setContentLanguage,
        availableContentLanguages,
        isContentLanguageLocked,
        reportsList,
        refreshReports: loadReportsAndSync,
        activeReport,
        activeReportId,
      }}
    >
      {children}
    </VersionContext.Provider>
  );
}

export function useVersion() {
  const context = useContext(VersionContext);
  if (!context) {
    return {
      version: "v1",
      setVersion: () => {},
      availableVersions: [],
      contentLanguage: "es" as Language,
      setContentLanguage: () => {},
      availableContentLanguages: ["es" as Language],
      isContentLanguageLocked: false,
      reportsList: [],
      refreshReports: async () => {},
      activeReport: null,
      activeReportId: null,
    };
  }
  return context;
}
