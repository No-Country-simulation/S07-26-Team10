"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useLanguage, type Language } from "@/context/language-context";
import { getReportsAction } from "@/features/admin/actions/reports-actions";
import type { ReportItem } from "@/features/admin/schemas/report-schema";

export function parseReportSlug(input: string): { version: string; lang: Language } | null {
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
  isLanguageLocked: boolean;
  setIsLanguageLocked: (locked: boolean) => void;
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
  const { language, setLanguage } = useLanguage();
  const [version, setVersionState] = useState<string>("");
  const [availableVersions, setAvailableVersions] = useState<string[]>([]);
  const [versionLangsMap, setVersionLangsMap] = useState<Record<string, Language[]>>({});
  const [isLanguageLocked, setIsLanguageLocked] = useState<boolean>(false);
  const [reportsList, setReportsList] = useState<ReportItem[]>([]);

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

      // Default to the most recent version (index 0) if no saved choice or if invalid
      const savedVer = localStorage.getItem("app_version");
      const activeVer = savedVer && uniqueVersions.includes(savedVer)
        ? savedVer
        : uniqueVersions[0] || "";

      if (activeVer) {
        setVersionState(activeVer);
        const langs = langsMap[activeVer];
        if (langs && langs.length === 1) {
          setLanguage(langs[0]);
          setIsLanguageLocked(true);
        } else {
          setIsLanguageLocked(false);
        }
      }
    } catch (err) {
      console.error("Error syncing version context with reports action:", err);
    }
  }, [setLanguage]);

  useEffect(() => {
    loadReportsAndSync();
  }, [loadReportsAndSync]);

  const setVersion = (ver: string) => {
    setVersionState(ver);
    localStorage.setItem("app_version", ver);

    const langs = versionLangsMap[ver];
    if (langs && langs.length === 1) {
      setLanguage(langs[0]);
      setIsLanguageLocked(true);
    } else {
      setIsLanguageLocked(false);
    }
  };

  // Automatically find active report and its UUID based on active version and active language
  const activeReport = reportsList.find((r) => {
    const p = parseReportSlug(r.slug || r.title || "");
    if (p) {
      return p.version === version && p.lang === language;
    }
    const slugStr = (r.slug || r.title || "").toLowerCase();
    return slugStr.includes(version.toLowerCase()) && slugStr.includes(`-${language}`);
  }) || null;

  const activeReportId = activeReport?.id || null;

  return (
    <VersionContext.Provider
      value={{
        version,
        setVersion,
        availableVersions,
        isLanguageLocked,
        setIsLanguageLocked,
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
      isLanguageLocked: false,
      setIsLanguageLocked: () => {},
      reportsList: [],
      refreshReports: async () => {},
      activeReport: null,
      activeReportId: null,
    };
  }
  return context;
}
