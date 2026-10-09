# SPEC 07 — Noticias: listado, artículo y SEO

> **Status:** Implementado
> **Depends on:** SPEC 03 (header), SPEC 04 (footer), SPEC 06 (prop `ogImage` de `BaseLayout`)
> **Date:** 2026-10-08
> **Objective:** Reemplazar el blog del starter por `/noticias` y `/noticias/<slug>` según las pantallas "Noticias" y "Detalle de noticia" de la referencia (desktop y mobile), con categorías, filtro en el navegador, compartir, Open Graph por artículo y JSON-LD `BlogPosting` + `BreadcrumbList`, editable desde Tina.

## Por qué existe esta spec

Hoy `/blog` y `/blog/<slug>` son la plantilla del starter:

- título "Blog", grilla genérica y cuerpo con `prose`;
- description fija ("Artículos y novedades."), `og:type` siempre `website`, `og:image` global y JSON-LD solo `Organization`;
- el schema de `post` usa `tags` con opciones que no son las del diseño ("Novedades", "Tecnología médica", "Marcas"), `readTime` a mano y campos `_en` que Medical no usa;
- hay un solo post de prueba (`primer-post.mdx`).

`/blog` nunca existió en producción: el WordPress actual no tiene sección de noticias, solo el "hello-world" de ejemplo. No hay posicionamiento que conservar.

La referencia (`Medical Digital Desktop.html` y `Medical Digital Mobile.html`) define:

- **Listado:**
  - miga, H1 "Noticias" y bajada (esta solo en desktop);
  - pestañas Todos, Productos, Actividades, Capacitaciones y Noticias;
  - un post destacado ancho (solo en desktop) y la grilla;
  - el bloque "Suscríbete al boletín" con un input de correo, que esta spec no implementa (ver Decisiones).
- **Artículo:**
  - miga con la categoría, chip, H1 y una franja con el autor "MD · Equipo Medical Digital", la fecha y la lectura;
  - botones de compartir: LinkedIn, WhatsApp y copiar enlace en desktop, y un solo ícono en mobile;
  - la portada, el extracto como lead y el cuerpo con H2 y una cita destacada;
  - el CTA "Hablar con un asesor" y "Sigue leyendo" con 3 posts (este último solo en desktop).

## Referencia de diseño (valores extraídos del bundle)

Todos los valores se escriben con tokens, nunca en hex. Los px de esta sección son los de la referencia; en el código se usa el token más cercano de la escala del UI Kit (ver Decisiones).

**Breakpoints:**

- **Mobile (`< md`):** el layout de la referencia mobile.
- **Tablet (`md` a `lg`):** los elementos de desktop en 2 columnas.
- **Desktop (`≥ lg`):** la referencia desktop.

| Hex del bundle | Token |
|---|---|
| `#1C2140` (texto, pestaña activa, CTA, avatar) | `brand-secondary-dark` |
| `#F4F5F8` (fondo del destacado, cita, "Sigue leyendo", fondo de imagen) | `bg-surface-raised` |
| `#EEF2FA` / `#18459A` (chip de categoría) | `bg-brand-tertiary-lightest` / `text-brand-tertiary-dark` |
| `#E5E7EB` / `#3F3F3F` (chip del destacado) | `bg-greyscale-light` / `text-content-muted` |
| `#717274` (miga, meta, extracto de tarjeta) | `text-content-subtle`; sobre `surface-raised` pasa a `text-content-muted` (CLAUDE.md: 4.4975:1) |
| `#3F3F3F` (bajada, cuerpo) | `text-content-muted` |
| `#E5E7EB` (bordes, pestaña inactiva) | `border-line` |
| `#F2F3F5` (hover de los botones de compartir) | `bg-greyscale-lightest` |
| `#E83C3E` → `#B8242A` ("Hablar con un asesor") | `btn-primary` |

### 1. Listado — cabecera y pestañas

- **Contenedor:** `container-xl`, padding `48px 0 96px` y gap de 40 px. En mobile: `28px 16px 16px`.
- **Desktop:** una fila `justify-between items-end`.
  - **A la izquierda:**
    - la miga "Inicio / Noticias" (14 px `text-content-subtle`; el último ítem en `brand-secondary-dark`);
    - el H1 de 48 px, peso 500 (`heading-h1`);
    - la bajada en 17 px `text-content-muted`.
  - **A la derecha:** las pestañas.
- **Mobile:** miga en 13 px, H1 de 32 px y sin bajada.
- **Pestañas:** pills de 44 px de alto (la referencia mobile usa 42 px; se sube a 44 por el target táctil), con `px-5`, 14 px y peso 500.
  - **Activa:** `bg-brand-secondary-dark text-white`.
  - **Inactiva:** `bg-surface border-line text-brand-secondary-dark`.
  - **Mobile:** scroll horizontal sin scrollbar.
  - Son `<button>` dentro de `role="group"` con `aria-label="Filtrar por categoría"`, y la activa lleva `aria-pressed="true"`.
  - Transición de color de 250 ms.

### 2. Listado — destacado (solo `≥ md`)

- **Tarjeta:**
  - grilla `1.3fr 1fr` desde `lg`; en tablet, en columna;
  - radio de 28 px (`rounded-[28px]`) y `bg-surface-raised`.
  - Hover: sombra (`can-hover:`) en 300 ms.
- **Imagen:**
  - `aspect-[16/10]` con `object-cover`.
  - Hover: `scale(1.04)` en 300 ms.
- **Texto:** padding de 48 px, en columna centrada y gap de 16 px.
  - **Meta:** el chip gris, la fecha y la lectura, en 13 px `text-content-muted`.
  - **Título:** 32 px, peso 500 y `text-pretty`.
  - **Extracto:** 16 px `text-content-muted`.
  - **"Leer artículo":** 15 px, peso 500, subrayado con offset de 4 px.
- **Mobile:** no hay destacado. El post destacado entra a la grilla como primera tarjeta.

### 3. Listado — grilla

- **Columnas:** 3 en desktop (gap de 28 px y 48 px entre filas), 2 en tablet y 1 en mobile (gap de 32 px).
- **Tarjeta:** un enlace en columna con gap de 16 px (12 px en mobile).
  - **Imagen:**
    - `aspect-[16/10]` con radio de 22 px (18 px en mobile) y `bg-surface-raised`.
    - Hover: `scale(1.05)` en 300 ms.
  - **Meta:** el chip azul, la fecha y la lectura, en 13 px (12 px en mobile) `text-content-subtle`.
  - **Título:** 20 px (19 px en mobile) y peso 500.
  - **Extracto:** 15 px (14 px en mobile) `text-content-subtle`.
- **Estado vacío:** `news.emptyText` centrado, en `body-md` y `text-content-muted`. No está en la referencia.

### 4. Artículo — cabecera

- **Columna de 820 px:** padding `48px 32px 40px` y gap de 22 px. En mobile: `24px 16px 20px` y gap de 14 px.
- **Miga:**
  - **Desktop:** "Inicio / Noticias / {categoría}".
  - **Mobile:** "Noticias / {categoría}" en 13 px.
  - "Noticias" enlaza a `/noticias`. La categoría no es enlace en la referencia; aquí enlaza a `/noticias?categoria=<slug>`.
- **Chip** de categoría azul en 13 px (12 px en mobile).
- **H1:** 46 px en desktop y 28 px en mobile, peso 500 y `text-balance`.
- **Franja del autor:** `border-y border-line`, con padding de 18 px (12 px en mobile).
  - Avatar "MD" de 44 px (40 px en mobile), `bg-brand-secondary-dark` y blanco.
  - El autor en 14 px peso 500.
  - "{fecha} · {N} min de lectura" en 13 px `text-content-subtle`. En mobile va sin "de lectura" y en 12 px.
  - **Compartir en desktop:** tres círculos de 44 px (la referencia usa 42 px) con `border-line`:
    - LinkedIn (`FaLinkedinIn`) y WhatsApp (`FaWhatsapp`) son enlaces `target="_blank" rel="noopener"`;
    - copiar enlace (`PiLinkLight`) es un `<button>`.
    - Cada uno lleva su `aria-label`.
  - **Compartir en mobile:** un botón de 44 px con `PiShareNetworkLight` de 24 px.

### 5. Artículo — portada, cuerpo y CTA

- **Portada:**
  - **Desktop:** columna de 1120 px, `aspect-[16/8]` y radio de 28 px.
  - **Mobile:** `aspect-[16/10]`, radio de 20 px y padding lateral de 16 px.
  - Sin portada, el bloque no se renderiza.
- **Columna del cuerpo:** 720 px, padding `48px 32px 80px` y gap de 22 px. En mobile: `28px 16px 40px` y gap de 18 px.
  - **Lead (`excerpt`):** 21 px en desktop y 18 px en mobile, `leading-[1.6]`, `text-brand-secondary-dark`.
  - **Párrafos:** 18 px en desktop y 16 px en mobile, `leading-[1.75]` y `text-content-muted`.
  - **H2:** 28 px en desktop y 22 px en mobile, peso 500, `text-brand-secondary-dark` y margen superior de 16 px (10 px en mobile).
  - **H3:** 22 px y 19 px, con el mismo estilo. No está en la referencia.
  - **Cita (`>`):** `bg-surface-raised`.
    - Radio de 20 px (16 px en mobile) y padding `28px 32px` (`20px 16px` en mobile).
    - 20 px en desktop y 18 px en mobile, en `text-brand-secondary-dark` y entre comillas “ ”.
  - **Enlaces:** `text-accent`, subrayados. **Listas:** con viñetas.
- **CTA:** caja `bg-brand-secondary-dark` con radio de 24 px (20 px en mobile).
  - **Desktop:** padding `28px 32px`, en fila. **Mobile:** padding de 22 px, en columna.
  - Texto "¿Te ayudamos a elegir el equipo ideal?" en 19 px (18 px en mobile).
  - Botón "Hablar con un asesor" (`btn-primary`, 50 px), que abre `QuoteModal` en su versión genérica.

### 6. Artículo — "Sigue leyendo" (solo `≥ md`)

- Sección `bg-surface-raised`, `container-xl`, padding `80px 0` y gap de 32 px.
- H2 "Sigue leyendo" en 32 px (`heading-h2`).
- **Grilla:** 3 columnas en desktop y 2 en tablet, con gap de 28 px.
  - La tarjeta es como la del listado, sin extracto ni lectura.
  - El título va en 19 px y la meta en `text-content-muted`, porque el fondo es `surface-raised`.

### 7. Motion

- Todas las transiciones van en 300 ms o menos. La referencia usa 450 ms en la sombra y 800 ms en el zoom; se recortan por el estándar §4.
- Con `prefers-reduced-motion` no hay zoom ni transición de sombra.
- Sin `data-reveal` de entrada.

## Alcance

**Entra:**

- **Rutas:** `/noticias` y `/noticias/<slug>`. Se borra `src/pages/blog/`, sin 301, porque `/blog` nunca estuvo en producción.
- **Schema de `post`:**
  - campo nuevo `category`, único y obligatorio, con las opciones Productos, Actividades, Capacitaciones y Noticias;
  - campo nuevo `author`, opcional, que si está vacío muestra "Equipo Medical Digital";
  - objeto nuevo `seo` (`title`, `description`), opcional;
  - se eliminan `tags`, `readTime`, `title_en`, `excerpt_en` y `body_en`;
  - se conservan `title`, `excerpt`, `coverImage`, `date`, `featured` y `body`.
- **Tiempo de lectura** calculado en build a partir del cuerpo: 200 palabras por minuto, redondeado hacia arriba, con un mínimo de 1 min.
- **Colección singleton `news`** (`src/content/news/index.json`): título, bajada, texto del estado vacío y el SEO del listado.
- **Listado:**
  - cabecera, pestañas, destacado, grilla y estado vacío, según la referencia desktop y mobile;
  - el filtro va en `?categoria=` con `history.replaceState`, en una isla `NewsListReact`;
  - el HTML estático es la vista "Todos".
- **Artículo:**
  - cabecera, franja del autor, portada, lead, cuerpo, cita, CTA "Hablar con un asesor" con `QuoteModal` y "Sigue leyendo" (los 3 posts más recientes, sin contar el actual);
  - el cuerpo se renderiza con componentes de `TinaMarkdown`, sin `prose`.
- **Compartir:**
  - en desktop, LinkedIn y WhatsApp como enlaces, y "copiar enlace" con el aviso "Enlace copiado";
  - en mobile, `navigator.share`, con el portapapeles como respaldo;
  - todo en una isla chica, `ShareButtonsReact`.
- **SEO del artículo:**
  - title desde `seo.title`, o "{title} | Medical Digital" si está vacío; description desde `seo.description`, o el `excerpt`; canonical;
  - `og:type="article"`, `article:published_time` y `article:section`;
  - `og:image` y `twitter:image` con la portada tal cual (URL absoluta), como la SPEC 06, o la imagen OG global si no hay portada;
  - JSON-LD `BlogPosting` (el autor es `Person` si `author` tiene valor, y `Organization` si no) y `BreadcrumbList`.
- **SEO del listado:** title y description desde `news.seo`, y JSON-LD `BreadcrumbList`.
- **Contenido:**
  - los 6 posts de la referencia (`datos-diseno.js`), con su categoría, fecha, extracto, `seo` dentro del rango del estándar y un cuerpo con H2 y cita;
  - sus imágenes, extraídas del bundle de la referencia y convertidas a WebP (máximo 1440 px y menos de 300 KB) en `public/uploads/noticias/`;
  - se borra `primer-post.mdx`.
- **Enlaces que cambian:**
  - en `global`: "Noticias" del nav, la tarjeta del ☰ y el footer pasan a `/noticias`;
  - en la Home, la sección de noticias enlaza a `/noticias` y `/noticias/<slug>`, muestra `category` en vez de `tags[0]` y la lectura calculada.
- **`CLAUDE.md`:** documenta las rutas, la colección `news`, el schema de `post` y `?categoria=`.

**Fuera de alcance (para specs futuras):**

- El boletín, en maqueta o con envío: no se implementa (ver Decisiones). Si se retoma, va en una spec propia con proveedor, consentimiento (Ley 29733) y envío.
- Redirecciones del "hello-world" y de `/category/uncategorized/` de WordPress: SPEC 13 (go-live).
- Paginación del listado, porque se asumen menos de ~30 posts.
- RSS.
- Etiquetas, páginas estáticas por categoría y búsqueda de noticias en el buscador global, que hoy solo indexa productos.
- Barra de progreso de lectura, Anterior / Siguiente y comentarios.
- Componentes MDX a medida (galerías, producto dentro del post).
- Posts reales del cliente: los de la referencia se reemplazan antes del go-live.

## Modelo de datos

### `tina/collections/post.ts`

```ts
export const NEWS_CATEGORIES = ["Productos", "Actividades", "Capacitaciones", "Noticias"] as const;

export const postCollection: Collection = {
  name: "post",
  label: "Noticias",
  path: "src/content/blog",
  format: "mdx",
  fields: [
    { name: "title", label: "Título", type: "string", required: true, isTitle: true },
    { name: "excerpt", label: "Extracto", type: "string", required: true, ui: { component: "textarea" },
      description: "Se usa como lead del artículo y en las tarjetas." },
    { name: "category", label: "Categoría", type: "string", required: true, options: [...NEWS_CATEGORIES] },
    { name: "author", label: "Autor", type: "string",
      description: "Vacío muestra «Equipo Medical Digital»." },
    { name: "coverImage", label: "Imagen de portada", type: "image",
      description: "Horizontal, mínimo 1200×630. También es la imagen al compartir en redes." },
    { name: "date", label: "Fecha", type: "datetime", required: true },
    { name: "featured", label: "Destacado", type: "boolean",
      description: "El más reciente marcado aparece arriba del listado en «Todos»." },
    {
      name: "seo",
      label: "SEO",
      type: "object",
      fields: [
        { name: "title", label: "Título (50–60 caracteres)", type: "string",
          description: "Vacío usa «{título} | Medical Digital»." },
        { name: "description", label: "Descripción (140–160 caracteres)", type: "string",
          ui: { component: "textarea" }, description: "Vacía usa el extracto." },
      ],
    },
    { name: "body", label: "Contenido", type: "rich-text", isBody: true },
  ],
};
```

- La carpeta sigue siendo `src/content/blog/`. Así no se mueven los archivos ni cambia el `path` del índice de TinaCloud, y la URL es independiente de la carpeta.
- `BLOG_TAG_OPTIONS` desaparece.

### Frontmatter de un post

```yaml
---
title: Guía para elegir el electrocardiógrafo ideal para tu clínica
excerpt: 'Canales, conectividad e interpretación automática: lo que debes evaluar antes de invertir.'
category: Productos
coverImage: /uploads/noticias/elegir-electrocardiografo.webp
date: '2026-09-18T12:00:00.000Z'
featured: true
seo:
  title: Cómo elegir un electrocardiógrafo para tu clínica | Medical Digital
  description: …
---
```

### `tina/collections/news.ts` → `src/content/news/index.json`

Es una colección singleton (`allowedActions: { create: false, delete: false }`), con `seo` en línea, como `about`.

```json
{
  "title": "Noticias",
  "intro": "Productos, actividades, capacitaciones y novedades del sector salud.",
  "emptyText": "Pronto publicaremos noticias en esta categoría.",
  "seo": {
    "title": "Noticias de tecnología médica | Medical Digital Perú",
    "description": "Novedades de productos, capacitaciones y actividades de Medical Digital: guías para elegir equipos médicos y noticias del sector salud en el Perú."
  }
}
```

### `src/utils/news.ts` (solo build)

```ts
export const NEWS_AUTHOR = "Equipo Medical Digital";

export function categorySlug(label: string): string;            // "Capacitaciones" → "capacitaciones"
export function readingMinutes(body: TinaMarkdownContent): number; // palabras / 200, ceil, mín. 1
export function formatNewsDate(iso: string): string;             // "18 sep 2026"
export function sortByDate<T extends { date?: string }>(posts: T[]): T[]; // descendente
export function pickFeatured<T extends { featured?: boolean }>(sorted: T[]): T | undefined;
```

- `readingMinutes` recorre los nodos de texto del AST de `body`.
- `formatNewsDate` normaliza el "sept." de `Intl` a "sep", como la referencia. Lo usan el listado, el artículo y la Home.

### Props de la isla del listado

```ts
interface NewsCard {
  href: string;
  title: string;
  excerpt: string;
  image: string;        // URL ya optimizada; "" sin portada
  category: string;
  categorySlug: string;
  date: string;         // formateada
  readTime: string;     // "6 min"
  featured: boolean;
}

interface Props {
  posts: NewsCard[];    // ya ordenados por fecha descendente
  emptyText: string;
}
```

### Reglas de selección

- **Orden:** `date` descendente.
- **Destacado:**
  - en "Todos", el más reciente con `featured: true`, o el más reciente si no hay ninguno;
  - en una categoría, el primero de esa categoría.
  - El destacado no se repite en la grilla.
- **Mobile:** no hay destacado; la grilla muestra todos, en orden.
- **Valor de `?categoria=`:** uno desconocido equivale a "Todos" y se quita de la URL.
- **"Sigue leyendo":** los 3 más recientes, sin contar el actual.

### JSON-LD del artículo

```json
[
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "{title}",
    "description": "{seo.description || excerpt}",
    "image": "{URL absoluta de la portada}",
    "datePublished": "{date}",
    "author": { "@type": "Person", "name": "{author}" },
    "publisher": { "@type": "Organization", "name": "Medical Digital", "logo": "{logo absoluto}" },
    "mainEntityOfPage": "{canonical}",
    "articleSection": "{category}"
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "{site}/" },
      { "@type": "ListItem", "position": 2, "name": "Noticias", "item": "{site}/noticias/" },
      { "@type": "ListItem", "position": 3, "name": "{title}" }
    ]
  }
]
```

Sin `author`, el autor es `{ "@type": "Organization", "name": "Medical Digital", "url": "{site}" }`.

## Plan de implementación

La rama `feat/spec-07-noticias` sale de `staging` actualizado, **después del merge de la SPEC 06** (trae la prop `ogImage` de `BaseLayout`).

1. **Schema de `post` y migración.**
   - Reescribir `tina/collections/post.ts` según el modelo: agregar `category`, `author` y `seo`, y quitar `tags`, `readTime` y los `_en`.
   - Ajustar `News.astro` de la Home para que lea `category` en vez de `tags[0]` y quite `readTime`, porque la lectura todavía no se calcula.
   - Agregar `category` a `primer-post.mdx` para que el build no se rompa hasta el paso 8.
   - Verificación: `npm run build` pasa y `/admin` exige elegir categoría en un post nuevo.
2. **Colección `news`.**
   - Crear `tina/collections/news.ts`, registrarla en `tina/config.ts` y crear `src/content/news/index.json`.
   - Verificación: se edita en `/admin`.
3. **Helpers.**
   - Crear `src/utils/news.ts` con `NEWS_AUTHOR`, `categorySlug`, `readingMinutes`, `formatNewsDate`, `sortByDate` y `pickFeatured`.
   - Usarlos en `News.astro`: lectura calculada y fecha "18 sep 2026".
   - Verificación: la Home muestra la categoría, la fecha y la lectura del post de prueba.
4. **SEO en `BaseLayout`.**
   - Agregar props opcionales:
     - `ogType` (`website` por defecto);
     - `article` (`publishedTime`, `section`);
     - `jsonLd` (objetos extra que se suman a `Organization`).
   - Agregar `twitter:image`.
   - Verificación: las páginas existentes no cambian su `<head>` salvo `twitter:image`.
5. **Artículo sin islas.**
   - Crear `src/pages/noticias/[slug].astro`: miga, chip, H1, franja del autor, portada, lead, cuerpo, CTA y "Sigue leyendo".
   - `og:image` es la portada tal cual, en URL absoluta (mismo criterio que la SPEC 06).
   - Además: JSON-LD `BlogPosting` y `BreadcrumbList`, y `og:type="article"`.
   - Reescribir `src/components/blog/PostBody.tsx` con componentes de `TinaMarkdown` (`p`, `h2`, `h3`, `blockquote`, `a`, `ul`, `ol`, `li`), sin `prose`.
   - El CTA usa un botón genérico que abre `QuoteModal` sin producto, por el mecanismo que ya escucha `HeaderReact`.
   - Verificación: `/noticias/primer-post` se ve según la referencia en 360, 768 y 1440 px.
6. **Compartir.**
   - Crear `src/components/noticias/ShareButtonsReact.tsx` con `client:visible`:
     - en desktop, LinkedIn y WhatsApp como `<a>`, y el botón "copiar" con el aviso "Enlace copiado" durante 2 s;
     - en mobile, `navigator.share`, con el portapapeles como respaldo.
   - Verificación: copiar funciona en desktop, y en el iPhone del preview abre la hoja nativa.
7. **Listado.**
   - Crear `src/pages/noticias/index.astro`: cabecera y SEO desde `news.seo` con `BreadcrumbList`.
   - Crear `src/components/noticias/NewsListReact.tsx` con `client:load`: pestañas, destacado, grilla y estado vacío.
     - Lee y escribe `?categoria=` con `history.replaceState`.
   - `viewTransitions={false}`, como el catálogo.
   - Verificación: las pestañas filtran sin recargar, y `?categoria=` funciona al abrir el enlace directamente.
8. **Contenido.**
   - Extraer del bundle las 6 imágenes de la referencia, convertirlas a WebP (máximo 1440 px y menos de 300 KB) y guardarlas en `public/uploads/noticias/` con nombres descriptivos.
   - Crear los 6 MDX con los textos de `datos-diseno.js`, un `seo` dentro del rango del estándar, un cuerpo con dos H2 y una cita, y `featured: true` en el más reciente.
   - Borrar `primer-post.mdx`.
   - Verificación: el listado muestra el destacado más 5 tarjetas, y cada pestaña muestra lo suyo.
9. **Rutas viejas y enlaces.**
   - Borrar `src/pages/blog/`.
   - Cambiar a `/noticias` los 3 enlaces de `src/content/global/index.json` y los de `NewsReact.tsx` y `News.astro`.
   - Verificación: `grep -rn "/blog" src` no devuelve nada, y el build no genera `dist/blog/`.
10. **Documentación y cierre.**
    - Actualizar `CLAUDE.md`: colección `news`, campos de `post`, rutas `/noticias` y `?categoria=`.
    - Correr `npm run build` y, si existe, `npm run check:standard`.
    - Validar el JSON-LD de un post en el Rich Results Test sobre el preview de Amplify.

## Criterios de aceptación

**Build y rutas**
- [ ] `npm run build` termina sin errores y genera `/noticias/index.html` y las 6 páginas `/noticias/<slug>/`.
- [ ] No existe `dist/blog/`, y `grep -rn "/blog" src` no devuelve nada.
- [ ] "Noticias" del nav, la tarjeta del ☰, el footer y "Ver todas las noticias" de la Home llevan a `/noticias` sin 404.

**Listado**
- [ ] En "Todos", el destacado es "Guía para elegir el electrocardiógrafo…" (`featured: true`) y la grilla muestra las otras 5 sin repetirlo.
- [ ] Con `featured: false` en todos, el destacado es el post más reciente.
- [ ] "Capacitaciones" muestra 1 destacado y 1 tarjeta, cambia la URL a `?categoria=capacitaciones` y no recarga la página.
- [ ] Abrir `/noticias?categoria=actividades` directamente deja "Actividades" activa.
- [ ] `/noticias?categoria=inexistente` se ve igual que "Todos" y quita el parámetro de la URL.
- [ ] Una categoría sin posts muestra `news.emptyText`.
- [ ] A 360 px no hay destacado y las 6 tarjetas van en 1 columna. A 768 px la grilla tiene 2 columnas y a 1024 px, 3.
- [ ] El listado no tiene el bloque del boletín ni ningún campo de correo.
- [ ] La pestaña activa lleva `aria-pressed="true"`, y las pestañas se usan con teclado y con el foco visible.

**Artículo**
- [ ] La miga es "Inicio / Noticias / {categoría}" en desktop y "Noticias / {categoría}" en mobile.
- [ ] Un post sin `author` muestra "Equipo Medical Digital". Uno con `author: "Dra. Ana Pérez"` lo muestra a ella.
- [ ] La lectura coincide con `ceil(palabras / 200)`, con un mínimo de 1 min. Se muestra "de lectura" en desktop y se omite en mobile.
- [ ] Un post sin `coverImage` no deja ningún hueco donde iría la portada.
- [ ] Una cita `>` se ve como la caja `surface-raised` de la referencia, con comillas.
- [ ] Ningún MDX repite el extracto como primer párrafo del cuerpo.
- [ ] "Hablar con un asesor" abre `QuoteModal` en su versión genérica.
- [ ] "Sigue leyendo" muestra 3 posts que no incluyen el actual, y no aparece por debajo de `md`.
- [ ] **Compartir en desktop:**
  - LinkedIn abre `linkedin.com/sharing/share-offsite/?url=<canonical>` en otra pestaña;
  - WhatsApp abre `wa.me/?text=<título> <canonical>`;
  - "copiar" copia la canonical y anuncia "Enlace copiado" (`aria-live`).
- [ ] **Compartir en mobile:** en el iPhone del preview abre la hoja nativa.

**SEO**
- [ ] El title de `/noticias` y el de cada post de ejemplo miden entre 50 y 60 caracteres, y sus descriptions entre 140 y 160.
- [ ] Un post sin `seo` usa "{title} | Medical Digital" y el `excerpt`.
- [ ] Cada post tiene `og:type="article"`, `article:published_time`, canonical y `og:image` / `twitter:image` con la URL absoluta de la portada.
- [ ] Las 6 portadas de ejemplo miden 1200×630 o más, en proporción 1.91:1.
- [ ] Un post sin portada usa la OG global.
- [ ] El JSON-LD de un post pasa el Rich Results Test sin errores como `Article` y como `Breadcrumb`.
- [ ] `/noticias` y los 6 posts aparecen en el sitemap.

**Contenido y calidad**
- [ ] Las 6 imágenes de `public/uploads/noticias/` son WebP de hasta 1440 px y menos de 300 KB.
- [ ] No hay scroll horizontal a 320, 360, 768, 1024 ni 1440 px.
- [ ] `grep -rnE "#[0-9A-Fa-f]{6}|text-white/|bg-white/|prose" src/pages/noticias src/components/noticias src/components/blog` no devuelve nada.
- [ ] Con `prefers-reduced-motion` no hay zoom de imágenes ni transición de sombra.
- [ ] `CLAUDE.md` documenta la colección `news`, el schema de `post`, las rutas y `?categoria=`.

## Decisiones

- **Sí: `/noticias` sin 301 desde `/blog`.** `/blog` nunca existió en producción y no hay posicionamiento que conservar.
- **No: 301 como Eres.** Allá el footer ya enlazaba la ruta nueva; aquí no aplica.
- **Sí: la referencia desktop y mobile manda,** incluidas sus diferencias: en mobile no hay destacado, ni bajada, ni "Sigue leyendo", y compartir es un solo ícono.
- **Sí: `category` única, obligatoria y fija en el schema.** Las pestañas dependen de ella; cambiarla es un cambio de diseño, no de contenido.
- **No: `tags`.** Ninguna referencia los muestra, y un campo que nadie ve solo confunde al editor.
- **Sí: filtro en el navegador con `?categoria=` y `history.replaceState`.** Es el patrón de Eres, y cambiar de pestaña no llena el historial.
- **No: páginas estáticas por categoría.** Multiplican rutas para un contenido chico.
- **Sí: destacado = el más reciente con `featured` en "Todos", y el primero de la categoría en las demás pestañas.** Es fiel a la referencia y el editor puede fijar la portada del listado.
- **Sí: `author` opcional, con "Equipo Medical Digital" por defecto.** La referencia siempre muestra un autor, y el campo permite firmar artículos.
- **Sí: lectura calculada en build.** Nunca se desactualiza al editar el cuerpo. Es lo que hacen Medium y Ghost.
- **No: `readTime` a mano, como Eres.** Se desactualiza.
- **Sí: eliminar los campos `_en`.** Medical es solo en español.
- **No: conservarlos sin uso, como Eres.** Son ruido en el panel.
- **Sí: colección singleton `news`.** Mismo patrón que `journal` de Eres, y `global` no crece.
- **Sí: `seo` opcional por post, con `title` + " | Medical Digital" y el `excerpt` como respaldo.** Cumple el §6.1 sin alargar los extractos de las tarjetas.
- **No: el boletín de la referencia.** El usuario decidió que no se implementará. Un formulario visible que no envía rompe el estándar §8 (validación en servidor, honeypot, consentimiento Ley 29733 y estados de envío), así que se quita la maqueta, el grupo `newsletter` de `news` y su contenido.
- **Sí: compartir fiel a la referencia.** En desktop, LinkedIn y WhatsApp son enlaces sin JS. Solo "copiar" y la hoja nativa de mobile necesitan una isla chica.
- **Sí: `og:image` = la portada tal cual, como la SPEC 06.** El 1200×630 del estándar se cumple por contenido: el campo lo pide y las portadas de ejemplo se exportan en esa proporción.
- **No: recortar la OG en build.** `getImage()` no procesa imágenes de `public/` (verificado: devuelve la misma ruta), y hacerlo con `sharp` agrega una dependencia que se aparta de lo aprobado en la 06. Queda como propuesta para la revisión.
- **No: campo `ogImage` aparte.** Duplica la portada.
- **Sí: JSON-LD `BlogPosting` + `BreadcrumbList`.** Lo piden el brief y el §6.2, y se valida en el Rich Results Test.
- **Sí: lead = `excerpt` y la cita es el `>` del MDX,** como Eres. Una sola fuente para el extracto y el lead, y la cita no necesita un campo aparte.
- **Sí: componentes de `TinaMarkdown` en vez de `prose`.** Así los tamaños salen exactos de la referencia.
- **Sí: los 6 posts de la referencia, con sus imágenes extraídas del bundle.** Sin ellos no se validan el destacado, las pestañas ni "Sigue leyendo". Se reemplazan antes del go-live.
- **Sí: la carpeta sigue siendo `src/content/blog/`.** La URL no depende de la carpeta, y moverla cambia el índice de TinaCloud sin ganar nada.
- **Sí: escala del UI Kit en vez de los px de la referencia.** El estándar §2.4 prohíbe tamaños sueltos. Equivalencias: 48/46 px → `heading-h1`; 32/28 px → `heading-h2`; 28/24 px en el cuerpo → `heading-h3`; 22/20 px → `heading-h4`; 21/19/18 px → `body-lg`; 17/16 px → `body-md` o `body-lg`; 15/14 px → `body-sm`; 13/12 px → `caption`; radios de 18–22 px → `rounded-xl`, y de 24–28 px → `rounded-2xl`; botones en `btn-lg` (48 px). Mismo criterio que la SPEC 06.
- **No: `useTina` en las páginas de noticias.** Los textos de `news` y de los posts se editan en `/admin` y se ven al reconstruir, como el Skin Journal de Eres. La edición visual en vivo no compensa una isla más por sección.
- **Sí: el artículo recibe el post y los relacionados por `getStaticPaths`.** Una sola consulta de posts por build (estándar §2.3); la página solo consulta `global` para el WhatsApp, igual que `CatalogPage`.
- **Sí: transiciones de 300 ms como máximo.** La referencia usa 450 y 800 ms; el estándar §4 manda.
- **No: RSS, paginación, etiquetas ni Anterior / Siguiente.** No están en la referencia ni en el estándar, y se pueden agregar después sin tocar esta spec.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| TinaCloud indexa por rama y el schema de `post` cambia | Después del merge, compilar y desplegar `staging` y `main` con su `TINA_BRANCH`, como indica `CLAUDE.md`. |
| La SPEC 06 no está mergeada y esta spec usa su prop `ogImage` | La rama sale de `staging` después del merge de la 06. Si se adelanta, el paso 4 agrega la prop y se resuelve el conflicto al rebasear. |
| El HTML estático es "Todos" y `?categoria=` se aplica al hidratar | La isla va con `client:load` y lee la query en su primer render. El salto es breve y no mueve el layout, porque destacado y grilla tienen alturas parecidas. |
| Una imagen del bundle es chica o de baja calidad para 1200×630 | Se verifica al extraerla. Si no alcanza, se usa el recorte disponible y se anota para que diseño la reemplace. |
| El editor sube una portada con otra proporción y la OG sale recortada por cada red | La descripción del campo pide 1200×630. Si se vuelve un problema, se propone el recorte en build con `sharp`. |
| Alguna red no lee WebP en `og:image` | Las portadas son WebP por la regla de imágenes del proyecto. Se valida con los depuradores de Facebook y LinkedIn sobre el preview. |
| El cuerpo del MDX cambia de estructura y `readingMinutes` cuenta de menos | Recorre todos los nodos de texto del AST; se verifica con un post de longitud conocida. |
| `navigator.share` o el portapapeles no existen (HTTP, navegadores viejos) | Si no hay `navigator.share`, se copia al portapapeles. Si tampoco hay portapapeles, el botón se oculta. |

## Notas de implementación / QA realizada

**QA local (build de Tina en modo local + Playwright Chromium, 2026-10-08):**

- `npm run build:local`, `npm run typecheck` (0 errores) y `npm run check:standard` (0 errores; avisos de `og:image` en páginas sin imagen global y JS de la home en 151 KB) pasan.
- Listado: "Todos" muestra el destacado más 5 tarjetas; "Capacitaciones" muestra 1 destacado y 1 tarjeta y escribe `?categoria=capacitaciones`; `?categoria=actividades` abre con la pestaña activa; `?categoria=inexistente` se ve como "Todos" y se limpia de la URL.
- La grilla tiene 1 columna a 360 px, 2 a 768 px y 3 a 1024 px, sin scroll horizontal a 360, 768, 1024 ni 1440 px.
- Artículo: la cita sale en 18/20 px navy con comillas; "Sigue leyendo" se muestra solo desde `md` y el ícono único de compartir solo en mobile. En desktop, LinkedIn, WhatsApp y "copiar" generan las URL esperadas y anuncian "Enlace copiado".
- Los 6 posts tienen title de 54–59 caracteres y description de 145–155.

**Desvíos y pendientes:**

- Solo 2 de las 6 portadas del bundle llegan a 1200×630 (congreso y mantenimiento). Las otras 4 se recortaron a 1.91:1 al tamaño disponible, sin agrandarlas (554×291, 587×308, 589×309 y 1140×599). Diseño debe reemplazarlas.
- El tiempo de lectura calculado da 1 min en los 6 posts de ejemplo porque sus cuerpos son cortos; la referencia muestra 3–7 min como texto fijo.
- `grep -rn "/blog" src` devuelve la importación de `src/components/blog/PostBody.tsx`, que la spec mantiene en esa carpeta. No queda ningún enlace a `/blog`.
- `og:url` se agregó a `BaseLayout` junto con las demás meta de Open Graph, y `og:image` ahora se emite siempre como URL absoluta.
- Tras el `/pre-pr`: tamaños y radios pasados a la escala del UI Kit, el artículo usa una sola consulta de posts y las tarjetas del listado son `h2` (no se salta de `h1` a `h3` en mobile).
- Se quitó el boletín después de abrir el PR: el usuario decidió que no se implementará (ver Decisiones). El listado termina en la grilla.
- Falta validar en el preview de Amplify: Rich Results Test, depuradores de Facebook y LinkedIn y la hoja nativa de compartir en iPhone.
