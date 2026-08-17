"use client";

import { useLanguage } from "@/features/admin/context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";

export function AdminLanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            title="Cambiar idioma de la interfaz del CMS"
            className="inline-flex items-center"
            style={{
              gap: 7,
              height: 30,
              padding: '0 12px',
              borderRadius: 8,
              border: '1px solid #ebebeb',
              background: '#ffffff',
              fontSize: 12.5,
              fontFamily: "'IBM Plex Mono', monospace",
              color: '#08090a',
              cursor: 'pointer',
              letterSpacing: '.04em',
            }}
          >
            <Globe
              style={{
                width: 14,
                height: 14,
                stroke: '#6f6f6f',
                fill: 'none',
                strokeWidth: 1.8,
              }}
            />
            <span style={{ fontWeight: 500 }}>
              {language === 'es' ? 'ES' : 'EN'}
            </span>
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem
          onClick={() => setLanguage("es")}
          className="justify-between cursor-pointer"
        >
          <span>Español</span>
          {language === "es" && <Check className="size-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("en")}
          className="justify-between cursor-pointer"
        >
          <span>English</span>
          {language === "en" && <Check className="size-4 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
