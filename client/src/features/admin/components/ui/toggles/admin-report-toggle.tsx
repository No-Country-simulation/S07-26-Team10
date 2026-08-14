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
    <div className="inline-flex items-center" style={{ gap: 7, height: 30, padding: '0 12px', borderRadius: 8, border: '1px solid #ebebeb', background: '#ffffff' }}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="flex items-center"
              style={{ gap: 7, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12.5, letterSpacing: '.03em', color: '#08090a', cursor: 'pointer', background: 'none', border: 0, padding: 0 }}
              title="Seleccionar Reporte Base activo"
            >
              <FileText style={{ width: 14, height: 14, stroke: '#6f6f6f', fill: 'none', strokeWidth: 1.8 }} />
              <span className="max-w-[140px] truncate" style={{ color: '#00603a', fontWeight: 500 }}>{displayLabel}</span>
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
