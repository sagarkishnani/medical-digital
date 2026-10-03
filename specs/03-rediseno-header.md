# SPEC 03 — Rediseño del header

> **Status:** Implementado
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-10-02
> **Objective:** Reemplazar el header actual por el de la referencia (desktop y mobile): blanco y sticky, con mega-menú de productos, panel ☰, búsqueda de productos, "Cotiza aquí" y WhatsApp flotante, editable desde Tina.

## Por qué existe esta spec

El header actual viene del starter: es `fixed` y transparente sobre el hero, con una prop `headerTheme` que cambia su fondo (por eso el menú no se lee sobre las fotos); es una lista plana de enlaces más un botón; y la búsqueda es un modal que solo encuentra posts.

La referencia (`Medical Digital Desktop.html` y `Medical Digital Mobile.html`) define un header blanco y sticky, un mega-menú de productos, un panel ☰ a pantalla completa, búsqueda de productos, "Cotiza aquí" y un WhatsApp flotante.

## Referencia de diseño (valores extraídos del bundle)

Todos los valores se escriben con los tokens del UI Kit, nunca en hex. Donde la referencia usa un valor que no existe como token, se indica el token más cercano.

**Header desktop (≥ `lg`, 1024 px)**

- `position: sticky; top: 0`, fondo `surface`, borde inferior `line`, alto **84 px**.
- Sombra al hacer scroll (`scrollY > 20`; en la referencia `0 10px 30px -18px` navy); sin sombra con el panel ☰ abierto.
- Celdas de izquierda a derecha, separadas por bordes verticales `line`:
  1. **Logo:** alto 22–30 px (`clamp`), padding horizontal 16–40 px.
  2. **☰:** celda de 60–92 px de ancho, ícono de 32 px `brand-secondary-dark`.
  3. **Navegación:** `body-sm`/`body-md` (13–15 px), peso 500, padding de 8–14 px por enlace; color `brand-secondary-dark`; activo y hover con `accent` (la referencia usa `#E83C3E`, que sobre blanco no llega a 4.5:1 en texto de 15 px; el `CLAUDE.md` pide `accent` para texto en color de marca).
  4. **🔍:** botón de 48 × 48, ícono de 26 px, hover `surface-raised`.
  5. **"Cotiza aquí":** bloque de 120–200 px de ancho y alto completo, fondo `brand-primary`, texto blanco 14–16 px peso 500, hover `brand-primary-dark`.

**Mega-menú de Productos**

- Panel bajo el header: fondo `surface`, borde superior `line`, sombra `shadow-lg`, contenedor de 1320 px.
- Grilla de **5 columnas** con bordes `line`; celdas de **112 px** de alto y padding de 20 px.
- Cada celda: ícono de 34 px `brand-primary`, nombre en `subtitle` y conteo en `caption` `content-subtle`. En hover: fondo `surface-raised` y la foto del producto (92 × 92 px) entra desde la derecha (de 24 px a 0, opacidad 0 → 1).
- Celda "Ver todo el catálogo": fondo `brand-secondary-dark`, texto blanco y flecha ↗.
- Fila final: "¿No encuentras lo que buscas? **Habla con un asesor**" (enlace `accent`, subrayado) y, a la derecha, "Catálogo PDF" con el ícono PDF `brand-primary`.

**Panel ☰ desktop**

- `fixed` desde los 84 px hasta abajo, fondo `surface`, con scroll propio.
- Columna izquierda de 132 px con borde `line` y el texto "MENÚ" vertical (`writing-mode: vertical-rl`, tracking .5em, `content-subtle`).
- Contenido de 1180 px máximo, padding de 52/56 px:
  - **Tarjetas** en 3 columnas: imagen de 120 × 104 px con radio de 14 px, título de 19 px peso 500 y texto `body-sm` `content-subtle`.
  - **Columnas** en 3 columnas: título `heading-h2` (32 px) y enlaces `body-lg` `content-muted`. "Contáctanos" con íconos de teléfono, correo, pin y reloj en `brand-primary`.

**Búsqueda**

- Desktop: panel bajo el header, contenedor de 1120 px y padding de 36/32 px. Campo con ícono de 30 px, texto de 28 px y borde inferior de 1.5 px `brand-secondary-dark`. Resultados en grilla de 4 columnas: miniatura de 64 px con radio de 12 px sobre `surface-raised`, nombre `body-sm` peso 500 y marca en `caption`.
- Mobile: a pantalla completa bajo el header, campo de 20 px y resultados en lista.
- Sin resultados: "No encontramos resultados para "…". Prueba con otra marca o especialidad."

**Header mobile (< `lg`)**

- 64 px de alto, padding de 16 px, logo de 24 px y botones de 48 × 48 para 🔍 y ☰.
- Menú: "Productos" como acordeón (fila de 60 px con borde `line`, texto de 20 px peso 500 y chevron que gira) con las categorías en 2 columnas (tarjetas `surface-raised`, radio de 12 px, ícono de 24 px y texto de 13 px) y "Ver todo el catálogo" en `brand-secondary-dark`; el resto de enlaces en filas de 60 px; luego los bloques "Sobre nosotros" y "Contáctanos" (rótulo de 13 px en mayúsculas, tracking .08em), las redes (íconos de 28 px `content`) y el botón "Descargar catálogo" (56 px, borde `brand-secondary-dark`).

**WhatsApp flotante**

- `fixed`, a 28 px de abajo y de la derecha, círculo de **61 px** con el logo de WhatsApp, sombra verde y hover `scale(1.08)`.

**Transiciones:** la referencia usa entre 250 y 500 ms; aquí se limitan a **300 ms** (estándar §4).

## Scope

**Entra:**

- **Header desktop (84 px):** logo SVG, ☰, navegación, 🔍 y "Cotiza aquí"; blanco y sticky, con borde inferior y sombra al hacer scroll; enlace activo según la URL.
- **Header mobile (64 px):** logo, 🔍 y ☰.
- **Mega-menú de "Productos" (desktop):** categorías de Woo con su ícono, conteo y la foto de su primer producto al pasar el mouse; "Ver todo el catálogo"; fila final con "Habla con un asesor" y el catálogo PDF si está cargado.
- **Panel ☰ desktop**, a pantalla completa bajo el header: tarjetas con imagen y las columnas "Sobre nosotros" (enlaces a las secciones de `/nosotros`), "Atención al cliente" y "Contáctanos" (datos de `global.company`).
- **Menú mobile:** "Productos" como acordeón con las categorías y "Ver todo el catálogo"; enlaces; "Sobre nosotros"; datos de contacto; redes; "Descargar catálogo" si hay PDF.
- **Búsqueda:** panel bajo el header en desktop y a pantalla completa en mobile, con resultados de **productos de Woo** (foto, nombre y marca) desde `/search-index.json`, generado en el build.
- **"Cotiza aquí" y "Habla con un asesor":** abren `QuoteModal` en su versión genérica ("Asesoría comercial"); solo funciona WhatsApp, como en la SPEC 02.
- **WhatsApp flotante** en todas las páginas, salvo en modo mantenimiento.
- **Íconos de especialidades** movidos de `home` a `global`, para que la Home y el header usen una sola lista.
- **Limpieza:** se eliminan la prop `headerTheme`, el modo transparente y el `pt-[72px]` que los heros reservaban para el header. El scroll se bloquea con un panel abierto y se libera siempre, aunque se cierre de golpe (lección de Fiberlux).
- **Enlaces solo con destino real:** se siembran Productos, Noticias (`/blog`) y Contacto; los demás se agregan desde Tina cuando existan.

**Fuera de alcance (para otras specs o tareas):**

- Páginas nuevas: Marcas y reseñas, Servicio técnico, Libro de reclamaciones y Trabaja con nosotros. Sus enlaces se agregan cuando existan.
- El archivo del catálogo PDF y las URLs de redes: los entrega el cliente. Los campos quedan listos.
- "Ver todos los resultados" de la búsqueda: necesita una búsqueda en el catálogo (tarea "Catálogo y detalle de producto").
- Footer: spec propia, dentro de la tarea "Links legales en el footer".
- Envío del formulario del modal: tarea de servicio técnico.
- Mega-menú por toque en tablets táctiles: ahí el primer toque navega.
- Traducciones: solo español.

## Modelo de datos

**Tina `global`.** Se reorganiza `nav` y se agregan bloques. `footer`, `whatsapp`, `company`, `seo` y `codeInjection` no cambian.

```ts
// tina/collections/global.ts → src/content/global/index.json
nav: {
  logo, logoAlt,                          // logo SVG en /uploads/marca/
  links: [{ label, url, external, productsMenu /* boolean: abre el mega-menú de productos */ }],
  cta: { label },                         // "Cotiza aquí": abre el modal genérico. Se quita cta.url
  panel: {
    cards: [{ image, imageAlt, title, text, url }],   // tarjetas con foto del panel ☰
    columns: [{ title, links: [{ label, url }] }],    // "Sobre nosotros", "Atención al cliente"
    contactTitle,                                     // "Contáctanos": datos de global.company
  },
},
search: { placeholder },                  // "¿Qué equipo estás buscando?"
whatsappButton: { enabled },              // WhatsApp flotante; usa global.whatsapp
catalog: { label, file },                 // catálogo PDF; sin archivo, no se muestra
categoryIcons: [{ categorySlug, icon }],  // se mueve desde home.specialties.icons
```

**Tina `home`.** Se elimina `specialties.icons`; la sección de especialidades lee `global.categoryIcons`.

**Contenido inicial** (solo destinos que existen):

```jsonc
"links": [
  { "label": "Productos", "url": "/productos", "productsMenu": true },
  { "label": "Noticias", "url": "/blog" },
  { "label": "Contacto", "url": "/contacto" }
],
"cta": { "label": "Cotiza aquí" },
"panel": {
  "cards": [
    { "image": "/uploads/menu/tarjeta-productos.webp", "title": "Nuestros productos", "text": "Equipos por especialidad médica", "url": "/productos" },
    { "image": "/uploads/menu/tarjeta-noticias.webp", "title": "Noticias", "text": "Capacitaciones y actividades", "url": "/blog" }
  ],
  "columns": [
    { "title": "Sobre nosotros", "links": [
      { "label": "Quiénes somos", "url": "/nosotros#quienes" },
      { "label": "Misión y visión", "url": "/nosotros#mision" },
      { "label": "Valores", "url": "/nosotros#valores" },
      { "label": "Políticas", "url": "/nosotros#politicas" } ] },
    { "title": "Atención al cliente", "links": [{ "label": "Contacto", "url": "/contacto" }] }
  ],
  "contactTitle": "Contáctanos"
},
"search": { "placeholder": "¿Qué equipo estás buscando?" },
"whatsappButton": { "enabled": true }
```

**Índice de búsqueda** (`src/pages/search-index.json.ts`): solo productos.

```ts
{ type: "product", title, brand, url /* /productos/<slug> */, image /* WebP optimizado en el build */ }
```

**Datos que el header recibe en el build** (`Header.astro` → `HeaderReact`):

```ts
categories: [{ slug, name, count, image /* foto del primer producto, WebP optimizado */ }]
// desde getCategories() y getProducts() de store.ts; nunca desde el .tsx
```

**Estado de interfaz** (`HeaderReact.tsx`):

```ts
openPanel: "menu" | "mega" | "search" | null  // un solo panel abierto a la vez
quoteOpen: boolean                             // modal genérico de cotización
scrolled: boolean                              // sombra del header
```

Convenciones:

- Los textos de interfaz ("Ver todo el catálogo", "Habla con un asesor", "Asesoría comercial") viven en el código, con el mismo criterio que la SPEC 02.
- Redes desde `footer.social`; WhatsApp desde `global.whatsapp`.
- Imágenes del CMS por `mediaUrl()`; las de Woo por `getImage()` en el build.

## Plan de implementación

Cada paso deja el build verde y va en su propio commit.

1. **Logo.** Extraer el SVG del bundle a `public/uploads/marca/logo-medical-digital.svg` y cargarlo en `nav.logo`.
2. **Schema y contenido de `global`.** Agregar `productsMenu`, `panel`, `search`, `whatsappButton`, `catalog` y `categoryIcons`, y dejar `nav.cta` solo con `label`. Mover los íconos de `home.specialties.icons` a `global.categoryIcons` y hacer que la Home los lea desde ahí. Sembrar el contenido inicial con destinos reales.
3. **Header base.** Reescribir `Header.astro` y `HeaderReact.tsx`: desktop de 84 px y mobile de 64 px, blanco, sticky, con sombra al hacer scroll (leyendo `scrollY` al montar) y enlace activo según la URL. `HeaderReact` devuelve un fragmento y los paneles se renderizan como hermanos del `<header>`. `scroll-margin-top` en `global.css` para que las anclas no queden bajo el header. "Cotiza aquí" abre `QuoteModal` en versión genérica (el modal acepta un título sin producto). Eliminar `headerTheme` y el `pt-[72px]` de `PageHero`. Utilidad de bloqueo de scroll que siempre libera el `overflow`.
4. **Mega-menú de Productos.** `Header.astro` obtiene las categorías y la foto del primer producto de cada una (`getCategories()`, `getProducts()`, `getImage()`). El panel desktop muestra los íconos de `global.categoryIcons`, "Ver todo el catálogo", "Habla con un asesor" y el catálogo PDF si existe.
5. **Panel ☰ desktop y menú mobile:** tarjetas, columnas, "Contáctanos" (`global.company`) y, en mobile, el acordeón de Productos, las redes de `footer.social` y "Descargar catálogo".
6. **Búsqueda.** `search-index.json.ts` pasa a tener solo productos, con la imagen optimizada. `SearchOverlay.tsx` se rehace como panel controlado por el header: bajo el header en desktop y a pantalla completa en mobile.
7. **WhatsApp flotante.** Componente nuevo en `BaseLayout`, visible con `whatsappButton.enabled` y nunca en modo mantenimiento.
8. **Comportamiento común de los paneles.** Un solo panel abierto a la vez; Esc los cierra y el foco vuelve al botón que los abrió (con `aria-expanded`); transiciones de 300 ms como máximo y sin transición con `prefers-reduced-motion`.
9. **Cierre.** `npm run build:local` y `check:standard`; Playwright en 360, 768 y 1280 px (sticky, un panel a la vez, teclado, bloqueo de scroll, anclas visibles); capturas contra la referencia; actualizar el `CLAUDE.md` (campos de `global` y reutilizables) y agregar "Notas de implementación" y "QA realizada" a esta spec.

## Criterios de aceptación

**Build y estándar**

- [x] `npm run build:local` termina sin errores y `check:standard` no da errores.
- [x] Ningún `.tsx` importa `src/lib/woo/store.ts`.
- [x] Sin hex, `text-[NNpx]` ni `text-white/…` fuera de las excepciones del `CLAUDE.md`.
- [x] Los íconos son Phosphor Light, salvo el logo de WhatsApp.

**Header**

- [x] Mide 84 px en desktop y 64 px en mobile, es blanco y queda fijo arriba al hacer scroll (sticky) en todas las páginas.
- [x] La sombra aparece al hacer scroll, también si se recarga a mitad de la página.
- [x] El enlace de la página actual se ve activo.
- [x] Ningún hero queda bajo el header; ya no existen `headerTheme` ni el `pt-[72px]`.
- [x] `/nosotros#quienes` (y las demás anclas) deja el título visible bajo el header.
- [x] "Cotiza aquí" abre el modal genérico ("Asesoría comercial") y su "Hablar con un asesor" abre WhatsApp.

**Mega-menú (desktop)**

- [x] Se abre al pasar sobre "Productos" y con teclado (Enter o Espacio); se cierra al salir, con Esc o al abrir otro panel.
- [x] Muestra las categorías de Woo con su ícono de `global.categoryIcons` y su conteo, y la foto del primer producto al pasar el mouse.
- [x] Muestra "Ver todo el catálogo" y "Habla con un asesor"; el enlace al catálogo PDF solo aparece si hay archivo.

**Panel ☰ y menú mobile**

- [x] El panel desktop muestra las tarjetas, las columnas y "Contáctanos" con los datos de `global.company`.
- [x] El menú mobile tiene "Productos" como acordeón, los enlaces, "Sobre nosotros", el contacto, las redes (si hay) y "Descargar catálogo" (si hay PDF).
- [x] Con un panel abierto la página no se desplaza, y al cerrarlo el scroll vuelve siempre.

**Búsqueda**

- [x] `/search-index.json` contiene solo productos, con nombre, marca, URL e imagen servida desde `dist/` (sin enlaces a WordPress).
- [x] Al escribir se filtran los productos; cada resultado lleva a su ficha; sin coincidencias aparece el mensaje de "sin resultados".
- [x] El placeholder sale de `global.search.placeholder`.

**WhatsApp flotante**

- [x] Aparece en todas las páginas con `whatsappButton.enabled` y abre `wa.me` con el número de `global.whatsapp`.
- [x] No aparece en modo mantenimiento ni con `enabled` desactivado.

**Accesibilidad y responsive**

- [x] Los botones del header llevan `aria-expanded` y `aria-label`; Esc cierra cualquier panel y el foco vuelve al botón que lo abrió.
- [x] Solo hay un panel abierto a la vez.
- [x] Transiciones de 300 ms como máximo; con `prefers-reduced-motion` los paneles aparecen sin transición.
- [ ] Áreas táctiles de al menos 44 px y sin scroll horizontal en 320, 360, 768 y 1280 px.
- [x] El layout coincide con la referencia desktop y mobile.

**Tina**

- [ ] Se editan desde `/admin`: logo, enlaces, "Cotiza aquí", tarjetas y columnas del panel, placeholder de búsqueda, catálogo, interruptor de WhatsApp e íconos de categorías.
- [x] La Home sigue mostrando los íconos de especialidades, ahora desde `global`.

## Decisiones

**Tomadas:**

| Decisión | Por qué |
|---|---|
| Header blanco y sticky, con sombra al hacer scroll | Es lo que define la referencia. Elimina el modo transparente (hoy deja el menú ilegible sobre las fotos) y la prop `headerTheme`. Mismo criterio que la SPEC 03 de header del repo de referencia del equipo (`eres-skin-studio`). |
| Solo lo que muestra la referencia | Nada de barra de anuncio, carrito, búsquedas populares ni ocultar el header al hacer scroll: eran del otro proyecto. |
| Mega-menú solo en "Productos", alimentado por Woo (`productsMenu: boolean`) | La referencia tiene un único submenú y sale de las categorías; un sistema de submenús editables sería sobreingeniería. |
| Íconos de especialidades en `global.categoryIcons` | El header y la Home necesitan la misma lista; en un solo lugar no se desincroniza. |
| Foto del mega-menú desde el primer producto de cada categoría | Woo no tiene imagen por categoría cargada; así se usa un dato real sin campos nuevos. |
| Solo enlaces con destino real | "Nada da 404", mismo criterio que el repo de referencia. Marcas, Servicio técnico, Libro de reclamaciones y Trabaja con nosotros se agregan desde Tina cuando existan. |
| `nav.cta` se mantiene con solo `label` | Mismo nombre que en el repo de referencia; "Cotiza aquí" abre un modal, así que la URL sobra. |
| `QuoteModal` genérico para "Cotiza aquí" y "Habla con un asesor" | Se reutiliza el componente de la SPEC 02; solo funciona WhatsApp hasta la tarea de formularios. |
| Índice de búsqueda solo con productos y la imagen optimizada en el build | La referencia busca equipos. La SPEC 01 prohíbe enlazar imágenes de WordPress (el repo de referencia sí lo hace; aquí no se copia). |
| `search.placeholder` y `whatsappButton.enabled` editables en Tina | Mismo patrón que el repo de referencia: el editor cambia el texto o apaga el botón sin tocar código. |
| Redes desde `footer.social` y contacto desde `global.company` | Una sola fuente para el header, el footer y Contacto. |
| `HeaderReact` devuelve un fragmento, con los paneles como hermanos del `<header>` | Si no, `sticky` deja de funcionar y los paneles `fixed` quedan recortados (problemas ya resueltos así en el repo de referencia). |
| `scroll-margin-top` global | Con un header sticky, las anclas del panel ☰ quedarían tapadas. |
| Transiciones de 300 ms como máximo | El estándar §4 lo pide; la referencia usa 400–500 ms. |
| Enlace activo con `accent` en lugar del rojo de la referencia | `#E83C3E` no llega a 4.5:1 en texto de 15 px; el `CLAUDE.md` pide `accent` para texto en color de marca. |
| Una sola spec, con un plan en 9 pasos commiteables por separado | Mismo criterio que el repo de referencia para su header. |

**Descartadas:**

| Alternativa | Por qué no |
|---|---|
| Submenús editables en `nav.links[].menu` (como el repo de referencia) | Nuestra referencia no tiene submenús configurables. |
| Mantener el header transparente sobre el hero | Se aparta de la referencia y obliga a mantener dos variantes. |
| Que el header consulte la colección `home` para los íconos | Duplica consultas y mezcla colecciones. |
| Sembrar enlaces a páginas que no existen (como Fiberlux) | Publica 404 temporales. |
| Búsqueda en vivo contra Woo desde el navegador | La SPEC 01 lo prohíbe: el navegador nunca habla con WordPress. |
| Mantener los posts en la búsqueda | La referencia busca solo productos. |
| Dividir en dos specs (navegación por un lado; búsqueda y WhatsApp por otro) | Son piezas del mismo header que comparten estado (un panel a la vez). |

## Riesgos

| Riesgo | Mitigación |
|---|---|
| `position: sticky` deja de funcionar si la isla envuelve el header en un `<div>`. | `HeaderReact` devuelve un fragmento (`astro-island` usa `display: contents`). |
| Un `transform` en el header deja recortados los paneles `fixed` que estén dentro. | Los paneles se renderizan como hermanos del `<header>`. |
| WordPress responde de forma intermitente y ahora el header también consulta Woo. | Las consultas se guardan en caché durante el build. Si Woo falla, el build falla a propósito, igual que el catálogo de la SPEC 01. Con `WOO_STORE_URL` vacía, el mega-menú y la búsqueda quedan vacíos y el resto funciona. |
| El header carga más JS en todas las páginas. | Medirlo con `check:standard` (150 KB). El índice de búsqueda se descarga recién al abrir la búsqueda. |
| Mover los íconos de `home` a `global` cambia dos schemas. | Un solo commit con el contenido migrado y la Home leyendo de `global`. |
| El SVG del logo puede traer una imagen incrustada pesada. | Revisar su peso al extraerlo y optimizarlo si supera unos 50 KB. |
| El menú se ve más corto que en el diseño porque se omiten los destinos que no existen. | Es intencional; el PR lo indica. |
| El catálogo PDF y las redes no están cargados. | Los campos quedan listos; el PR lo indica. |
| El texto blanco sobre "Cotiza aquí" queda en 4.08:1. | Ya es un pendiente de diseño en el `CLAUDE.md`. |

## Notas de implementación

- El mega-menú quedó dentro del `<header>` (`absolute`, bajo la fila) y no como hermano: el header no usa `transform`, así que el riesgo de recorte no aplica. `SiteMenu` y `QuoteModal` sí son hermanos.
- `nav.cta.url` se eliminó en el paso 3 (no en el 2), al conectar "Cotiza aquí" con el modal.
- Imágenes provisionales de las tarjetas del panel en `public/uploads/menu/` (240 × 208, WebP), tomadas de la referencia; se reemplazan desde Tina.
- Lenis ya estaba activo en `BaseLayout` (la SPEC 02 lo daba por descartado). Se expone en `window.lenis` para que `scrollLock` lo detenga con un panel abierto.
- Las páginas de productos y blog pasaron de `pt-[128px]` a `pt-14`, porque el header ya no se superpone al contenido.
- El header mide 84 + 1 px de borde en desktop y 64 + 1 px en mobile, igual que la referencia (el alto es de la fila; el borde va aparte).
- Búsqueda: el índice incluye también los nombres de las categorías, para que funcione lo que sugiere el mensaje "prueba con otra marca o especialidad". Se buscan nombre, marca y categorías, sin distinguir tildes. Se muestran 4 resultados como máximo, como en la referencia. Con el campo vacío no se muestran productos: la referencia muestra "Más buscados", pero no hay datos de búsquedas.
- El texto del campo de búsqueda usa `heading-h3` (24 px) y `heading-h4` (20 px) en mobile: los 28 px de la referencia no existen en el UI Kit.
- El chevron de "Productos" mantiene abierto el mega-menú si ya se abrió por hover; antes, el clic con mouse lo cerraba.
- WhatsApp flotante: `WhatsAppButton.astro`, sin JS. Usa `FaWhatsapp` en blanco sobre `semantics-success-dark` (5:1) en lugar de la imagen de la referencia; el verde medio quedaba bajo 3:1 contra el fondo blanco.
- Las redes del menú mobile usan logos de `react-icons/fa6`, como el de WhatsApp: son logos de marca.
- **Pendiente para una tarea propia:** dentro del menú y la búsqueda a pantalla completa (mobile), el foco con Tab puede salir hacia la página de atrás. Resolverlo requiere atrapar el foco dentro del panel.
- **Pendiente de decisión de diseño:** el chevron de "Productos" mide 24 × 84 px. Cumple el mínimo de 24 px de WCAG 2.5.8, pero no los 44 px del estándar; agrandarlo separa "Productos" de los demás enlaces respecto de la referencia. Es solo desktop (el mega-menú táctil está fuera de alcance).
- **Pendiente (SPEC 02):** en la Home, a 320 px, el enlace "Ver todos" de `SectionHeader` desborda 29 px y genera scroll horizontal. No viene del header.

## QA realizada

- `npm run build:local`: 59 páginas sin errores. `check:standard`: 0 errores (aviso previo: páginas sin `og:image`). JS de la página más pesada: 148 KB gzip, cerca del presupuesto de 150 KB.
- `tsc --noEmit` sin errores en los archivos del header. Ningún `.tsx` importa `store.ts`; sin hex, `text-[NNpx]` ni `text-white/…` en los archivos tocados; sin comentarios agregados.
- Playwright en 320, 360, 768 y 1280 px sobre `/`, `/nosotros`, `/contacto`, `/productos`, una ficha de producto y `/blog`: header sticky (queda en `top: 0` tras el scroll), enlace activo correcto, el contenido empieza bajo el header y no hay scroll horizontal salvo el caso pendiente de la Home a 320 px.
- Sombra presente al recargar a mitad de página. `/nosotros#valores` deja el título a 96 px del borde, bajo el header de 85.
- "Cotiza aquí" abre el modal "Asesoría comercial" y su WhatsApp lleva a `wa.me` con el número de `global.whatsapp`.
- Mega-menú: hover, teclado (Enter en el chevron), clics sucesivos con mouse (abre, cierra, abre), Esc con retorno de foco y la foto del primer producto al pasar el mouse.
- Panel ☰ y menú mobile: acordeón de productos, enlaces que cierran el panel, scroll bloqueado y liberado siempre.
- Búsqueda: el índice se descarga recién al abrir; foco en el campo; filtra por nombre, marca y especialidad sin tildes; mensaje sin resultados; cada resultado abre su ficha; imágenes servidas desde `/_astro/`, sin enlaces a WordPress.
- Un solo panel a la vez, Esc y retorno de foco verificados en 1280, 768 y 360 px para el menú, la búsqueda y el mega-menú.
- WhatsApp flotante en todas las páginas probadas; desaparece con `whatsappButton.enabled: false` y en modo mantenimiento (ambos probados con cambios temporales de contenido, ya revertidos).
- Capturas en 1440 y 390 px comparadas con "Medical Digital Desktop.html" y "Medical Digital Mobile.html": header, mega-menú y panel ☰ coinciden. La diferencia visible es que el menú solo tiene Productos, Noticias y Contacto (los demás destinos aún no existen).
- Sin verificar desde local: edición en vivo desde `/admin`, `npm run build` con TinaCloud (lo valida el preview de Amplify) y el uso en dispositivos táctiles reales.
