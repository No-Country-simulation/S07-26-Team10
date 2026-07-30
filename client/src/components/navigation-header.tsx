"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { LanguageToggle } from "@/components/language-toggle";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function NavigationHeader() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isReportActive = pathname.startsWith("/report");
  const isMethodologyActive = pathname.startsWith("/methodology");
  const isAboutActive = pathname.startsWith("/about");

  const getLinkClasses = (isActive: boolean) =>
    isActive
      ? "text-foreground font-semibold border-b-2 border-foreground pb-0.5 transition-colors"
      : "text-muted-foreground hover:text-foreground transition-colors";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <span className="font-serif font-bold text-lg sm:text-xl tracking-wider text-foreground">
            PHYSAFLOW
          </span>
          <span className="hidden sm:inline-block text-xs font-serif italic text-muted-foreground border-l border-border pl-3 py-0.5">
            {t("logoSubtitle")}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-wider">
          <Link href="/report" className={getLinkClasses(isReportActive)}>
            {t("report")}
          </Link>
          <Link
            href="/methodology"
            className={getLinkClasses(isMethodologyActive)}
          >
            {t("methodology")}
          </Link>
          <Link href="/about" className={getLinkClasses(isAboutActive)}>
            {t("about")}
          </Link>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageToggle />

          {/* Mobile Menu Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-6 space-y-4 font-mono text-xs uppercase tracking-wider animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-3">
            <Link
              href="/report"
              onClick={() => setMobileMenuOpen(false)}
              className={
                isReportActive
                  ? "text-foreground font-semibold py-1"
                  : "text-muted-foreground hover:text-foreground py-1"
              }
            >
              {t("report")}
            </Link>
            <Link
              href="/methodology"
              onClick={() => setMobileMenuOpen(false)}
              className={
                isMethodologyActive
                  ? "text-foreground font-semibold py-1"
                  : "text-muted-foreground hover:text-foreground py-1"
              }
            >
              {t("methodology")}
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={
                isAboutActive
                  ? "text-foreground font-semibold py-1"
                  : "text-muted-foreground hover:text-foreground py-1"
              }
            >
              {t("about")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
