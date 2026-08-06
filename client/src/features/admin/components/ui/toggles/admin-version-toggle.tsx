"use client";

import { useVersion } from "@/context/version-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Layers, Check } from "lucide-react";

export function AdminVersionToggle() {
  const {
    version,
    setVersion,
    availableVersions,
    contentLanguage,
    setContentLanguage,
    isContentLanguageLocked,
  } = useVersion();

  const displayVersion =
    version || (availableVersions.length > 0 ? availableVersions[0] : "v1");

  return (
    <div className="inline-flex items-center rounded-full border border-amber-600/30 bg-amber-500/5 text-amber-800 dark:text-amber-300 p-0.5 shadow-2xs">
      {/* Left Segment: Version Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold rounded-full hover:bg-amber-500/10 transition-colors outline-none cursor-pointer"
              title="Seleccionar versión del reporte"
            >
              <Layers className="size-3.5 text-amber-600 dark:text-amber-500" />
              <span>{displayVersion}</span>
            </button>
          }
        />
        {availableVersions.length > 0 && (
          <DropdownMenuContent align="start" className="w-36">
            {availableVersions.map((v) => (
              <DropdownMenuItem
                key={v}
                onClick={() => setVersion(v)}
                className="justify-between cursor-pointer font-mono text-xs font-semibold"
              >
                <span>{v}</span>
                {displayVersion === v && (
                  <Check className="size-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        )}
      </DropdownMenu>

      {/* Thin Vertical Divider */}
      <span className="h-3.5 w-px bg-amber-600/30 shrink-0" />

      {/* Right Segment: Content Language Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              disabled={isContentLanguageLocked}
              className={`flex items-center px-2 py-1 text-xs font-mono font-bold uppercase rounded-full transition-colors outline-none ${
                isContentLanguageLocked
                  ? "opacity-75 cursor-default"
                  : "hover:bg-amber-500/10 cursor-pointer"
              }`}
              title={
                isContentLanguageLocked
                  ? "Idioma de contenido fijado para esta versión"
                  : "Cambiar idioma del contenido de la versión"
              }
            >
              <span>{contentLanguage}</span>
            </button>
          }
        />
        {!isContentLanguageLocked && (
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem
              onClick={() => setContentLanguage("es")}
              className="justify-between cursor-pointer font-mono text-xs font-semibold"
            >
              <span>ES (Español)</span>
              {contentLanguage === "es" && (
                <Check className="size-4 text-primary" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setContentLanguage("en")}
              className="justify-between cursor-pointer font-mono text-xs font-semibold"
            >
              <span>EN (English)</span>
              {contentLanguage === "en" && (
                <Check className="size-4 text-primary" />
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  );
}
