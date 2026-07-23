# PhysaFlow — Stranded Capacity Index Report

> El reporte definitivo sobre la **stranded capacity** en data centers de IA. Documento de referencia de la industria que combina autoridad académica con diseño moderno.

---

## Contexto

PhysaFlow es una empresa de infraestructura de Inteligencia Artificial enfocada en resolver un problema específico y costoso de los data centers modernos: la **stranded capacity** (capacidad pagada y encendida que no produce nada porque las capas físicas y operativas del facility no se coordinan entre sí).

Hasta la fecha, este desperdicio masivo no ha sido documentado de forma exhaustiva ni pública. PhysaFlow busca posicionarse como la voz más autorizada del mundo sobre este problema, iniciando con este primer reporte público firmado por su fundador para establecer el vocabulario y estándar de la industria.

---

## El Desafío

Diseñar y desarrollar el sitio web oficial del reporte público de PhysaFlow. El objetivo es ofrecer una experiencia de lectura de autoridad académica y diseño moderno que sirva como documento de referencia de la industria.

El reporte presenta una taxonomía nombrada de las formas que toma la stranded capacity en tres capas fundamentales de un data center:

1. **Facility Layer**: Energía y refrigeración (cooling).
2. **IT Layer**: Infraestructura (servidores, almacenamiento y red).
3. **Workload Layer**: Scheduling y orquestación de cargas de trabajo.

El sitio no es un blog ni una landing page promocional — es un documento vivo y de referencia de la industria.

---

## Funcionalidades

- **Sitio Web Navegable**: Estructura completa del reporte incluyendo introducción, taxonomía por capas, metodología y sección de citas.
- **Taxonomía Desglosada**: Secciones con nombre distintivo y descripción en lenguaje de operador (qué se ve, qué cuesta, por qué ocurre).
- **Gráficos y Visualizaciones Descargables**: Recursos con atribución explícita: `"Source: PhysaFlow Stranded Capacity Index"`.
- **Bloque de Citación**: Formatos de citación estructurados para uso académico y periodístico.
- **Diseño Responsivo e Identidad Visual**: Aplicación de la paleta corporativa forest-green y gold de PhysaFlow.
- **Contenido Estructurado**: Estructura visual y jerarquía del reporte implementada mediante componentes y MDX.

---

## Arquitectura del Proyecto

El repositorio cuenta con una estructura inicial dividida en dos carpetas principales:

```
S07-26-Team10/
├── client/     # Frontend de la aplicación (Interfaz de usuario y reporte web)
└── server/     # Backend de la aplicación (Servicios y lógica del servidor)
```

### Módulos Iniciales

- **`client`**: Aplicación frontend responsable de la interfaz del portal, navegación interactiva del reporte, renderizado de taxonomías y exportación de gráficos.
- **`server`**: Estructura de backend destinada a gestionar servicios de soporte, APIs y procesamiento de datos.

---

## Stack Tecnológico y Sistema de Diseño

### Tecnologías Sugeridas (Frontend)

- **Next.js**: Framework para renderizado optimizado y estructura web.
- **Tailwind CSS**: Sistema de diseño y estilos responsivos.
- **MDX**: Integración de contenido del reporte y componentes dinámicos.

### Arquitectura Backend

- **`server`**: Módulo en fase de definición técnica según requerimientos del proyecto.

### Sistema de Diseño

- **Forest Green**: Tono principal para la identidad institucional y lectura del reporte.
- **Gold**: Tono de acento para destacados, bordes y elementos de interacción.

---

## Taxonomía de Stranded Capacity

| Capa         | Tipo de Stranded Capacity | Manifestación (_Qué se ve_)                             | Impacto (_Qué cuesta_)                              | Causa Raíz (_Por qué ocurre_)                             |
| :----------- | :------------------------ | :------------------------------------------------------ | :-------------------------------------------------- | :-------------------------------------------------------- |
| **Facility** | Thermal Stranded Power    | PDU cargado al 60% nominal pero térmicamente bloqueado. | Gasto en kWh reservado sin uso efectivo de cómputo. | Falta de monitoreo térmico dinámico a nivel de rack.      |
| **IT Layer** | GPU Memory Fragmentation  | GPUs asignadas al 100% con VRAM consumida al 25%.       | Inversión congelada en hardware de aceleración.     | Asignación estática de recursos en pods de entrenamiento. |
| **Workload** | Idle Job Guardbands       | Ventanas de reserva de workloads sin ejecución activa.  | Capacidad ociosa en colas de alta prioridad.        | Scheduling defensivo sin sobre-suscripción segura.        |

---

## Cómo Citar este Reporte

### Atribución en Gráficos y Visualizaciones

`Source: PhysaFlow Stranded Capacity Index`

### Formato Periodístico

_PhysaFlow Stranded Capacity Index (2026)._ "Taxonomía de la Capacidad Ociosa en Data Centers de IA". PhysaFlow Public Reports.

### Formato Académico (BibTeX)

```bibtex
@techreport{physaflow2026stranded,
  author       = {PhysaFlow Research & Founders},
  title        = {PhysaFlow Stranded Capacity Index: Mapping Unproductive Power and Compute in AI Infrastructure},
  institution  = {PhysaFlow},
  year         = {2026},
  url          = {https://reports.physaflow.com/stranded-capacity-index}
}
```

---

## Criterio de Éxito

Un stakeholder de PhysaFlow puede abrir el sitio, navegar el reporte completo y entender la taxonomía de stranded capacity sin necesitar explicación adicional. El diseño transmite autoridad académica y rigor profesional.

---

## Licencia

Este proyecto está distribuido bajo la [Licencia MIT](LICENSE). El contenido del reporte y la taxonomía corresponden a la propiedad intelectual de PhysaFlow.
