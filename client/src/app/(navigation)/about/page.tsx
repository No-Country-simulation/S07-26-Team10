import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Acerca de PhysaFlow | PhysaFlow Research",
  description: "Conoce más sobre PhysaFlow y nuestra misión en infraestructura de IA.",
};

export default function AboutPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-8 font-sans">
      <header className="space-y-4">
        <div className="inline-block px-3 py-1 bg-muted/60 text-muted-foreground font-mono text-xs uppercase tracking-widest rounded-full border border-border">
          NUESTRA MISIÓN
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-foreground leading-tight">
          Acerca de PhysaFlow
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Pioneros en el análisis de infraestructura física para la era de la inteligencia artificial generativa.
        </p>
      </header>

      <Separator className="my-8" />

      <article className="space-y-8 text-foreground/90 text-base sm:text-lg leading-relaxed">
        <p>
          En PhysaFlow Research, nos dedicamos a desentrañar los desafíos operacionales más complejos que enfrentan los centros de datos modernos a medida que la escala computacional de los modelos de inteligencia artificial se expande globalmente.
        </p>
        <p className="text-muted-foreground">
          Nuestros reportes e investigaciones independientes proporcionan a los líderes de tecnología, ingenieros de instalaciones y tomadores de decisiones la claridad analítica necesaria para optimizar el rendimiento y reducir el desperdicio de infraestructura.
        </p>
      </article>
    </div>
  );
}
