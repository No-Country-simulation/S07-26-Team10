import { SectionForm } from "@/features/admin/components/sections/section-form";
import type { SectionItem } from "@/features/admin/schemas/section-schema";

// Complete, production-grade mock data for editing an existing report section
const RICH_MOCK_SECTION_DATA: SectionItem = {
  id: "sec-001-intro",
  title: "Análisis de Resiliencia Térmica y Capacidad Ociosa",
  slug: "analisis-resiliencia-termica",
  description: "Evaluación técnica y económica detallada sobre el impacto de la capacidad ociosa en plantas térmicas del sistema eléctrico regional durante el periodo 2024-2026.",
  introduction: `# Introducción al Análisis de Resiliencia Térmica

El **Stranded Capacity Report 2026** presenta una investigación técnica rigurosa sobre el comportamiento de la infraestructura de generación térmica frente a las variaciones del mercado eléctrico y el avance de la transición energética.

## Alcance y Contexto del Reporte

En los últimos tres años, la **capacidad ociosa (stranded capacity)** en plantas termoeléctricas de ciclo combinado e hidrocarburos ha experimentado un incremento del **18.4%** debido a:
* La entrada masiva de proyectos de generación renovable no convencional (FNCER).
* Cuellos de botella en la infraestructura de transporte y transmisión en alta tensión.
* Fluctuaciones severas en los precios spot del gas natural y combustibles fósiles.

> "Identificar la capacidad ociosa no es solo un ejercicio contable o financiero; es una necesidad estratégica para garantizar la estabilidad operativa del sistema eléctrico a largo plazo."

### Objetivos Clave

1. **Cuantificación Eficiente**: Medir con precisión las horas de indisponibilidad comercial vs. disponibilidad técnica.
2. **Mitigación de Riesgos**: Establecer mecanismos regulatorios para evitar la obsolescencia prematura de activos estratégicos.
3. **Optimización Operativa**: Definir esquemas de remuneración por confiabilidad y reserva fría.`,
  methodology: `# Metodología Aplicada

La metodología empleada combina **modelación estocástica de despacho económico** con análisis de series de tiempo históricas provistas por los operadores del sistema.

## Formulacion del Indicador de Capacidad Ociosa ($C_{ociosa}$)

Para cada unidad de generación $i$ en el periodo $t$, el porcentaje de capacidad no aprovechada se define como:

$$C_{ociosa, i}(t) = \frac{P_{disponible, i}(t) - P_{despachada, i}(t)}{P_{nominal, i}} \times 100$$

### Fases de Recolección y Procesamiento

1. **Fase I - Consolidación de Datos**: Recopilación de telemetría horaria de generación efectiva y disponibilidad declarada de 45 plantas térmicas.
2. **Fase II - Filtrado de Mantenimientos**: Exclusión de horas asignadas a mantenimientos programados para no distorsionar el indicador de ociosidad comercial.
3. **Fase III - Simulación de Escenarios Hidrológicos**: Evaluación del comportamiento térmico bajo escenarios de hidrología crítica (*El Niño*) vs. hidrología media.

\`\`\`json
{
  "metodologia": "Estocástica Dual",
  "intervalo_muestreo": "15 minutos",
  "cobertura_sistema": "98.5%",
  "periodo_analisis": "2024-2026"
}
\`\`\``,
  citation_text: "Physa Energy Analytics. (2026). Stranded Capacity Report 2026: Análisis de Resiliencia Térmica y Capacidad Ociosa (pp. 12-38). Editorials & Research Group.",
  created_at: "10 Enero 2026",
  updated_at: "12 May 2026",
};

export default function EditSectionPage() {
  return <SectionForm isEditMode={true} initialData={RICH_MOCK_SECTION_DATA} />;
}
