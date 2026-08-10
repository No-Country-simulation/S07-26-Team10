# Fuentes y logos — PhysaFlow

## Tipografías

Las dos son de Google Fonts, gratuitas, sin licencia que gestionar.

**Inter Tight** — todo el texto. Pesos usados: 400 y 500.
**IBM Plex Mono** — códigos, metadatos y etiquetas. Pesos: 400 y 500.

### En el HTML

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter+Tight:wght@400;500;600&display=swap" rel="stylesheet">
```

### En Next.js (recomendado — evita el salto de fuente al cargar)

```ts
// app/layout.tsx
import { Inter_Tight, IBM_Plex_Mono } from 'next/font/google'

const sans = Inter_Tight({
  subsets: ['latin'], weight: ['400','500','600'], variable: '--font-sans',
})
const mono = IBM_Plex_Mono({
  subsets: ['latin'], weight: ['400','500'], variable: '--font-mono',
})

export default function RootLayout({ children }) {
  return (
    <html className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

Los tokens ya apuntan a `--font-sans` y `--font-mono`, así que con eso queda enganchado.

**Regla de marca:** los títulos van en peso 500, nunca en 700.
La mono no se usa nunca para texto corrido — solo códigos, cifras y etiquetas cortas.

## Logos

| Archivo | Uso |
|---|---|
| `physaflow-isotipo.png` | El isotipo. 512px, fondo transparente. Header 44px de alto, footer 56px. |
| `physaflow-wordmark-black.png` | La palabra PhysaFlow sobre fondo claro. |
| `physaflow-wordmark-white.png` | La palabra sobre fondo oscuro. |
| `datacenter.jpg` | Imagen de fondo del hero y de los mast de capítulo. Va al 16–17% de opacidad, en escala de grises con contraste 1.3. |

**Pendiente:** no hay versión vectorial. El wordmark salió recortado de un JPG,
así que en tamaños grandes se va a ver el borde. Hace falta el SVG original.

En el prototipo estas imágenes van embebidas en base64 dentro del HTML para
que se abra con doble clic sin servidor. Al portar a Next van a `public/`.
