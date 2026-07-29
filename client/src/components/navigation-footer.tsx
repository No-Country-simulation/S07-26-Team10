"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Globe, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NavigationFooter() {
  const t = useTranslations("HomePage");
  const currentYear = new Date().getFullYear();

  return (
    <footer id="about" className="w-full border-t border-border/40 bg-muted/20 text-muted-foreground font-sans py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8 sm:space-y-12">
        {/* Top Footer Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[11px] font-mono uppercase tracking-widest font-semibold text-foreground">
              {t("officialReport")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("source")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground" aria-label="Globe">
              <Globe className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground" aria-label="Share">
              <Share2 className="size-4" />
            </Button>
          </div>
        </div>

        {/* Bottom Footer Section */}
        <div className="pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-muted-foreground">
          <p>© {currentYear} PhysaFlow Research. {t("allRightsReserved")}</p>

          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-foreground transition-colors">
              {t("privacyPolicy")}
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              {t("termsOfService")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
