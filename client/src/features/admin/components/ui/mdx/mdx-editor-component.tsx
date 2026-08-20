"use client";

import React, { useRef } from "react";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Minus,
} from "lucide-react";

interface MDXEditorComponentProps {
  markdown: string;
  onChange: (markdown: string) => void;
}

export function MDXEditorComponent({
  markdown,
  onChange,
}: MDXEditorComponentProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertSyntax = (
    prefix: string,
    suffix: string = "",
    defaultText: string = "",
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end) || defaultText;

    const newText =
      markdown.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      markdown.substring(end);

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length,
      );
    }, 0);
  };

  const insertPrefixToLine = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Buscar el inicio de la línea actual
    const lineStart = markdown.lastIndexOf("\n", start - 1) + 1;
    const newText =
      markdown.substring(0, lineStart) +
      prefix +
      markdown.substring(lineStart);

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  return (
    <div
      style={{
        border: "1px solid #ebebeb",
        borderRadius: "8px",
        background: "#ffffff",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 1px 2px rgba(8,9,10,0.03)",
        transition: "border-color .16s, box-shadow .16s",
      }}
    >
      {/* Barra de herramientas */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "3px",
          padding: "6px 10px",
          background: "#fafafa",
          borderBottom: "1px solid #ebebeb",
        }}
      >
        <button
          type="button"
          title="Negrita (**texto**)"
          onClick={() => insertSyntax("**", "**", "texto en negrita")}
          className="b icon ghost sm"
          style={{ width: "28px", height: "28px", borderRadius: "5px" }}
        >
          <Bold style={{ width: 13, height: 13 }} />
        </button>

        <button
          type="button"
          title="Cursiva (*texto*)"
          onClick={() => insertSyntax("*", "*", "texto en cursiva")}
          className="b icon ghost sm"
          style={{ width: "28px", height: "28px", borderRadius: "5px" }}
        >
          <Italic style={{ width: 13, height: 13 }} />
        </button>

        <div
          style={{
            width: "1px",
            height: "16px",
            background: "#ebebeb",
            margin: "0 4px",
          }}
        />

        <button
          type="button"
          title="Encabezado 1 (# Título)"
          onClick={() => insertPrefixToLine("# ")}
          className="b icon ghost sm"
          style={{ width: "28px", height: "28px", borderRadius: "5px" }}
        >
          <Heading1 style={{ width: 13, height: 13 }} />
        </button>

        <button
          type="button"
          title="Encabezado 2 (## Subtítulo)"
          onClick={() => insertPrefixToLine("## ")}
          className="b icon ghost sm"
          style={{ width: "28px", height: "28px", borderRadius: "5px" }}
        >
          <Heading2 style={{ width: 13, height: 13 }} />
        </button>

        <button
          type="button"
          title="Encabezado 3 (### Sección)"
          onClick={() => insertPrefixToLine("### ")}
          className="b icon ghost sm"
          style={{ width: "28px", height: "28px", borderRadius: "5px" }}
        >
          <Heading3 style={{ width: 13, height: 13 }} />
        </button>

        <div
          style={{
            width: "1px",
            height: "16px",
            background: "#ebebeb",
            margin: "0 4px",
          }}
        />

        <button
          type="button"
          title="Lista de viñetas (- elemento)"
          onClick={() => insertPrefixToLine("- ")}
          className="b icon ghost sm"
          style={{ width: "28px", height: "28px", borderRadius: "5px" }}
        >
          <List style={{ width: 13, height: 13 }} />
        </button>

        <button
          type="button"
          title="Lista numerada (1. elemento)"
          onClick={() => insertPrefixToLine("1. ")}
          className="b icon ghost sm"
          style={{ width: "28px", height: "28px", borderRadius: "5px" }}
        >
          <ListOrdered style={{ width: 13, height: 13 }} />
        </button>

        <div
          style={{
            width: "1px",
            height: "16px",
            background: "#ebebeb",
            margin: "0 4px",
          }}
        />

        <button
          type="button"
          title="Cita (> cita)"
          onClick={() => insertPrefixToLine("> ")}
          className="b icon ghost sm"
          style={{ width: "28px", height: "28px", borderRadius: "5px" }}
        >
          <Quote style={{ width: 13, height: 13 }} />
        </button>

        <button
          type="button"
          title="Bloque de código (``` código ```)"
          onClick={() => insertSyntax("\n```\n", "\n```\n", "código aquí")}
          className="b icon ghost sm"
          style={{ width: "28px", height: "28px", borderRadius: "5px" }}
        >
          <Code style={{ width: 13, height: 13 }} />
        </button>

        <button
          type="button"
          title="Enlace ([Texto](url))"
          onClick={() => insertSyntax("[", "](https://)", "texto del enlace")}
          className="b icon ghost sm"
          style={{ width: "28px", height: "28px", borderRadius: "5px" }}
        >
          <LinkIcon style={{ width: 13, height: 13 }} />
        </button>

        <button
          type="button"
          title="Línea horizontal (---)"
          onClick={() => insertPrefixToLine("---\n")}
          className="b icon ghost sm"
          style={{ width: "28px", height: "28px", borderRadius: "5px" }}
        >
          <Minus style={{ width: 13, height: 13 }} />
        </button>
      </div>

      {/* Área de texto limpia con fondo blanco plano */}
      <textarea
        ref={textareaRef}
        value={markdown}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escriba su contenido Markdown / MDX aquí..."
        style={{
          width: "100%",
          padding: "16px",
          minHeight: "340px",
          background: "#ffffff",
          fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
          fontSize: "13.5px",
          color: "#08090a",
          lineHeight: 1.65,
          border: "none",
          outline: "none",
          resize: "vertical",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

export default MDXEditorComponent;
