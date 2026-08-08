"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Clipboard, Check } from "lucide-react";

interface CiteBlockProps {
  label: string;
  text: string;
}

export function CiteBlock({ label, text }: CiteBlockProps) {
  const t = useTranslations("HowToCite");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border/50">
        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          {copied ? (
            <>
              <Check className="size-3.5" />
              {t("copied")}
            </>
          ) : (
            <>
              <Clipboard className="size-3.5" />
              {t("copy")}
            </>
          )}
        </button>
      </div>
      <p className="px-4 py-3.5 text-sm sm:text-base text-foreground leading-relaxed font-mono">
        {text}
      </p>
    </div>
  );
}