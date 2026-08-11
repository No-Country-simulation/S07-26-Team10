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
    <div className="nt rvs">
      <div className="ntl">
        <span className="ntw">{label}</span>
        <p className="ntd">{text}</p>
      </div>
      <div className="ntr">
        <button
          type="button"
          onClick={handleCopy}
          className="reflink"
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
    </div>
  );
}