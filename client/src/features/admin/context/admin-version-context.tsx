"use client";

import React, { useEffect, useMemo } from "react";
import { type AdminLanguage, type Language } from "../store/admin-language-store";
import {
  useAdminVersionStore,
  getAdminVersionComputed,
  parseReportSlug,
} from "../store/admin-version-store";
import type { BaseReport, ReportVersion } from "../schemas/report-schema";

export { parseReportSlug };

export type AdminVersionContextType = {
  version: string;
  setVersion: (ver: string) => void;
  availableVersions: string[];
  contentLanguage: AdminLanguage;
  setContentLanguage: (lang: AdminLanguage) => void;
  availableContentLanguages: AdminLanguage[];
  isContentLanguageLocked: boolean;
  baseReports: BaseReport[];
  reportVersions: ReportVersion[];
  reportsList: ReportVersion[];
  refreshReports: () => Promise<void>;
  activeReport: BaseReport | null;
  activeReportVersion: ReportVersion | null;
  activeReportId: string | null;
  activeVersionId: string | null;
  selectedBaseReportId: string | null;
  setActiveBaseReportId: (id: string) => void;
};

export function AdminVersionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const loadReportsAndSync = useAdminVersionStore(
    (state) => state.loadReportsAndSync,
  );

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      void loadReportsAndSync();
    }
    return () => {
      isMounted = false;
    };
  }, [loadReportsAndSync]);

  return <>{children}</>;
}

export function useAdminVersion(): AdminVersionContextType {
  const version = useAdminVersionStore((state) => state.version);
  const contentLanguage = useAdminVersionStore((state) => state.contentLanguage);
  const selectedBaseReportId = useAdminVersionStore(
    (state) => state.selectedBaseReportId,
  );
  const baseReports = useAdminVersionStore((state) => state.baseReports);
  const reportVersions = useAdminVersionStore((state) => state.reportVersions);
  const setVersion = useAdminVersionStore((state) => state.setVersion);
  const setContentLanguage = useAdminVersionStore(
    (state) => state.setContentLanguage,
  );
  const setActiveBaseReportId = useAdminVersionStore(
    (state) => state.setActiveBaseReportId,
  );
  const loadReportsAndSync = useAdminVersionStore(
    (state) => state.loadReportsAndSync,
  );
  const versionLangsMap = useAdminVersionStore((state) => state.versionLangsMap);
  const isLoading = useAdminVersionStore((state) => state.isLoading);

  const computed = useMemo(() => {
    return getAdminVersionComputed({
      version,
      contentLanguage,
      selectedBaseReportId,
      baseReports,
      reportVersions,
      versionLangsMap,
      isLoading,
      setVersion,
      setContentLanguage,
      setActiveBaseReportId,
      loadReportsAndSync,
    });
  }, [
    version,
    contentLanguage,
    selectedBaseReportId,
    baseReports,
    reportVersions,
    versionLangsMap,
    isLoading,
    setVersion,
    setContentLanguage,
    setActiveBaseReportId,
    loadReportsAndSync,
  ]);

  return {
    version,
    setVersion,
    availableVersions: computed.availableVersions,
    contentLanguage,
    setContentLanguage,
    availableContentLanguages: computed.availableContentLanguages,
    isContentLanguageLocked: computed.isContentLanguageLocked,
    baseReports,
    reportVersions,
    reportsList: computed.reportsList,
    refreshReports: loadReportsAndSync,
    activeReport: computed.activeReport,
    activeReportVersion: computed.activeReportVersion,
    activeReportId: computed.activeReportId,
    activeVersionId: computed.activeVersionId,
    selectedBaseReportId,
    setActiveBaseReportId,
  };
}

export const useVersion = useAdminVersion;
export const VersionProvider = AdminVersionProvider;
export type { Language };
