"use client";

import { useVersion } from "@/context/version-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, Check } from "lucide-react";

export function AdminReportToggle() {
  const { baseReports, activeReport, setActiveBaseReportId } = useVersion();

  if (!baseReports || baseReports.length === 0) {
    return null;
  }

  const currentReport = activeReport || baseReports[0];
  const displayLabel = currentReport?.slug || "Reporte";

  return (
    <div className="inline-flex items-center rounded-full border border-amber-600/30 bg-amber-500/5 text-amber-800 dark:text-amber-300 p-0.5 shadow-2xs">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold rounded-full hover:bg-amber-500/10 transition-colors outline-none cursor-pointer"
              title="Seleccionar Reporte Base activo"
            >
              <FileText className="size-3.5 text-amber-600 dark:text-amber-500" />
              <span className="max-w-[140px] truncate">{displayLabel}</span>
            </button>
          }
        />
        {baseReports.length > 0 && (
          <DropdownMenuContent align="start" className="w-52">
            {baseReports.map((b) => (
              <DropdownMenuItem
                key={b.id}
                onClick={() => setActiveBaseReportId(b.id)}
                className="justify-between cursor-pointer font-mono text-xs font-semibold"
              >
                <span className="truncate">{b.slug}</span>
                {currentReport?.id === b.id && (
                  <Check className="size-4 text-primary shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  );
}
