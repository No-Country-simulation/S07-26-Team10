import type { HomeIntroData } from "../home-types";





  const FALLBACK_HOME_DATA: Record<"es" | "en", HomeIntroData> = {
  es: {
    id: "stranded-capacity-2024",
    title:
      "Capacidad Estancada: El Cuello de Botella Silencioso de la Infraestructura de IA",
    slug: "stranded-capacity-ai-infrastructure",
    description:
      "A medida que el despliegue de modelos de lenguaje a gran escala crece exponencialmente, la infraestructura física no logra mantener el ritmo. Identificamos las ineficiencias ocultas que crean desperdicio operacional en los centros de datos modernos.",
    introduction: `## 01. RESUMEN EJECUTIVO

La rápida aceleración de la IA generativa ha creado un choque de demanda sin precedentes para la infraestructura computacional. Sin embargo, el cuello de botella ya no es simplemente la disponibilidad de silicio; es la realidad física y operacional de desplegar ese silicio a escala. Este fenómeno, al que denominamos 'Capacidad Estancada', representa una desconexión crítica entre el hardware adquirido y el cómputo utilizado.

> "Estimamos que hasta el 30% del cómputo de IA desplegado a nivel mundial está funcionalmente estancado: encendido, pero incapaz de contribuir al entrenamiento o a la inferencia debido a restricciones a nivel de instalaciones."

Nuestra investigación indica que las causas subyacentes son sistémicas en lugar de aisladas. Las limitaciones de densidad de potencia, las fallas en la gestión térmica y las topologías de red desalineadas impiden colectivamente que los operadores alcancen el rendimiento máximo teórico de sus clústeres. Este reporte proporciona un análisis cuantitativo de estos modos de falla y propone una taxonomía arquitectónica para evaluar la resiliencia de las instalaciones de próxima generación.

## 02. ANÁLISIS TÉCNICO Y TAXONOMÍA DE INFRAESTRUCTURA

El análisis detallado demuestra que la capacidad no utilizada dentro de los clústeres de supercomputación responde a cuellos de botella en la distribución térmica y de densidad energética. Al optimizar los flujos de trabajo dinámicos y la telemetría en tiempo real, las organizaciones pueden recuperar hasta un 25% del rendimiento nominal previamente inalcanzable.`,
    methodology: `## MARCO METODOLÓGICO Y ANÁLISIS

Un enfoque cuantitativo y riguroso para medir la eficiencia y el desperdicio operativo en instalaciones de procesamiento masivo de IA.

## 01. RECOLECCIÓN DE DATOS DE TELEMETRÍA

Analizamos métricas en tiempo real de más de 45 instalaciones globales de supercomputación durante un periodo de 12 meses. Los puntos de datos incluyen consumo de energía a nivel de rack, fluctuaciones de temperatura de entrada y salida, y ciclos de reloj efectivamente aprovechados en tareas de inferencia y entrenamiento.

## 02. CÁLCULO DEL ÍNDICE DE CAPACIDAD ESTANCADA (SCI)

El valor SCI se obtiene al comparar la capacidad máxima teórica del hardware instalado frente al rendimiento útil real alcanzado bajo restricciones térmicas y energéticas. Cualquier brecha recurrente mayor al 5% se clasifica como capacidad estancada operacional.

## 03. ENFOQUE DE MEDICIÓN

Cada capa (facility, IT y carga de trabajo) se evalúa con indicadores propios de su dominio: energía/cooling en facility, utilización y topología en IT, y admisión/scheduling en carga de trabajo. Los resultados se consolidan en una sola puntuación SCI por instalación.

## 04. LO QUE ESTE ÍNDICE NO AFIRMA

El SCI describe e identifica patrones de capacidad estancada; no atribuye causalidad financiera definitiva ni proyecta rendimiento futuro de proveedores individuales. Sus estimaciones de impacto deben leerse como órdenes de magnitud orientativos, no como auditorías.

## 05. ESTADOS DE EVIDENCIA

Cada fenómeno se clasifica en una escala de siete estados de evidencia, desde "documentado en telemetría" hasta "pregunta abierta", para señalar el grado de confianza de cada hallazgo.`,
    citation_text: "Fuente: Índice de Capacidad Estancada de PhysaFlow",
    created_at: "2024-09-30T00:00:00Z",
    updated_at: "2024-09-30T00:00:00Z",
  },
  en: {
    id: "stranded-capacity-2024",
    title: "Stranded Capacity: The Silent Bottleneck of AI Infrastructure.",
    slug: "stranded-capacity-ai-infrastructure",
    description:
      "As the deployment of large language models scales exponentially, physical infrastructure is failing to keep pace. We identify the hidden inefficiencies creating operational waste in modern data centers.",
    introduction: `## 01. EXECUTIVE SUMMARY

The rapid acceleration of generative AI has created an unprecedented demand shock for computational infrastructure. However, the bottleneck is no longer simply silicon availability; it is the physical and operational reality of deploying that silicon at scale. This phenomenon, which we term 'Stranded Capacity,' represents a critical disconnect between procured hardware and utilized compute.

> "We estimate that up to 30% of globally deployed AI compute is functionally stranded—powered on, but unable to contribute to training or inference due to facility-level constraints."

Our research indicates that the underlying causes are systemic rather than isolated. Power density limitations, thermal management failures, and misaligned networking topologies collectively prevent operators from realizing the theoretical peak performance of their clusters. This report provides a quantitative analysis of these failure modes and proposes an architectural taxonomy for evaluating next-generation facility resilience.

## 02. TECHNICAL BREAKDOWN AND INFRASTRUCTURE TAXONOMY

Detailed analysis demonstrates that unutilized capacity within supercomputing clusters responds to bottlenecks in thermal distribution and power density. By optimizing dynamic workflows and real-time telemetry, organizations can recover up to 25% of nominal performance previously unattainable.`,
    methodology: `## METHODOLOGICAL FRAMEWORK & ANALYSIS

A rigorous quantitative approach for measuring operational efficiency and infrastructure waste in large-scale AI facilities.

## 01. TELEMETRY DATA COLLECTION

We analyzed real-time telemetry metrics across 45 global supercomputing facilities over a 12-month period. Data points include rack-level power consumption, inlet and outlet thermal fluctuations, and compute clock cycles effectively utilized for training and inference workloads.

## 02. STRANDED CAPACITY INDEX (SCI) CALCULATION

The SCI value is calculated by comparing theoretical peak capacity against actual compute performance achieved under real-world thermal and power constraints. Any recurring gap greater than 5% is classified as stranded capacity.

## 03. MEASUREMENT APPROACH

Each layer (facility, IT, workload) is assessed with domain-specific indicators: energy and cooling for facility, utilization and topology for IT, admission and scheduling for workload. Results are consolidated into a single SCI score per facility.

## 04. WHAT THIS INDEX DOES NOT CLAIM

The SCI describes and identifies stranded-capacity patterns; it does not attribute definitive financial causation or project individual vendor performance. Impact estimates should be read as indicative orders of magnitude, not audits.

## 05. EVIDENCE STATES

Each phenomenon is classified on a seven-state evidence scale, from "documented in telemetry" to "open question", to signal the confidence level of each finding.`,
    citation_text: "Source: PhysaFlow Stranded Capacity Index",
    created_at: "2024-09-30T00:00:00Z",
    updated_at: "2024-09-30T00:00:00Z",
  },
};


export { FALLBACK_HOME_DATA };