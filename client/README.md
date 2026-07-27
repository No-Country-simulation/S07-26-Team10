# 🚀 Cliente PhysaFlow - Proyecto Next.js 16

Este proyecto es una aplicación web moderna desarrollada con **Next.js 16 (App Router)**, **TypeScript** y **Tailwind CSS v4**.

---

## 🛠️ Tecnologías y Dependencias Principales

A continuación se presenta el desglose de las principales librerías utilizadas en el proyecto y su propósito:

| Tecnología / Librería   | Versión    | Propósito / ¿Para qué se usa?                                                                       |
| :---------------------- | :--------- | :-------------------------------------------------------------------------------------------------- |
| **Next.js 16**          | `^16.2.11` | Framework principal de React con App Router para renderizado híbrido (SSR, SSG, Server Components). |
| **TypeScript**          | `^5`       | Tipado estático para JavaScript, garantizando autocompletado y detección de errores en desarrollo.  |
| **Tailwind CSS 4**      | `^4`       | Framework de estilos _utility-first_ rápido, moderno y altamente personalizable.                    |
| **React Hook Form**     | `^7.83.0`  | Gestión eficiente del estado y rendimiento de formularios (evita re-renderizados innecesarios).     |
| **Zod**                 | `^4.4.3`   | Declaración y validación de esquemas de datos y tipos en tiempo de ejecución.                       |
| **@hookform/resolvers** | `^5.5.7`   | Integración e hiper-conector entre React Hook Form y esquemas de validación de Zod.                 |
| **Zustand**             | `^5.0.14`  | Estado global ligero y rápido, sin necesidad de usar Context Providers complejos.                   |
| **Shadcn UI**           | `^4.14.1`  | Componentes de UI accesibles, reutilizables y estilizados con Tailwind.                             |
| **next-intl**           | `^4.13.4`  | Gestión de internacionalización (i18n) para soporte multi-idioma en Next.js.                        |
| **Lucide React**        | `^1.26.0`  | Conjunto de iconos vectoriales modernos y ligeros.                                                  |
| **Recharts**            | `^3.8.0`   | Librería para renderizar gráficos estadísticos e interactivos.                                      |
| **Date-fns**            | `^4.4.0`   | Utilidad modular para formateo y manipulación de fechas.                                            |
| **Embla Carousel**      | `^8.6.0`   | Carruseles fluidos y táctiles para componentes de interfaz.                                         |
| **Input OTP**           | `^1.4.2`   | Componente optimizado para entradas de código de verificación / OTP.                                |

---

## 🏗️ Arquitectura del Proyecto: Feature-Sliced Layout

El proyecto sigue el patrón de arquitectura **Feature-Sliced Layout** diseñado para aplicaciones modernas con Next.js 16 (App Router) y React Server Components:

### 📌 Principios de la Arquitectura

1. **Módulos de Dominio (`src/features/<domain>/`)**:
   - Cada dominio de negocio (ej. `home`, `user`, `report`) agrupa sus propias consultas (`<domain>-queries.ts`), Server Actions (`<domain>-actions.ts`) y componentes UI (`components/`).
2. **Co-locación de Componentes y Skeletons**:
   - Cada archivo de componente exporta tanto el componente real como su esqueleto de carga (ej. `HomeCard` y `HomeCardSkeleton` en `home-card.tsx`).
3. **Páginas Composicionales (`src/app/`)**:
   - Las rutas dentro de `app/` solo componen características y administran los límites de `<Suspense>`. Las páginas se mantienen síncronas y sin lógica directa de datos.
4. **Organización de Componentes (`src/components/`)**:
   - `src/components/ui/`: Primitivos y átomos de UI (Shadcn UI / Radix).
   - `src/components/`: Componentes globales de la app (*app-shell singletons* como `language-toggle.tsx`). No se emplean carpetas genéricas sin concepto como `common/`.

### 📂 Estructura del Código (`src/`)

```
src/
├── app/                            # Rutas, layouts y composición de páginas
│   ├── layout.tsx
│   └── page.tsx
├── features/                       # Módulos de dominio de la aplicación
│   └── home/
│       ├── components/
│       │   └── home-card.tsx       # Componente principal y su Skeleton
│       ├── home-queries.ts         # Consultas de servidor (server-only)
│       └── home-actions.ts         # Acciones de servidor ('use server')
├── components/                     # Componentes compartidos de UI y Shell
│   ├── ui/                         # Componentes reutilizables (Shadcn UI)
│   └── language-toggle.tsx         # Componente global de selección de idioma
├── context/                        # Proveedores de contexto de React
│   └── language-context.tsx
└── lib/                            # Utilidades globales del proyecto
    └── utils.ts
```

---

## ⚙️ Comandos de Desarrollo

```bash
# Instalar dependencias del proyecto
npm install

# Ejecutar el servidor de desarrollo
npm run dev

# Crear la build para producción
npm run build

# Iniciar la aplicación en modo producción
npm start

# Ejecutar el linter de código
npm run lint
```
