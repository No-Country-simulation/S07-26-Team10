"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/context/language-context";

const NAV_LINKS = [
  { href: "/report", key: "definition" },
  { href: "/#s02", key: "chapters", match: "/" },
  { href: "/report/taxonomy", key: "taxonomy", match: "/report/taxonomy" },
  { href: "/methodology", key: "methodology", match: "/methodology" },
  { href: "/report/references", key: "references", match: "/report/references" },
];

export function BurgerMenu() {
  const t = useTranslations("Nav");
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 900) {
        setIsOpen(false);
      }
    };

    document.body.classList.toggle("noscroll", true);
    window.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleResize);

    return () => {
      document.body.classList.remove("noscroll");
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  const isActive = (href: string, match?: string) => {
    if (match) return pathname === match;
    return pathname.startsWith(href);
  };

  return (
    <>
      <button
        type="button"
        className={`burger${isOpen ? " on" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? t("close") : t("menu")}
        aria-expanded={isOpen}
      >
        <span className="burger-box" aria-hidden="true">
          <span className="burger-line" />
          <span className="burger-line" />
          <span className="burger-line" />
        </span>
      </button>

      <nav className={`mmenu${isOpen ? " on" : ""}`} aria-label={t("menu")}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className={isActive(link.href, link.match) ? "cur" : undefined}
            onClick={() => setIsOpen(false)}
          >
            {t(link.key)}
          </Link>
        ))}
        <div className="mlg">
          <button
            aria-current={language === "en" ? "true" : "false"}
            onClick={() => {
              setLanguage("en");
              setIsOpen(false);
              router.refresh();
            }}
          >
            EN
          </button>
          <button
            aria-current={language === "es" ? "true" : "false"}
            onClick={() => {
              setLanguage("es");
              setIsOpen(false);
              router.refresh();
            }}
          >
            ES
          </button>
        </div>
      </nav>
    </>
  );
}
