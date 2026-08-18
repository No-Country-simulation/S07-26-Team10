"use client";

import { useLanguage } from "@/context/language-context";
import { useVersion } from "@/context/version-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check, Lock } from "lucide-react";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const { isContentLanguageLocked } = useVersion();
  const router = useRouter();

  const handleLanguageChange = (lang: "es" | "en") => {
    setLanguage(lang);
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            disabled={isContentLanguageLocked}
            className={`gap-2 rounded-full ${isContentLanguageLocked ? "opacity-70 cursor-not-allowed bg-muted/50" : ""}`}
            title={isContentLanguageLocked ? "El idioma está fijado para esta versión" : "Cambiar idioma"}
          >
            {isContentLanguageLocked ? <Lock className="size-3.5 text-muted-foreground" /> : <Globe className="size-4" />}
            <span className="font-medium">
              {language === "es" ? "ES" : "EN"}
            </span>
          </Button>
        }
      />
      {!isContentLanguageLocked && (
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem
            onClick={() => handleLanguageChange("es")}
            className="justify-between cursor-pointer"
          >
            <span>Español</span>
            {language === "es" && <Check className="size-4 text-primary" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleLanguageChange("en")}
            className="justify-between cursor-pointer"
          >
            <span>English</span>
            {language === "en" && <Check className="size-4 text-primary" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}

