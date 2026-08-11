"use client";

import { useVersion } from "@/context/version-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, Check } from "lucide-react";

export function ReportToggle() {
  const { baseReports, activeReport, setActiveBaseReportId } = useVersion();

  if (!baseReports || baseReports.length === 0) {
    return null;
  }

  const currentReport = activeReport || baseReports[0];
  const displayLabel = currentReport?.slug || "Reporte";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-full font-mono text-xs font-bold border-amber-600/30 bg-amber-500/5 text-amber-800 dark:text-amber-300 hover:bg-amber-500/10 outline-none"
            title="Seleccionar Reporte Base"
          >
            <FileText className="size-3.5 text-amber-600 dark:text-amber-500" />
            <span className="max-w-[120px] truncate">{displayLabel}</span>
          </Button>
        }
      />
      {baseReports.length > 0 && (
        <DropdownMenuContent align="end" className="w-48">
          {baseReports.map((b) => (
            <DropdownMenuItem
              key={b.id}
              onClick={() => setActiveBaseReportId(b.id)}
              className="justify-between cursor-pointer font-mono text-xs font-semibold"
            >
              <span className="truncate">{b.slug}</span>
              {currentReport?.id === b.id && <Check className="size-4 text-primary shrink-0" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}

export default ReportToggle;
