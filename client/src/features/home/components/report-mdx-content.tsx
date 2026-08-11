import React from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Separator } from "@/components/ui/separator";

interface ReportMdxContentProps {
  content: string;
}

const components = {
  h2: ({ children }: { children?: React.ReactNode }) => {
    const text = typeof children === "string" ? children : "";
    const match = text.match(/^(\d+)\.\s*(.*)/);
    const num = match ? match[1] : null;
    const title = match ? match[2] : children;

    return (
      <div className="pt-10 first:pt-0 my-8 space-y-4">
        <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-lg border-l-4 border-foreground border-y border-r border-border/50">
          {num && (
            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded bg-foreground text-background font-mono text-xs font-bold tracking-wider">
              {num}
            </span>
          )}
          <h2 className="font-mono text-sm sm:text-base font-bold uppercase tracking-wider text-foreground">
            {title}
          </h2>
        </div>
        <Separator className="bg-border/40" />
      </div>
    );
  },
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-8 p-6 bg-muted/20 rounded-xl border border-border/60 text-foreground font-mono text-sm sm:text-base leading-relaxed space-y-2">
      <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">
        • DEFINICIÓN
      </div>
      {children}
    </blockquote>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-muted-foreground leading-relaxed text-base sm:text-lg mb-6">
      {children}
    </p>
  ),
};

export function ReportMdxContent({ content }: ReportMdxContentProps) {
  if (!content) return null;

  return (
    <div className="font-sans text-base sm:text-lg text-foreground/90 leading-relaxed">
      <MDXRemote source={content} components={components} />
    </div>
  );
}