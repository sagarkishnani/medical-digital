# SPEC 05 — Catálogo con filtros

> **Status:** Aprobado
> **Depends on:** SPEC 01, SPEC 03
> **Date:** 2026-10-04
> **Objective:** Rehacer `/productos` y `/productos/categoria/<slug>` según la referencia (desktop y mobile), con búsqueda, filtros por especialidad y marca, orden y paginación que funcionan en el navegador y viven en la URL.

## Por qué existe esta spec

Hoy `/productos` es la plantilla de SPEC 01: un título, una fila de categorías (`CategoryNav`) y una grilla con todo el catálogo. La tarjeta no permite cotizar. No se puede buscar, filtrar por marca ni ordenar.

La referencia (`Medical Digital Desktop.html` y `Medical Digital Mobile.html`, pantalla "Productos") define:

- una cabecera con miga de pan;
- un sidebar con búsqueda, "Especialidades", "Marcas" y "¿Necesitas ayuda?";
- chips de filtros activos, orden y estado vacío;
- en mobile, una barra sticky con "Filtros" y una hoja inferior.

Estado de Woo al redactar (verificado contra la Store API y el admin el 2026-10-03):

| Dato | Estado |
|---|---|
| Productos | 45 |
| Categorías | 7, todas de primer nivel, sin subcategorías |
| Marcas | 11 (`brands`), todas con logo; todos los productos tienen una |
| Garantía, atributos y tags | No existen |

Por eso la referencia se implementa sin subcategorías, sin el sello de garantía y sin el orden "Mayor garantía".

## Referencia de diseño (valores extraídos del bundle)

Todos los valores se escriben con tokens, nunca en hex. Breakpoints del estándar: el sidebar arranca en `lg`; por debajo se usan la barra sticky y la hoja de filtros.

| Hex del bundle | Token |
|---|---|
| `#F4F5F8` (cabecera, fondo de imagen) | `bg-surface-raised` |
| `#1C2140` (texto, botón de la tarjeta) | `brand-secondary-dark` |
| `#18459A` (hover del botón) | `brand-tertiary-dark` |
| `#EEF2FA` / `#18459A` (chip) | `bg-brand-tertiary-lightest` / `text-brand-tertiary-dark` |
| `#E83C3E` (activo, "Limpiar filtros") | `text-accent` (`#E83C3E` no llega a 4.5:1 en texto) |
| `#717274` (conteos, miga) | `text-content-subtle` |
| `#E5E7EB` | `border-line` |
| `#C9CCD6` (checkbox sin marcar, borde del vacío) | `border-brand-secondary-light` |
| Degradado `#1C2140 → #18459A` ("¿Necesitas ayuda?") | `bg-gradient-primary` o el más cercano del UI Kit |

### 1. Cabecera

- `bg-surface-raised`.
- Miga "Inicio / Productos" en 14 px `text-content-subtle`; el último ítem en `brand-secondary-dark`.
- H1 de 48 px en desktop y 32 px en mobile (`heading-h1`), peso 500.
- Padding de 48 px en desktop y 28/16 px en mobile.
- En categorías, la miga es Inicio / Productos / Especialidad y el H1 es el nombre de la especialidad.

### 2. Layout desktop (≥ `lg`)

- `container-xl`, grilla `320px minmax(0,1fr)`, gap de 40 px y padding `40px 0 96px`.
- Sidebar sticky bajo el header de 84 px (`top` ≈ 108 px), con gap de 16 px entre bloques.

### 3. Sidebar

- **Buscar:** input de 52 px, radio de 14 px (`rounded-xl`), lupa de 20 px a la izquierda y texto de 15 px. Lleva un `<label>` visualmente oculto.
- **Especialidades:**
  - Tarjeta con `border-line`, radio de 18 px (`rounded-2xl`) y padding de 24 px. Título de 20 px, peso 500.
  - "Todos los productos" y una fila por especialidad: enlaces de 15 px con padding de 10 px. La activa va en `text-accent`, peso 500.
  - Sin acordeón ni caret: no hay subcategorías.
- **Marcas:**
  - Misma tarjeta, con un input "Buscar marca…" de 42 px.
  - Filas de 38 px con checkbox de 20 px y radio de 6 px; marcado lleva `bg-brand-secondary-dark` y check blanco.
  - Etiqueta de 15 px y conteo de 13 px en `text-content-subtle`.
- **¿Necesitas ayuda?:**
  - Tarjeta con el degradado de marca, radio de 18 px y padding de 28/24 px.
  - Ícono `PiHeadsetLight` de 36 px, título de 22 px y texto de 14 px.
  - Botón pill "Hablar con un asesor" de 50 px sobre fondo claro, que abre `QuoteModal` en su versión genérica.

### 4. Cabecera de la grilla

- A la izquierda: "N productos" (15 px, `text-content-subtle`), los chips y "Limpiar" (13 px, subrayado).
- Chip: pill de 34 px con la etiqueta y una ✕ de 14 px.
- A la derecha, el orden: "Más relevantes" con un caret que rota 180°.
  - Desplegable de 210 px, `bg-surface`, `border-line`, radio de 14 px y sombra.
  - Opciones de 14 px; la activa en `text-accent`.

### 5. Tarjeta (la misma de la home)

- Grilla de 3 columnas en desktop y 2 en `md` y mobile; gap de 20 px en desktop y 10 px en mobile.
- Borde `line`, radio de 22 px (`rounded-2xl`) y padding de 10 px.
- Imagen en una caja `aspect-[10/9]` `bg-surface-raised`, al 74 %, con `object-contain` y `mix-blend-multiply`.
- Marca en 12 px uppercase `text-content-subtle`, nombre en 17 px peso 500 y especialidad en 13 px. En mobile no se muestra la especialidad.
- "Solicitar cotización" (46 px, `bg-brand-secondary-dark`) y una flecha circular de 46 px que lleva a la ficha. En mobile: "Cotizar" de 40 px y flecha de 40 px.
- Hover: `-translate-y` de 6 px y sombra, en 300 ms (estándar §4; la referencia usa 450 ms).

### 6. Estado vacío

- Caja con borde punteado, radio de 22 px y padding de 64 px en desktop y 40 px en mobile.
- Lupa de 48 px, "No hay productos con estos filtros" en 20 px y "Limpiar filtros" en `text-accent`.

### 7. Mobile y tablet (< `lg`)

- **Barra sticky** bajo el header de 64 px, con `bg-surface` y `border-b border-line`:
  - buscador de 48 px con texto de 16 px, para que iOS no haga zoom;
  - debajo, "Filtros (n)" (pill de 44 px con borde; la referencia usa 40 px) y el orden a la derecha.
- **Hoja de filtros desde abajo:**
  - `max-h-[86vh]`, radio superior de 24 px y overlay oscuro.
  - Cabecera "Filtros" con un cerrar de 44 px.
  - Cuerpo con scroll propio (`data-lenis-prevent`): "ESPECIALIDADES" con filas de 48 px y "MARCAS" con checkboxes de 22 px en filas de 48 px.
  - Pie con "Limpiar" y "Ver N productos", ambos de 52 px.
- "¿Necesitas ayuda?" va al final de la grilla.

**Transiciones:** la referencia usa entre 250 y 500 ms; aquí se limitan a 300 ms, y `prefers-reduced-motion` las desactiva (estándar §4).

## Alcance

**Entra:**

- `/productos` con cabecera, catálogo filtrable y "¿Necesitas ayuda?", según la referencia desktop y mobile.
- `/productos/categoria/<slug>` con la misma plantilla y la especialidad activa. Sigue siendo una página estática indexable; los enlaces del mega-menú (SPEC 03) no cambian.
- **Búsqueda local** "Buscar producto…": filtra la grilla por nombre, marca y SKU, sin distinguir tildes ni mayúsculas.
- **Especialidades:** enlaces de selección única, de "Todos los productos" a `/productos/categoria/<slug>`. Al navegar se conservan marca, orden y búsqueda.
- **Marcas:** selección múltiple con checkbox y conteo, más el buscador "Buscar marca…".
- **Orden:** Más relevantes (destacados de Woo primero y después el orden de Woo), Nombre A–Z y Nombre Z–A.
- **Chips** por cada filtro activo, "Limpiar" y el conteo "N productos".
- **Paginación** de 12 productos, visible solo con más de una página.
- **Estado en la URL** (`?q=`, `?marca=`, `?orden=`, `?pagina=`), con `pushState` y el botón "atrás" funcionando.
- **Estado vacío** con "Limpiar filtros".
- **Mobile y tablet:** barra sticky con buscador, "Filtros (n)" y orden, y una hoja inferior con especialidades y marcas.
- **Cotizar desde la tarjeta:** "Solicitar cotización" (y "Cotizar" en mobile) abre `QuoteModal` con el producto.
- **Tarjeta compartida:** se extrae la tarjeta de `FeaturedProductsReact` a un componente que usan la home y el catálogo.
- Se eliminan `ProductListing.astro`, `ProductCard.astro` y `CategoryNav.astro`, que quedan sin uso.

**Fuera de alcance (para specs futuras):**

- Ficha de producto `/productos/<slug>`: galería, ficha técnica PDF, especificaciones, accesorios y video (SPEC 06).
- Exponer los campos de JetEngine en la REST API: depende de la aprobación de Sagar y va con la SPEC 06.
- Subcategorías, sello de garantía y orden "Mayor garantía": no hay datos en Woo.
- Página de marcas y logos de marca.
- El bug de entidades HTML en los nombres (`store.ts`): va en un `fix/` aparte, antes de implementar esta spec.
- La búsqueda global del header (SPEC 03): esta spec no la toca.
- Textos de la cabecera del catálogo y de "¿Necesitas ayuda?" editables en Tina: quedan fijos, como en la referencia.

## Modelo de datos

### Woo (`src/lib/woo/types.ts` y `store.ts`)

```ts
export interface WooProduct {
  brandSlug: string | null;
}
```

- `brandSlug` sale de `raw.brands[0].slug`. Se agrega junto a `brand`, sin cambiarlo, para no tocar la home, el header ni la búsqueda.
- "Más relevantes" necesita los destacados: `getFeaturedProducts()` ya existe y el build lo usa para ordenar.

### Tarjeta compartida (`src/components/productos/ProductCard.tsx`)

```ts
export interface ProductCardData {
  href: string;
  name: string;
  brand: string | null;
  specialty: string | null;
  quoteUrl: string;
  image: { src: string; alt: string; width: number; height: number } | null;
}
```

- Reemplaza a `FeaturedCard`. La home pasa `specialty: null` y la tarjeta solo la muestra si llega.
- La tarjeta recibe `onQuote(card)`. El `QuoteModal` vive en la isla que la contiene (home o catálogo).

### Catálogo serializado (`src/utils/catalog/types.ts`, seguro para el navegador)

```ts
export interface CatalogItem extends ProductCardData {
  id: number;
  sku: string;
  brandSlug: string | null;
  categories: string[];
  search: string;
  rank: number;
}

export interface CatalogFacets {
  specialties: { slug: string; name: string; count: number; href: string }[];
  brands: { slug: string; name: string }[];
}

export type SortKey = "relevantes" | "a-z" | "z-a";

export interface CatalogState {
  q: string;
  marca: string[];
  orden: SortKey;
  pagina: number;
}
```

- `src/lib/woo/catalog.ts` (`buildCatalog()`, solo build) arma `items` y `facets`, con las imágenes optimizadas (`getImage`, 480 px, WebP) y el `quoteUrl` de `buildQuoteUrl()`.
- `search` es el texto normalizado (minúsculas, sin tildes por `NFD`) de nombre, marca y SKU.
- `rank`: primero los destacados y después el orden en que Woo devuelve los productos.
- `categories` son slugs. En `/productos/categoria/<slug>` la isla recibe solo los productos de esa especialidad, más `activeSpecialty`.
- Los conteos de marca se calculan con la especialidad y la búsqueda aplicadas, sin el filtro de marca.

### URL (`src/utils/catalog/urlState.ts`)

| Parámetro | Formato | Ejemplo | Por defecto (se omite) |
|---|---|---|---|
| `q` | texto | `holter` | vacío |
| `marca` | slugs separados por coma | `schiller,edan` | ninguna |
| `orden` | `SortKey` | `a-z` | `relevantes` |
| `pagina` | entero ≥ 2 | `2` | `1` |

- Los valores desconocidos se ignoran en silencio.
- Si `pagina` supera el total, se usa la última.
- Cualquier cambio de filtro, búsqueda u orden vuelve a la página 1.
- La búsqueda escribe la URL con `replaceState` y un debounce de 300 ms, para no llenar el historial. Los demás cambios usan `pushState`.
- Los enlaces de especialidad conservan `q`, `marca` y `orden`, y descartan `pagina`.

### Reglas de filtrado (`src/utils/catalog/applyFilters.ts`)

- Las marcas se combinan con **O** entre sí, y con **Y** con la búsqueda.
- Página de 12 (`CATALOG_PAGE_SIZE`).
- A–Z y Z–A usan `localeCompare(…, "es")`.

Esta spec no toca Tina: no hay schema nuevo.

## Plan de implementación

1. **Preparación.**
   - Esperar el merge del PR #11 (SPEC 03) y del `fix/` de entidades HTML en `store.ts`.
   - Crear `feat/spec-05-catalogo-filtros` desde `staging` actualizado.
2. **Marca con slug.**
   - Agregar `brandSlug` a `WooProduct` y a la proyección de `store.ts`.
   - Verificación: `npm run build` pasa con y sin `WOO_STORE_URL`.
3. **Tarjeta compartida.**
   - Extraer la tarjeta de `FeaturedProductsReact` a `src/components/productos/ProductCard.tsx` (`ProductCardData` y `onQuote`), con `specialty` opcional.
   - La home la usa sin cambios visuales. Verificación: la home se ve igual en 360 y 1280 px.
4. **Modelo del catálogo.**
   - Crear `src/utils/catalog/{types,urlState,applyFilters}.ts`.
   - Verificación con `node --experimental-strip-types`:
     - `parseCatalogUrl(serializeCatalogUrl(s))` devuelve `s`;
     - buscar `"electrocardiografo"` encuentra "Electrocardiógrafo";
     - dos marcas devuelven la unión de ambas.
5. **Datos en build.**
   - Crear `src/lib/woo/catalog.ts` con `buildCatalog(category?)`: `items` con imagen optimizada y `quoteUrl`, `facets` y `rank` con los destacados primero.
   - Solo se importa desde `.astro`.
6. **Plantilla compartida sin interacción.**
   - Crear `src/components/productos/CatalogPage.astro` (cabecera con miga y H1) y `CatalogReact.tsx` (`client:load`), que renderiza la página 1 en la grilla.
   - Las dos rutas usan `CatalogPage`.
   - Borrar `ProductListing.astro`, `ProductCard.astro` y `CategoryNav.astro`.
   - Verificación: las dos rutas compilan y muestran 12 tarjetas.
7. **Sidebar desktop:**
   - "Buscar producto…" con `<label>` oculto;
   - "Especialidades" como enlaces, con la activa resaltada;
   - "Marcas" con buscador, checkboxes y conteos;
   - "¿Necesitas ayuda?";
   - sticky bajo el header.
8. **Estado y URL.**
   - Hook `useCatalogState()`: lee la URL al montar, usa `pushState` (y `replaceState` con debounce para `q`) y escucha `popstate`.
   - Conectar la búsqueda, las marcas y los enlaces de especialidad (que conservan los parámetros).
9. **Cabecera de la grilla:**
   - conteo "N productos" en una región `aria-live="polite"`;
   - chips y "Limpiar";
   - `SortMenu.tsx`: botón con `aria-expanded`, que se cierra con `Esc` y al hacer clic fuera.
10. **Paginación y estado vacío.**
    - `Pagination.tsx` con botones de 44×44, `aria-current` y "Siguiente".
    - Al cambiar de página, scroll al inicio de la grilla compensando el header.
    - Estado vacío con "Limpiar filtros".
11. **Cotización.**
    - La tarjeta y "Hablar con un asesor" abren `QuoteModal` (con el producto o en versión genérica).
    - Verificación: el enlace de WhatsApp incluye el nombre del producto.
12. **Mobile y tablet:**
    - barra sticky bajo el header de 64 px con buscador, "Filtros (n)" y orden;
    - `FilterSheet.tsx` con `scrollLock`, `data-lenis-prevent`, foco atrapado, `Esc`, overlay, "Limpiar" y "Ver N productos";
    - "¿Necesitas ayuda?" al final de la grilla.
13. **Pulido.**
    - Script inline que, solo si la URL trae parámetros, marca la grilla con `data-catalog-pending` (opacidad 0) hasta que la isla aplica el estado. Un timeout de 1,5 s la vuelve a mostrar si la isla falla.
    - `prefers-reduced-motion` desactiva las transiciones.
14. **Cierre.**
    - `npm run build` y `check:standard`.
    - Playwright en 320, 360, 768, 1024 y 1280 px.
    - Capturas contra la referencia y prueba en touch real.
    - Documentar en el `CLAUDE.md` los parámetros de URL del catálogo y la tarjeta compartida.
    - Agregar "Notas de implementación" y "QA realizada" a esta spec.

## Criterios de aceptación

**Build y estándar**

- [ ] `npm run build` termina sin errores con y sin `WOO_STORE_URL`. Sin Woo, `/productos` muestra el aviso de catálogo no disponible.
- [ ] `npm run check:standard` pasa.
- [ ] En las piezas nuevas no hay hex, `text-white/*` ni `bg-white/*`, salvo en el bloque con degradado "¿Necesitas ayuda?".
- [ ] `src/lib/woo/store.ts` y `catalog.ts` no se importan desde ningún `.tsx`.
- [ ] El HTML de `/productos` contiene los 12 primeros productos con su enlace, sin necesidad de JavaScript.

**Desktop (≥ 1024 px)**

- [ ] `/productos` muestra la miga "Inicio / Productos", el H1 "Nuestros productos", el sidebar y la grilla de 3 columnas.
- [ ] El sidebar tiene "Buscar producto…", "Especialidades" (Todos + 7), "Marcas" (11 con conteo) y "¿Necesitas ayuda?", y queda fijo bajo el header al hacer scroll.
- [ ] Escribir "holter" filtra la grilla y el conteo, y la URL recibe `?q=holter`.
- [ ] Escribir "electrocardiografo" sin tilde muestra los electrocardiógrafos.
- [ ] Marcar "Schiller" deja solo productos Schiller, agrega el chip "Schiller" y la URL recibe `?marca=schiller`.
- [ ] Marcar "Schiller" y "Edan" muestra la unión de ambas marcas.
- [ ] Los conteos de marca no cambian al marcar otra marca, y sí con la búsqueda o la especialidad.
- [ ] La ✕ de un chip quita ese filtro, y "Limpiar" deja la URL sin parámetros.
- [ ] "Nombre A–Z" y "Nombre Z–A" reordenan la grilla y escriben `?orden=a-z` o `?orden=z-a`.
- [ ] "Más relevantes" muestra primero los destacados de Woo.
- [ ] El desplegable de orden se cierra con `Esc` y al hacer clic fuera.

**Especialidades y rutas**

- [ ] Clic en "Cardiología" lleva a `/productos/categoria/cardiologia`, con miga Inicio / Productos / Cardiología, H1 "Cardiología" y la especialidad resaltada.
- [ ] Con `?marca=schiller` activo, clic en otra especialidad conserva `?marca=schiller`.
- [ ] Los enlaces del mega-menú del header siguen funcionando.

**Paginación y URL**

- [ ] Con más de 12 resultados aparece la paginación. "Siguiente" muestra la página 2, escribe `?pagina=2` y lleva el scroll al inicio de la grilla, visible bajo el header.
- [ ] Cualquier cambio de filtro, búsqueda u orden vuelve a la página 1.
- [ ] El botón "atrás" del navegador deshace el último cambio de marca, orden o página.
- [ ] Abrir `/productos?marca=schiller&orden=z-a` en una pestaña nueva muestra el resultado filtrado, sin ver antes la grilla sin filtrar.
- [ ] `?orden=foo&marca=xyz&pagina=99` no rompe la página: los valores inválidos se ignoran y la página se ajusta a la última.
- [ ] Una combinación sin resultados muestra "No hay productos con estos filtros", y "Limpiar filtros" funciona.

**Cotización**

- [ ] "Solicitar cotización" en una tarjeta abre `QuoteModal` con el nombre de ese producto.
- [ ] "Hablar con un asesor" abre `QuoteModal` en versión genérica.
- [ ] La home muestra la misma tarjeta que antes y su cotización sigue funcionando.

**Mobile y tablet (< 1024 px)**

- [ ] Se ven la barra sticky (buscador, "Filtros (n)" y orden) y la grilla de 2 columnas; la barra queda fija bajo el header de 64 px.
- [ ] "Filtros" abre la hoja inferior con especialidades y marcas; "Ver N productos" la cierra con el conteo correcto.
- [ ] Con la hoja abierta el fondo no hace scroll; se cierra con `Esc`, el overlay y la ✕, y el foco vuelve a "Filtros".
- [ ] El buscador mobile tiene texto de 16 px y en iOS no hace zoom.
- [ ] A 320 y 360 px no hay scroll horizontal, ni con la hoja abierta, y los nombres largos no se cortan.
- [ ] Todos los controles tocables miden al menos 44×44 px.

**Accesibilidad**

- [ ] Todo el catálogo se usa con teclado y el foco siempre es visible.
- [ ] Los checkboxes son `<input type="checkbox">` con label, y la especialidad activa lleva `aria-current="page"`.
- [ ] El conteo de resultados se anuncia en una región `aria-live="polite"`.
- [ ] Con `prefers-reduced-motion` no hay transiciones de desplazamiento.

## Decisiones

- **Sí: definición guiada por las recomendaciones.** Por pedido del usuario, se sigue la referencia, el estándar y la forma de trabajo de las specs de `eres-skin-studio` (09 y 10).
- **Sí: filtrar en el navegador sobre datos generados en build.** Con 45 productos, el catálogo entero cabe en la página: es instantáneo y no consulta WordPress en runtime (SPEC 01).
- **No: filtrar contra la Store API en vivo.** Suma latencia y dependencia de WordPress a cambio de nada con este tamaño de catálogo.
- **Sí: una isla React que renderiza la grilla (`client:load`).** La tarjeta de la home ya es React y se reutiliza en vez de duplicarla en Astro. Astro la renderiza en build, así que el HTML trae la página 1 sin JavaScript.
- **No: tarjetas Astro controladas desde el DOM (patrón de Eres).** Allá servía por el `QuickAdd` anidado; aquí obligaría a mantener dos tarjetas (Astro y React para la home).
- **Sí: `/productos/categoria/<slug>` como página estática con la especialidad activa.** Conserva URLs indexables y los enlaces del mega-menú. Mismo criterio que Eres.
- **No: especialidad como parámetro de URL o de selección múltiple.** La referencia la trata como selección única, y un parámetro haría que el H1 no coincida con la página.
- **Sí: estado en la query string con `pushState`.** Se puede compartir, el "atrás" funciona y otras páginas pueden enlazar a vistas filtradas.
- **Sí: `replaceState` con debounce para la búsqueda.** Una entrada de historial por tecla rompería el "atrás".
- **Sí: paginación de 12.** La referencia no pagina, pero 45 tarjetas con imagen superan el presupuesto mobile del estándar (§5.2). Mismo valor que Eres.
- **Sí: búsqueda local en el sidebar, además de la global del header.** Está en la referencia y filtra la vista actual junto con los demás filtros; la del header busca en todo el sitio.
- **No: subcategorías, sello de garantía ni orden "Mayor garantía".** Woo no tiene esos datos (verificado el 2026-10-03). Si el cliente los carga, van en otra spec.
- **Sí: `brandSlug` junto a `brand`.** Evita tocar la home, el header y la búsqueda, que ya usan `brand`.
- **Sí: "Más relevantes" con los destacados primero.** Le da al cliente control del orden desde Woo sin campos nuevos.
- **Sí: textos fijos en la cabecera y en "¿Necesitas ayuda?".** Son copys cortos de la referencia; hacerlos editables en Tina no aporta en esta etapa.
- **Sí: 300 ms de transición y áreas táctiles de 44 px**, aunque la referencia usa 450–500 ms y botones de 40 px. Prevalece el estándar (§3.2 y §4).
- **Sí: `text-accent` en lugar de `#E83C3E` para el texto activo.** `#E83C3E` no llega a 4.5:1 sobre blanco (`CLAUDE.md`).
- **Sí: el bug de entidades HTML en un `fix/` aparte.** Es independiente, se revisa rápido y también desbloquea la SPEC 06.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Destello de la grilla sin filtrar antes de hidratar, cuando la URL trae parámetros | Un script inline pone `data-catalog-pending` (opacidad 0) solo si hay parámetros. La isla lo quita al aplicar el estado, y un timeout de 1,5 s lo quita igual si la isla falla. |
| El JSON del catálogo pesa en el HTML | Solo se serializan los campos de `CatalogItem`, sin descripciones: unos 15 KB con 45 productos. Pasados unos 300 productos se evalúa paginar en build (otra spec). |
| Un producto sin marca o sin imagen | Aparece sin filtros y no cuenta en ninguna marca. La tarjeta muestra el bloque neutro, como en la home. |
| Woo cambia el slug de una categoría | La página se regenera con el nuevo slug en el siguiente deploy y el enlace viejo da 404. Mismo comportamiento que hoy. |
| El JS de la isla supera el presupuesto | Solo usa React y `react-icons`, que ya están en el bundle; sin dependencias nuevas. Se mide en el paso de cierre. |

## Qué **no** entra en esta spec

- La ficha de producto (SPEC 06) y los campos de JetEngine en la REST API.
- Subcategorías, garantía y orden "Mayor garantía".
- Página de marcas y logos de marca.
- El `fix/` de entidades HTML (va antes, por separado).
- Textos de la cabecera y de "¿Necesitas ayuda?" editables en Tina.

Cada una de esas piezas, si llega, va en su propia spec.

## Notas de implementación

- **Paso 1 sin el `fix/` de entidades HTML.** Por decisión del usuario se implementó sin esperar el fix: "EASY PULSE &#8211; …" sigue mostrando la entidad en el catálogo hasta que se corrija `store.ts`.
- **`npm run build` necesita TinaCloud.** En local se verificó con `npm run build:local`; no dejó cambios en `tina/`.
- **Tarjeta compartida.** `ProductCard.tsx` reemplaza la tarjeta de `FeaturedProductsReact`. La variante del catálogo (`compactOnMobile`) muestra "Cotizar" y oculta la especialidad por debajo de `md`.
- **Botones de la tarjeta mobile de 44 px**, no de 40 px como la referencia: prevalece el área táctil del estándar (§3.2).
- **Chips de 32/34 px de alto** con un área táctil extendida a 44 px mediante un pseudo-elemento.
- **Hoja de filtros como `<dialog>` nativo**, igual que `QuoteModal`: el foco queda atrapado y vuelve al botón "Filtros" al cerrar. Entra con 16 px de desplazamiento y fundido (`sheet-in`, 300 ms), no desde fuera de la pantalla, por la regla de desplazamiento del estándar (§4).
- **Tamaños de texto con tokens.** Los 15 px de la referencia van en `body-md` y los 13 px en `body-sm`; el H1 usa `heading-h2` en mobile y `heading-h1` (44 px) en desktop.
- **Chip de especialidad.** En `/productos/categoria/<slug>` la especialidad aparece como chip; su ✕ lleva a `/productos` conservando los demás parámetros.
- **Facetas de marca por página.** En una categoría solo se listan las marcas con productos en ella; una marca de la URL que no existe ahí se ignora.
- **Sidebar más alto que la pantalla (≈1450 px a 1280 × 900).** Queda fijo a 108 px y sube junto con el final de la grilla, como en la referencia.
- **Presupuesto de JS.** `check:standard` mide 148 KB gzipped en la página más pesada (la home), dentro del límite de 150 KB pero muy cerca.

## QA realizada

Build local (`npm run build:local`) y `npm run check:standard` (0 errores, 1 aviso previo: páginas sin `og:image`). Playwright sobre `astro preview` el 2026-10-04:

- **1280 px:** sidebar con 8 especialidades y 11 marcas; 12 tarjetas por página; búsqueda sin tilde ("espirometro" → 2 resultados, `?q=espirometro`); marca Schiller (27) y unión Schiller + Edan (29); conteos de marca estables; "atrás" deshace; chips y "Limpiar"; orden A–Z; `Esc` cierra el orden; "Siguiente" escribe `?pagina=2` y deja la grilla visible bajo el header; parámetros inválidos ignorados; estado vacío y "Limpiar filtros"; especialidad conserva `?marca=`; H1, miga y `aria-current` en Cardiología; modal con el producto y enlace de WhatsApp con su nombre; asesor genérico; sidebar sticky a 108 px; destacados de Woo primero.
- **URL directa:** `/productos?marca=schiller` con JS demorado: la grilla queda en opacidad 0 hasta hidratar y aparece ya filtrada.
- **320, 360 y 768 px:** sin scroll horizontal (también con la hoja abierta); 2 columnas; barra sticky a 64 px; la hoja bloquea y libera el scroll, se cierra con `Esc` y devuelve el foco a "Filtros (1)"; "Ver 27 productos"; buscador de 16 px.
- **1024 px:** 3 columnas, sin scroll horizontal.
- Sin errores de JavaScript en consola.
- El ejemplo "electrocardiógrafo" de los criterios no existe en Woo; la búsqueda sin tilde se verificó con "espirometro".

Pendiente de verificar a mano: zoom en iOS real, swipe y toques en un Android real, y recorrido completo con teclado y lector de pantalla.
