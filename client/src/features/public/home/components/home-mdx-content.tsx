import React from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Separator } from "@/components/ui/separator";

interface HomeMdxContentProps {
  content: string;
}

const components = {
  h2: ({ children }: { children?: React.ReactNode }) => {
    const text = typeof children === "string" ? children : "";
    const match = text.match(/^(\d+)\.\s*(.*)/);
    const num = match ? match[1] : null;
    const title = match ? match[2] : children;

    return (
      <div className="pt-8 first:pt-0 border-t first:border-0 border-border/40 space-y-4 my-8">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-muted-foreground pb-2">
          {num && <span className="font-semibold text-foreground/80">{num}</span>}
          <span>{title}</span>
        </div>
        <Separator className="bg-border/60" />
      </div>
    );
  },
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-10 pl-6 sm:pl-8 border-l-2 border-foreground/80 font-serif italic text-xl sm:text-2xl text-foreground leading-snug py-2">
      {children}
    </blockquote>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-muted-foreground leading-relaxed text-base sm:text-lg mb-6">
      {children}
    </p>
  ),
};

export function HomeMdxContent({ content }: HomeMdxContentProps) {
  if (!content) return null;

  return (
    <div className="font-sans text-base sm:text-lg text-foreground/90 leading-relaxed">
      <MDXRemote source={content} components={components} />
    </div>
  );
}
