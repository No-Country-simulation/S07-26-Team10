import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AdminLanguage = "es" | "en";
export type Language = AdminLanguage;

export interface AdminLanguageState {
  language: AdminLanguage;
  reportsLanguage: AdminLanguage;
  setLanguage: (lang: AdminLanguage) => void;
  setReportsLanguage: (lang: AdminLanguage) => void;
}

export const useAdminLanguageStore = create<AdminLanguageState>()(
  persist(
    (set) => ({
      language: "es",
      reportsLanguage: "es",
      setLanguage: (lang: AdminLanguage) => set({ language: lang }),
      setReportsLanguage: (lang: AdminLanguage) => set({ reportsLanguage: lang }),
    }),
    {
      name: "admin_app_language_storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
