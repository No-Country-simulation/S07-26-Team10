"use client";

import React from "react";

interface MdxPreviewProps {
  content: string;
  className?: string;
}

export function MdxPreview({ content, className = "" }: MdxPreviewProps) {
  if (!content || content.trim() === "") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border border-dashed border-border/60 rounded-xl bg-muted/20">
        <p className="text-xs font-mono uppercase tracking-wider mb-1 opacity-70">Vista Previa Editorial</p>
        <p className="text-sm">Escriba contenido MDX para visualizar la vista previa en vivo...</p>
      </div>
    );
  }

  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];

    let inCodeBlock = false;
    let codeBlockLang = "";
    let codeBlockBuffer: string[] = [];

    let inBlockQuote = false;
    let blockQuoteBuffer: string[] = [];

    const flushBlockQuote = (key: number) => {
      if (blockQuoteBuffer.length > 0) {
        elements.push(
          <blockquote
            key={`bq-${key}`}
            className="my-3 pl-4 border-l-4 border-primary bg-primary/5 p-3 rounded-r-lg text-sm text-foreground/90 font-medium italic"
          >
            {blockQuoteBuffer.join(" ")}
          </blockquote>
        );
        blockQuoteBuffer = [];
      }
    };

    const flushCodeBlock = (key: number) => {
      elements.push(
        <div key={`code-block-${key}`} className="my-3 rounded-xl border border-border/60 overflow-hidden bg-muted/40 shadow-xs">
          {codeBlockLang && (
            <div className="px-4 py-1.5 bg-muted/80 border-b border-border/40 font-mono text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {codeBlockLang}
            </div>
          )}
          <pre className="p-4 overflow-x-auto font-mono text-xs text-foreground leading-relaxed">
            <code>{codeBlockBuffer.join("\n")}</code>
          </pre>
        </div>
      );
      codeBlockBuffer = [];
      codeBlockLang = "";
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Multi-line Code Block handling (```lang ... ```)
      if (trimmed.startsWith("```")) {
        if (inCodeBlock) {
          // Close code block
          inCodeBlock = false;
          flushCodeBlock(idx);
          return;
        } else {
          // Open code block
          if (inBlockQuote) {
            inBlockQuote = false;
            flushBlockQuote(idx);
          }
          inCodeBlock = true;
          codeBlockLang = trimmed.replace(/^```/, "").trim();
          return;
        }
      }

      if (inCodeBlock) {
        codeBlockBuffer.push(line);
        return;
      }

      // Blockquote handling
      if (trimmed.startsWith(">")) {
        inBlockQuote = true;
        blockQuoteBuffer.push(trimmed.replace(/^>\s?/, ""));
        return;
      } else if (inBlockQuote) {
        inBlockQuote = false;
        flushBlockQuote(idx);
      }

      if (trimmed === "") {
        elements.push(<div key={`sp-${idx}`} className="h-2" />);
        return;
      }

      // Headings
      if (trimmed.startsWith("### ")) {
        elements.push(
          <h3 key={`h3-${idx}`} className="text-base font-bold text-foreground mt-4 mb-1">
            {parseInline(trimmed.slice(4))}
          </h3>
        );
      } else if (trimmed.startsWith("## ")) {
        elements.push(
          <h2 key={`h2-${idx}`} className="text-lg font-bold tracking-tight text-foreground mt-5 mb-2 border-b border-border/40 pb-1">
            {parseInline(trimmed.slice(3))}
          </h2>
        );
      } else if (trimmed.startsWith("# ")) {
        elements.push(
          <h1 key={`h1-${idx}`} className="text-xl font-extrabold tracking-tight text-foreground mt-6 mb-2">
            {parseInline(trimmed.slice(2))}
          </h1>
        );
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        elements.push(
          <li key={`li-${idx}`} className="ml-4 list-disc text-sm text-muted-foreground my-1">
            {parseInline(trimmed.slice(2))}
          </li>
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        const itemContent = trimmed.replace(/^\d+\.\s/, "");
        elements.push(
          <li key={`oli-${idx}`} className="ml-4 list-decimal text-sm text-muted-foreground my-1">
            {parseInline(itemContent)}
          </li>
        );
      } else {
        elements.push(
          <p key={`p-${idx}`} className="text-sm leading-relaxed text-foreground/90 my-1.5">
            {parseInline(trimmed)}
          </p>
        );
      }
    });

    if (inCodeBlock) {
      flushCodeBlock(lines.length);
    }
    if (inBlockQuote) {
      flushBlockQuote(lines.length);
    }

    return elements;
  };

  const parseInline = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g);

    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={index} className="italic text-foreground/90">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={index} className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs text-primary">{part.slice(1, -1)}</code>;
      }
      if (part.startsWith("[") && part.includes("](")) {
        const match = part.match(/\[(.*?)\]\((.*?)\)/);
        if (match) {
          return (
            <a key={index} href={match[2]} target="_blank" rel="noreferrer" className="text-primary underline font-medium hover:text-primary/80">
              {match[1]}
            </a>
          );
        }
      }
      return part;
    });
  };

  return (
    <div className={`p-4 bg-card rounded-xl border border-border/60 text-card-foreground shadow-xs overflow-hidden ${className}`}>
      <div className="space-y-1">{renderMarkdown(content)}</div>
    </div>
  );
}

export default MdxPreview;
