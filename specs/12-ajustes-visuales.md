# SPEC 12 — Ajustes visuales (lote 1)

> **Status:** Aprobado
> **Depends on:** SPEC 03 (header y panel ☰), SPEC 04 (footer), SPEC 05 (filtro de marcas), SPEC 06 (video de la ficha), SPEC 07 (noticias)
> **Date:** 2026-10-10
> **Objective:** Aplicar los nueve ajustes visuales de la revisión del cliente (imágenes, favicon, textos y detalles de estilo) sin cambiar la estructura de ninguna página.

## Por qué existe esta spec

- La revisión de staging dejó nueve ajustes chicos repartidos por el sitio. Ninguno merece una spec propia y juntos caben en un solo PR.
- Diseño entregó los assets finales en `~/code/twnstudios/fix-imagenes/`: tres fotos del panel ☰, dos banners de la Home, el favicon y el logo de TWNSTUDIOS. Hoy esos lugares tienen imágenes provisionales o texto.
- La portada del video de la ficha usa `hqdefault.jpg` de YouTube (480×360) estirada al ancho del contenedor: se ve pixelada.
- El cliente entregó una misión y una visión nuevas para `/nosotros`.
- No depende de la SPEC 11 (en PR) ni toca sus archivos.

## Ajustes

| # | Ajuste | Hoy | Después | Archivo |
|---|---|---|---|---|
| 1 | Fotos del panel ☰ | `tarjeta-productos.webp`, `tarjeta-servicio-tecnico.webp`, `tarjeta-noticias.webp` (provisionales); solo una tarjeta tiene `imageAlt` | `menu-productos.webp` (1024×683), `menu-servicio-posventa.webp` (1200×800), `menu-noticias.webp` (1422×800), todas < 300 KB, con `imageAlt` en las tres | `public/uploads/menu/`, `src/content/global/index.json` (`nav.panel.cards`) |
| 2 | Casillas del filtro de marcas | `rounded-md` (se ven casi circulares) | `rounded-sm` (2 px) | `src/components/productos/BrandFilter.tsx` |
| 3 | Chevron de "Productos" activo | Texto en `text-accent`, chevron navy fijo | Con la página de productos activa, texto **y** chevron en `text-accent` | `src/components/shared/HeaderReact.tsx` |
| 4 | Portada del video de YouTube | `hqdefault.jpg` remoto (480×360), pixelado | `maxresdefault` → `sddefault` → `hqdefault`, elegida en build y servida por `astro:assets` desde `dist/` | `src/pages/productos/[slug].astro`, `astro.config.mjs` |
| 5 | Sombra de la noticia destacada | `can-hover:hover:shadow-xl` | `can-hover:hover:shadow-md` | `src/components/noticias/NewsListReact.tsx` |
| 6 | Favicon | `public/favicon.svg` | `favicon-medical-digital.svg` (68×68) y `favicon-medical-digital.png` (100×100) de respaldo | `public/`, `src/layouts/BaseLayout.astro` |
| 7 | Slides 1 y 2 de la Home | `slide-tecnologia-diagnostico.webp`, `slide-servicio-tecnico-laboratorio.webp` | `slide-medicos-electrocardiografo.webp` (`banner-1`, 1440×655) y `slide-servicio-tecnico-desfibrilador.webp` (`banner-2` reducido de 2828×1200 a 1440×611, < 300 KB). Se actualizan los `alt`; el slide 3 no cambia | `public/uploads/home/`, `src/content/home/index.json` (`slides`) |
| 8 | Crédito del footer | Texto "TWNSTUDIOS" | `twnstudios-logo-white.svg`: `h-3`, `opacity-80` y `opacity-100` al pasar el mouse, `alt="TWNSTUDIOS"` | `public/`, `src/components/shared/FooterReact.tsx` |
| 9 | Misión y visión | Textos anteriores | Textos nuevos del cliente (ver Modelo de datos) | `src/content/about/nosotros.json` (`visionMission`) |

Las imágenes reemplazadas (`tarjeta-*.webp`, los dos slides viejos y `favicon.svg`) solo se usan en esos lugares y se borran del repo.

## Scope

**In:**

- Los nueve ajustes de la tabla anterior, en desktop y mobile.
- Reducción de `banner-2.webp` a 1440 px de ancho con `sharp` (ya instalado por Astro).
- Textos `alt`/`imageAlt` nuevos para las tres fotos del panel ☰ y los tres slides, descriptivos de la foto real.
- Portada de YouTube resuelta en build, con respaldo a `hqdefault` remoto si YouTube no responde. El build nunca falla por una portada.
- Borrado de las imágenes y el favicon reemplazados.

**Fuera de alcance (para futuras specs):**

- Portada para videos MP4 (`kind: "file"`): hoy no tienen y siguen sin tener.
- Campo de portada en JetEngine.
- Sombras en las tarjetas normales de noticias o en las noticias de la Home: hoy no tienen y no se agregan.
- Cambios en el slide 3 de la Home, salvo su `alt`.
- `apple-touch-icon`, `manifest.webmanifest` e íconos de PWA.
- Sitemap, 301, Search Console, GA4 y `robots.txt` de staging: van en la SPEC 14.

## Modelo de datos

Esta spec **no cambia ningún schema de Tina**. Solo cambian valores de contenido que ya existen (`image`, `imageAlt`, `vision`, `mission`) y se agrega un tipo interno para la ficha.

### `src/content/global/index.json` → `nav.panel.cards`

| Tarjeta | `image` | `imageAlt` |
|---|---|---|
| Nuestros productos | `/uploads/menu/menu-productos.webp` | `Desfibriladores Schiller con su bolso de transporte y electrodos` |
| Servicio posventa | `/uploads/menu/menu-servicio-posventa.webp` | `Técnico midiendo una placa electrónica con un osciloscopio` |
| Noticias | `/uploads/menu/menu-noticias.webp` | `Médica revisando una tableta frente a un monitor con imágenes diagnósticas` |

### `src/content/home/index.json` → `slides`

| Slide | `image` | `imageAlt` |
|---|---|---|
| 1 | `/uploads/home/slide-medicos-electrocardiografo.webp` | `Médico explicando un electrocardiógrafo a un equipo de profesionales de la salud` |
| 2 | `/uploads/home/slide-servicio-tecnico-desfibrilador.webp` | `Técnico probando un desfibrilador con un analizador en el laboratorio` |
| 3 | sin cambios | Nuevo: describe la foto actual (hoy no tiene) |

### `src/content/about/nosotros.json` → `visionMission`

`visionTitle`, `missionTitle`, `image` e `imageAlt` no cambian.

`mission`:

> Brindar soluciones integrales de equipamiento médico que contribuyan a la continuidad operativa de los servicios de salud. A través de la comercialización especializada, una distribución eficiente y soporte técnico confiable, acompañamos a instituciones médicas de todo el Perú con altos estándares de calidad, ética y seguridad, comprometidos con la excelencia y el bienestar del paciente.

`vision`:

> Ser la empresa líder en soluciones de equipamiento médico en el Perú, reconocida por su excelencia técnica, innovación continua y capacidad de acompañar la operación ininterrumpida de las instituciones de salud en todo el país. Buscamos transformar el servicio técnico en salud mediante tecnología, prácticas sostenibles y un equipo altamente capacitado que contribuya al bienestar y la seguridad de los pacientes.

### Portada del video (build)

Función nueva `resolveYouTubePoster(id)` en `src/lib/woo/youtubePoster.ts`, importada solo desde `.astro`:

```ts
type YouTubePoster =
  | { kind: "remote"; src: string; width: number; height: number }; // la URL de i.ytimg.com que respondió 200

// Orden: maxresdefault (1280×720) → sddefault (640×480) → hqdefault (480×360).
// Un 404, un error de red o una imagen de 120 px de ancho pasa a la siguiente.
// Si fallan todas, devuelve hqdefault sin verificar.
```

La ficha pasa `src`, `width` y `height` a `<Image>` de `astro:assets` con `widths` para el `srcset` y `sizes` según el contenedor. `astro.config.mjs` agrega `i.ytimg.com` a `image.domains` junto a los dominios de Woo. Las respuestas se cachean en memoria por `id` durante el build.

## Plan de implementación

Cada paso compila (`npm run build`) y se puede commitear por separado.

1. **Assets.** Copiar `menu-*.webp` a `public/uploads/menu/` y `banner-1.webp` como `public/uploads/home/slide-medicos-electrocardiografo.webp`. Reducir `banner-2.webp` a 1440 px de ancho con `sharp` (WebP, calidad ~80), guardarlo como `slide-servicio-tecnico-desfibrilador.webp` y verificar que pese < 300 KB. Copiar `favicon-medical-digital.svg`/`.png` y `twnstudios-logo-white.svg` a `public/`. Sin los archivos `:Zone.Identifier`.
2. **Contenido.** Actualizar `nav.panel.cards` (imagen e `imageAlt`), `slides` (imagen e `imageAlt` de los tres) y `visionMission` (`vision` y `mission`). Borrar `tarjeta-*.webp`, `slide-tecnologia-diagnostico.webp` y `slide-servicio-tecnico-laboratorio.webp`. Verificar con `grep` que no queden referencias.
3. **Favicon.** En `BaseLayout.astro`, `<link rel="icon" type="image/svg+xml">` al SVG nuevo y `<link rel="icon" type="image/png" sizes="100x100">` al PNG, ambos con `import.meta.env.BASE_URL`. Borrar `public/favicon.svg`.
4. **Footer.** En `FooterReact.tsx`, reemplazar el texto "TWNSTUDIOS" por `<img>` del logo (`h-3 w-auto`, `width`/`height` del SVG, `alt="TWNSTUDIOS"`). El enlace lleva `opacity-80 can-hover:hover:opacity-100` con transición de 300 ms y conserva `target`, `rel` y la URL con UTM.
5. **Header.** En `HeaderReact.tsx`, el botón del chevron de "Productos" usa `text-accent` cuando `current` es verdadero. Si no, queda como hoy (navy con hover en `text-accent`).
6. **Filtro de marcas.** En `BrandFilter.tsx`, la casilla pasa de `rounded-md` a `rounded-sm`.
7. **Noticias.** En `NewsListReact.tsx`, la destacada pasa de `can-hover:hover:shadow-xl` a `can-hover:hover:shadow-md`.
8. **Portada del video.** Crear `src/lib/woo/youtubePoster.ts` con `resolveYouTubePoster` (status y ancho validado con `sharp`). Agregar `i.ytimg.com` a `image.domains`. En `[slug].astro`, dibujar la portada con `<Image>` (`widths` 640/960/1280, `sizes` del contenedor, `loading="lazy"`). Si ninguna variante respondió, dibujar el `<img>` remoto de `hqdefault` como hoy, sin `astro:assets`, para que el build no falle.
9. **Documentación.** Actualizar `CLAUDE.md` (favicon, portada del video en build) y completar "Notas de implementación" y "QA realizada" en esta spec.

## Criterios de aceptación

**Imágenes y contenido**

- [ ] El panel ☰ muestra `menu-productos`, `menu-servicio-posventa` y `menu-noticias`, y cada `<img>` tiene `alt` no vacío.
- [ ] Los slides 1 y 2 de la Home muestran las fotos nuevas. Los tres slides tienen `alt` no vacío y el slide 3 conserva su foto.
- [ ] `slide-servicio-tecnico-desfibrilador.webp` mide 1440 px de ancho. Las cinco imágenes nuevas pesan < 300 KB.
- [ ] `/nosotros` muestra la misión y la visión nuevas, palabra por palabra como en esta spec.
- [ ] `grep` no encuentra `tarjeta-productos`, `tarjeta-servicio-tecnico`, `tarjeta-noticias`, `slide-tecnologia-diagnostico`, `slide-servicio-tecnico-laboratorio` ni `favicon.svg` en `src/`, `tina/` ni `public/`.
- [ ] No hay archivos `:Zone.Identifier` en el repo.

**Favicon y footer**

- [ ] La pestaña muestra el favicon nuevo y el HTML trae los dos `<link rel="icon">` (SVG y PNG 100×100) con rutas que responden 200.
- [ ] El crédito del footer muestra el logo de TWNSTUDIOS a 12 px de alto, alineado con "Desarrollado por", en desktop y mobile (360 px).
- [ ] El logo tiene `alt="TWNSTUDIOS"`, abre la URL con UTM en otra pestaña y sube a opacidad 100 % al pasar el mouse.

**Estilos**

- [ ] En `/productos`, `/productos/categoria/<slug>` y la ficha, el texto y el chevron de "Productos" en el header van en `text-accent`. En las demás páginas el chevron sigue navy.
- [ ] Las casillas del filtro de marcas tienen esquinas de 2 px, en el sidebar y en el panel de filtros mobile.
- [ ] La noticia destacada muestra `shadow-md` solo al pasar el mouse y no la muestra en un dispositivo táctil.

**Portada del video**

- [ ] En la ficha de un producto con video de YouTube que tiene `maxresdefault`, la portada sale de `dist/` (`/_astro/…webp`) con `srcset` y no se ve pixelada a 1280 px.
- [ ] Un video sin `maxresdefault` usa `sddefault` o `hqdefault` sin mostrar la imagen gris de YouTube.
- [ ] Antes de dar play, la ficha no hace ningún pedido a `ytimg.com` ni a `youtube.com`.
- [ ] Con la red a YouTube cortada en build, el build termina y la portada cae al `<img>` remoto de `hqdefault`.
- [ ] El botón de play, el modal y la reproducción funcionan igual que antes.

**General**

- [ ] `npm run build` pasa sin errores ni warnings nuevos.
- [ ] Sin scroll horizontal a 320 y 360 px en la Home, `/nosotros`, `/productos`, una ficha con video y `/noticias`.

## Decisiones

- **Sí:** un solo PR para los nueve ajustes, porque son cambios chicos e independientes de la misma revisión.
- **Sí:** portada de YouTube elegida en build (`maxresdefault` → `sddefault` → `hqdefault`), porque es la opción más nítida que no le pide nada al cliente.
- **No:** elegir la portada en el navegador revisando `naturalWidth`, porque necesita JS, descarga la imagen gris antes de cambiarla y hace pedidos a YouTube al cargar la ficha.
- **No:** un campo de portada en JetEngine, porque depende de que el cliente lo cree y lo llene en cada producto.
- **No:** la imagen principal del producto como portada, porque no muestra el contenido del video.
- **Sí:** servir la portada con `astro:assets` desde `dist/`, como las imágenes de Woo: WebP con `srcset` y sin pedidos a terceros hasta el play.
- **Sí:** respaldo al `<img>` remoto de `hqdefault` si YouTube no responde en build, porque una portada no justifica tumbar el deploy (a diferencia del catálogo, que falla a propósito).
- **Sí:** `shadow-md` al pasar el mouse, solo en la destacada, porque mantiene la pista de que es clicable sin la mancha que señaló la revisión.
- **No:** agregar sombras a las demás tarjetas de noticias, porque hoy no tienen y la revisión no lo pidió.
- **Sí:** `rounded-sm` (2 px) en las casillas de marca, porque `rounded-md` a 20–24 px las hace parecer radios (selección única) cuando son checkboxes.
- **Sí:** chevron en `text-accent` solo con "Productos" activo, para que texto e ícono se lean como un mismo control.
- **Sí:** logo del footer a `h-3` con `opacity-80`, porque iguala la altura del texto `caption` y reproduce el hover que hoy tiene el texto.
- **Sí:** PNG de 100×100 como respaldo del favicon SVG, para navegadores sin soporte de SVG.
- **No:** `apple-touch-icon` ni `manifest`, porque no hay assets en la medida correcta (180×180 o más).
- **Sí:** `alt` también para el slide 3, aunque la revisión no lo pidió, porque hoy no tiene y es una falla de accesibilidad (estándar §7).
- **Sí:** borrar las imágenes reemplazadas, porque solo las usaba el contenido que cambia.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| YouTube responde 200 con la imagen gris en vez de 404 | Además del status, se valida el ancho con `sharp` (120 px se descarta). Se comprueba en QA con un video sin `maxresdefault` |
| Un video se cambia en Woo y la portada queda vieja | Igual que todo el catálogo: aparece en el siguiente deploy (ver `CLAUDE.md`) |
| El build se alarga con muchos videos | Un pedido por video, cacheado en memoria por `id`. Hoy son pocos productos con video |
| `banner-2` reducido pierde calidad en pantallas 2× | Mismo criterio que el resto de los slides (estándar §5.2: 1440 px, < 300 KB) |

## Lo que **no** entra en esta spec

- Portada para videos MP4 y campo de portada en JetEngine.
- Sombras en otras tarjetas de noticias o de la Home.
- Cambios en el slide 3, salvo su `alt`.
- `apple-touch-icon`, `manifest` e íconos de PWA.
- Sitemap, 301, Search Console, GA4 y `robots.txt` de staging (SPEC 14).

## Notas de implementación

Se completan al terminar la implementación.

## QA realizada

Se completa al terminar la implementación.
