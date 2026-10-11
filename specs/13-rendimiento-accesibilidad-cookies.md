# SPEC 13 — Rendimiento, accesibilidad, animaciones y banner de cookies

> **Status:** Aprobado
> **Depends on:** SPEC 02 (Home y testimonios), SPEC 03 (header y panel ☰), SPEC 04 (footer), SPEC 10 (marquee de marcas)
> **Date:** 2026-10-10
> **Objective:** Llevar Lighthouse mobile a 90 o más en las cuatro categorías en una página por plantilla, corrigiendo las fallas medidas en staging y reemplazando el modal de cookies por un banner compacto.

## Por qué existe esta spec

- La tarjeta "Animaciones e interacciones" del tablero pide que respeten `prefers-reduced-motion` y Lighthouse mobile ≥ 90.
- La medición de staging del 2026-10-10 (PageSpeed y Lighthouse 13.5 en local, Home, mobile) dio: Rendimiento 89–91, Accesibilidad 89, Prácticas recomendadas 100, SEO 92 y Navegación agéntica 1/2.
- El modal de cookies actual es centrado, con overlay, y tapa la página en la primera visita. El usuario pidió uno más chico, como el de Eres.
- Las fallas son pocas y están ubicadas. Ninguna necesita rediseñar una página.

## Fallas medidas

| Categoría | Auditoría | Causa | Archivo |
|---|---|---|---|
| Rendimiento | FCP 2.7 s, LCP 3.2 s, "Render-blocking requests" (~1,750 ms) | El CSS de Google Fonts bloquea el render y carga Space Mono además de Rubik. TBT y CLS ya son 0 | `src/layouts/BaseLayout.astro` |
| Accesibilidad | `color-contrast` | Texto blanco sobre `#E83C3E` (4.07:1) en `btn-primary` | `src/styles/global.css` |
| Accesibilidad | `list` | `<ul>` con `<li role="group">` | `src/components/home/TestimonialsReact.tsx` |
| Accesibilidad | `target-size` | Dots del slider de 10×44 px con 8 px de separación | `src/components/home/HomeSliderReact.tsx` |
| SEO | `crawlable-anchors` | Tres `<a>` sin `href`: el enlace al catálogo PDF cuando `catalog.file` está vacío | `ProductsMegaMenu.tsx`, `SiteMenu.tsx`, `FooterReact.tsx` |
| Navegación agéntica | `agent-accessibility-tree` | El mismo `<li role="group">` de testimonios | `TestimonialsReact.tsx` |

## Scope

**In:**

- **Fuentes.** Rubik autoalojada en lugar del CSS de Google Fonts. Se quita Space Mono; `404.astro` pasa a Rubik.
- **Contraste.** `btn-primary` y `btn-navigation` pasan a `brand-primary-dark` con texto blanco, con sus estados hover y pressed.
- **Testimonios.** El carrusel deja de usar `<ul>/<li>` con `role="group"` y sigue el marcado de `HomeSliderReact.tsx`.
- **Dots del slider.** Cada botón mide al menos 24×44 px y no se solapa con sus vecinos.
- **Enlace al catálogo PDF.** Con `catalog.file` vacío no se dibuja en el mega menú, en el panel ☰ ni en el footer (el banner del catálogo completo).
- **Banner de cookies.** Tarjeta fija abajo a la izquierda, sin overlay ni bloqueo de scroll: un texto corto y "Configurar", "Rechazar todo" y "Aceptar todo". "Configurar" abre el modal actual de categorías.
- **Dos campos nuevos en Tina** (`bannerText`, `btnConfigure`) en `cookieConsent`.
- **Colores del banner y del modal con tokens** del tema en lugar de los hex escritos a mano.
- **Auditoría de animaciones.** Toda transición dura 300 ms o menos y se apaga con `prefers-reduced-motion`. Se corrigen las que no cumplan.
- **Medición.** Lighthouse mobile en Home, `/productos`, una ficha, `/noticias` y `/contacto`, con los resultados en esta spec.
- Actualización de `CLAUDE.md` (fuentes, botones, catálogo PDF y cookies).

**Fuera de alcance (para futuras specs):**

- Animaciones de entrada al hacer scroll (fade-up).
- GA4, `noindex` fuera de producción y sitemap: van en la SPEC 14.
- `btn-sm` de 32 px frente al target de 44×44 y el contraste del hover de `btn-link`.
- Contraste del botón flotante de WhatsApp (decisión de diseño ya tomada).
- Imágenes de Woo más grandes que el tamaño mostrado (60 KiB estimados por Lighthouse).
- JS sin usar del runtime de React (30 KiB estimados).
- Cambiar las categorías de cookies o la clave `medical-digital-cookie-consent:v1`.

## Modelo de datos

### `tina/collections/cookieConsent.ts`: dos campos nuevos

```ts
{ name: "bannerText", label: "Texto del banner", type: "string", ui: { component: "textarea" } },
{ name: "btnConfigure", label: "Texto del enlace 'Configurar'", type: "string" },
```

Valores en `src/content/cookie-consent/index.json`:

| Campo | Valor |
|---|---|
| `bannerText` | `Usamos cookies para que la web funcione y, con tu permiso, para entender cómo la usas.` |
| `btnConfigure` | `Configurar` |

Los demás campos (`title`, `intro`, `categories` y los botones) no cambian y siguen alimentando el modal de categorías. La etiqueta de la colección pasa a "Consentimiento de cookies (banner y modal)".

### Estado del componente

```ts
type View = "hidden" | "banner" | "settings";
```

- Primera visita sin consentimiento guardado: `banner`.
- "Configurar", un enlace `#preferencias-cookies` o el evento `open-cookie-consent`: `settings`.
- Cerrar `settings` sin guardar: vuelve a `banner` si no hay consentimiento guardado, o a `hidden` si ya lo hay.
- "Rechazar todo", "Aceptar todo" y "Guardar mis preferencias": guardan y pasan a `hidden`.

### Consentimiento guardado (sin cambios)

`localStorage["medical-digital-cookie-consent:v1"]` conserva su forma:

```ts
{ necesaria: true, funcional: boolean, analitica: boolean, ts: number }
```

### Banner

| Propiedad | Valor |
|---|---|
| Posición | `fixed`, abajo a la izquierda, `z-[100]` |
| Ancho | 100 % menos los márgenes en mobile; 440 px como máximo desde `md` |
| Semántica | `role="region"` con `aria-label="Aviso de cookies"`. No es `dialog` ni `aria-modal`, y no atrapa el foco |
| Botones | "Rechazar todo" con `btn-secondary btn-md`, "Aceptar todo" con `btn-primary btn-md`, "Configurar" con `btn-link` |
| Entrada | `animate-sheet-in` (300 ms, ya definida en `tailwind.config.mjs`) |
| Ficha de producto en mobile | Se dibuja por encima de la barra fija (`data-mobile-bottom-bar`) |

El modal `settings` conserva `role="dialog"` y `aria-modal="true"`. Suma lo que hoy no tiene: bloqueo de scroll con `src/utils/scrollLock.ts`, cierre con Esc y devolución del foco al elemento que lo abrió.

### Fuentes

Dependencia nueva `@fontsource-variable/rubik`, importada en `src/styles/global.css`. Se sirve desde `dist/_astro/` con `font-display: swap`. `fontFamily.sans` y `fontFamily.heading` pasan a `'Rubik Variable'` con `Rubik` como respaldo. `fontFamily.mono` sale de `tailwind.config.mjs`.

### Botones (`src/styles/global.css`)

| Estado de `btn-primary` y `btn-navigation` | Hoy | Después | Contraste con blanco |
|---|---|---|---|
| Normal | `brand-primary-medium` `#E83C3E` | `brand-primary-dark` `#B8242A` | 6.3:1 |
| Hover | `brand-primary-dark` | `brand-primary-darkest` `#8E1A1F` | 9.5:1 |
| Pressed | `brand-primary-darkest` | `brand-primary-darkest` con `brightness-90` | mayor |

No se agregan ni cambian hex en `tailwind.config.mjs`.

## Plan de implementación

Cada paso compila (`npm run build`) y se puede commitear por separado.

1. **Fuentes.** Instalar `@fontsource-variable/rubik` e importarla en `src/styles/global.css`. Quitar de `BaseLayout.astro` los dos `preconnect` y el `<link>` de Google Fonts. Actualizar `fontFamily` en `tailwind.config.mjs` y quitar `mono`. En `404.astro`, quitar `font-mono`. Verificar con `grep` que no queden `font-mono` ni `fonts.googleapis`.
2. **Botones.** Cambiar los tres estados de `btn-primary` y `btn-navigation` en `global.css` según la tabla. Revisar a la vista el slider de la Home, el header, el footer y los formularios.
3. **Testimonios.** En `TestimonialsReact.tsx`, pasar `<ul>/<li>` a `<div>`, con `role="group"`, `aria-roledescription="slide"` y `aria-label` en cada slide, igual que `HomeSliderReact.tsx`. Sin cambios visuales.
4. **Dots del slider.** En `HomeSliderReact.tsx`, cada botón pasa a `min-w-6` con la barra centrada, y se ajusta el `gap` del contenedor para que las áreas no se solapen. La barra visible conserva sus medidas (10 px y 40 px la activa).
5. **Catálogo PDF.** En `ProductsMegaMenu.tsx`, `SiteMenu.tsx` y `FooterReact.tsx`, dibujar el enlace solo si `catalog.file` tiene valor. En el footer se oculta el banner completo (título y botón). Actualizar la `description` del campo `catalog` en `tina/collections/global.ts`.
6. **Schema de cookies.** Agregar `bannerText` y `btnConfigure` a `cookieConsent.ts` y sus valores a `index.json`. Cambiar la etiqueta de la colección.
7. **Banner.** En `CookieConsentReact.tsx`, reemplazar `open` por `view` y dibujar la tarjeta compacta para `banner`. Los botones reutilizan `rejectAll` y `acceptAll`.
8. **Modal de categorías.** El modal actual queda como vista `settings`. Sumar `scrollLock`, Esc y devolución del foco. Cambiar los hex (`#D93B32`, `#0a0a0a`, `#717274` y los demás) por tokens (`accent`, `content`, `content-muted`, `line`) y las clases `btn-*`.
9. **Auditoría de animaciones.** Recorrer `transition`, `duration-*` y `animate-*` en `src/`. Bajar a 300 ms lo que lo supere y confirmar que la regla global de `prefers-reduced-motion` de `global.css` lo cubre. Anotar el resultado en "Notas de implementación".
10. **Medición.** Con el preview de Amplify, correr Lighthouse mobile en las cinco páginas y anotar las cuatro categorías en "QA realizada".
11. **Documentación.** Actualizar `CLAUDE.md`: tipografías (Rubik autoalojada, sin Space Mono), botones (color nuevo y cierre del pendiente de contraste de `btn-primary`), catálogo PDF y cookies.

## Criterios de aceptación

**Lighthouse (mobile, preview de Amplify)**

- [ ] Home, `/productos`, una ficha de producto, `/noticias` y `/contacto` dan 90 o más en Rendimiento, Accesibilidad, Prácticas recomendadas y SEO.
- [ ] En la Home pasan las auditorías `color-contrast`, `list`, `target-size` y `crawlable-anchors`.
- [ ] En la Home, "Navegación agéntica" no reporta `agent-accessibility-tree`.
- [ ] "Render-blocking requests" ya no lista `fonts.googleapis.com`.

**Fuentes**

- [ ] El HTML no pide nada a `fonts.googleapis.com` ni a `fonts.gstatic.com`.
- [ ] Rubik se sirve desde `/_astro/` y los pesos 400, 500 y 600 se ven igual que antes.
- [ ] `grep` no encuentra `font-mono` ni `Space Mono` en `src/` ni en `tailwind.config.mjs`.

**Botones**

- [ ] `btn-primary` y `btn-navigation` tienen fondo `#B8242A` y texto blanco, y cambian de tono en hover y en pressed.
- [ ] El estado deshabilitado se ve igual que antes.

**Marcado**

- [ ] El carrusel de testimonios no tiene `<ul>` ni `<li>`. Las flechas, el arrastre y el contador funcionan igual.
- [ ] Cada dot del slider de la Home mide al menos 24×44 px y cambia de slide al tocarlo.
- [ ] Con `catalog.file` vacío no aparece el enlace del catálogo en el mega menú, el panel ☰ ni el footer. Con un PDF cargado en Tina aparecen los tres y abren el archivo.
- [ ] El build no deja ningún `<a>` sin `href`.

**Cookies**

- [ ] En la primera visita aparece la tarjeta abajo a la izquierda, sin overlay, y la página se puede leer y recorrer sin responderla.
- [ ] La tarjeta mide 440 px de ancho como máximo en desktop y no produce scroll horizontal a 320 px.
- [ ] "Aceptar todo" y "Rechazar todo" guardan en `medical-digital-cookie-consent:v1` y la tarjeta no vuelve al recargar.
- [ ] "Configurar" abre el modal con las tres categorías. Esc lo cierra y el foco vuelve a "Configurar".
- [ ] Un enlace `#preferencias-cookies` abre el modal con la elección guardada.
- [ ] `bannerText` y `btnConfigure` se editan en Tina y se ven en el banner.
- [ ] En la ficha de producto en mobile la tarjeta no tapa la barra fija de cotización.
- [ ] `CookieConsentReact.tsx` no contiene colores en hex.

**Animaciones**

- [ ] Ninguna clase `duration-*` ni animación de `tailwind.config.mjs` supera 300 ms, salvo el marquee de marcas (excepción de la SPEC 10).
- [ ] Con `prefers-reduced-motion: reduce`, el banner, los modales, el slider y el marquee aparecen sin animación.

**General**

- [ ] `npm run build`, `npm run typecheck` y `npm run check:standard` pasan sin errores ni warnings nuevos.

## Decisiones

- **Sí: dos specs.** El pedido tocaba cuatro áreas. Esta cierra rendimiento, accesibilidad, animaciones y cookies; la SPEC 14 cierra SEO técnico.
- **Sí: definición rápida de las últimas secciones.** El usuario confirmó la cabecera, el alcance y el modelo de datos, y pidió asumir el plan, los criterios, las decisiones y los riesgos sin revisarlos uno por uno.
- **Sí: Rubik autoalojada con `@fontsource-variable/rubik`.** Quita el pedido bloqueante a Google Fonts, que es la causa principal del FCP. Una fuente variable cubre los tres pesos en un archivo.
- **No: `preload` o `media="print"` sobre el CSS de Google Fonts.** Mantiene el pedido a un tercero y dos conexiones extra.
- **Sí: quitar Space Mono.** Solo la usa el "404" de `404.astro` y no es parte del UI Kit.
- **Sí: `btn-primary` en `brand-primary-dark`.** Elección del usuario. Llega a 6.3:1 sin agregar colores y cierra el pendiente de diseño anotado en `CLAUDE.md`.
- **No: un rojo intermedio nuevo (cerca de `#D32F33`).** Se parece más al actual, pero queda fuera de la paleta del UI Kit y apenas pasa 4.5:1.
- **Sí: testimonios con `<div role="group">`.** Es el marcado que ya usa `HomeSliderReact.tsx` y el que pide el patrón de carrusel. Un `<li>` con otro rol rompe la lista.
- **No: dejar `<ul>/<li>` y quitar solo el rol.** Se pierde el anuncio "slide 1 de 4" en el lector de pantalla.
- **Sí: ocultar el enlace al catálogo sin archivo.** Un enlace que no lleva a ningún lado falla en SEO y confunde. Revierte la decisión anterior ("se muestran pero no descargan nada"), que servía mientras no había PDF.
- **No: convertirlo en `<button>` deshabilitado.** Sigue siendo un control que no hace nada.
- **Sí: banner compacto con "Configurar" hacia el modal actual.** Elección del usuario, con Eres como referencia. No tapa la página y conserva el consentimiento por categoría.
- **No: banner sin categorías (solo aceptar o rechazar).** El contenido ya describe tres categorías y la SPEC 14 necesita la de analítica.
- **Sí: el banner no es un `dialog`.** No bloquea la página, así que no debe atrapar el foco ni anunciarse como modal.
- **Sí: "Rechazar todo" y "Aceptar todo" con el mismo peso visual y tamaño.** Rechazar no debe costar más que aceptar.
- **Sí: tokens en lugar de hex en el componente de cookies.** `CLAUDE.md` pide que los componentes no escriban colores.
- **Sí: solo auditar las animaciones existentes.** Elección del usuario. Agregar entradas al hacer scroll arriesga el rendimiento que esta spec busca.
- **Sí: medir una página por plantilla.** Elección del usuario. La Home sola no cubre el catálogo ni la ficha, que cargan otras islas.
- **No: optimizar las imágenes de Woo ni el JS de React en esta spec.** No hacen falta para llegar a 90 y cada uno abre un frente propio.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| El rojo más oscuro cambia la imagen de marca en todo el sitio | Es el tono de `accent`, ya presente en textos y enlaces. Se revisa a la vista en el paso 2 y el cambio vive en tres líneas de `global.css` |
| Las métricas de Rubik variable difieren y mueven el texto | Mismo diseño de fuente. Se compara header, slider y tarjetas antes y después, y CLS debe seguir en 0 |
| Rendimiento queda en 89–91 por la variación de Lighthouse | Se toma la mediana de tres corridas por página. Si una plantilla no llega, se anota la causa y se abre una spec propia |
| La tarjeta de cookies tapa el botón de WhatsApp o la barra de la ficha en mobile | WhatsApp va abajo a la derecha y la tarjeta a la izquierda. A 320 px se verifica que no se monten; en la ficha la tarjeta sube sobre la barra |
| El cliente espera el enlace del catálogo y no lo ve | Aparece al cargar el PDF en Tina (`global.catalog.file`). Se documenta en `CLAUDE.md` y en la descripción del campo |
| Las fichas y el catálogo fallan por auditorías que la Home no muestra | El paso 10 mide las cinco páginas antes de cerrar. Las fallas nuevas se corrigen si caben en el alcance o se anotan |

## Lo que **no** entra en esta spec

- Animaciones de entrada al hacer scroll.
- GA4, `noindex` fuera de producción y sitemap (SPEC 14).
- `btn-sm`, el hover de `btn-link` y el contraste del botón de WhatsApp.
- Optimización de las imágenes de Woo y del JS de React.
- Cambios en las categorías de cookies o en la clave de `localStorage`.

Cada una, si llega, va en su propia spec.

## Notas de implementación

- **"Cotiza aquí" del header no usaba `btn-navigation`.** Tenía sus propias clases con texto blanco sobre `bg-brand-primary` (4.07:1). Queda fuera de la letra del alcance, pero es el mismo defecto y solo se ve en desktop. Se alineó con `btn-primary` en un commit aparte (`fix(a11y): alinea el botón de cotización del header con btn-primary`).
- **El modal de categorías es un `<dialog>` nativo.** `showModal()` da el cierre con Esc, la trampa de foco y la devolución del foco sin código propio. Mientras está abierto sin consentimiento guardado, el banner sigue montado detrás del backdrop para que el foco vuelva a "Configurar".
- **Los pasos 7 y 8 van en un solo commit.** El banner y el modal comparten el estado `view` y no compilan por separado.
- **Banner en mobile.** Usa un solo desplazamiento inferior (`88px + max(16px, safe-area)`) que libra tanto el botón de WhatsApp (61 px) como la barra fija de la ficha. Entre `md` y `lg` solo se aplica en la ficha.
- **Botones del modal.** "Guardar mis preferencias" ocupa una fila y "Rechazar todo" y "Aceptar todo" la siguiente: con `whitespace-nowrap` los tres no caben en una fila de 480 px.
- **Enlace al catálogo.** El mega menú y el panel ☰ siguen pidiendo además `catalog.label`, como antes.
- **Auditoría de animaciones.** Las 37 clases `duration-*` de `src/` son de 200, 250 o 300 ms. Las constantes en JS (`ACCORDION_DURATION_MS`, `CLOSE_FALLBACK_MS`) son de 300 ms. Se quitó `fade-up` (600 ms) de `tailwind.config.mjs`: nadie la usaba. No hubo que corregir ningún componente. La regla global de `global.css` lleva a 0.01 ms toda animación y transición con `prefers-reduced-motion`; Lenis no arranca y el marquee queda estático.
- **Lenis (`duration: 1.1`) no es una transición.** Es la inercia del scroll y se apaga con movimiento reducido. No se tocó.

## QA realizada

Build local (`astro build` contra el servidor de Tina en marcha, catálogo real de Woo, 68 páginas) servido con `astro preview`. Lighthouse 13.5, mobile, una corrida por página:

| Página | Rendimiento | Accesibilidad | Prácticas | SEO | Navegación agéntica |
|---|---|---|---|---|---|
| `/` | 92 | 100 | 100 | 100 | 2/2 |
| `/productos/` | 93 | 91 | 100 | 100 | 2/2 |
| `/productos/balanza-de-pie-digital-500kl/` | 91 | 100 | 100 | 100 | 2/2 |
| `/noticias/` | 93 | 100 | 100 | 100 | 2/2 |
| `/contacto/` | 96 | 97 | 100 | 100 | 2/2 |

- En la Home pasan `color-contrast`, `list`, `target-size`, `crawlable-anchors` y `agent-accessibility-tree`. FCP baja de 2.7 s a 2.1 s; LCP queda en 3.1 s.
- `astro preview` no comprime ni usa CDN: el rendimiento es orientativo. **Pendiente:** repetir la medición en el preview de Amplify (mediana de tres corridas) después del push.
- Ningún HTML ni CSS de `dist/` (sin `/admin`) menciona `fonts.googleapis`, `fonts.gstatic` ni `Space Mono`. La fuente computada del `body` es `"Rubik Variable"`.
- Ningún `<a>` sin `href` en las 68 páginas.
- Banner medido con emulación de móvil: a 360 px ocupa de x=16 a x=344, termina 15 px por encima del botón de WhatsApp y 21 px por encima de la barra de la ficha. Sin scroll horizontal a 320 ni a 360 px. En desktop mide 440 px.
- "Configurar" abre el `<dialog>` con las tres categorías (captura a 360 px revisada).
- `npm run typecheck`: sin errores. `npm run check:standard`: 0 errores y dos avisos (17 páginas sin `og:image` y 9 imágenes sin `alt`); no se comprobó si los avisos ya existían antes de esta rama.
- No se probó a mano: Esc y devolución del foco en el modal, el enlace `#preferencias-cookies`, la edición de `bannerText` y `btnConfigure` en Tina, el arrastre del carrusel de testimonios y `prefers-reduced-motion` en el navegador.

Fallas que quedan por encima de 90 y fuera del alcance:

- `/productos/`: `list` y `listitem` (el `<ul>` del catálogo recibe sus `<li>` a través de un `<astro-slot>`) y `heading-order` (un `<h3>` de tarjeta sin `<h2>` previo).
- `/contacto/`: `color-contrast` en `content-subtle` sobre `surface-raised` (4.49:1, ya anotado en `CLAUDE.md`) y en el botón verde de WhatsApp (2.74:1, decisión de diseño).
