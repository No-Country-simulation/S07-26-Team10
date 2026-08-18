"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { type Language } from "@/context/language-context";
import {
  getReportsWithVersionsAction,
} from "@/features/admin/actions/reports-actions";
import type {
  BaseReport,
  ReportVersion,
} from "@/features/admin/schemas/report-schema";
import type { PublicReportWithVersions } from "@/features/public/report/queries/reports";

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
  baseReports: BaseReport[];
  reportVersions: ReportVersion[];
  reportsList: ReportVersion[]; // para compatibilidad retroactiva
  refreshReports: () => Promise<void>;
  activeReport: BaseReport | null;
  activeReportVersion: ReportVersion | null;
  activeReportId: string | null; // Retorna activeVersionId para que secciones, referencias y taxonomías usen version_id
  activeVersionId: string | null;
  selectedBaseReportId: string | null;
  setActiveBaseReportId: (id: string) => void;
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

export function VersionProvider({
  children,
  publicOnly = false,
  initialReports = [],
}: {
  children: React.ReactNode;
  publicOnly?: boolean;
  initialReports?: PublicReportWithVersions[];
}) {
  const [version, setVersionState] = useState<string>("");
  const [contentLanguage, setContentLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("app_content_lang") as Language;
      if (saved === "es" || saved === "en") return saved;
    }
    return "es";
  });

  const [versionLangsMap, setVersionLangsMap] = useState<
    Record<string, Language[]>
  >({});
  const [baseReports, setBaseReports] = useState<BaseReport[]>([]);
  const [reportVersions, setReportVersions] = useState<ReportVersion[]>([]);
  const [selectedBaseReportId, setSelectedBaseReportIdState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("app_base_report_id");
    }
    return null;
  });

  const setActiveBaseReportId = (id: string) => {
    setSelectedBaseReportIdState(id);
    localStorage.setItem("app_base_report_id", id);
    const targetVers = reportVersions.filter((rv) => rv.report_id === id);
    if (targetVers.length > 0) {
      const firstVer = targetVers[0].version.toLowerCase().startsWith("v")
        ? targetVers[0].version.toLowerCase()
        : `v${targetVers[0].version.toLowerCase()}`;
      setVersionState(firstVer);
      localStorage.setItem("app_version", firstVer);
    } else {
      setVersionState("");
    }
  };


  useEffect(() => {

  }, [version, contentLanguage]);

  const persistContentLanguage = (lang: Language) => {
    setContentLanguageState(lang);
    localStorage.setItem("app_content_lang", lang);
    document.cookie = `app_content_lang=${lang}; path=/; SameSite=Lax; max-age=31536000`;
  };

  const setContentLanguage = (lang: Language) => {
    persistContentLanguage(lang);

  };

  const loadReportsAndSync = useCallback(async () => {
    try {
      let reportsWithVersions;
      if (publicOnly) {
        // Datos ya provistos por el Server Component (layout) vía props.
        reportsWithVersions = initialReports;
      } else {
        // Una sola request: GET /api/v1/reports/admin/with-versions
        reportsWithVersions = await getReportsWithVersionsAction();
      }

      const bases: BaseReport[] = reportsWithVersions.map((r) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { report_versions, ...base } = r;
        return base;
      });
      const allVersions: ReportVersion[] = reportsWithVersions.flatMap((r) => r.report_versions);

      setBaseReports(bases);
      setReportVersions(allVersions);

      const vMap: Record<string, Set<Language>> = {};

      allVersions.forEach((rv) => {
        const verStr = rv.version.toLowerCase().startsWith("v") ? rv.version.toLowerCase() : `v${rv.version.toLowerCase()}`;
        const langStr = (rv.language || "ES").toLowerCase() as Language;
        if (!vMap[verStr]) {
          vMap[verStr] = new Set();
        }
        vMap[verStr].add(langStr);
      });

      const uniqueVersions = Object.keys(vMap).sort(compareVersionsDescending);
      const langsMap: Record<string, Language[]> = {};
      Object.entries(vMap).forEach(([ver, langSet]) => {
        langsMap[ver] = Array.from(langSet);
      });

      setVersionLangsMap(langsMap);

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
          persistContentLanguage(langs[0]);
        }
      }
    } catch {
    }
  }, [publicOnly, initialReports]);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      if (isMounted) {
        await loadReportsAndSync();
      }
    }
    void init();
    return () => {
      isMounted = false;
    };
  }, [loadReportsAndSync]);

  const setVersion = (ver: string) => {
    setVersionState(ver);
    localStorage.setItem("app_version", ver);

    const langs = versionLangsMap[ver] || [];
    if (langs.length === 1) {
      persistContentLanguage(langs[0]);
    }
  };

  const currentBaseReportId = selectedBaseReportId || baseReports[0]?.id || null;

  const currentReportVersions = currentBaseReportId
    ? reportVersions.filter((rv) => rv.report_id === currentBaseReportId)
    : reportVersions;

  // Recalculate versions and language map strictly for currentBaseReportVersions
  const vMap: Record<string, Set<Language>> = {};
  currentReportVersions.forEach((rv) => {
    const verStr = rv.version.toLowerCase().startsWith("v") ? rv.version.toLowerCase() : `v${rv.version.toLowerCase()}`;
    const langStr = (rv.language || "ES").toLowerCase() as Language;
    if (!vMap[verStr]) {
      vMap[verStr] = new Set();
    }
    vMap[verStr].add(langStr);
  });

  const availableVersions = Object.keys(vMap).sort(compareVersionsDescending);
  const langsMap: Record<string, Language[]> = {};
  Object.entries(vMap).forEach(([ver, langSet]) => {
    langsMap[ver] = Array.from(langSet);
  });

  const defaultLangs: Language[] = ["es", "en"];
  const availableContentLanguages: Language[] = version
    ? langsMap[version] || defaultLangs
    : defaultLangs;
  const isContentLanguageLocked = availableContentLanguages.length === 1;

  // Active report version based on active version and content language
  const activeReportVersion =
    currentReportVersions.find((rv) => {
      const verStr = rv.version.toLowerCase().startsWith("v") ? rv.version.toLowerCase() : `v${rv.version.toLowerCase()}`;
      const langStr = (rv.language || "ES").toLowerCase();
      return verStr === version.toLowerCase() && langStr === contentLanguage.toLowerCase();
    }) || currentReportVersions[0] || null;

  const activeReport = currentBaseReportId
    ? baseReports.find((b) => b.id === currentBaseReportId) || baseReports[0] || null
    : baseReports[0] || null;

  const activeVersionId = activeReportVersion?.id || null;
  // Sub-resources expect version_id, so activeReportId returns activeVersionId
  const activeReportId = activeVersionId;


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
        baseReports,
        reportVersions,
        reportsList: reportVersions,
        refreshReports: loadReportsAndSync,
        activeReport,
        activeReportVersion,
        activeReportId,
        activeVersionId,
        selectedBaseReportId,
        setActiveBaseReportId,
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
      baseReports: [],
      reportVersions: [],
      reportsList: [],
      refreshReports: async () => {},
      activeReport: null,
      activeReportVersion: null,
      activeReportId: null,
      activeVersionId: null,
      selectedBaseReportId: null,
      setActiveBaseReportId: () => {},
    };
  }
  return context;
}
