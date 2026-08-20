"use client";

import { useVersion } from "@/features/admin/context";
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

  const hasVersions = availableVersions.length > 0;
  const displayVersion = hasVersions
    ? version || availableVersions[0]
    : "Sin versión";

  return (
    <div className="inline-flex items-center" style={{ height: 30, borderRadius: 8, border: '1px solid #ebebeb', background: '#ffffff' }}>
      {/* Left Segment: Version Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              disabled={!hasVersions}
              className="flex items-center"
              style={{
                gap: 6,
                padding: '0 12px',
                height: 30,
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 12.5,
                letterSpacing: '.03em',
                color: '#08090a',
                cursor: hasVersions ? 'pointer' : 'default',
                opacity: hasVersions ? 1 : 0.6,
                background: 'none',
                border: 0,
              }}
              title={hasVersions ? 'Seleccionar versión del reporte' : 'No hay versiones registradas'}
            >
              <Layers style={{ width: 14, height: 14, stroke: '#6f6f6f', fill: 'none', strokeWidth: 1.8 }} />
              <span style={{ fontWeight: 500, color: '#00603a' }}>{displayVersion}</span>
            </button>
          }
        />
        {hasVersions && (
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


      {hasVersions && (
        <>
          {/* Divisor */}
          <span style={{ width: 1, height: 15, background: '#ebebeb', display: 'inline-block', flexShrink: 0 }} />

          {/* Right Segment: Content Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  disabled={isContentLanguageLocked}
                  className="flex items-center"
                  style={{
                    padding: '0 12px',
                    height: 30,
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: 12.5,
                    letterSpacing: '.04em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    color: '#08090a',
                    cursor: isContentLanguageLocked ? 'default' : 'pointer',
                    opacity: isContentLanguageLocked ? 0.75 : 1,
                    background: 'none',
                    border: 0,
                  }}
                  title={isContentLanguageLocked ? 'Idioma fijado' : 'Cambiar idioma del contenido'}
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
        </>
      )}
    </div>

  );
}
