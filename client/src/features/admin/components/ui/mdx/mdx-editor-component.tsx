"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
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

export function MDXEditorComponent({ markdown, onChange }: MDXEditorComponentProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertSyntax = (prefix: string, suffix: string = "", defaultText: string = "") => {
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
        start + prefix.length + selectedText.length
      );
    }, 0);
  };

  const insertPrefixToLine = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Find the beginning of the current line
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
    <div className="border border-border/60 rounded-xl bg-card overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-primary/20 transition-all flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/40 border-b border-border/40 text-xs">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md"
          title="Negrita (**texto**)"
          onClick={() => insertSyntax("**", "**", "texto en negrita")}
        >
          <Bold className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md"
          title="Cursiva (*texto*)"
          onClick={() => insertSyntax("*", "*", "texto en cursiva")}
        >
          <Italic className="h-3.5 w-3.5" />
        </Button>

        <div className="h-4 w-px bg-border/60 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md font-bold text-xs"
          title="Encabezado 1 (# Título)"
          onClick={() => insertPrefixToLine("# ")}
        >
          <Heading1 className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md font-bold text-xs"
          title="Encabezado 2 (## Subtítulo)"
          onClick={() => insertPrefixToLine("## ")}
        >
          <Heading2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md font-bold text-xs"
          title="Encabezado 3 (### Sección)"
          onClick={() => insertPrefixToLine("### ")}
        >
          <Heading3 className="h-3.5 w-3.5" />
        </Button>

        <div className="h-4 w-px bg-border/60 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md"
          title="Lista viñetas (- elemento)"
          onClick={() => insertPrefixToLine("- ")}
        >
          <List className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md"
          title="Lista numerada (1. elemento)"
          onClick={() => insertPrefixToLine("1. ")}
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </Button>

        <div className="h-4 w-px bg-border/60 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md"
          title="Cita (> cita)"
          onClick={() => insertPrefixToLine("> ")}
        >
          <Quote className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md"
          title="Bloque de código (``` código ```)"
          onClick={() => insertSyntax("\n```\n", "\n```\n", "código aquí")}
        >
          <Code className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md"
          title="Enlace ([Texto](url))"
          onClick={() => insertSyntax("[", "](https://)", "texto del enlace")}
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md"
          title="Línea horizontal (---)"
          onClick={() => insertPrefixToLine("---\n")}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Content Textarea */}
      <textarea
        ref={textareaRef}
        value={markdown}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escriba su contenido Markdown / MDX aquí..."
        className="w-full p-4 min-h-[320px] bg-transparent text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none resize-y leading-relaxed"
      />
    </div>
  );
}

export default MDXEditorComponent;
