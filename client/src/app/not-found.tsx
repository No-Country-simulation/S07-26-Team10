import Link from "next/link";

export default function NotFound() {
  return (
    <div className="phi min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-6 text-center">
      <p className="font-mono text-sm uppercase tracking-widest text-primary">404</p>
      <h1 className="mt-4 text-4xl font-serif font-bold tracking-tight">
        Página no encontrada
      </h1>
      <p className="mt-3 text-muted-foreground max-w-md leading-relaxed">
        La página que buscas no existe o se movió. Podés volver al inicio o
        explorar el reporte desde su definición.
      </p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Volver al inicio
        </Link>
        <Link
          href="/report"
          className="inline-flex items-center justify-center rounded-md border border-input px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Leer el reporte
        </Link>
      </div>
    </div>
  );
}