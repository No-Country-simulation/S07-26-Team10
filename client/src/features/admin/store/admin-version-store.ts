import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type AdminLanguage } from "./admin-language-store";
import { getReportsWithVersionsAction } from "../actions/reports-actions";
import type { BaseReport, ReportVersion } from "../schemas/report-schema";

export function parseReportSlug(
  input: string,
): { version: string; lang: AdminLanguage } | null {
  if (!input) return null;
  const match = input.trim().match(/^(v[0-9.-]+)-(es|en)$/i);
  if (match) {
    return {
      version: match[1].toLowerCase(),
      lang: match[2].toLowerCase() as AdminLanguage,
    };
  }
  return null;
}

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

export interface AdminVersionStoreState {
  version: string;
  contentLanguage: AdminLanguage;
  selectedBaseReportId: string | null;
  baseReports: BaseReport[];
  reportVersions: ReportVersion[];
  versionLangsMap: Record<string, AdminLanguage[]>;
  isLoading: boolean;

  setVersion: (ver: string) => void;
  setContentLanguage: (lang: AdminLanguage) => void;
  setActiveBaseReportId: (id: string) => void;
  loadReportsAndSync: () => Promise<void>;
}

export const useAdminVersionStore = create<AdminVersionStoreState>()(
  persist(
    (set, get) => ({
      version: "",
      contentLanguage: "es",
      selectedBaseReportId: null,
      baseReports: [],
      reportVersions: [],
      versionLangsMap: {},
      isLoading: false,

      setVersion: (ver: string) => {
        const langs = get().versionLangsMap[ver] || [];
        if (langs.length === 1) {
          set({ version: ver, contentLanguage: langs[0] });
        } else {
          set({ version: ver });
        }
      },

      setContentLanguage: (lang: AdminLanguage) => {
        set({ contentLanguage: lang });
      },

      setActiveBaseReportId: (id: string) => {
        const { reportVersions } = get();
        const targetVers = reportVersions.filter((rv) => rv.report_id === id);
        if (targetVers.length > 0) {
          const firstVer = targetVers[0].version.toLowerCase().startsWith("v")
            ? targetVers[0].version.toLowerCase()
            : `v${targetVers[0].version.toLowerCase()}`;
          set({ selectedBaseReportId: id, version: firstVer });
        } else {
          set({ selectedBaseReportId: id, version: "" });
        }
      },

      loadReportsAndSync: async () => {
        set({ isLoading: true });
        try {
          const reportsWithVersions = await getReportsWithVersionsAction();

          const bases: BaseReport[] = reportsWithVersions.map((r) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { report_versions, ...base } = r;
            return base;
          });
          const allVersions: ReportVersion[] = reportsWithVersions.flatMap(
            (r) => r.report_versions,
          );

          const vMap: Record<string, Set<AdminLanguage>> = {};
          allVersions.forEach((rv) => {
            const verStr = rv.version.toLowerCase().startsWith("v")
              ? rv.version.toLowerCase()
              : `v${rv.version.toLowerCase()}`;
            const langStr = (rv.language || "ES").toLowerCase() as AdminLanguage;
            if (!vMap[verStr]) {
              vMap[verStr] = new Set();
            }
            vMap[verStr].add(langStr);
          });

          const uniqueVersions = Object.keys(vMap).sort(compareVersionsDescending);
          const langsMap: Record<string, AdminLanguage[]> = {};
          Object.entries(vMap).forEach(([ver, langSet]) => {
            langsMap[ver] = Array.from(langSet);
          });

          const currentSavedVer = get().version;
          const activeVer =
            currentSavedVer && uniqueVersions.includes(currentSavedVer)
              ? currentSavedVer
              : uniqueVersions[0] || "";

          let activeContentLang = get().contentLanguage;
          if (activeVer) {
            const langs = langsMap[activeVer] || [];
            if (langs.length === 1) {
              activeContentLang = langs[0];
            }
          }

          set({
            baseReports: bases,
            reportVersions: allVersions,
            versionLangsMap: langsMap,
            version: activeVer,
            contentLanguage: activeContentLang,
            isLoading: false,
          });
        } catch (err) {
          console.error("Error syncing version store with reports action:", err);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "admin_app_version_storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        version: state.version,
        contentLanguage: state.contentLanguage,
        selectedBaseReportId: state.selectedBaseReportId,
      }),
    },
  ),
);

export function getAdminVersionComputed(state: AdminVersionStoreState) {
  const currentBaseReportId =
    state.selectedBaseReportId || state.baseReports[0]?.id || null;

  const currentReportVersions = currentBaseReportId
    ? state.reportVersions.filter((rv) => rv.report_id === currentBaseReportId)
    : state.reportVersions;

  const vMap: Record<string, Set<AdminLanguage>> = {};
  currentReportVersions.forEach((rv) => {
    const verStr = rv.version.toLowerCase().startsWith("v")
      ? rv.version.toLowerCase()
      : `v${rv.version.toLowerCase()}`;
    const langStr = (rv.language || "ES").toLowerCase() as AdminLanguage;
    if (!vMap[verStr]) {
      vMap[verStr] = new Set();
    }
    vMap[verStr].add(langStr);
  });

  const availableVersions = Object.keys(vMap).sort(compareVersionsDescending);
  const langsMap: Record<string, AdminLanguage[]> = {};
  Object.entries(vMap).forEach(([ver, langSet]) => {
    langsMap[ver] = Array.from(langSet);
  });

  const defaultLangs: AdminLanguage[] = ["es", "en"];
  const availableContentLanguages: AdminLanguage[] = state.version
    ? langsMap[state.version] || defaultLangs
    : defaultLangs;
  const isContentLanguageLocked = availableContentLanguages.length === 1;

  const activeReportVersion =
    currentReportVersions.find((rv) => {
      const verStr = rv.version.toLowerCase().startsWith("v")
        ? rv.version.toLowerCase()
        : `v${rv.version.toLowerCase()}`;
      const langStr = (rv.language || "ES").toLowerCase();
      return (
        verStr === state.version.toLowerCase() &&
        langStr === state.contentLanguage.toLowerCase()
      );
    }) ||
    currentReportVersions[0] ||
    null;

  const activeReport = currentBaseReportId
    ? state.baseReports.find((b) => b.id === currentBaseReportId) ||
      state.baseReports[0] ||
      null
    : state.baseReports[0] || null;

  const activeVersionId = activeReportVersion?.id || null;
  const activeReportId = activeVersionId;

  return {
    availableVersions,
    availableContentLanguages,
    isContentLanguageLocked,
    activeReport,
    activeReportVersion,
    activeReportId,
    activeVersionId,
    reportsList: state.reportVersions,
  };
}
