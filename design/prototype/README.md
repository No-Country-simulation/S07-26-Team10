# PhysaFlow — Stranded Capacity Index

Prototipo de sitio · **v0.1 · borrador** · diseño UX/UI

HTML estático, sin build ni dependencias. Referencia visual y de contenido
para portar a Next.js.

---

## Cómo verlo

Abrí `index.html` con doble clic. No hace falta servidor ni conexión:
imágenes y logos van embebidos.

> En GitHub el preview de un `.html` muestra el código, no la página.
> Hay que descargar la carpeta. **Code → Download ZIP**, parados en la rama.

## Páginas

| Archivo | Contenido |
|---|---|
| `index.html` | Portada — el problema, capítulos, embudo de capacidad |
| `definition.html` | Cap. 01 — qué es la capacidad varada y qué **no** es |
| `taxonomy.html` | Las 18 entradas, filtrables, con cita por entrada |
| `methodology.html` | Cap. 06 — cómo se construyó y qué **no** afirma |
| `references.html` | Cap. 08 — fuentes de contexto y qué falta |
| `design-system.html` | Guía visual del sistema, con la escala y los colores |

## Para el front — tokens

| Archivo | Cuándo usarlo |
|---|---|
| `tokens.theme.css` | **Este.** Formato `@theme` de Tailwind v4. Pegar dentro de `client/src/styles/tokens.css`, junto al `@theme` que ya existe. Genera `text-body`, `text-lead`, `text-green`, `rounded-card`… |
| `tokens.css` | Si el proyecto no usa Tailwind. CSS plano con custom properties: `var(--fs-body)`. |

Los tamaños y colores viven en un solo lugar. Cambiar un valor ahí lo cambia
en todo el sitio. No copiar números a mano.

**Decisión pendiente:** el repo tiene `--color-forest-900: #012d1d` y
`--color-forest-700: #1b4332`. El logo y este prototipo usan `#00603A`.
Son tres verdes para la misma marca. Hay que elegir uno antes de consumir
los tokens. Está anotado también dentro de `tokens.theme.css`.

## Assets para el front

Carpeta `assets/`:

| Archivo | Qué es |
|---|---|
| `physaflow-isotipo.png` | Isotipo, 512px, transparente |
| `physaflow-wordmark-black.png` | Wordmark sobre fondo claro |
| `physaflow-wordmark-white.png` | Wordmark sobre fondo oscuro |
| `datacenter.jpg` | Imagen de fondo del hero |
| `FUENTES.md` | **Cómo cargar las tipografías** — incluye el snippet de `next/font/google` listo para pegar |

En el prototipo estas imágenes van embebidas en base64 para que se abra sin
servidor. Al portar a Next van a `public/`.

## Idioma

Toggle **EN / ES** en el header. El idioma queda en la URL:
`index.html?lang=es` abre en español y se mantiene al navegar.

## Accesibilidad

- Todos los colores de texto pasan WCAG AA (4.5:1) sobre blanco.
- Foco visible con contorno verde en enlaces, botones y campos.
- Las filas del embudo son navegables con teclado.
- Respeta `prefers-reduced-motion`: si el sistema tiene los efectos
  apagados, nada se mueve y todo queda en su estado final.

---

## ⚠️ Regla de datos — leer antes de mostrarlo afuera

**No hay ni una sola cifra medida en todo el sitio.**

- El embudo está marcado como **modelo ilustrativo**. Las proporciones no
  son datos y no deben citarse como tales.
- De las 18 entradas, 13 usan un nombre que ya existe en la literatura
  pública y 5 los proponemos nosotros. Está marcado entrada por entrada.
- Ninguna entrada cita todavía una fuente específica.
- `methodology.html` tiene una sección con **seis cosas que este índice no
  afirma**, incluida la aclaración de que ninguna institución nombrada
  revisó ni avaló nada.

Si alguien saca un número de acá, sale mal.

## Pendiente

- [ ] Página "about" del equipo
- [ ] Contenido largo dentro de cada capítulo
- [ ] Logo vectorial (hoy es PNG embebido)
- [ ] Elegir el verde canónico
- [ ] Citas por entrada en la taxonomía
- [ ] Unificar el tagline: hoy conviven tres versiones
- [ ] PDF del reporte (el botón está deshabilitado a propósito)
