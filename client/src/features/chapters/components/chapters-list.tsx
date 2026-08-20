"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useVersion } from "@/context/version-context";
import { getPublicChapterItemsAction } from "../chapters-actions";
import { formatSectionsToChapterItems } from "../chapters-utils";
import { FALLBACK_SECTIONS } from "../data/fallback";
import type { ChapterItem } from "../chapters-types";

interface ChaptersListProps {
  initialItems?: ChapterItem[];
}

export function ChaptersListSkeleton() {
  return (
    <div className="chap animate-pulse" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "32px 1fr 34px",
            gap: "14px",
            alignItems: "start",
            padding: "16px 0",
            borderTop: "1px solid var(--phi-gline, #E5E7EB)",
          }}
        >
          <span className="h-4 w-6 bg-muted/70 rounded" />
          <div>
            <div
              className="bg-muted/60 rounded"
              style={{
                width: `${65 + ((i * 19) % 30)}%`,
                height: "18px",
              }}
            />
            <div
              className="bg-muted/50 rounded"
              style={{ width: "42px", height: "11px", marginTop: "6px" }}
            />
          </div>
          <span className="h-5 w-5 bg-muted/50 rounded justify-self-end" />
        </div>
      ))}
    </div>
  );
}

export function ChaptersList({ initialItems = [] }: ChaptersListProps) {
  const { activeVersionId, contentLanguage } = useVersion();
  const [items, setItems] = useState<ChapterItem[]>(initialItems);
  const [isLoading, setIsLoading] = useState<boolean>(initialItems.length === 0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    startTransition(async () => {
      try {
        const fetchedItems = await getPublicChapterItemsAction(
          activeVersionId || undefined,
          contentLanguage,
        );
        if (!isCancelled) {
          if (fetchedItems && fetchedItems.length > 0) {
            setItems(fetchedItems);
          } else {
            const fallback = formatSectionsToChapterItems(
              FALLBACK_SECTIONS[contentLanguage || "es"] || FALLBACK_SECTIONS.es,
            );
            setItems(fallback);
          }
        }
      } catch (err) {
        console.error("Error loading chapter items for version:", err);
        if (!isCancelled) {
          const fallback = formatSectionsToChapterItems(
            FALLBACK_SECTIONS[contentLanguage || "es"] || FALLBACK_SECTIONS.es,
          );
          setItems(fallback);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [activeVersionId, contentLanguage]);

  // If loading and no items yet, show skeleton
  if (isLoading && items.length === 0) {
    return <ChaptersListSkeleton />;
  }

  const displayItems =
    items.length > 0
      ? items
      : formatSectionsToChapterItems(
          FALLBACK_SECTIONS[contentLanguage || "es"] || FALLBACK_SECTIONS.es,
        );

  return (
    <div
      className={`chap transition-opacity duration-300 ${
        isPending ? "opacity-60" : "opacity-100"
      }`}
    >
      {displayItems.map((item) => (
        <Link key={item.id || item.slug} href={`/chapter/${item.slug}`}>
          <span className="n">{item.num}</span>
          <div>
            <h3>{item.title}</h3>
            <span className="chd">{item.time}</span>
          </div>
          <span className="chx">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 17L17 7M8 7h9v9" />
            </svg>
          </span>
        </Link>
      ))}
    </div>
  );
}

// Backward-compatibility aliases
export const CaptionsList = ChaptersList;
export const CaptionsListSkeleton = ChaptersListSkeleton;
