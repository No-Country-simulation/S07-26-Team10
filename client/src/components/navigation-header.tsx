"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/context/language-context";
import { useVersion } from "@/context/version-context";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { useSectionTracker } from "@/hooks/use-section-tracker";
import { searchIndex } from "@/features/public/home/data/search-index";

import { ReportToggle } from "./report-toggle";
import { VersionToggle } from "./version-toggle";

const NAV_LINKS = [
  { href: "/report", key: "definition" },
  { href: "/#s02", key: "chapters", match: "/" },
  { href: "/report/taxonomy", key: "taxonomy", match: "/report/taxonomy" },
  { href: "/methodology", key: "methodology", match: "/methodology" },
  { href: "/report/references", key: "references", match: "/report/references" },
];


function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7.2" />
      <path d="M20.5 20.5l-4-4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("Nav");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? searchIndex.filter((i) =>
          `${i.k} ${t(i.tKey)} ${t(i.eKey)}`.toLowerCase().includes(q),
        )
      : searchIndex;
  }, [query, t]);

  if (!open) return null;

  return (
    <div className="sheet on">
      <button
        className="sclose"
        aria-label="Close"
        onClick={onClose}
      >
        <CloseIcon />
      </button>
      <div className="box">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          autoComplete="off"
        />
        <div className="sres">
          {results.length > 0 ? (
            results.map((item) => (
              <Link key={item.k} href={item.href} onClick={onClose}>
                <span className="k">{item.k}</span>
                <span>
                  <span className="ti">{t(item.tKey)}</span>
                  <span className="ex">{t(item.eKey)}</span>
                </span>
              </Link>
            ))
          ) : (
            <div className="none">{t("noResults")}</div>
          )}
        </div>
      </div>
    </div>
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

  const changeLanguage = (lang: "es" | "en") => {
    setLanguage(lang);
    setContentLanguage(lang);
    router.refresh();
  };

  return (
    <>
      <header id="hd" className={shrunk ? "sm" : undefined}>
        <div className="hr">
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
            <ReportToggle />
            <VersionToggle />
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
          <button
            className={`burger ${mobileMenuOpen ? "on" : ""}`}
            aria-label={t("menu")}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i />
          </button>
        </div>
        <div className="prog">
          <i id="pg" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className={`mmenu ${mobileMenuOpen ? "on" : ""}`} onClick={closeMobileMenu}>
        <nav>
          {NAV_LINKS.map((link) => (
            <Link key={link.key} href={link.href} onClick={closeMobileMenu}>
              {t(link.key)}
            </Link>
          ))}
        </nav>
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

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
