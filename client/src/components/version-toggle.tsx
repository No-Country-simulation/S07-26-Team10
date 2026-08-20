"use client";

import { usePathname, useRouter } from "next/navigation";
import { useVersion } from "@/context/version-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Layers, Check } from "lucide-react";

function setCookie(name: string, value: string, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function VersionToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const { version, setVersion, availableVersions } = useVersion();

  // Hide version toggle on /admin/reports routes
  if (pathname?.startsWith("/admin/reports")) {
    return null;
  }

  const hasVersions = availableVersions.length > 0;
  const displayVersion = hasVersions
    ? version || availableVersions[0]
    : "Sin versión";

  const handleVersionChange = (v: string) => {
    setVersion(v);
    setCookie("app_version", v);
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            disabled={!hasVersions}
            className={`gap-2 rounded-full font-mono text-xs font-bold border-amber-600/30 bg-amber-500/5 text-amber-800 dark:text-amber-300 ${
              hasVersions ? "hover:bg-amber-500/10" : "opacity-60 cursor-default"
            }`}
          >
            <Layers className="size-3.5 text-amber-600 dark:text-amber-500" />
            <span>{displayVersion}</span>
          </Button>
        }
      />
      {hasVersions && (
        <DropdownMenuContent align="end" className="w-36">
          {availableVersions.map((v) => (
            <DropdownMenuItem
              key={v}
              onClick={() => handleVersionChange(v)}
              className="justify-between cursor-pointer font-mono text-xs font-semibold"
            >
              <span>{v}</span>
              {displayVersion === v && <Check className="size-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
