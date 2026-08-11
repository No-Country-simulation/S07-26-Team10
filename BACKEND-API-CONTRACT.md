# Contrato de API — Cliente → Backend

Documento para coordinar la conexión del `client` Next.js con el `server` FastAPI (PhysaFlow Stranded Capacity Index).

El cliente ya está **listo para consumir la API con fallback local**: si el backend no responde o no provee los campos ricos, cae a datos locales. Estos son los endpoints y campos que el frontend espera.

## Endpoints públicos consumidos

| Endpoint | Uso | Status |
|---|---|---|
| `GET /api/v1/reports/{slug}` | metadata del reporte (title, summary, citation_text) + timestamps | Existe ✓ |
| `GET /api/v1/sections/report/{report_id}` | introduction + methodology (campos `content`) | Existe ✓ |
| `GET /api/v1/categories/report/{report_id}` | taxonomía por capas | Existe ✓ |
| `GET /api/v1/concepts/category/{category_id}` | conceptos por capa | Existe ✓ |
| `GET /api/v1/references/report/{report_id}` | referencias públicas | Existe ✓ |
| `DELETE /api/v1/reports/{report_id}` | borrado en admin (hoy **404**) | Falta ✗ |

## Contenido del reporte (reports + sections)

El frontend arma la página Definición (`/report`) y Metodología (`/methodology`) combinando:

- `reports`: `title`, `summary` (→ description), `citation_text`, `created_at`, `updated_at`.
- `sections` (por `report_id`): busca por `slug` los items `introduction` y `methodology` y usa su campo `content` (MDX/servicio).

⚠️ **Para quitar el fallback**: exponer `created_at` y `updated_at` también en el schema público `ReportPublicRead` (hoy solo están en `ReportRead` admin).

## Taxonomía — campos ricos necesarios en `ConceptPublicRead`

El front end espera (además de `id`, `name`, `description`) los campos:

| Campo front `TaxonomyConcept` | Backend esperado | Tipo |
|---|---|---|
| `itemCode` | `item_code` | varchar (`FAC-01`) |
| `layerCode` | `layer_code` (o derivado de categoría) | varchar (`FAC`/`IT`/`WKL`) |
| `slug` | `slug` | varchar, unique |
| `shortDescription` | `short_description` | text |
| `definition` | `definition` | text |
| `characteristics` | `characteristics` | jsonb (`[]`) |
| `operationalImpact` | `operational_impact` | text |
| `commonCauses` | `common_causes` | jsonb (`[]`) |
| `exampleScenario` | `example_scenario` | text |
| `relatedConceptIds` | `related_concept_ids` | jsonb (`[]` de UUIDs/slugs) |

### Migración propuesta (tabla `concepts`)

```sql
ALTER TABLE concepts
  ADD COLUMN slug VARCHAR UNIQUE,
  ADD COLUMN item_code VARCHAR,
  ADD COLUMN layer_code VARCHAR,
  ADD COLUMN short_description TEXT,
  ADD COLUMN definition TEXT,
  ADD COLUMN characteristics JSONB DEFAULT '[]',
  ADD COLUMN operational_impact TEXT,
  ADD COLUMN common_causes JSONB DEFAULT '[]',
  ADD COLUMN example_scenario TEXT,
  ADD COLUMN related_concept_ids JSONB DEFAULT '[]';
```

`categories`: agregar `layer_code` (`FAC`/`IT`/`WKL`).

## Estrategia de fallback del cliente

1. `fetchTaxonomyData()` consulta `categories` + `concepts`; por cada concepto **fusiona** los campos ricos con los de `src/data/taxonomy.ts` (match por `id`/`name`). Si la API no responde → sirve la taxonomía local (18 conceptos).
2. `getHomeIntro()` consulta `reports/{slug}` + `sections`; si falla → `FALLBACK_HOME_DATA`.
3. `getReferences()` consulta `references/report/{id}`; si falla → lista local.

Con esto el sitio funciona 100% sin backend y se conecta automáticamente apenas existan los campos.