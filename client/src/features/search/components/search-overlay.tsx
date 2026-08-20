"use client";

import { useEffect, useState, useTransition, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/context/language-context";
import { useVersion } from "@/context/version-context";
import { searchPublicContentAction } from "../search-actions";
import type { SearchResultItem, SearchTypeFilter } from "../search-types";
import { resolveSearchResultHref } from "../search-utils";
import { SearchResultsList } from "./search-results-list";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7.5" />
      <path d="M20.5 20.5l-4-4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="currentColor">
      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="search-spinner"
      viewBox="0 0 24 24"
      aria-hidden="true"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const t = useTranslations("Nav");
  const { language, setLanguage } = useLanguage();
  const {
    version: currentVersion,
    setVersion,
    contentLanguage,
    setContentLanguage,
    reportVersions,
    activeReport,
    setActiveBaseReportId,
  } = useVersion();
  const lang: "es" | "en" = language === "en" ? "en" : "es";
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<SearchTypeFilter>("all");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setSelectedIndex(-1);
    } else {
      setQuery("");
      setResults([]);
      setTotal(0);
      setSelectedFilter("all");
    }
  }, [open]);

  // Handle global shortcut (Escape to close, Cmd+K / Ctrl+K)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Execute search via Server Action with debounce
  const executeSearch = useCallback((searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setResults([]);
      setTotal(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    startTransition(async () => {
      try {
        const response = await searchPublicContentAction(trimmed, 40);
        setResults(response.results || []);
        setTotal(response.total || 0);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
        setSelectedIndex(-1);
      }
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!val.trim()) {
      setResults([]);
      setTotal(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(() => {
      executeSearch(val);
    }, 280);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setTotal(0);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (term: string) => {
    setQuery(term);
    executeSearch(term);
    inputRef.current?.focus();
  };

  // Filtered results
  const filteredResults = useMemo(() => {
    if (selectedFilter === "all") return results;
    return results.filter((item) => {
      const t = (item.type || "").toLowerCase();
      if (selectedFilter === "section") return t === "section";
      if (selectedFilter === "category") return t === "category";
      if (selectedFilter === "concept") return t === "concept";
      if (selectedFilter === "reference") return t === "reference";
      if (selectedFilter === "resource") return t === "resource";
      if (selectedFilter === "report_version") return t === "report_version";
      return true;
    });
  }, [results, selectedFilter]);

  // Counts per filter type
  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: results.length,
      section: 0,
      category: 0,
      concept: 0,
      reference: 0,
      resource: 0,
      report_version: 0,
    };
    results.forEach((r) => {
      const t = (r.type || "").toLowerCase();
      if (counts[t] !== undefined) {
        counts[t] += 1;
      }
    });
    return counts;
  }, [results]);

  // Sincroniza la versión/idioma del resultado seleccionado y navega a su URL
  const handleSelectResult = useCallback(
    (item: SearchResultItem) => {
      const targetReportVersionId = item.location?.report_version;
      let didChangeContext = false;

      if (targetReportVersionId && reportVersions && reportVersions.length > 0) {
        const matchingVersion = reportVersions.find(
          (rv) => rv.id === targetReportVersionId,
        );

        if (matchingVersion) {
          const targetLang = (matchingVersion.language || "ES").toLowerCase() as "es" | "en";
          const targetVer = matchingVersion.version.toLowerCase().startsWith("v")
            ? matchingVersion.version.toLowerCase()
            : `v${matchingVersion.version.toLowerCase()}`;

          if (targetLang !== language) {
            setLanguage(targetLang);
            didChangeContext = true;
          }
          if (targetLang !== contentLanguage) {
            setContentLanguage(targetLang);
            didChangeContext = true;
          }
          if (targetVer !== currentVersion) {
            setVersion(targetVer);
            didChangeContext = true;
          }
          if (matchingVersion.report_id && matchingVersion.report_id !== activeReport?.id) {
            setActiveBaseReportId(matchingVersion.report_id);
            didChangeContext = true;
          }
        }
      }

      const href = resolveSearchResultHref(item);
      onClose();
      router.push(href);
      if (didChangeContext) {
        router.refresh();
      }
    },
    [
      reportVersions,
      language,
      contentLanguage,
      currentVersion,
      activeReport,
      setLanguage,
      setContentLanguage,
      setVersion,
      setActiveBaseReportId,
      onClose,
      router,
    ],
  );

  // Keyboard navigation inside results list (Up/Down/Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredResults.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredResults.length - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredResults.length) {
        handleSelectResult(filteredResults[selectedIndex]);
      }
    }
  };

  if (!open) return null;

  const filtersList: { key: SearchTypeFilter; label: string; count: number }[] = [
    { key: "all", label: lang === "en" ? "All" : "Todos", count: filterCounts.all },
    { key: "section", label: lang === "en" ? "Sections" : "Secciones", count: filterCounts.section },
    { key: "category", label: lang === "en" ? "Categories" : "Categorías", count: filterCounts.category },
    { key: "concept", label: lang === "en" ? "Concepts" : "Conceptos", count: filterCounts.concept },
    { key: "reference", label: lang === "en" ? "References" : "Referencias", count: filterCounts.reference },
    { key: "resource", label: lang === "en" ? "Resources" : "Recursos", count: filterCounts.resource },
    { key: "report_version", label: lang === "en" ? "Versions" : "Versiones", count: filterCounts.report_version },
  ];

  return (
    <div className="sheet on search-sheet" role="dialog" aria-modal="true" aria-label="Global Search">
      <div className="search-backdrop" onClick={onClose} />

      <button
        className="sclose search-close-btn"
        aria-label={lang === "en" ? "Close search (Esc)" : "Cerrar buscador (Esc)"}
        onClick={onClose}
        title="Esc"
      >
        <CloseIcon />
      </button>

      <div className="box search-modal-box">
        {/* Search Bar Input Container */}
        <div className="search-input-wrapper">
          <span className="search-input-icon" aria-hidden="true">
            {isLoading ? <SpinnerIcon /> : <SearchIcon />}
          </span>

          <input
            ref={inputRef}
            type="text"
            className="search-main-input"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              lang === "en"
                ? "Search sections, taxonomy, references, resources..."
                : "Buscar en secciones, taxonomía, referencias, recursos..."
            }
            autoComplete="off"
            spellCheck="false"
          />

          {query && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={handleClear}
              aria-label={lang === "en" ? "Clear query" : "Limpiar búsqueda"}
            >
              <ClearIcon />
            </button>
          )}

          <div className="search-esc-badge" aria-hidden="true">
            <span>ESC</span>
          </div>
        </div>

        {/* Filter Pills (Shown when there are results) */}
        {results.length > 0 && (
          <div className="search-filters-bar">
            <span className="search-total-count">
              {total} {lang === "en" ? "results" : "resultados"}
            </span>

            <div className="search-filter-pills">
              {filtersList
                .filter((f) => f.key === "all" || f.count > 0)
                .map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    className={`search-filter-pill ${selectedFilter === f.key ? "active" : ""}`}
                    onClick={() => setSelectedFilter(f.key)}
                  >
                    {f.label}
                    <span className="search-pill-count">{f.count}</span>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Results List Component */}
        <SearchResultsList
          results={filteredResults}
          query={query}
          lang={lang}
          isLoading={isLoading}
          selectedIndex={selectedIndex}
          onSelect={handleSelectResult}
          onHoverIndex={setSelectedIndex}
          onSuggestionClick={handleSuggestionClick}
        />

        {/* Bottom Hint */}
        <div className="search-footer-hint" aria-hidden="true">
          <span className="search-hint-item">
            <kbd>↑</kbd> <kbd>↓</kbd> {lang === "en" ? "to navigate" : "para navegar"}
          </span>
          <span className="search-hint-item">
            <kbd>↵</kbd> {lang === "en" ? "to select" : "para seleccionar"}
          </span>
          <span className="search-hint-item">
            <kbd>ESC</kbd> {lang === "en" ? "to close" : "para cerrar"}
          </span>
        </div>
      </div>
    </div>
  );
}
