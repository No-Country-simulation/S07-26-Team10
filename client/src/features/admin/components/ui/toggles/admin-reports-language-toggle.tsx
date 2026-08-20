"use client";

import { useLanguage } from "@/features/admin/context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";

export function AdminReportsLanguageToggle() {
  const { reportsLanguage, setReportsLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-full"
            title="Filtrar idioma de reportes"
          >
            <Globe className="size-4" />
            <span className="font-medium">
              {reportsLanguage === "es" ? "ES" : "EN"}
            </span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem
          onClick={() => setReportsLanguage("es")}
          className="justify-between cursor-pointer"
        >
          <span>Español</span>
          {reportsLanguage === "es" && <Check className="size-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setReportsLanguage("en")}
          className="justify-between cursor-pointer"
        >
          <span>English</span>
          {reportsLanguage === "en" && <Check className="size-4 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
