"use client";

import { usePathname } from "next/navigation";
import { useVersion } from "@/context/version-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Layers, Check } from "lucide-react";

export function VersionToggle() {
  const pathname = usePathname();
  const { version, setVersion, availableVersions } = useVersion();

  // Hide version toggle on /admin/reports routes
  if (pathname?.startsWith("/admin/reports")) {
    return null;
  }

  const displayVersion = version || (availableVersions.length > 0 ? availableVersions[0] : "v1");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2 rounded-full font-mono text-xs font-bold border-amber-600/30 bg-amber-500/5 text-amber-800 dark:text-amber-300 hover:bg-amber-500/10">
            <Layers className="size-3.5 text-amber-600 dark:text-amber-500" />
            <span>{displayVersion}</span>
          </Button>
        }
      />
      {availableVersions.length > 0 && (
        <DropdownMenuContent align="end" className="w-36">
          {availableVersions.map((v) => (
            <DropdownMenuItem
              key={v}
              onClick={() => setVersion(v)}
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
