"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="phi min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-6 text-center">
      <p className="font-mono text-sm uppercase tracking-widest text-primary">Error</p>
      <h1 className="mt-4 text-4xl font-serif font-bold tracking-tight">
        Algo salió mal
      </h1>
      <p className="mt-3 text-muted-foreground max-w-md leading-relaxed">
        Ocurrió un error inesperado al renderizar esta página. Intentá de nuevo
        o volvé al inicio.
      </p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md border border-input px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}