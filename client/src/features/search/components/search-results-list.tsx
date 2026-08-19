"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { SearchResultItem } from "../search-types";
import {
  resolveSearchResultHref,
  getTypeBadgeInfo,
  getMatchedFieldLabel,
  highlightQueryMatches,
} from "../search-utils";

interface SearchResultsListProps {
  results: SearchResultItem[];
  query: string;
  lang: "es" | "en";
  isLoading?: boolean;
  selectedIndex?: number;
  onSelect?: (item: SearchResultItem) => void;
  onHoverIndex?: (index: number) => void;
  onSuggestionClick?: (term: string) => void;
}

const POPULAR_SUGGESTIONS = [
  "GPU",
  "Cooling",
  "Stranded Power",
  "Taxonomía",
  "Topology",
  "Funnel",
  "Facility",
  "Workload",
];

function HighlightedText({ text, query }: { text: string; query: string }) {
  const chunks = highlightQueryMatches(text, query);
  return (
    <>
      {chunks.map((chunk, i) =>
        chunk.isMatch ? (
          <mark key={i} className="search-highlight">
            {chunk.text}
          </mark>
        ) : (
          <span key={i}>{chunk.text}</span>
        ),
      )}
    </>
  );
}

export function SearchResultsListSkeleton() {
  return (
    <div className="search-skeletons" aria-hidden="true">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="search-skeleton-item">
          <div className="search-skeleton-badge" />
          <div className="search-skeleton-content">
            <div className="search-skeleton-line search-skeleton-title" />
            <div className="search-skeleton-line search-skeleton-excerpt" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SearchResultsList({
  results,
  query,
  lang,
  isLoading = false,
  selectedIndex = -1,
  onSelect,
  onHoverIndex,
  onSuggestionClick,
}: SearchResultsListProps) {
  const t = useTranslations("Nav");
  const trimmedQuery = query.trim();

  if (isLoading) {
    return <SearchResultsListSkeleton />;
  }

  if (trimmedQuery && results.length === 0) {
    return (
      <div className="search-empty-state">
        <div className="search-empty-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" fill="none" strokeWidth="1.5">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4.5-4.5" />
            <path d="M9 11h4" />
          </svg>
        </div>
        <p className="search-empty-title">
          {lang === "en" ? "No results found for" : "Sin resultados para"} &ldquo;{trimmedQuery}&rdquo;
        </p>
        <p className="search-empty-desc">
          {lang === "en"
            ? "Try searching for a different keyword, category or concept."
            : "Intenta buscar con otra palabra clave, categoría o concepto."}
        </p>
        {onSuggestionClick && (
          <div className="search-suggestions">
            <span className="search-suggestions-label">
              {lang === "en" ? "Suggestions:" : "Sugerencias:"}
            </span>
            <div className="search-suggestions-list">
              {POPULAR_SUGGESTIONS.map((term) => (
                <button
                  key={term}
                  type="button"
                  className="search-suggestion-chip"
                  onClick={() => onSuggestionClick(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!trimmedQuery) {
    return (
      <div className="search-initial-state">
        <span className="search-initial-label">
          {lang === "en" ? "Quick topics & suggestions" : "Temas rápidos y sugerencias"}
        </span>
        {onSuggestionClick && (
          <div className="search-suggestions-grid">
            {POPULAR_SUGGESTIONS.map((term) => (
              <button
                key={term}
                type="button"
                className="search-topic-btn"
                onClick={() => onSuggestionClick(term)}
              >
                <span className="search-topic-hash">#</span>
                <span className="search-topic-name">{term}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="sres search-results-scroll" role="listbox" id="search-results-list">
      {results.map((item, index) => {
        const href = resolveSearchResultHref(item);
        const badge = getTypeBadgeInfo(item.type, lang);
        const matchedLabel = getMatchedFieldLabel(item.matched_field, lang);
        const isSelected = selectedIndex === index;

        return (
          <Link
            key={`${item.type}-${item.id || index}`}
            href={href}
            role="option"
            aria-selected={isSelected}
            className={`search-result-row ${isSelected ? "is-selected" : ""}`}
            onClick={(e) => {
              if (onSelect) {
                e.preventDefault();
                onSelect(item);
              }
            }}
            onMouseEnter={() => onHoverIndex?.(index)}
          >
            <div className="search-badge-col">
              <span className="k search-type-label">
                {badge.label}
              </span>
            </div>

            <div className="search-content-col">
              <div className="search-title-row">
                <span className="ti search-item-title">
                  <HighlightedText text={item.title || item.id} query={trimmedQuery} />
                </span>
                {matchedLabel && (
                  <span className="search-matched-field">{matchedLabel}</span>
                )}
              </div>

              {item.excerpt && (
                <p className="ex search-item-excerpt">
                  <HighlightedText text={item.excerpt} query={trimmedQuery} />
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
