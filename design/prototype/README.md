# PhysaFlow — Stranded Capacity Index

Prototipo de sitio · **v0.1 · borrador** · diseño UX/UI

Maquetado en HTML estático, sin build ni dependencias. Es la referencia visual
y de contenido para pasar después a Next.js.

---

## Cómo verlo

Descargá la carpeta y abrí `index.html` con doble clic.
No hace falta servidor ni conexión: las imágenes y los logos están
embebidos en los archivos.

> En GitHub el "preview" de un `.html` muestra el código, no la página.
> Hay que descargarlo para verlo. Botón verde **Code → Download ZIP**.

## Páginas

| Archivo | Contenido |
|---|---|
| `index.html` | Portada — el problema, los capítulos, el embudo de capacidad |
| `definition.html` | Capítulo 01 — qué es la capacidad varada y qué **no** es |
| `taxonomy.html` | Las 18 entradas, filtrables por capa, con cita por entrada |
| `methodology.html` | Cómo se construyó y qué **no** afirma este índice |
| `references.html` | Fuentes de contexto y qué falta |

## Idioma

El toggle **EN / ES** del header traduce todo el sitio.
El idioma queda en la URL: `index.html?lang=es` abre directo en español
y se mantiene al navegar entre páginas.

---

## ⚠️ Regla de datos — leer antes de mostrarlo afuera

**No hay ni una sola cifra medida en todo el sitio.**

- El embudo de capacidad está marcado como **modelo ilustrativo**.
  Las proporciones no son datos y no deben citarse como tales.
- De las 18 entradas de la taxonomía, 13 usan un nombre que ya existe
  en la literatura pública y 5 los proponemos nosotros. Está marcado
  entrada por entrada.
- Ninguna entrada cita todavía una fuente específica.
- `methodology.html` tiene una sección con **seis cosas que este índice
  no afirma**, incluida la aclaración de que ninguna institución nombrada
  revisó ni avaló nada.

Si alguien saca un número de acá, sale mal. Esa sección existe para eso.

---

## Pendiente

- [ ] Página "about" del equipo
- [ ] Contenido largo dentro de cada capítulo
- [ ] Logo vectorial (hoy es PNG embebido)
- [ ] Definir cuál de los tres verdes de la marca es el canónico
      (`#00603A` del logo vs `#012d1d` / `#1b4332` de los tokens del repo)
- [ ] Citas por entrada en la taxonomía
- [ ] Unificar el tagline: hoy conviven tres versiones distintas

## Notas técnicas

Los archivos pesan ~650 KB cada uno porque las imágenes van en base64
dentro del HTML. Es a propósito: así se abren sin servidor y no se rompen
al moverlos de carpeta. Al portar a Next.js las imágenes salen a `/public`.

Sistema de diseño: Inter Tight, IBM Plex Mono para metadatos,
monocromo + un solo acento verde.
