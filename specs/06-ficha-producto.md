# SPEC 06 — Ficha de producto

> **Status:** Aprobado
> **Depends on:** SPEC 01, SPEC 03, SPEC 05
> **Date:** 2026-10-06
> **Objective:** Rehacer `/productos/<slug>` según la referencia (desktop y mobile), con galería, cotización, WhatsApp, ficha técnica, especificaciones, accesorios, video y productos relacionados.

## Por qué existe esta spec

Hoy `/productos/<slug>` es la plantilla de SPEC 01: una foto con miniaturas estáticas, el nombre, el SKU, la descripción corta, un botón de WhatsApp y la descripción larga. No permite cotizar con el `QuoteModal`, no tiene ficha técnica ni especificaciones y no lleva a otros productos.

La referencia (`Medical Digital Desktop.html` y `Medical Digital Mobile.html`, pantalla "Detalle") define:

- miga de pan con la especialidad;
- galería con miniaturas (en columna en desktop, en fila en mobile);
- etiqueta "Uso Profesional Médico", especialidad, logo de la marca, H1 y descripción corta;
- "Solicitar cotización" y "Hablar con un asesor" por WhatsApp;
- sellos "Entrega e instalación", "Capacitación incluida" y "Ficha técnica";
- acordeón, "Video demo" y "Productos relacionados";
- en mobile, una barra fija abajo con cotización y WhatsApp.

Estado de los datos al redactar (verificado contra la Store API, las páginas públicas y el admin el 2026-10-03):

| Dato | Origen | Estado |
|---|---|---|
| Nombre, SKU, descripciones, galería, especialidad | Store API | 45 de 45; 41 con 2 a 5 fotos |
| Logo de la marca | Store API (`/products/brands`) | 11 de 11 marcas; hoy no se lee |
| Ficha técnica PDF | JetEngine `link` | 28 de 45 |
| Especificaciones técnicas | JetEngine `especificaciones_tecnicas` (HTML con tablas) | 44 de 45 |
| Accesorios | JetEngine `accesorios` | Desconocido; vacío en el producto revisado |
| Video | JetEngine `video_link` / `video` | 2 de 45 (YouTube) |
| Características, garantía | — | No existen |

Los campos de JetEngine tienen apagado "Show in Rest API" (`/wp/v2/product` devuelve `meta: []`). Por decisión del revisor, el catálogo pasa a la REST API v3 con una clave de solo lectura, como Eres: su `meta_data` trae los campos de JetEngine sin tocar WordPress (ver Decisiones).

## Referencia de diseño (valores extraídos del bundle)

Todos los valores se escriben con tokens, nunca en hex. El layout de dos columnas arranca en `lg`; por debajo, layout mobile con barra fija.

| Hex del bundle | Token |
|---|---|
| `#F4F5F8` (fondo de foto, relacionados) | `bg-surface-raised` |
| `#1C2140` (texto, miga activa, bloque de video) | `brand-secondary-dark` |
| `#E83C3E` ("Solicitar cotización") | `btn-primary` |
| `#E83C3E` (ícono PDF) | `text-accent` |
| `#F2F3F5` / `#3F3F3F` (etiqueta "Uso Profesional Médico") | `bg-greyscale-lightest` / `text-content-muted` |
| `#EEF2FA` / `#18459A` (etiqueta de especialidad) | `bg-brand-tertiary-lightest` / `text-brand-tertiary-dark` |
| `#37B24D` / `#267C35` (WhatsApp) | `border-semantics-success` / `text-semantics-success-dark` |
| `#E5E7EB` | `border-line` |

### 1. Miga

- Desktop: Inicio / Productos / Especialidad / Nombre, 14 px `text-content-muted`; el último ítem en `brand-secondary-dark`.
- Mobile: Productos / Especialidad, 12 px.
- Sin hover en los enlaces, como la referencia; el foco visible global se mantiene.

### 2. Layout desktop (≥ `lg`)

- `container-xl`, padding `32px 0 48px`.
- Grilla `minmax(0,1.1fr) minmax(0,1fr)`, gap de 64 px, `items-start`.

### 3. Galería

- **Desktop:** grilla `96px minmax(0,1fr)` con gap de 16 px, sticky bajo el header (`top-28`).
  - Miniaturas en columna de 96 × 96 px, `rounded-xl`, borde de 1,5 px (`line`; la activa en `brand-secondary-dark`).
  - Foto principal `aspect-square`, `rounded-3xl`, `bg-surface-raised`; imagen al 78 %, `object-contain`, `mix-blend-multiply`.
  - Botón de zoom abajo a la derecha (14 px; 18 px en desktop): 44 px, `rounded-full`, `bg-surface`, `shadow-sm`, `PiMagnifyingGlassPlusLight` de 22 px y `scale(1.08)` en hover con mouse.
- **Zoom (como Eres):** `<dialog>` a pantalla completa en `bg-surface-raised`, con la foto a 1600 px en `object-contain`.
  - Cerrar de 48 px arriba a la derecha; abajo, anterior, "N / M" y siguiente (44 px) si hay más de una foto.
  - `Esc` cierra y devuelve el foco al botón; las flechas del teclado navegan; el foco queda dentro del `<dialog>`; `scrollLock` bloquea la página.
  - Entra con fade de 300 ms y sale con 200 ms. Al cerrar, la galería queda en la foto que se estaba viendo.
- **Mobile:** foto principal con swipe (Embla + `useSlider`); debajo, fila de miniaturas de 72 px con gap de 8 px y scroll horizontal si no caben.

### 4. Información

- **Etiquetas:** pills de 32 px (30 px en mobile). Primero la `tag` de Tina con su ícono; después la especialidad, que enlaza a su landing.
- **Marca:** logo en una caja de 40 px (34 px en mobile), con máximo de 36 × 170 px (30 × 140 px en mobile) y `mix-blend-multiply`. Sin logo, el nombre en 22 px (19 px), peso 600.
- **H1:** `heading-h1` en desktop y `heading-h2` en mobile, peso 500, `text-wrap: balance`.
- **Descripción corta:** `body-lg` (`body-md` en mobile), `text-content-muted`.
- **CTA en desktop:** dos botones `flex-1` de 56 px (la referencia usa 58 px).
  - "Solicitar cotización" (`btn-primary`) abre el `QuoteModal`.
  - "Hablar con un asesor" (`btn-secondary` con los colores de la referencia: borde y texto `brand-secondary-dark`, fondo `surface` y hover `surface-raised`; `FaWhatsapp` en `semantics-success-dark`) abre WhatsApp.
  - En mobile no van en el cuerpo: están en la barra fija.
- **Sellos en desktop:** fila con gap de 24 px, texto de 14 px e íconos de 20 px.
  - Primero los `badges` de Tina; al final "Ficha técnica" (`BsFiletypePdf` en `text-accent`), solo si hay PDF.
  - En mobile no se muestran los sellos de Tina; solo el enlace "Descargar ficha técnica", de 44 px de alto.

### 5. Acordeón

- `<details name="detalles-producto">`/`<summary>` con `border-t border-line` y un `border-b` por fila. La primera pestaña viene abierta y solo hay una abierta a la vez.
- Fila: padding de 22 px y título de 18 px en desktop; 60 px de alto mínimo y 16 px en mobile. Peso 500 y `PiCaretDownLight`, que rota 180°.
- Apertura animada como en la referencia: la pestaña crece y la que estaba abierta se cierra a la vez (alto con la Web Animations API, 300 ms `ease-in-out`). Sin JS, el `<details>` abre y cierra igual, sin animación.
- Cuerpo: 16 px (15 px en mobile), interlineado 1.7, `text-content-muted`.
- Pestañas: Descripción general, Especificaciones técnicas y Accesorios.
- Especificaciones y Accesorios son HTML de un WYSIWYG y se dibujan como `prose`. Las tablas van dentro de un contenedor con `overflow-x-auto` (enfocable con teclado), ocupan el ancho, sus celdas parten línea y el texto baja a 14 px. La primera columna mide al menos 9rem y, por debajo de `lg`, la tabla al menos 34rem.
- La grilla de tarjetas de Accesorios de la referencia no se aplica: el dato es HTML libre, no una lista.

### 6. Video demo (solo si hay video)

- **Desktop:** `border-t`, grilla `minmax(0,1fr) minmax(0,1.7fr)`, gap de 56 px y padding superior de 56 px.
  - A la izquierda: "Video demo" (`body-md`, `text-content-subtle`), H2 "Conoce el equipo en funcionamiento" y un texto de 16 px.
- **Mobile:** una columna, H2 de 22 px.
- **Bloque de video:** `aspect-video`, `rounded-3xl`, `bg-brand-secondary-dark`.
  - Póster: la miniatura de YouTube.
  - Play blanco de 88 px (64 px en mobile) con `PiPlayFill` en `text-accent`.
- Sin las tres viñetas ni la leyenda "Espacio para video".

### 7. Productos relacionados

- Sección `bg-surface-raised`, padding de 88 px en desktop y `32px 0 40px` en mobile; H2 "Productos relacionados".
- **Desktop:** grilla de 4 columnas, gap de 20 px, con `ProductCard.astro` (la de la SPEC 05, sin sello de garantía).
- **Mobile:** carrusel con Embla + `useSlider`; slides al 72 % de ancho, gap de 12 px y padding lateral de 16 px.

### 8. Barra fija mobile (< `lg`)

- `fixed bottom-0` a todo el ancho, `bg-surface`, `border-t border-line`, padding `12px 16px max(16px, env(safe-area-inset-bottom))`.
- "Solicitar cotización" (`btn-primary`, `flex-1`, 54 px) y un círculo de WhatsApp de 54 px con borde `semantics-success` y `aria-label`.
- La página reserva 84 px abajo para que la barra no tape el contenido.
- El botón flotante de WhatsApp del sitio se oculta en la ficha por debajo de `lg`.
- Queda por debajo de los paneles del header y del `QuoteModal`.

**Transiciones:** como máximo 300 ms; `prefers-reduced-motion` las desactiva (estándar §4).

## Alcance

**Entra:**

- `/productos/<slug>` rehecha según la referencia desktop y mobile: miga, galería, información, CTA, sellos, acordeón, video, relacionados y barra fija en mobile.
- **Galería** con Embla + `useSlider`: las miniaturas cambian la foto y en mobile hay swipe. Botón de zoom que abre la foto a pantalla completa.
- **Cotización:**
  - "Solicitar cotización" abre el `QuoteModal` con el producto (`data-quote-name` / `data-quote-url`, igual que la tarjeta).
  - "Hablar con un asesor" abre WhatsApp con `buildQuoteUrl` (nombre y URL del producto).
- **Logo de la marca** leído en build desde `/products/brands`; si falta, el nombre en texto.
- **Etiqueta y sellos editables en Tina** en una colección singleton `productPage` (equivale a `shop.productPage` de Eres), con el contenido inicial de la referencia.
- **Sello y enlace "Ficha técnica"** al PDF (`link` de JetEngine), solo cuando existe.
- **Acordeón:** Descripción general (Woo), Especificaciones técnicas y Accesorios (JetEngine). Una pestaña sin contenido no se muestra.
- **Video demo** solo cuando existe: YouTube con fachada e `iframe` de `youtube-nocookie.com` al hacer clic; un archivo subido, con `<video controls preload="none">`.
- **Relacionados:** hasta 4 de la misma especialidad, con los destacados primero, completados con la misma marca y después con el resto del catálogo por destacados (como `eres-skin-studio`). Sin ninguno, no aparece la sección.
- **Lectura de los campos de JetEngine en build** desde `/wp/v2/product` (`meta`), sanitizados con la allowlist de `store.ts`. Si no llegan, la ficha se publica sin esas secciones y el build no falla.
- **JSON-LD** `Product` (sin `offers`) y `BreadcrumbList` (estándar §SEO).
- Dos íconos nuevos en `src/lib/icons.ts` para los sellos de la referencia: `truck` ("Entrega") y `graduation-cap` ("Capacitación").

**Fuera de alcance (para specs futuras):**

- Pestañas Características y Garantía, y el sello "N años de garantía" en los relacionados: no hay datos.
- Viñetas fijas del video ("Puesta en marcha"…).
- Precio, stock y `offers` en el JSON-LD: el sitio cotiza, no vende.
- Sellos distintos por producto: los de Tina son iguales para toda la ficha.
- Cambios en el catálogo (SPEC 05) y en la tarjeta, salvo reutilizarla.
- El `fix/` de entidades HTML (`fix/entidades-html-woo`): va antes y por separado.

## Modelo de datos

### Woo (`src/lib/woo/types.ts`)

```ts
export interface WooProduct {
  brandLogo: WooImage | null;
}

export type WooVideo =
  | { kind: "youtube"; id: string }
  | { kind: "file"; src: string };

export interface WooProductExtras {
  datasheetUrl: string | null;
  specifications: string;
  accessories: string;
  video: WooVideo | null;
}
```

- `brandLogo` sale de `products/brands` (v3), cruzado por el slug de la marca. Sin imagen, `null`.
- `WooProductExtras` va aparte de `WooProduct`: la home, el catálogo y la búsqueda no cargan campos que solo usa la ficha.

### Campos de JetEngine (`src/lib/woo/extras.ts`, solo build)

`getProductExtras(): Promise<Map<number, WooProductExtras>>` toma el `meta_data` de los productos que ya descargó `store.ts` (`getProductMeta()`, sin las claves que empiezan con `_`). No hace otra descarga del catálogo.

| Meta key | Campo | Regla |
|---|---|---|
| `link` | `datasheetUrl` | Solo `https:`, del mismo host que `WOO_STORE_URL` y terminado en `.pdf`; si no, `null` |
| `especificaciones_tecnicas` | `specifications` | HTML sanitizado con la allowlist de `store.ts` (ya incluye tablas) |
| `accesorios` | `accessories` | Igual que el anterior |
| `es_link` + `video_link` | `video` (`youtube`) | Se extrae el ID de 11 caracteres de `watch?v=`, `youtu.be/`, `/embed/` o `/shorts/`; si no hay ID válido, `null` |
| `es_archivo` + `video` | `video` (`file`) | URL `https:` del mismo host, `.mp4` o `.webm`. Si llega el ID del adjunto, se resuelve con `/wp/v2/media/<id>?_fields=source_url` |

- **Degradación:** si `meta` llega vacío o el endpoint responde con error, cada producto queda con los extras vacíos. El build avisa con `console.warn` y **no falla**. A diferencia del catálogo, que falla si Woo no responde (SPEC 01), los extras son opcionales.
- Un HTML que queda vacío tras sanitizar cuenta como vacío y su pestaña no se muestra.

### Datos de la ficha (`src/lib/woo/productPage.ts`, solo build)

Mismo patrón que `buildProductPage` en `eres-skin-studio` (SPEC 10):

```ts
export type DetailKey = "descripcion" | "especificaciones" | "accesorios";

export interface ProductDetail {
  key: DetailKey;
  title: string;
  html: string;
}

export interface ProductPageData {
  details: ProductDetail[];
  related: WooProduct[];
}

export function buildProductPage(
  product: WooProduct,
  rankedProducts: WooProduct[],
  extras: WooProductExtras,
): ProductPageData;
```

- **Detalles:** Descripción general (`description` de Woo), Especificaciones técnicas y Accesorios (JetEngine), en ese orden y sin los vacíos.
- **Relacionados** (máximo 4, `RELATED_LIMIT`), sin el producto actual y sin repetidos:
  1. los de la misma especialidad (`categories[0]`), por el rank de destacados;
  2. los de la misma marca (`brandSlug`);
  3. el resto del catálogo por destacados.
- `rankedProducts` sale de `getRankedProducts()` de `catalog.ts`: destacados primero y después el orden de Woo, el mismo rank que "Más relevantes" en la SPEC 05.

### Tina: `productPage` (`tina/collections/productPage.ts`)

Colección singleton en `src/content/product-page/index.json`, sin crear ni borrar. Equivale al objeto `shop.productPage` de Eres; aquí es una colección propia porque este sitio no tiene colección `shop`:

```ts
{
  tag: { label: string; icon: string },
  badges: { label: string; icon: string }[],
}
```

- `icon` usa las opciones de `src/lib/icons.ts`, que suma `truck` ("Entrega") y `graduation-cap` ("Capacitación").
- Contenido inicial: `tag` "Uso Profesional Médico" (`stethoscope`); `badges` "Entrega e instalación" (`truck`) y "Capacitación incluida" (`graduation-cap`).
- Un `label` vacío no se muestra.

### Ficha (`src/pages/productos/[slug].astro`)

- `getStaticPaths` pasa `product`, `extras` y `page` (`buildProductPage`) por props. Los extras y los productos se piden una sola vez para todas las páginas.
- **Islas:**
  - `ProductGalleryReact.tsx` (`client:load`, arriba del fold) recibe las imágenes ya optimizadas en Astro con `getImage()` (960 px la principal, 192 px las miniaturas, WebP).
  - `RelatedCarouselReact.tsx` (`client:visible`) recibe las `ProductCard.astro` como *children*. Embla solo se activa por debajo de `lg`; en desktop es una grilla.
- **Sin isla:** el acordeón (`<details>` nativo), la fachada del video (un `<script>` de Astro que cambia el botón por el `iframe` al hacer clic), la barra fija y los CTA.
- **JSON-LD:**
  - `Product` con `name`, `sku`, `image[]`, `description` (descripción corta en texto plano), `brand` (`Brand`), `category` y `url`.
  - `BreadcrumbList` con Inicio, Productos, la especialidad y el producto.

## Plan de implementación

1. **Preparación.**
   - La rama `feat/spec-06-ficha-producto` ya existe, creada desde `staging` en `351e869` (con la SPEC 05 integrada).
   - El `fix/entidades-html-woo` se revisa por separado; si genera conflictos al integrarse, se resuelven en esta rama.
2. **Logo de la marca.**
   - Agregar `brandLogo` a `WooProduct` y leer `products/brands` en `store.ts`.
   - Sumar el host de las imágenes de marca a `image.domains` si es distinto.
   - Verificación: `npm run build:local` pasa con y sin `WOO_STORE_URL`, y Schiller trae su logo.
3. **Extras de JetEngine.**
   - Crear `src/lib/woo/extras.ts` con `getProductExtras()`, las validaciones de PDF, YouTube y archivo, y la degradación sin `meta`.
   - Verificación con `node --experimental-strip-types`:
     - los 4 formatos de URL de YouTube dan el mismo ID;
     - un `link` de otro host da `null`;
     - un `meta: []` da extras vacíos sin lanzar error.
4. **Datos de la ficha.**
   - Extraer el rank de `catalog.ts` a `getRankedProducts()` y crear `src/lib/woo/productPage.ts` con `buildProductPage()`.
   - Verificación: un producto de Cardiología devuelve 4 de Cardiología con los destacados primero; uno de una especialidad con menos de 5 completa con su marca y después con destacados.
5. **Colección `productPage`.**
   - Crear `tina/collections/productPage.ts`, registrarla en `tina/config.ts` y crear `src/content/product-page/index.json` con el contenido de la referencia.
   - Agregar `truck` y `graduation-cap` a `src/lib/icons.ts` y `Icon.tsx`.
   - Verificación: se edita en `/admin` y el build pasa.
6. **Esqueleto de la ficha sin interacción.**
   - Reescribir `[slug].astro` con miga, layout de dos columnas, galería estática (primera foto), etiquetas, marca, H1, descripción corta, CTA y sellos.
   - "Solicitar cotización" con `data-quote-name`/`data-quote-url`; "Hablar con un asesor" con `buildQuoteUrl`.
   - Verificación: compila para los 45 productos y el modal abre con el nombre del producto.
7. **Acordeón.**
   - `<details>` con Descripción general, Especificaciones y Accesorios; una pestaña vacía no aparece.
   - Tablas dentro de `overflow-x-auto`.
   - Verificación: sin JS, las pestañas abren y cierran.
8. **Galería.**
   - `ProductGalleryReact.tsx` con `useSlider`: las miniaturas cambian la foto y en mobile hay swipe.
   - Miniaturas como `<button>` con `aria-label` y `aria-current`.
   - Con una sola foto, sin miniaturas ni swipe.
9. **Video.**
   - Sección con fachada: póster de `i.ytimg.com`, botón de play con `aria-label` e `iframe` de `youtube-nocookie.com` con `autoplay=1` al hacer clic.
   - Para un archivo, `<video controls preload="none">`.
   - Verificación: sin clic no hay ninguna petición a YouTube.
10. **Relacionados.**
    - Sección con `ProductCard.astro` dentro de `RelatedCarouselReact.tsx`.
    - Embla se activa solo por debajo de `lg` (`active` según `matchMedia`); en desktop, grilla de 4.
11. **Barra fija mobile.**
    - Barra por debajo de `lg`, con `safe-area-inset-bottom` y 84 px reservados al final de la página.
    - `BaseLayout` acepta `hideWhatsAppButton` para ocultar el botón flotante por debajo de `lg` en la ficha.
12. **SEO.**
    - JSON-LD `Product` y `BreadcrumbList`.
    - `title` y `description` como hoy, y `og:image` con la primera foto.
13. **Cierre.**
    - `npm run build:local` y `check:standard`.
    - Playwright en 320, 360, 768, 1024 y 1280 px, con capturas contra la referencia.
    - Prueba en el iPhone XR con el preview de Amplify.
    - Documentar en el `CLAUDE.md` la colección `productPage` y los extras de JetEngine.
    - Agregar "Notas de implementación" y "QA realizada" a esta spec.

## Criterios de aceptación

**Build y estándar**

- [ ] `npm run build:local` termina sin errores con y sin `WOO_STORE_URL`, y genera una ficha por producto (45).
- [ ] Si ningún producto trae campos de JetEngine, el build pasa, avisa por consola y las fichas salen sin PDF, especificaciones, accesorios ni video.
- [ ] Con `WOO_STORE_URL` y sin `WOO_CONSUMER_KEY`/`WOO_CONSUMER_SECRET`, el build falla con un mensaje que explica cómo crear la clave.
- [ ] `npm run check:standard` pasa.
- [ ] En las piezas nuevas no hay hex, `text-white/*` ni `bg-white/*`, salvo en el bloque oscuro del video.
- [ ] `store.ts`, `extras.ts`, `productPage.ts` y `catalog.ts` no se importan desde ningún `.tsx`.
- [ ] El HTML de la ficha trae, sin JavaScript, el H1, la descripción, las pestañas del acordeón y los enlaces de los relacionados.

**Desktop (≥ 1024 px)**

- [ ] La miga muestra Inicio / Productos / Especialidad / Nombre, y la especialidad enlaza a su landing.
- [ ] Las miniaturas van en columna; clic en una cambia la foto principal y queda marcada.
- [ ] La galería queda fija bajo el header al hacer scroll hasta el final de la columna de información.
- [ ] Se ven la etiqueta "Uso Profesional Médico", la especialidad, el logo de la marca, el H1 y la descripción corta.
- [ ] Una marca sin logo muestra su nombre en texto.
- [ ] "Solicitar cotización" abre el `QuoteModal` con el nombre del producto.
- [ ] "Hablar con un asesor" abre `wa.me` en otra pestaña con el nombre y la URL del producto en el mensaje.
- [ ] Se ven los sellos "Entrega e instalación" y "Capacitación incluida".
- [ ] Al quitar un sello en `/admin`, desaparece en el siguiente build sin dejar hueco.

**Datos de JetEngine (leídos por la v3)**

- [ ] Q-Flow muestra "Ficha técnica" y el enlace abre `Q-Flow-Spanish.pdf` en otra pestaña.
- [ ] `scout-tube` no muestra el sello ni el enlace de ficha técnica.
- [ ] La pestaña "Especificaciones técnicas" muestra la tabla con columnas por modelo y, a 320 px, se desplaza dentro de su contenedor sin scroll horizontal en la página.
- [ ] Un producto sin accesorios no muestra la pestaña "Accesorios".
- [ ] Un producto con video de YouTube muestra la sección con póster; antes del clic no hay ninguna petición a `youtube.com` ni a `youtube-nocookie.com`; al hacer clic, el video se reproduce.
- [ ] Un producto sin video no muestra "Video demo".

**Acordeón**

- [ ] "Descripción general" viene abierta; cada pestaña abre y cierra con clic, `Enter` y `Espacio`.
- [ ] Abrir una pestaña cierra la que estaba abierta.

**Relacionados**

- [ ] Un producto de Cardiología muestra 4 relacionados de Cardiología, con los destacados primero, y no se incluye a sí mismo.
- [ ] Un producto de una especialidad con menos de 5 productos completa hasta 4: primero con su marca y después con destacados.
- [ ] "Solicitar cotización" en una tarjeta relacionada abre el modal con ese producto.

**Mobile y tablet (< 1024 px)**

- [ ] La miga muestra Productos / Especialidad.
- [ ] La foto principal responde al swipe y las miniaturas en fila cambian la foto.
- [ ] No se ven los sellos de Tina ni los CTA del cuerpo; se ve "Descargar ficha técnica" si hay PDF.
- [ ] La barra fija muestra "Solicitar cotización" y WhatsApp.
- [ ] La barra no tapa el final de la página y, en el iPhone XR, respeta la zona del indicador de inicio.
- [ ] El botón flotante de WhatsApp del sitio no aparece en la ficha.
- [ ] Los relacionados se desplazan como carrusel con swipe, cada tarjeta al 72 % del ancho.
- [ ] El `QuoteModal` abierto desde la barra fija queda por encima de ella y se cierra bien en Safari del iPhone XR.
- [ ] A 320 y 360 px no hay scroll horizontal y los nombres largos no se cortan.
- [ ] Todos los controles tocables miden al menos 44×44 px.

**SEO y accesibilidad**

- [ ] El HTML trae JSON-LD `Product` (nombre, SKU, imágenes, marca, categoría y URL) y `BreadcrumbList`, válidos en el validador de schema.org.
- [ ] La ficha tiene `og:image` con la primera foto del producto.
- [ ] Hay un solo H1; "Video demo" y "Productos relacionados" son H2.
- [ ] Las miniaturas, el play del video y el WhatsApp de la barra tienen `aria-label`.
- [ ] La lupa abre el zoom en la foto activa; `Esc` y ✕ lo cierran, las flechas del teclado navegan y la página de fondo no hace scroll.
- [ ] Toda la ficha se usa con teclado y el foco siempre es visible.
- [ ] Con `prefers-reduced-motion` no hay transiciones de desplazamiento en la galería ni en el carrusel.

## Decisiones

- **Sí: catálogo y campos de JetEngine desde la REST API v3 con clave de solo lectura, como Eres.** Decisión del revisor. El `meta_data` trae los campos sin activar "Show in Rest API" ni dejar PHP en WordPress, y la misma respuesta trae cross-sells y upsells. Reemplaza la Store API pública de SPEC 01. La clave va por cabecera, nunca en la URL, y solo existe en el build.
- **No: "Show in Rest API" en JetEngine ni un mu-plugin.** Dependen de cambiar la configuración de WordPress campo por campo o de mantener PHP en el servidor del cliente.
- **Sí: extras opcionales en el build.** La ficha se publica sin ellos si no llegan. El catálogo sí debe fallar sin Woo (SPEC 01), pero perder un PDF no justifica no publicar.
- **Sí: `WooProductExtras` aparte de `WooProduct`.** La home, el catálogo y la búsqueda no cargan HTML de especificaciones que no usan.
- **Sí: acordeón con Descripción general, Especificaciones técnicas y Accesorios.** Especificaciones reemplaza a Características: es el dato más útil y existe en 44 de 45 productos.
- **No: pestañas Características y Garantía.** No hay datos en Woo ni en JetEngine (verificado el 2026-10-03). Si el cliente los carga, van en otra spec.
- **Sí: etiqueta y sellos editables en Tina, en una colección singleton `productPage`.** Es el patrón de `shop.productPage` en Eres: los textos fijos de la ficha se editan en Tina. Respeta la referencia y el cliente puede corregir o quitar una promesa sin tocar código.
- **No: sellos fijos en el código.** Son promesas comerciales ("Capacitación incluida") que el cliente debe poder ajustar.
- **No: sellos por producto.** No hay un campo que los respalde; si hace falta, va en otra spec junto con JetEngine.
- **Sí: "Ficha técnica" automático, fuera de Tina.** Depende de que el producto tenga PDF, no de una decisión editorial.
- **Sí: galería con Embla + `useSlider`, sin lightbox.** Es lo que manda el `CLAUDE.md`. Las fotos de Woo son de producto sobre fondo blanco y suelen venir chicas, y un `<dialog>` más es el patrón que falló en Safari en la SPEC 05.
- **Sí: video con fachada y `youtube-nocookie.com`.** El estándar pide póster y carga bajo demanda; el `iframe` directo descarga unos 500 KB de JS por ficha.
- **No: viñetas fijas del video.** Prometen contenido ("Limpieza y mantenimiento") que el video del producto quizá no tiene.
- **Sí: relacionados con los cross-sells y upsells de Woo primero (como Eres), después la misma especialidad con los destacados primero, la marca y los destacados.** La especialidad es lo que busca un médico; el último paso, igual que en `eres-skin-studio`, asegura siempre 4 tarjetas si el catálogo las tiene.
- **Sí: "Hablar con un asesor" abre WhatsApp directo.** El ícono promete WhatsApp y "Solicitar cotización" ya abre el modal. En el catálogo abre el modal porque ahí no hay producto en contexto.
- **Sí: leer el logo de la marca en build.** El dato ya existe en las 11 marcas y la referencia lo muestra.
- **Sí: acordeón con `<details>` nativo y fachada del video con un `<script>` de Astro.** No tienen estado que justifique React (estándar §2.1).
- **Sí: una sola pestaña abierta a la vez, con `<details name>`.** Es el comportamiento de `eres-skin-studio`, resuelto por el navegador sin JS. Un navegador sin soporte del atributo deja abrir varias, sin romper nada.
- **Sí: `buildProductPage()` en `src/lib/woo/productPage.ts`.** La misma estructura que `eres-skin-studio`: la página recibe `details` y `related` ya resueltos en build.
- **Sí: carrusel de relacionados como isla que recibe las `ProductCard.astro` como *children*.** Reutiliza la tarjeta de la SPEC 05 sin duplicarla en React.
- **Sí: `Product` sin `offers` en el JSON-LD.** El sitio cotiza y no publica precio. Es válido, aunque Google no muestre resultado enriquecido.
- **Sí: ocultar el botón flotante de WhatsApp en la ficha por debajo de `lg`.** La barra fija ya tiene WhatsApp y los dos se superponen.
- **Sí: botones de 54–56 px y transiciones de 300 ms**, aunque la referencia usa 58 px y animaciones de 550–800 ms. Prevalece el estándar (§3.2 y §4).
- **Sí: rama independiente desde `staging`, sin esperar el `fix/entidades-html-woo`.** Por decisión del usuario. Si al integrarse el fix hay conflictos en `store.ts`, se resuelven en esta rama. Sin el fix, *Easy Pulse* muestra `&#8211;` en el H1, el `<title>` y el JSON-LD de su ficha.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Amplify no tiene las claves cuando se integra la rama | El build falla con un mensaje claro. Las variables se cargan en Amplify antes del merge. |
| La clave se filtra | Es de solo lectura, vive solo en las variables de Amplify y del `.env`, viaja por cabecera y `store.ts` lanza un error si llega al navegador. |
| La v3 devuelve borradores, privados u ocultos | Se pide `status=publish` y se descartan los de `catalog_visibility: hidden`. |
| El HTML de especificaciones trae estilos en línea o tablas anchas del WYSIWYG | La allowlist de `store.ts` descarta `style` y clases; las tablas van dentro de `overflow-x-auto`. |
| El campo `video` de JetEngine llega como ID de adjunto y no como URL | `extras.ts` lo resuelve con `/wp/v2/media/<id>` (público, sin clave). |
| La barra fija choca con el `QuoteModal` o con Safari | La barra queda por debajo de los paneles; se prueba en el iPhone XR antes de pedir revisión. |
| El póster de YouTube (`i.ytimg.com`) no existe en `maxresdefault` | Se usa `hqdefault.jpg`, que siempre existe, con `loading="lazy"`. |
| El catálogo tiene un solo producto | La sección de relacionados no aparece. |

## Qué **no** entra en esta spec

- Pestañas Características y Garantía, y el sello de garantía.
- Viñetas fijas del video.
- Precio, stock y `offers`.
- Sellos por producto.
- Cambios en el catálogo y en la tarjeta de la SPEC 05.
- El `fix/` de entidades HTML (va por separado).

Cada una de esas piezas, si llega, va en su propia spec.

## Notas de implementación

- **`npm run build` necesita TinaCloud.** En local se verificó con `npm run build:local` y `WOO_STORE_URL=https://medicaldigitalperu.com`, la URL pública de la tienda.
- **Reglas de JetEngine en `extrasRules.ts`.** Las validaciones de PDF, YouTube y archivo de video viven en un módulo sin dependencias de Astro, para probarlas con `node --experimental-strip-types`. `extras.ts` solo descarga y degrada.
- **`store.ts` sobre la v3.** `fetchJson` usa `wc/v3` con la clave por defecto y `wp/v2` sin clave (para resolver adjuntos de video), con el mismo timeout y reintento; `sanitizeDescription` se exporta para los campos WYSIWYG. La rama se rebasó sobre `staging` con el fix de entidades HTML (#15).
- **`useSlider` acepta `container`.** Las tarjetas Astro llegan a la isla dentro de `<astro-slot>`, así que Embla recibe el selector del `<ul>` (`[data-related-track]`) en lugar de tomar el primer hijo del viewport.
- **Fondo de la galería en cada slide.** Embla mueve el carril con `transform`, que crea un contexto de apilamiento: con el fondo en el viewport, `mix-blend-multiply` dejaba un rectángulo blanco alrededor de la foto.
- **Columna de la galería con `min-w-0`.** Sin él, la fila de miniaturas ensanchaba la grilla y la página tenía scroll horizontal en mobile.
- **Relacionados en tablet al 42 %.** La spec fija el 72 % en mobile; entre `sm` y `lg` una tarjeta al 72 % mide más de 500 px, así que desde `sm` va al 42 %.
- **"Hablar con un asesor" con el borde navy de la referencia** en lugar del rojo de `btn-secondary`. Dos botones rojos juntos compiten; el navy deja a "Solicitar cotización" como la acción principal. Conserva la forma, el foco y los estados de `btn-secondary`.
- **Galería sticky.** Queda fija mientras la columna de información sea más alta; sin especificaciones (estado actual) el recorrido es corto.
- **Alineado con `eres-skin-studio` tras revisar su SPEC 10.** Se movieron los relacionados a `buildProductPage()` (`productPage.ts`, que reemplaza a `related.ts`), se sumó el relleno por destacados y el acordeón pasó a una pestaña abierta a la vez.
- **Relleno de relacionados.** Hospitalización (4 productos, marcas sin otros productos) completa la cuarta tarjeta con destacados. El relleno por marca no se activa con los datos actuales; se verificó con datos de prueba.
- **Lock de Tina.** `tina/tina-lock.json` se actualizó con la colección `productPage`.
- **Póster de YouTube sin `astro:assets`.** Se carga desde `i.ytimg.com` con `loading="lazy"`; no se agrega ese dominio a `image.domains`.

## QA realizada

Build local (`npm run build:local`) con y sin `WOO_STORE_URL` (sin Woo: 7 páginas y ninguna ficha, sin errores). `npm run check:standard`: 0 errores, 2 avisos previos (páginas sin `og:image` y JS de la home en el límite de 150 KB). Playwright sobre `astro preview` el 2026-10-07:

- **Reglas (`node --experimental-strip-types`):** los 4 formatos de YouTube dan el mismo ID; `link` de otro host o `http:` da `null`; `meta` vacío da extras vacíos; los switchers `es_link`/`es_archivo` eligen la fuente. `buildProductPage`: especialidad con destacados primero, relleno por marca y después por destacados, sin el producto actual; detalles en orden y sin los vacíos.
- **1280 px (Holter Medilog AR):** miga de 4 niveles; 5 miniaturas en columna de 96 px y la 3.ª queda activa al hacer clic; galería fija a 112 px; etiqueta, sellos y logo de Schiller; "Solicitar cotización" abre el modal con el producto; "Hablar con un asesor" abre `wa.me` en otra pestaña con el nombre y la URL; botón flotante visible y barra fija oculta; 4 relacionados de Cardiología en una fila; acordeón abre y cierra con `Enter` y `Espacio`, y abrir una pestaña cierra la otra (verificado con datos simulados); JSON-LD `Product` y `BreadcrumbList`; un solo H1; sin scroll horizontal.
- **Hospitalización (Desecador Derm 102):** 3 relacionados de su especialidad y el cuarto por destacados; con una sola foto no hay miniaturas.
- **320, 360 y 768 px:** sin scroll horizontal; miga Productos / Cardiología; barra fija visible, botón flotante y sellos ocultos; controles de 44 px o más; swipe a la foto 2; carrusel de relacionados; la barra no tapa el final del footer; la barra abre el modal.
- **`prefers-reduced-motion`:** el acordeón abre y cierra sin animar el alto ni el caret.
- **Datos reales por la v3 (2026-10-08):** 45 fichas; 28 con ficha técnica, 44 con especificaciones, 0 con accesorios y 10 con video de YouTube; 43 con logo de marca. Q-Flow abre `Q-Flow-Spanish.pdf`, tiene 4 relacionados y no pide nada a YouTube antes del clic. Ninguna de las 45 fichas tiene scroll horizontal de página en 1280 y 360 px; solo la tabla de 7 columnas de Q-Flow se desplaza en desktop (5 tablas en mobile), dentro de su contenedor.
- **Zoom (Chromium, 1280 y 360 px):** abre en la foto activa (3 / 5), → pasa a 4 / 5, `Tab` no sale del `<dialog>`, `Esc` cierra, devuelve el foco a la lupa y deja la galería en la foto 4; la página no hace scroll ni tiene desborde horizontal; sin errores de consola.
- **Animación del acordeón (Chromium):** a los 120 ms las dos pestañas están a mitad de camino (164 px y 134 px); a los 300 ms queda una sola abierta. `Enter` anima igual, un doble clic rápido revierte sin saltos y no hay errores de consola.
- **Campos de JetEngine simulados** (parche temporal en `extras.ts`, no versionado) en Q-Flow, en 1280 y 320 px: "Ficha técnica" y "Descargar ficha técnica" abren el PDF en otra pestaña; la pestaña "Accesorios" con `<p>&nbsp;</p>` no aparece; la tabla de especificaciones pierde `style` y clases y se desplaza en su contenedor sin scroll en la página; sin peticiones a YouTube antes del clic; el clic carga el `iframe` de `youtube-nocookie.com`. `scout-tube` sale sin ficha técnica ni video.
- Sin errores de JavaScript en consola.

Pendiente de verificar a mano: Safari en el iPhone XR con el preview de Amplify (barra fija, zona del indicador de inicio y modal), swipe en un Android real, edición de los sellos en `/admin`, el validador de schema.org, el recorrido completo con teclado y lector de pantalla, y los campos reales de JetEngine cuando se active "Show in Rest API".
