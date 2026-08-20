"use client";

import React from "react";

interface MdxPreviewProps {
  content: string;
  className?: string;
}

export function MdxPreview({ content, className = "" }: MdxPreviewProps) {
  if (!content || content.trim() === "") {
    return (
      <div
        style={{
          padding: "48px 20px",
          textAlign: "center",
          fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
          fontSize: "13.5px",
          color: "#6f6f6f",
        }}
      >
        Escriba contenido Markdown en el editor para visualizar la vista previa en vivo...
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
            style={{
              margin: "14px 0",
              padding: "4px 0 4px 16px",
              borderLeft: "2px solid #00603a",
              background: "transparent",
              color: "#08090a",
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "14.5px",
              lineHeight: 1.55,
              fontStyle: "normal",
            }}
          >
            {blockQuoteBuffer.join(" ")}
          </blockquote>,
        );
        blockQuoteBuffer = [];
      }
    };

    const flushCodeBlock = (key: number) => {
      elements.push(
        <div
          key={`code-block-${key}`}
          style={{
            margin: "14px 0",
            borderRadius: "8px",
            border: "1px solid #ebebeb",
            background: "#fafafa",
            overflow: "hidden",
          }}
        >
          {codeBlockLang && (
            <div
              style={{
                padding: "6px 14px",
                background: "#f0f0f0",
                borderBottom: "1px solid #ebebeb",
                fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                fontSize: "11px",
                color: "#6f6f6f",
                textTransform: "uppercase",
                letterSpacing: ".06em",
              }}
            >
              {codeBlockLang}
            </div>
          )}
          <pre
            style={{
              padding: "14px",
              margin: 0,
              overflowX: "auto",
              fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
              fontSize: "12.5px",
              color: "#08090a",
              lineHeight: 1.55,
            }}
          >
            <code>{codeBlockBuffer.join("\n")}</code>
          </pre>
        </div>,
      );
      codeBlockBuffer = [];
      codeBlockLang = "";
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Multi-line Code Block handling (```lang ... ```)
      if (trimmed.startsWith("```")) {
        if (inCodeBlock) {
          inCodeBlock = false;
          flushCodeBlock(idx);
          return;
        } else {
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
        elements.push(<div key={`sp-${idx}`} style={{ height: "8px" }} />);
        return;
      }

      // Headings
      if (trimmed.startsWith("### ")) {
        elements.push(
          <h3
            key={`h3-${idx}`}
            style={{
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "17px",
              fontWeight: 500,
              color: "#08090a",
              margin: "16px 0 6px",
              letterSpacing: "-0.01em",
            }}
          >
            {parseInline(trimmed.slice(4))}
          </h3>,
        );
      } else if (trimmed.startsWith("## ")) {
        elements.push(
          <h2
            key={`h2-${idx}`}
            style={{
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "20px",
              fontWeight: 500,
              color: "#08090a",
              margin: "20px 0 8px",
              letterSpacing: "-0.02em",
            }}
          >
            {parseInline(trimmed.slice(3))}
          </h2>,
        );
      } else if (trimmed.startsWith("# ")) {
        elements.push(
          <h1
            key={`h1-${idx}`}
            style={{
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "24px",
              fontWeight: 500,
              color: "#08090a",
              margin: "24px 0 10px",
              letterSpacing: "-0.03em",
            }}
          >
            {parseInline(trimmed.slice(2))}
          </h1>,
        );
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        elements.push(
          <li
            key={`li-${idx}`}
            style={{
              marginLeft: "18px",
              listStyleType: "disc",
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "14px",
              color: "#08090a",
              margin: "4px 0 4px 18px",
              lineHeight: 1.5,
            }}
          >
            {parseInline(trimmed.slice(2))}
          </li>,
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        const itemContent = trimmed.replace(/^\d+\.\s/, "");
        elements.push(
          <li
            key={`oli-${idx}`}
            style={{
              marginLeft: "18px",
              listStyleType: "decimal",
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "14px",
              color: "#08090a",
              margin: "4px 0 4px 18px",
              lineHeight: 1.5,
            }}
          >
            {parseInline(itemContent)}
          </li>,
        );
      } else {
        elements.push(
          <p
            key={`p-${idx}`}
            style={{
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "14.5px",
              color: "#08090a",
              lineHeight: 1.6,
              margin: "6px 0",
            }}
          >
            {parseInline(trimmed)}
          </p>,
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
        return (
          <strong key={index} style={{ fontWeight: 600, color: "#08090a" }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <em key={index} style={{ fontStyle: "italic", color: "#08090a" }}>
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={index}
            style={{
              padding: "2px 6px",
              borderRadius: "4px",
              background: "#f0f0f0",
              fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
              fontSize: "12px",
              color: "#00603a",
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith("[") && part.includes("](")) {
        const match = part.match(/\[(.*?)\]\((.*?)\)/);
        if (match) {
          return (
            <a
              key={index}
              href={match[2]}
              target="_blank"
              rel="noreferrer"
              style={{
                color: "#00603a",
                textDecoration: "underline",
                fontWeight: 500,
              }}
            >
              {match[1]}
            </a>
          );
        }
      }
      return part;
    });
  };

  return (
    <div
      style={{
        color: "#08090a",
        overflow: "hidden",
      }}
      className={className}
    >
      <div className="space-y-1">{renderMarkdown(content)}</div>
    </div>
  );
}

export default MdxPreview;
