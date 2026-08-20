import type { PublicSection } from "../chapters-types";

export const FALLBACK_SECTIONS: Record<"es" | "en", PublicSection[]> = {
  es: [
    {
      id: "fallback-es-01",
      report_version_id: "fallback-version-es",
      title: "Resumen Ejecutivo",
      slug: "resumen-ejecutivo",
      display_order: 1,
      content: `## 01. Resumen Ejecutivo

La rápida aceleración de la IA generativa ha creado un choque de demanda sin precedentes para la infraestructura computacional. Sin embargo, el cuello de botella ya no es simplemente la disponibilidad de silicio; es la realidad física y operacional de desplegar ese silicio a escala. Este fenómeno, al que denominamos 'Capacidad Estancada', representa una desconexión crítica entre el hardware adquirido y el cómputo utilizado.

Estimamos que hasta el 30% del cómputo de IA desplegado a nivel mundial está funcionalmente estancado: encendido, pero incapaz de contribuir al entrenamiento o a la inferencia debido a restricciones a nivel de instalaciones.

Nuestra investigación indica que las causas subyacentes son sistémicas en lugar de aisladas. Las limitaciones de densidad de potencia, las fallas en la gestión térmica y las topologías de red desalineadas impiden colectivamente que los operadores alcancen el rendimiento máximo teórico de sus clústeres.`,
    },
    {
      id: "fallback-es-02",
      report_version_id: "fallback-version-es",
      title: "Definición del Problema",
      slug: "definicion-problema",
      display_order: 2,
      content: `## 02. Definición del Problema

La capacidad estancada ocurre cuando los recursos de infraestructura (energía, enfriamiento, espacio o ancho de banda) se encuentran comprometidos o provisionados pero no pueden ser aprovechados por la carga de cómputo útil.

### Modos de falla fundamentales:
1. **Desbalance de Potencia**: Capacidad eléctrica contratada o en UPS que no puede distribuirse por límites en PDUs o breakers.
2. **Cuellos de Botella Térmicos**: Puntos calientes que obligan a reducir la potencia de servidores adyacentes.
3. **Fragmentación Topológica**: GPUs disponibles en nodos aislados que no satisfacen requerimientos de paralelismo de modelos masivos.`,
    },
    {
      id: "fallback-es-03",
      report_version_id: "fallback-version-es",
      title: "Modelo Operativo del Data Center",
      slug: "modelo-operativo",
      display_order: 3,
      content: `## 03. Modelo Operativo del Data Center

Los centros de datos de IA operan bajo dinámicas radicalmente diferentes a las cargas de trabajo empresariales tradicionales. La densidad de potencia por rack ha aumentado de 10-15 kW a más de 40-100 kW.

Esto impone una sincronización estricta entre tres capas operativas interdependientes:
- **Capa de Instalaciones (Facility)**: Suministro eléctrico, climatización y espacio físico.
- **Capa de IT e Infraestructura**: Servidores, aceleradores GPU/ASIC y tejidos de interconexión.
- **Capa de Cargas de Trabajo (Workload)**: Programadores de tareas, colas de entrenamiento e inferencia.`,
    },
    {
      id: "fallback-es-04",
      report_version_id: "fallback-version-es",
      title: "Taxonomía Propuesta",
      slug: "taxonomia",
      display_order: 4,
      content: `## 04. Taxonomía Propuesta

Para diagnosticar y cuantificar sistemáticamente la capacidad estancada, presentamos una taxonomía estructurada en 3 niveles de abstracción:

- **Facility (FAC)**: Restricciones de energía disponible, refrigeración activa y espacio utilizable.
- **IT Hardware (IT)**: Disponibilidad de aceleradores, fragmentación de memoria y cuellos de botella en redes de baja latencia.
- **Workload (WKL)**: Eficiencia en colas de programación (scheduling), asignación de tareas distribuidas y fragmentación de trabajos.`,
    },
    {
      id: "fallback-es-05",
      report_version_id: "fallback-version-es",
      title: "Facility",
      slug: "facility",
      display_order: 5,
      content: `## 05. Capa de Instalaciones (Facility)

La capa física representa el límite superior estricto del cómputo desplegable. Analizamos los tres componentes críticos:

- **Stranded Power (Energía Estancada)**: Margen de potencia reservado que excede el consumo real debido a factores de sobredimensionamiento conservadores.
- **Stranded Cooling (Enfriamiento Estancado)**: Capacidad térmica instalada que no enfría efectivamente debido a mala distribución del flujo de aire.
- **Restricciones de Distribución**: Límites en barras colectoras y disyuntores que impiden alimentar racks densos contiguos.`,
    },
    {
      id: "fallback-es-06",
      report_version_id: "fallback-version-es",
      title: "IT",
      slug: "it",
      display_order: 6,
      content: `## 06. Capa de IT y Hardware

La infraestructura computacional sufre de subutilización debido a factores arquitectónicos:

- **GPU Fragmentation**: Unidades de procesamiento gráfico que quedan inactivas cuando los trabajos requieren potencias de dos (ej. 8, 16, 32 GPUs).
- **Topology Bottlenecks**: Servidores cuyos enlaces InfiniBand/RoCE no satisfacen la latencia necesaria para sincronización de gradientes.
- **Fallas de Mantenimiento**: Nodos fuera de línea por diagnósticos pendientes que bloquean clústeres completos en esquemas Gang Scheduling.`,
    },
    {
      id: "fallback-es-07",
      report_version_id: "fallback-version-es",
      title: "Workload",
      slug: "workload",
      display_order: 7,
      content: `## 07. Capa de Cargas de Trabajo (Workload)

El software de orquestación y scheduling es el responsable directo de materializar el cómputo disponible:

- **Gang Scheduling**: Políticas que requieren la reserva simultánea de todos los recursos antes de iniciar el trabajo, dejando servidores ociosos mientras se liberan los restantes.
- **Ineficiencias en Colas**: Políticas FIFO que bloquean trabajos pequeños detrás de entrenamientos de meses de duración.
- **Checkpointing Overhead**: Pérdida de ciclos de cálculo útil durante el guardado síncrono del estado del modelo.`,
    },
    {
      id: "fallback-es-08",
      report_version_id: "fallback-version-es",
      title: "Impacto Económico",
      slug: "impacto-economico",
      display_order: 8,
      content: `## 08. Impacto Económico y Financiero

La capacidad estancada tiene un impacto directo multimillonario en el costo total de propiedad (TCO) y en el retorno de capital invertido (ROIC):

- **Depreciación Acelerada**: El hardware de IA pierde valor rápidamente mientras permanece inactivo.
- **Costo de Energía Comprometida**: Pagos por capacidad contratada no utilizada (take-or-pay contracts).
- **Oportunidad de Mercado**: Retrasos en el lanzamiento de modelos fundacionales frente a competidores.`,
    },
    {
      id: "fallback-es-09",
      report_version_id: "fallback-version-es",
      title: "Metodología",
      slug: "metodologia",
      display_order: 9,
      content: `## 09. Metodología de Medición (SCI)

El Índice de Capacidad Estancada (Stranded Capacity Index - SCI) cuantifica la diferencia porcentual entre el cómputo teórico máximo y el cómputo útil entregado:

$$\\text{SCI} = 1 - \\frac{\\text{Cómputo Útil Entregado}}{\\text{Capacidad Teórica Nominal}}$$

Los datos se recopilan mediante telemetría en tiempo real a nivel de rack, PDU, conmutador de red y métricas del planificador Slurm/Kubernetes.`,
    },
    {
      id: "fallback-es-10",
      report_version_id: "fallback-version-es",
      title: "Referencias",
      slug: "referencias",
      display_order: 10,
      content: `## 10. Referencias y Bibliografía

1. PhysaFlow Research Group (2026). *Stranded Capacity in High-Density AI Data Centers*.
2. Open Compute Project (OCP). *Advanced Cooling Facilities Specifications v2.1*.
3. IEEE Computer Society. *Topology-Aware Scheduling for Distributed Deep Learning Workloads*.
4. Uptime Institute. *Data Center Power and Cooling Utilization Benchmarks*.`,
    },
  ],
  en: [
    {
      id: "fallback-en-01",
      report_version_id: "fallback-version-en",
      title: "Executive Summary",
      slug: "executive-summary",
      display_order: 1,
      content: `## 01. Executive Summary

The rapid acceleration of generative AI has created an unprecedented demand shock for computational infrastructure. However, the bottleneck is no longer simply silicon availability; it is the physical and operational reality of deploying that silicon at scale. This phenomenon, which we term 'Stranded Capacity,' represents a critical disconnect between procured hardware and utilized compute.

We estimate that up to 30% of globally deployed AI compute is functionally stranded: powered on, but unable to contribute to training or inference due to facility-level constraints.

Our research indicates that the underlying causes are systemic rather than isolated. Power density limitations, thermal management failures, and misaligned networking topologies collectively prevent operators from realizing the theoretical peak performance of their clusters.`,
    },
    {
      id: "fallback-en-02",
      report_version_id: "fallback-version-en",
      title: "Problem Definition",
      slug: "problem-definition",
      display_order: 2,
      content: `## 02. Problem Definition

Stranded capacity occurs when infrastructure resources (power, cooling, space, or network bandwidth) are committed or provisioned but cannot be utilized by useful computational workloads.

### Primary Failure Modes:
1. **Power Imbalance**: Contracted or UPS power that cannot be distributed due to PDU or breaker constraints.
2. **Thermal Bottlenecks**: Hot spots requiring throttling of adjacent server nodes.
3. **Topological Fragmentation**: Available GPUs in isolated nodes failing multi-node parallelism requirements.`,
    },
    {
      id: "fallback-en-03",
      report_version_id: "fallback-version-en",
      title: "Data Center Operating Model",
      slug: "operating-model",
      display_order: 3,
      content: `## 03. Data Center Operating Model

AI data centers operate under fundamentally different dynamics than traditional enterprise computing. Rack power densities have escalated from 10-15 kW to over 40-100 kW.

This requires tight synchronization across three interlinked operational layers:
- **Facility Layer**: Power distribution, cooling plants, and physical whitespaces.
- **IT Infrastructure Layer**: Servers, GPU/ASIC accelerators, and high-speed fabrics.
- **Workload Layer**: Schedulers, job queues, and training frameworks.`,
    },
    {
      id: "fallback-en-04",
      report_version_id: "fallback-version-en",
      title: "Proposed Taxonomy",
      slug: "taxonomy",
      display_order: 4,
      content: `## 04. Proposed Taxonomy

To systematically diagnose and measure stranded capacity, we define a 3-tier architectural taxonomy:

- **Facility (FAC)**: Power delivery, active cooling capacity, and whitespace layout.
- **IT Hardware (IT)**: Accelerator availability, memory fragmentation, and fabric topology.
- **Workload (WKL)**: Queue scheduling efficiency, gang allocation, and distributed synchronization.`,
    },
    {
      id: "fallback-en-05",
      report_version_id: "fallback-version-en",
      title: "Facility",
      slug: "facility",
      display_order: 5,
      content: `## 05. Facility Layer

The physical plant forms the strict upper boundary of deliverable compute:

- **Stranded Power**: Reserved electrical headroom that exceeds actual draw due to conservative derating.
- **Stranded Cooling**: Commissioned thermal capacity failing to cool IT load due to bypass air.
- **Distribution Constraints**: Busway and breaker limits preventing concurrent dense rack operations.`,
    },
    {
      id: "fallback-en-06",
      report_version_id: "fallback-version-en",
      title: "IT",
      slug: "it",
      display_order: 6,
      content: `## 06. IT Hardware Layer

Compute hardware experiences significant structural underutilization:

- **GPU Fragmentation**: Unassigned GPUs when jobs demand power-of-two partitions (e.g. 8, 16, 32 GPUs).
- **Topology Bottlenecks**: Interconnect latency constraints preventing distributed training scale-out.
- **Maintenance Lockouts**: Nodes pending diagnostics causing multi-node job failures under gang scheduling.`,
    },
    {
      id: "fallback-en-07",
      report_version_id: "fallback-version-en",
      title: "Workload",
      slug: "workload",
      display_order: 7,
      content: `## 07. Workload Layer

Workload orchestration software determines effective hardware utilization:

- **Gang Scheduling**: Rigid co-allocation requirements leaving nodes idle awaiting cluster availability.
- **Queue Inefficiencies**: Head-of-line blocking delaying urgent inference and fine-tuning jobs.
- **Checkpointing Overhead**: Idle compute cycles consumed by synchronous storage writes.`,
    },
    {
      id: "fallback-en-08",
      report_version_id: "fallback-version-en",
      title: "Economic Impact",
      slug: "economic-impact",
      display_order: 8,
      content: `## 08. Economic & Financial Impact

Stranded capacity imposes massive costs on total cost of ownership (TCO) and return on invested capital (ROIC):

- **Accelerated Depreciation**: Hardware losing economic value while sitting unutilized.
- **Committed Utility Penalties**: Take-or-pay power contract expenses for unconsumed electricity.
- **Time-to-Market Penalties**: Critical delays in foundation model training timelines.`,
    },
    {
      id: "fallback-en-09",
      report_version_id: "fallback-version-en",
      title: "Methodology",
      slug: "methodology",
      display_order: 9,
      content: `## 09. Measurement Methodology (SCI)

The Stranded Capacity Index (SCI) evaluates the gap between nominal hardware capability and delivered productive compute:

$$\\text{SCI} = 1 - \\frac{\\text{Useful Compute Delivered}}{\\text{Theoretical Peak Capacity}}$$

Data is gathered via continuous telemetry from rack PDUs, cooling manifolds, network switches, and workload schedulers.`,
    },
    {
      id: "fallback-en-10",
      report_version_id: "fallback-version-en",
      title: "References",
      slug: "references",
      display_order: 10,
      content: `## 10. References & Bibliography

1. PhysaFlow Research Group (2026). *Stranded Capacity in High-Density AI Data Centers*.
2. Open Compute Project (OCP). *Advanced Cooling Facilities Specifications v2.1*.
3. IEEE Computer Society. *Topology-Aware Scheduling for Distributed Deep Learning Workloads*.
4. Uptime Institute. *Data Center Power and Cooling Utilization Benchmarks*.`,
    },
  ],
};
