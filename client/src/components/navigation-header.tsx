"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/context/language-context";
import { useVersion } from "@/context/version-context";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { useSectionTracker } from "@/hooks/use-section-tracker";
import { SearchOverlay } from "@/features/search";

import { ReportToggle } from "./report-toggle";
import { VersionToggle } from "./version-toggle";

const NAV_LINKS = [
  { href: "/report", key: "definition" },
  { href: "/#s02", key: "chapters", match: "/" },
  { href: "/report/taxonomy", key: "taxonomy", match: "/report/taxonomy" },
  { href: "/methodology", key: "methodology", match: "/methodology" },
  { href: "/report/references", key: "references", match: "/report/references" },
];

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7.2" />
      <path d="M20.5 20.5l-4-4" />
    </svg>
  );
}

export function NavigationHeader({ disableShrink = false }: { disableShrink?: boolean }) {
  const t = useTranslations("Nav");
  const { language, setLanguage } = useLanguage();
  const { setContentLanguage } = useVersion();
  const router = useRouter();
  const { progress, shrink } = useScrollProgress({ disableShrink });
  const active = useSectionTracker(".phi section.n[data-n]");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathname = usePathname();
  const onHome = pathname === "/";
  const shrunk = !onHome ? false : shrink;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const isNavActive = (href: string, match?: string) => {
    if (match) return pathname === match;
    return pathname.startsWith(href);
  };

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobileMenu();
    };

    const handleResize = () => {
      if (window.innerWidth > 900) closeMobileMenu();
    };

    window.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleResize);
    };
  }, [mobileMenuOpen]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const changeLanguage = (lang: "es" | "en") => {
    setLanguage(lang);
    setContentLanguage(lang);
    router.refresh();
  };

  return (
    <>
      <header id="hd" className={shrunk ? "sm" : undefined}>
        <div className="hr">
          <button
            type="button"
            className={`burger ${mobileMenuOpen ? "on" : ""}`}
            aria-label={mobileMenuOpen ? t("close") : t("menu")}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="burger-box" aria-hidden="true">
              <span className="burger-line" />
              <span className="burger-line" />
              <span className="burger-line" />
            </span>
          </button>
          <Link href="/" className="lock">
            <img
              className="iso"
              src="/physaflow-isotipo.png"
              alt="PhysaFlow"
              width="44"
              height="44"
            />
            <img
              className="wmk"
              src="/physaflow-wordmark-black.png"
              alt="PhysaFlow"
              width="154"
              height="26"
            />
          </Link>
          <span className="sep" />
          
          <div className="now">
            <span className="n" id="nn">
              {active.n}
            </span>
            <span className="t" id="nt">
              {active.t ? t(active.t) : ""}
            </span>
          </div>
          <nav>
            {NAV_LINKS.map((link) => (
              <Link key={link.key} href={link.href} onClick={closeMobileMenu}>
                {t(link.key)}
              </Link>
            ))}
          </nav>
          <div className="tools flex items-center gap-2">
            <div className="hdr-toggle">
              <ReportToggle />
            </div>
            <div className="hdr-toggle">
              <VersionToggle />
            </div>
            <button
              className="ic"
              id="sbtn"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <SearchIcon />
            </button>
            <div className="lgs">
              <button
                aria-current={language === "en" ? "true" : "false"}
                onClick={() => changeLanguage("en")}
              >
                EN
              </button>
              <span style={{ color: "#DADADA" }}>/</span>
              <button
                aria-current={language === "es" ? "true" : "false"}
                onClick={() => changeLanguage("es")}
              >
                ES
              </button>
            </div>
          </div>
        </div>
        <div className="prog">
          <i id="pg" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className={`mmenu ${mobileMenuOpen ? "on" : ""}`} onClick={closeMobileMenu}>
        <div className="mmenu-panel" onClick={(event) => event.stopPropagation()}>
          <div className="mmenu-head">
            <span className="mmenu-title">{t("menu")}</span>
            <button
              type="button"
              className="mmenu-close"
              aria-label={t("close")}
              onClick={closeMobileMenu}
            >
              <CloseIcon />
            </button>
          </div>
          <nav aria-label={t("menu")}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={isNavActive(link.href, link.match) ? "cur" : undefined}
                onClick={closeMobileMenu}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>
          <div className="mmenu-tools">
            <div className="hdr-toggle">
              <ReportToggle />
            </div>
            <div className="hdr-toggle">
              <VersionToggle />
            </div>
          </div>
          <div className="mlg">
            <button
              aria-current={language === "en" ? "true" : "false"}
              onClick={() => { changeLanguage("en"); closeMobileMenu(); }}
            >
              EN
            </button>
            <span style={{ color: "#DADADA" }}>/</span>
            <button
              aria-current={language === "es" ? "true" : "false"}
              onClick={() => { changeLanguage("es"); closeMobileMenu(); }}
            >
              ES
            </button>
          </div>
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
